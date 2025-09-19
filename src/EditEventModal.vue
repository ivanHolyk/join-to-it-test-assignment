<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useEventStore } from './stores/events'
import { pickForegroundColor } from './utils/color-contrast'
import PickerIcon from '@/assets/icons/color-picker-svgrepo-com.svg?component'
import { formatDateTimeLocal } from './utils/dateFormatter'

const eventStore = useEventStore()

/* form state */
const title = ref('')
const startDatetime = ref('')
const endDatetime = ref('')
const eventColor = ref('#3B86FF')
const allDay = ref(false)
const notes = ref('')

const endManuallyEdited = ref(false)

const touched = ref({
  title: false,
  startDatetime: false,
  endDatetime: false,
  eventColor: false,
  allDay: false,
})
const ignoreBlur = ref(false)

const TITLE_MAX = 30

const titleTrimmed = computed(() => title.value.trim())
const titleLength = computed(() => titleTrimmed.value.length)
const titleEmpty = computed(() => titleLength.value === 0)
const titleTooLong = computed(() => titleLength.value > TITLE_MAX)
const startDatetimeEmpty = computed(() => startDatetime.value.trim() === '')
const endDatetimeEmpty = computed(() => endDatetime.value.trim() === '')

const titleTextColor = computed(() => {
  try {
    const res = pickForegroundColor(eventColor.value)
    return typeof res === 'string' ? res : res.color
  } catch {
    return '#000'
  }
})

/* date helpers (same behavior as NewEventModal) */
const isDateOnly = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s)

function parseToLocalDate(v: string | null | undefined): Date | null {
  if (!v) return null
  if (isDateOnly(v)) {
    const [y, m, d] = v.split('-').map(Number)
    return new Date(y, m - 1, d, 9, 0, 0)
  }
  const dt = new Date(v)
  if (isNaN(dt.getTime())) return null
  return dt
}

function formatDateOnly(d: Date) {
  const pad = (n: number) => (n < 10 ? '0' + n : '' + n)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/* validation */
const startAfterEnd = computed(() => {
  if (!startDatetime.value || !endDatetime.value) return false
  const s = parseToLocalDate(startDatetime.value)
  const e = parseToLocalDate(endDatetime.value)
  if (!s || !e) return false
  return s.getTime() > e.getTime()
})

const isValid = computed(
  () =>
    !titleEmpty.value && !titleTooLong.value && !startDatetimeEmpty.value && !startAfterEnd.value,
)

function markTouched(field: keyof typeof touched.value) {
  if (ignoreBlur.value) return
  touched.value[field] = true
}
function startCancel() {
  ignoreBlur.value = true
}

/* reset form */
function resetForm() {
  title.value = ''
  startDatetime.value = ''
  endDatetime.value = ''
  eventColor.value = '#3B86FF'
  allDay.value = false
  notes.value = ''
  touched.value = {
    title: false,
    startDatetime: false,
    endDatetime: false,
    eventColor: false,
    allDay: false,
  }
  endManuallyEdited.value = false
}

/* restore from selectedEvent in store */
async function restoreOriginal() {
  const found: any = eventStore.selectedEvent
  if (!found) {
    resetForm()
    return
  }

  title.value = (found.title ?? '') as string

  // store may have 'start' / 'end' fields as string or Date
  const sRaw: any = found.start ?? found.startDatetime ?? ''
  const eRaw: any = found.end ?? found.endDatetime ?? ''

  // If event is all-day it might be date-only (YYYY-MM-DD) in the store
  startDatetime.value = typeof sRaw === 'string' ? sRaw : sRaw ? String(sRaw) : ''
  endDatetime.value = typeof eRaw === 'string' ? eRaw : eRaw ? String(eRaw) : ''

  // color fallbacks (backgroundColor / borderColor / eventColor)
  eventColor.value =
    (found.backgroundColor as string) ||
    (found.borderColor as string) ||
    (found.eventColor as string) ||
    '#3B86FF'

  allDay.value = !!found.allDay

  // notes may be in extendedProps or directly
  notes.value =
    (found.extendedProps && (found.extendedProps.notes as string)) || (found.notes as string) || ''

  // compute endManuallyEdited similar to new modal
  const s = parseToLocalDate(startDatetime.value)
  const e = parseToLocalDate(endDatetime.value)
  if (!startDatetime.value || !s || !e) {
    endManuallyEdited.value = !!endDatetime.value
  } else {
    const diff = Math.abs(e.getTime() - s.getTime())
    endManuallyEdited.value = Math.abs(diff - 3600_000) > 1000
  }

  touched.value = {
    title: false,
    startDatetime: false,
    endDatetime: false,
    eventColor: false,
    allDay: false,
  }

  await nextTick()
}

/* watch selectedEventId -> restore */
watch(
  () => eventStore.selectedEventId,
  () => {
    restoreOriginal()
  },
  { immediate: true },
)

/* auto-fill end +1h when start changes (skip if manually edited) */
watch(startDatetime, (newVal) => {
  if (!newVal) return
  if (endManuallyEdited.value) return

  const startDate = parseToLocalDate(newVal)
  if (!startDate) return

  if (isDateOnly(newVal)) {
    // all-day style
    endDatetime.value = formatDateOnly(startDate)
    return
  }

  const candidate = new Date(startDate.getTime())
  candidate.setHours(candidate.getHours() + 1)

  if (!endDatetime.value) {
    endDatetime.value = formatDateTimeLocal(candidate)
  } else {
    const existingEnd = parseToLocalDate(endDatetime.value)
    if (!existingEnd || existingEnd.getTime() <= startDate.getTime()) {
      endDatetime.value = formatDateTimeLocal(candidate)
    }
  }
})

function onEndInput() {
  endManuallyEdited.value = true
}

/* Toggle all day - convert values safely */
async function onToggleAllDay(checked: boolean) {
  if (checked === allDay.value) return

  if (checked) {
    const s = parseToLocalDate(startDatetime.value) ?? new Date()
    const e = parseToLocalDate(endDatetime.value) ?? new Date(s.getTime())
    startDatetime.value = formatDateOnly(s)
    endDatetime.value = formatDateOnly(e)
  } else {
    const s = parseToLocalDate(startDatetime.value) ?? new Date()
    s.setHours(9, 0, 0, 0)
    startDatetime.value = formatDateTimeLocal(s)
    const candidate = new Date(s.getTime())
    candidate.setHours(candidate.getHours() + 1)
    endDatetime.value = formatDateTimeLocal(candidate)
  }

  endManuallyEdited.value = false
  allDay.value = checked
  await nextTick()
  if ((eventStore as any).selectedPosition) {
    computeAndApplyPosition()
  }
}

/* Save (update store) */
function handleSave() {
  touched.value.title = true
  touched.value.startDatetime = true
  touched.value.endDatetime = true

  if (startAfterEnd.value) return
  if (!isValid.value) return

  const id = eventStore.selectedEventId
  if (!id) return

  const payload: any = {
    id,
    title: titleTrimmed.value,
    start: startDatetime.value,
    end: endDatetime.value,
    eventColor: eventColor.value,
    borderColor: eventColor.value,
    backgroundColor: eventColor.value,
    allDay: allDay.value,
    extendedProps: { notes: notes.value },
  }

  try {
    eventStore.updateEvent(payload)
  } catch (err) {
    console.error('EditEventModal: update failed', err)
  } finally {
    eventStore.clearSelection?.()
    resetForm()
  }
}

/* Delete */
function handleDelete() {
  const id = eventStore.selectedEventId
  if (!id) return
  if (!confirm('Delete this event?')) return

  try {
    eventStore.deleteEvent(id)
  } catch (err) {
    console.error('EditEventModal: delete failed', err)
  } finally {
    eventStore.clearSelection?.()
    resetForm()
  }
}

/* Cancel */
function handleCancel() {
  startCancel()
  eventStore.clearSelection?.()
  resetForm()
}

/* keyboard/backdrop */
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') handleCancel()
}

/* positioning - reuse pattern from NewEventModal */
const cardRef = ref<HTMLElement | null>(null)
const cardStyle = ref<Record<string, string>>({ position: 'relative' })

async function computeAndApplyPosition() {
  const pos = (eventStore as any).selectedPosition
  if (!pos) {
    cardStyle.value = { position: 'relative' }
    return
  }
  await nextTick()
  const card = cardRef.value
  if (!card) return

  const rect = card.getBoundingClientRect()
  const modalW = rect.width
  const modalH = rect.height
  const vw = window.innerWidth
  const vh = window.innerHeight
  let left = pos.x - modalW / 2
  let top = pos.y + 12
  const margin = 8
  if (left < margin) left = margin
  if (left + modalW + margin > vw) left = vw - modalW - margin
  if (top + modalH + margin > vh) {
    top = pos.y - modalH - 12
    if (top < margin) top = margin
  }
  cardStyle.value = {
    position: 'fixed',
    left: `${Math.round(left)}px`,
    top: `${Math.round(top)}px`,
    transform: 'none',
    zIndex: '1300',
  }
}

/* watch for selectedEventId and position changes to reposition/restore */
watch(
  () => [(eventStore as any).selectedEventId, (eventStore as any).selectedPosition],
  async () => {
    await nextTick()
    computeAndApplyPosition()
  },
  { immediate: true, deep: true },
)

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('resize', computeAndApplyPosition)
  window.addEventListener('scroll', computeAndApplyPosition, true)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('resize', computeAndApplyPosition)
  window.removeEventListener('scroll', computeAndApplyPosition, true)
})
</script>

<template>
  <div
    v-if="eventStore.selectedEventId"
    class="modal-backdrop"
    @click.self="handleCancel"
    role="dialog"
    aria-modal="true"
  >
    <div
      class="modal-card"
      ref="cardRef"
      :style="cardStyle"
      role="document"
      aria-label="Edit event"
    >
      <div v-if="!(eventStore as any).selectedPosition" class="caret" aria-hidden="true" />
      <button class="close-btn" @click="handleCancel" aria-label="Close">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M18 6L6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>

      <form @submit.prevent="handleSave" class="modal-form" novalidate>
        <div class="field">
          <label for="title" class="visually-hidden">Event name</label>
          <input
            id="title"
            v-model="title"
            :maxlength="TITLE_MAX"
            placeholder="Name"
            @blur="() => markTouched('title')"
            :aria-invalid="touched.title && (titleEmpty || titleTooLong) ? 'true' : 'false'"
            autocomplete="off"
            :style="{ backgroundColor: eventColor, color: titleTextColor }"
          />
          <span class="counter"> {{ `${titleLength}/${TITLE_MAX}` }} </span>
        </div>

        <div class="row column">
          <div class="field">
            <label for="startDatetime" class="visually-hidden">Event date & time</label>
            <input
              id="startDatetime"
              v-model="startDatetime"
              :type="allDay ? 'date' : 'datetime-local'"
              @blur="() => markTouched('startDatetime')"
              :aria-invalid="touched.startDatetime && startDatetimeEmpty ? 'true' : 'false'"
              required
            />
          </div>

          <div class="field">
            <label for="endDatetime" class="visually-hidden">End time</label>
            <input
              id="endDatetime"
              v-model="endDatetime"
              :type="allDay ? 'date' : 'datetime-local'"
              @blur="() => markTouched('endDatetime')"
              @input="onEndInput"
              :aria-invalid="
                touched.endDatetime && (endDatetimeEmpty || startAfterEnd) ? 'true' : 'false'
              "
              required
            />
          </div>
        </div>

        <div class="row note-and-color">
          <div style="flex: 1">
            <div class="field">
              <label for="notes" class="visually-hidden">Notes</label>
              <textarea id="notes" v-model="notes" placeholder="Notes" rows="2" />
            </div>
          </div>

          <div class="color-pick">
            <label class="color-label" title="Event color">
              <span class="icon"><PickerIcon width="20" height="20" /></span>
              <input
                type="color"
                v-model="eventColor"
                class="color-input"
                aria-label="Event color"
              />
            </label>
          </div>
        </div>

        <div class="row all-day-row">
          <label class="all-day-label">
            <input
              type="checkbox"
              :checked="allDay"
              @change="(e) => onToggleAllDay((e.target as HTMLInputElement).checked)"
              aria-label="All day"
            />
            All day
          </label>
        </div>

        <div class="actions">
          <button type="button" class="cancel" @mousedown="startCancel" @click="handleCancel">
            Cancel
          </button>
          <button type="button" class="reset" @mousedown="startCancel" @click="restoreOriginal">
            Reset
          </button>
          <button type="button" class="danger" @click="handleDelete">Delete</button>
          <button type="submit" class="save" :disabled="!isValid">Save</button>
        </div>
      </form>
    </div>
  </div>

  <!-- keep DOM presence consistent -->
  <div v-else style="display: none" aria-hidden="true"></div>
</template>

<style scoped>
/* Reuse the same styles as NewEventModal (copy/paste) */
.modal-backdrop {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 64px;
  z-index: 1200;
}
.modal-card {
  width: 320px;
  background: #fff;
  border-radius: 12px;
  padding: 14px;
  box-shadow: 0 10px 30px rgba(11, 20, 40, 0.12);
  border: 1px solid rgba(16, 24, 40, 0.06);
  transform-origin: top center;
  position: relative;
}
.modal-card .caret {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 12px;
  height: 12px;
  background: #fff;
  border-left: 1px solid rgba(16, 24, 40, 0.06);
  border-top: 1px solid rgba(16, 24, 40, 0.06);
  box-shadow: -2px -2px 6px rgba(11, 20, 40, 0.04);
  border-radius: 2px;
}
.close-btn {
  position: absolute;
  right: 8px;
  top: 8px;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: rgba(16, 24, 40, 0.03);
  border: none;
  cursor: pointer;
  color: #6b6f76;
}
.close-btn:hover {
  background: rgba(16, 24, 40, 0.06);
}
.modal-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.field input[type='text'],
.field input[type='date'],
.field input[type='datetime-local'],
.field textarea {
  width: 100%;
  border: none;
  border-bottom: 1px solid rgba(16, 24, 40, 0.06);
  padding: 8px 6px;
  font-size: 13px;
  color: #333;
  background: transparent;
  outline: none;
  border-radius: 4px;
}
.field input::placeholder,
.field textarea::placeholder {
  color: #c9cbd0;
  font-size: 13px;
}
.row {
  display: flex;
  gap: 8px;
}
.row.column {
  flex-direction: column;
}

.note-and-color {
  align-items: center;
}
.color-pick {
  width: 68px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.textarea {
  resize: vertical;
  min-height: 54px;
  max-height: 160px;
  padding-top: 6px;
}
.actions {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 6px;
}
.actions .cancel {
  color: #6b6f76;
  background: transparent;
  border: none;
  padding: 6px 8px;
  cursor: pointer;
}
.actions .reset {
  background: transparent;
  border: 1px solid rgba(16, 24, 40, 0.06);
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
}
.actions .danger {
  background: #fff0f0;
  border: 1px solid #f5c2c2;
  color: #b00020;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
}
.actions .save {
  background: #3b86ff;
  color: #fff;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}
.actions .save[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}
.visually-hidden {
  position: absolute !important;
  height: 1px;
  width: 1px;
  overflow: hidden;
  clip: rect(1px, 1px, 1px, 1px);
  white-space: nowrap;
  border: 0;
  padding: 0;
  margin: -1px;
}
.color-label {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  background: #f3f4f6;
}
.color-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  border: 0;
  padding: 0;
  margin: 0;
  cursor: pointer;
}
.icon {
  pointer-events: none;
}
.counter {
  font-size: 13px;
  color: #666;
  display: inline-block;
  margin-left: 8px;
}
.all-day-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #666;
}
</style>
