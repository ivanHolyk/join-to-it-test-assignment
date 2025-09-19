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

  function computeTextColorFromBg(bg: string) {
    try {
      const res = pickForegroundColor(bg)

      if (typeof res === 'string') return res
      return res.color
    } catch (err) {
      console.warn('computeTextColorFromBg: invalid bg color', bg, err)
      return '#000'
    }
  }

  function ensureEndAfterStart(start?: string, end?: string) {
    if (!start) return end
    const s = new Date(start)
    if (isNaN(s.getTime())) return end
    if (!end) {
      const candidate = new Date(s.getTime())
      candidate.setHours(candidate.getHours() + 1)
      return candidate.toISOString().slice(0, 16)
    }
    const e = new Date(end)
    if (isNaN(e.getTime()) || e.getTime() <= s.getTime()) {
      const candidate = new Date(s.getTime())
      candidate.setHours(candidate.getHours() + 1)
      return candidate.toISOString().slice(0, 16)
    }
    return end
  }

  const addNewEvent = (input: EventInput) => {
    const start = input.start
    const end = ensureEndAfterStart(start?.toString(), input.end?.toString())
    console.log({ bg: input.backgroundColor }, { broder: input.borderColor })
    const bg =
      input.backgroundColor && input.backgroundColor != '' ? input.backgroundColor : '#3B86FF'
    console.log(bg)
    const textColor = computeTextColorFromBg(bg)
    events.push({ ...input, id: uuidv4(), end, textColor })
  }

  function updateEvent(payload: Partial<EventInput> & { id: string }) {
    const idx = events.findIndex((e: any) => String(e.id) === String(payload.id))

    const startCandidate = payload.start ?? (idx !== -1 ? events[idx].start : undefined)
    const endCandidate = payload.end ?? (idx !== -1 ? events[idx].end : undefined)
    const correctedEnd = ensureEndAfterStart(
      startCandidate as string | undefined,
      endCandidate as string | undefined,
    )

    if (idx === -1) {
      const bg = payload.backgroundColor ?? payload.borderColor ?? payload.eventColor
      const textColor = computeTextColorFromBg(bg)
      events.push({ ...(payload as EventInput), end: correctedEnd, textColor })
      return
    }

    const incomingBg = payload.backgroundColor ?? payload.borderColor ?? payload.eventColor

    const base = { ...(events[idx] as any) }
    const updated = { ...base, ...payload }

    if (correctedEnd) updated.end = correctedEnd

    if (incomingBg) {
      updated.textColor = computeTextColorFromBg(incomingBg)
    } else if (!updated.textColor) {
      const existingBg = updated.backgroundColor ?? updated.borderColor ?? updated.eventColor
      updated.textColor = computeTextColorFromBg(existingBg)
    }

    events.splice(idx, 1, updated)
  }

  function deleteEvent(id: string) {
    const idx = events.findIndex((e: any) => String(e.id) === String(id))
    if (idx !== -1) events.splice(idx, 1)

    if (String(selectedEventId.value) === String(id)) selectedEventId.value = null
  }

  const selectedDate = ref<string | null>(null)
  function selectDate(isoOrEmpty: string | null) {
    selectedDate.value = isoOrEmpty
  }
  function clearSelectedDate() {
    selectedDate.value = null
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

    selectedDate,
    selectDate,
    clearSelectedDate,
  }
})
