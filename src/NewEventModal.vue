<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useEventStore } from './stores/events'

type SubmitPayload = { title: string; datetime: string }

const emit = defineEmits<{
  (e: 'submit', payload: SubmitPayload): void
  (e: 'cancel'): void
}>()

const eventStore = useEventStore()

const title = ref('')
const datetime = ref('')
const touched = ref({ title: false, datetime: false })
const ignoreBlur = ref(false)

const TITLE_MAX = 30
const titleTrimmed = computed(() => title.value.trim())
const titleLength = computed(() => titleTrimmed.value.length)
const titleEmpty = computed(() => titleLength.value === 0)
const titleTooLong = computed(() => titleLength.value > TITLE_MAX)
const datetimeEmpty = computed(() => datetime.value.trim() === '')
const isValid = computed(() => !titleEmpty.value && !titleTooLong.value && !datetimeEmpty.value)

function markTouched(field: 'title' | 'datetime') {
  if (ignoreBlur.value) return
  touched.value[field] = true
}

function startCancel() {
  ignoreBlur.value = true
}

async function handleCancel() {
  resetForm()
  await nextTick()
  ignoreBlur.value = false
  emit('cancel')
}

function resetForm() {
  title.value = ''
  datetime.value = ''
  touched.value = { title: false, datetime: false }
}

function handleSubmit() {
  touched.value.title = true
  touched.value.datetime = true
  if (!isValid.value) return
  eventStore.addNewEvent({ title: titleTrimmed.value, start: datetime.value })
  emit('submit', { title: titleTrimmed.value, datetime: datetime.value })
  resetForm()
}
</script>

<template>
  <div class="modal">
    <form @submit.prevent="handleSubmit" novalidate>
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
        <label for="datetime">Date & time</label>
        <input
          id="datetime"
          v-model="datetime"
          type="datetime-local"
          @blur="() => markTouched('datetime')"
          :aria-invalid="touched.datetime && datetimeEmpty ? 'true' : 'false'"
          required
        />
        <p v-if="touched.datetime && datetimeEmpty" class="error">Date & time is required.</p>
      </div>

      <div class="actions">
        <button type="button" @mousedown="startCancel" @click="handleCancel">Cancel</button>
        <button type="submit">Submit</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.modal {
  padding: 1rem;
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
</style>
