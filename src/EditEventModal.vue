<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useEventStore } from './stores/events'
import { formatDateTimeLocal } from './utils/dateFormatter'

const eventStore = useEventStore()

const title = ref('')
const startDatetime = ref('')
const endDatetime = ref('')
const eventColor = ref('')
const allDay = ref(false)

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

const startAfterEnd = computed(() => {
  if (!startDatetime.value || !endDatetime.value) return false
  const s = new Date(startDatetime.value)
  const e = new Date(endDatetime.value)
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return false
  return s.getTime() > e.getTime()
})

const isValid = computed(
  () =>
    !titleEmpty.value && !titleTooLong.value && !startDatetimeEmpty.value && !startAfterEnd.value,
)

function markTouched(field: 'title' | 'startDatetime' | 'endDatetime' | 'eventColor' | 'allDay') {
  if (ignoreBlur.value) return
  touched.value[field] = true
}
function startCancel() {
  ignoreBlur.value = true
}

function resetForm() {
  title.value = ''
  startDatetime.value = ''
  endDatetime.value = ''
  eventColor.value = ''
  allDay.value = false
  touched.value = {
    title: false,
    startDatetime: false,
    endDatetime: false,
    eventColor: false,
    allDay: false,
  }
  endManuallyEdited.value = false
}

async function restoreOriginal() {
  const found = eventStore.selectedEvent
  if (!found) {
    resetForm()
    return
  }

  title.value = found.title ?? ''
  startDatetime.value = found.start?.toString() ?? ''
  endDatetime.value = found.end?.toString() ?? ''
  eventColor.value = found.backgroundColor ?? ''
  allDay.value = !!found.allDay

  const s = new Date(startDatetime.value)
  const e = new Date(endDatetime.value)
  if (!startDatetime.value || isNaN(s.getTime()) || isNaN(e.getTime())) {
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

watch(
  () => eventStore.selectedEventId,
  () => {
    restoreOriginal()
  },
  { immediate: true },
)

watch(startDatetime, (newVal) => {
  if (!newVal) return
  if (endManuallyEdited.value) return

  const startDate = new Date(newVal)
  if (isNaN(startDate.getTime())) return

  const candidate = new Date(startDate.getTime())
  candidate.setHours(candidate.getHours() + 1)

  if (!endDatetime.value) {
    endDatetime.value = formatDateTimeLocal(candidate)
  } else {
    const existingEnd = new Date(endDatetime.value)
    if (isNaN(existingEnd.getTime()) || existingEnd.getTime() <= startDate.getTime()) {
      endDatetime.value = formatDateTimeLocal(candidate)
    }
  }
})

function onEndInput() {
  endManuallyEdited.value = true
}

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
  }

  try {
    eventStore.updateEvent(payload)
  } catch (err) {
    console.error('EditEventModal: update failed', err)
  } finally {
    eventStore.clearSelection()
  }
}

function handleDelete() {
  const id = eventStore.selectedEventId
  if (!id) return
  if (!confirm('Delete this event?')) return

  try {
    eventStore.deleteEvent(id)
  } catch (err) {
    console.error('EditEventModal: delete failed', err)
  } finally {
    eventStore.clearSelection()
  }
}

function handleCancel() {
  startCancel()
  eventStore.clearSelection()
  resetForm()
}
</script>

<template>
  <div v-if="eventStore.selectedEventId" class="modal">
    <form @submit.prevent="handleSave" novalidate>
      <div class="field">
        <label for="title">Title</label>
        <input
          id="title"
          v-model="title"
          :maxlength="TITLE_MAX"
          @blur="() => markTouched('title')"
          :aria-invalid="touched.title && (titleEmpty || titleTooLong) ? 'true' : 'false'"
          placeholder="Event title (max 30 chars)"
          required
        />
        <div class="meta">
          <small>{{ titleLength }}/{{ TITLE_MAX }}</small>
        </div>

        <p v-if="touched.title && titleEmpty" class="error">Title is required.</p>
        <p v-if="touched.title && titleTooLong" class="error">
          Title must be at most {{ TITLE_MAX }} characters.
        </p>
      </div>

      <div class="field">
        <label for="startDatetime">Start</label>
        <input
          id="startDatetime"
          v-model="startDatetime"
          type="datetime-local"
          @blur="() => markTouched('startDatetime')"
          :aria-invalid="touched.startDatetime && startDatetimeEmpty ? 'true' : 'false'"
          required
        />
        <p v-if="touched.startDatetime && startDatetimeEmpty" class="error">
          Date & time is required.
        </p>
      </div>

      <div class="field">
        <label for="endDatetime">End</label>
        <input
          id="endDatetime"
          v-model="endDatetime"
          type="datetime-local"
          @blur="() => markTouched('endDatetime')"
          @input="onEndInput"
          :aria-invalid="
            touched.endDatetime && (endDatetimeEmpty || startAfterEnd) ? 'true' : 'false'
          "
          required
        />
        <p v-if="touched.endDatetime && endDatetimeEmpty" class="error">Date & time is required.</p>
        <p v-if="(touched.startDatetime || touched.endDatetime) && startAfterEnd" class="error">
          End must be after start.
        </p>
      </div>

      <div class="field">
        <label for="color">Event color</label>
        <input
          id="eventColor"
          v-model="eventColor"
          type="color"
          @blur="() => markTouched('eventColor')"
        />
      </div>

      <div class="field">
        <label for="allDay">All day</label>
        <input id="allDay" v-model="allDay" type="checkbox" @blur="() => markTouched('allDay')" />
      </div>

      <div class="actions">
        <button type="button" @mousedown="startCancel" @click="handleCancel">Cancel</button>
        <button type="button" @mousedown="startCancel" @click="resetForm">Reset</button>
        <button type="button" @click="handleDelete" class="danger">Delete</button>
        <button type="submit">Save</button>
      </div>
    </form>
  </div>

  <div v-else class="modal" aria-hidden="true" style="display: none"></div>
</template>

<style scoped>
.modal {
  padding: 1rem;
  background: white;
  border-radius: 6px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
}
.field {
  margin-bottom: 0.75rem;
}
.error {
  color: #b00020;
  font-size: 0.9rem;
  margin-top: 0.25rem;
}
.meta {
  display: flex;
  justify-content: flex-end;
  font-size: 0.8rem;
  color: #666;
}
.actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
button[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}
button.danger {
  background: #fff0f0;
  border: 1px solid #f5c2c2;
  color: #b00020;
}
</style>
