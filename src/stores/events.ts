import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'
import type { EventInput } from '@fullcalendar/core/index.js'

export const useEventStore = defineStore('events', () => {
  const events = reactive<Array<EventInput>>([
    {
      title: 'event 1',
      start: '2025-09-01',
    },
    {
      title: 'event 2',
      start: '2025-09-05',
      end: '2025-09-07',
    },
    {
      title: 'event 3',
      start: '2025-09-09T12:30:00',
      allDay: false, // will make the time show
    },
  ])

  const addNewEvent = (input: EventInput) => {
    events.push(input)
  }
  return { events, addNewEvent }
})
