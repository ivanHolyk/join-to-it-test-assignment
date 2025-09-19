<script setup lang="ts">
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin, { type DateClickArg } from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'

import { reactive, ref, computed } from 'vue'
import { Calendar, type CalendarOptions, type EventClickArg } from '@fullcalendar/core/index.js'

import { useEventStore } from './stores/events'
import NewEventModal from './NewEventModal.vue'
import EditEventModal from './EditEventModal.vue'
import { storeToRefs } from 'pinia'

const eventStore = useEventStore()
const { events, selectedEventId, selectedDate } = storeToRefs(eventStore)
const calendarRef = ref<{ getApi: () => Calendar }>()
type calendarViews = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek'
const changeCalendarView = (newView: calendarViews) => {
  const calendarApi = calendarRef.value?.getApi()
  calendarApi?.changeView(newView)
}
function formatDateTimeLocal(d: Date) {
  const pad = (n: number) => (n < 10 ? '0' + n : '' + n)
  const yyyy = d.getFullYear()
  const mm = pad(d.getMonth() + 1)
  const dd = pad(d.getDate())
  const hh = pad(d.getHours())
  const min = pad(d.getMinutes())
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`
}
const calendarOptions: CalendarOptions = reactive({
  plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin],
  initialView: 'dayGridMonth',
  editable: true,
  nowIndicator: true,
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
  eventColor: '#3B86FF',
  headerToolbar: {
    start: 'today,prev,next',
    center: 'title',
    end: 'dayGridMonth,timeGridWeek,timeGridDay',
  },

  dateClick: function (info: DateClickArg) {
    const dtStr = formatDateTimeLocal(info.date)
    eventStore.selectDate(dtStr)
    newEventModal.value = true
  },
})

const newEventModal = ref(false)
const toggleNewEventModal = () => (newEventModal.value = !newEventModal.value)

const handleEventClick = (info: EventClickArg) => {
  const clickedId = info.event.id
  console.log(`event id to edit: ${clickedId}`)
  eventStore.selectEvent(clickedId)
}

calendarOptions.eventClick = handleEventClick

const handleCancel = () => {
  console.log('recieved cancel')
  newEventModal.value = false
}
const handleSubmit = () => {
  console.log('recieved submit')
  newEventModal.value = false
}

const isEditing = computed(() => !!eventStore.selectedEventId)
</script>

<template>
  <div class="page-card">
    <button @click="changeCalendarView('dayGridMonth')">Month</button>
    <button @click="changeCalendarView('timeGridWeek')">Week</button>
    <button @click="changeCalendarView('timeGridDay')">Day</button>
    <button @click="changeCalendarView('listWeek')">List</button>

    <button @click="toggleNewEventModal">Add event</button>

    <FullCalendar ref="calendarRef" :options="calendarOptions">
      <template v-slot:eventContent="arg" :color="arg.event.backgroundColor">
        <span style="margin-left: 0.33rem">
          <b>{{ arg.timeText }}</b> <i>{{ arg.event.title }}</i></span
        >
      </template>
    </FullCalendar>

    <NewEventModal v-show="newEventModal" @cancel="handleCancel" @submit="handleSubmit" />

    <EditEventModal v-show="isEditing" />
  </div>
</template>

<style scoped>
.page-card {
  background: #fff;
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  height: fit-content;
}
</style>
