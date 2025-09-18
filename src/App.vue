<script setup lang="ts">
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { reactive, ref } from 'vue'
import type { CalendarOptions } from '@fullcalendar/core/index.js'

import { useEventStore } from './stores/events'
import NewEventModal from './NewEventModal.vue'
import { storeToRefs } from 'pinia'
const eventStore = useEventStore()

const { events } = storeToRefs(eventStore)
const calendarOptions: CalendarOptions = reactive({
  plugins: [dayGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  weekends: true,
  locale: 'ua',
  firstDay: 1,
  events: events?.value,
  eventTimeFormat: {
    hour: '2-digit',
    minute: '2-digit',
    meridiem: false,
  },
})

const toggleWeekends = () => {
  calendarOptions.weekends = !calendarOptions.weekends
}
const newEventModal = ref(false)
const toggleNewEventModal = () => (newEventModal.value = !newEventModal.value)

const handleCancel = () => {
  console.log('recieved cancel')
  newEventModal.value = false
}
const handleSubmit = () => {
  console.log('recieved submit')

  newEventModal.value = false
}
</script>

<template>
  <button @click="toggleWeekends">Toggle weekends</button>
  <button @click="toggleNewEventModal">Add event</button>
  <FullCalendar :options="calendarOptions">
    <template v-slot:eventContent="arg">
      <b>{{ arg.timeText }}</b>
      <i>{{ arg.event.title }}</i></template
    ></FullCalendar
  >
  <NewEventModal
    v-show="newEventModal"
    @cancel="handleCancel"
    @submit="handleSubmit"
  ></NewEventModal>
</template>

<style scoped></style>
