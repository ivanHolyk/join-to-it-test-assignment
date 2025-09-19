import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'
import type { EventInput } from '@fullcalendar/core/index.js'

export const useEventStore = defineStore('events', () => {
  const events = reactive<Array<EventInput>>([
    { title: 'event 1', start: '2025-09-01' },
    { title: 'event 2', start: '2025-09-05', end: '2025-09-07' },
    { title: 'event 3', start: '2025-09-09T12:30:00', allDay: false },
    {
      title: 'hello',
      start: '2025-09-19T08:09',
      end: '2025-09-19T09:09',
      eventColor: '#0c3614',
      borderColor: '#0c3614',
      backgroundColor: '#0c3614',
      allDay: true,
    },
    {
      title: 'hello 2',
      start: '2025-09-19T08:10',
      end: '2025-09-19T11:10',
      eventColor: '#6b5e1f',
      borderColor: '#6b5e1f',
      backgroundColor: '#6b5e1f',
      allDay: false,
    },
    {
      title: 'loooooong',
      start: '2025-09-18T08:13',
      end: '2025-09-23T09:13',
      eventColor: '#882b2b',
      borderColor: '#882b2b',
      backgroundColor: '#882b2b',
      allDay: false,
    },
    {
      title: 'l2',
      start: '2025-09-18T07:20',
      end: '2025-09-18T09:20',
      eventColor: '#af6060',
      borderColor: '#af6060',
      backgroundColor: '#af6060',
      allDay: false,
    },
  ])

  const addNewEvent = (input: EventInput) => {
    events.push(input)
  }
  return { events, addNewEvent }
})
