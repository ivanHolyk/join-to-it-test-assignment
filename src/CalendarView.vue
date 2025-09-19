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
import { formatDateTimeLocal } from './utils/dateFormatter'

const eventStore = useEventStore()
const { events } = storeToRefs(eventStore)
const calendarRef = ref<{ getApi: () => Calendar }>()

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

    const js = (info as any).jsEvent as MouseEvent | undefined
    const pos = js ? { x: js.clientX, y: js.clientY } : null

    eventStore.selectDate(dtStr, pos)
    newEventModal.value = true
  },
})

const newEventModal = ref(false)

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
    <FullCalendar ref="calendarRef" :options="calendarOptions">
      <template v-slot:eventContent="arg" :color="arg.event.backgroundColor">
        <span style="margin-left: 0.33rem">
          <b>{{ arg.timeText }}</b> {{ arg.event.title }}</span
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
