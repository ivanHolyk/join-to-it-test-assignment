<script setup lang="ts">
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'

import { reactive, ref } from 'vue'
import { Calendar, type CalendarOptions } from '@fullcalendar/core/index.js'

import { useEventStore } from './stores/events'
import NewEventModal from './NewEventModal.vue'
import { storeToRefs } from 'pinia'
import { DayGridView } from '@fullcalendar/daygrid/internal.js'
const eventStore = useEventStore()

const { events } = storeToRefs(eventStore)
const calendarRef = ref<{ getApi: () => Calendar }>()
type calendarViews = 'dayGridMonth' | 'dayGridWeek' | 'timeGridDay' | 'listWeek'
const changeCalendarView = (newView: calendarViews) => {
  const calendarApi = calendarRef.value?.getApi()
  calendarApi?.changeView(newView)
}
const calendarOptions: CalendarOptions = reactive({
  plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin],
  initialView: 'dayGridMonth',

  weekends: true,
  locale: 'ua',
  firstDay: 1,
  events: events?.value,
  eventDisplay: 'block',
  eventTimeFormat: {
    hour: '2-digit',
    minute: '2-digit',
    meridiem: true,
    hour12: false,
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
  <button @click="changeCalendarView('dayGridMonth')">Month</button>
  <button @click="changeCalendarView('dayGridWeek')">Week</button>
  <button @click="changeCalendarView('timeGridDay')">Day</button>
  <button @click="changeCalendarView('listWeek')">List</button>

  <button @click="toggleWeekends">Toggle weekends</button>
  <button @click="toggleNewEventModal">Add event</button>
  <FullCalendar ref="calendarRef" :options="calendarOptions">
    <template v-slot:eventContent="arg" :color="arg.event.backgroundColor">
      <b>{{ arg.timeText }}</b>
      <i>{{ arg.event.title }}</i>
    </template></FullCalendar
  >
  <NewEventModal
    v-show="newEventModal"
    @cancel="handleCancel"
    @submit="handleSubmit"
  ></NewEventModal>
</template>

<style scoped></style>
