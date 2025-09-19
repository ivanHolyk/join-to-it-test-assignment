import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'
import type { EventInput } from '@fullcalendar/core/index.js'
import { v4 as uuidv4 } from 'uuid'
import { pickForegroundColor } from '../utils/color-contrast'

export const useEventStore = defineStore('events', () => {
  const events = reactive<Array<EventInput>>([
    { id: '00000000-0000-0000-0000-000000000001', title: 'event 1', start: '2025-09-01' },
    {
      id: '00000000-0000-0000-0000-000000000002',
      title: 'event 2',
      start: '2025-09-05',
      end: '2025-09-07',
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
      title: 'event 3',
      start: '2025-09-09T12:30:00',
      allDay: false,
    },
    {
      id: '00000000-0000-0000-0000-000000000004',
      title: 'hello',
      start: '2025-09-19T08:09',
      end: '2025-09-19T09:09',
      borderColor: '#0c3614',
      backgroundColor: '#0c3614',
      allDay: true,
      textColor: '#fff',
    },
    {
      id: '00000000-0000-0000-0000-000000000005',
      title: 'hello 2',
      start: '2025-09-19T08:10',
      end: '2025-09-19T11:10',
      borderColor: '#6b5e1f',
      backgroundColor: '#6b5e1f',
      allDay: false,
      textColor: '#fff',
    },
    {
      id: '00000000-0000-0000-0000-000000000006',
      title: 'loooooong',
      start: '2025-09-18T08:13',
      end: '2025-09-23T09:13',
      borderColor: '#882b2b',
      backgroundColor: '#882b2b',
      allDay: false,
      textColor: '#fff',
    },
    {
      id: '00000000-0000-0000-0000-000000000007',
      title: 'l2',
      start: '2025-09-18T07:20',
      end: '2025-09-18T09:20',
      borderColor: '#af6060',
      backgroundColor: '#af6060',
      allDay: false,
      textColor: '#fff',
    },
  ])

  const selectedEventId = ref<string | null>(null)

  const selectedEvent = computed(() => {
    if (!selectedEventId.value) return null
    return events.find((e: any) => String(e.id) === String(selectedEventId.value)) ?? null
  })

  function selectEvent(id: string | null) {
    selectedEventId.value = id
  }
  function clearSelection() {
    selectedEventId.value = null
  }

  function computeTextColorFromBg(bg: string | undefined, prefer?: 'black' | 'white' | 'contrast') {
    if (!bg) return '#000'
    try {
      const res = pickForegroundColor(bg, { prefer: prefer ?? 'contrast' })

      if (typeof res === 'string') return res
      return res.color
    } catch (err) {
      console.warn('computeTextColorFromBg: invalid bg color', bg, err)
      return '#000'
    }
  }

  const addNewEvent = (input: EventInput) => {
    const bg = input.backgroundColor ?? input.borderColor
    const textColor = computeTextColorFromBg(bg)
    events.push({ ...(input as any), id: uuidv4(), textColor })
  }

  function updateEvent(payload: Partial<EventInput> & { id: string }) {
    const idx = events.findIndex((e: any) => String(e.id) === String(payload.id))
    if (idx === -1) {
      const bg = (payload as any).backgroundColor ?? (payload as any).borderColor
      const textColor = computeTextColorFromBg(bg)
      events.push({ ...(payload as EventInput), textColor })
      return
    }

    const incomingBg = (payload as any).backgroundColor ?? (payload as any).borderColor

    const base = { ...(events[idx] as any) }
    const updated = { ...base, ...(payload as any) }

    if (incomingBg) {
      updated.textColor = computeTextColorFromBg(incomingBg)
    } else if (!updated.textColor) {
      const existingBg = updated.backgroundColor ?? updated.borderColor
      updated.textColor = computeTextColorFromBg(existingBg)
    }

    events.splice(idx, 1, updated)
  }

  function deleteEvent(id: string) {
    const idx = events.findIndex((e: any) => String(e.id) === String(id))
    if (idx !== -1) events.splice(idx, 1)

    if (String(selectedEventId.value) === String(id)) selectedEventId.value = null
  }

  return {
    events,
    addNewEvent,
    selectedEventId,
    selectedEvent,
    selectEvent,
    clearSelection,
    updateEvent,
    deleteEvent,
  }
})
