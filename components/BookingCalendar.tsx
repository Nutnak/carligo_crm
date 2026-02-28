'use client'

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import frLocale from '@fullcalendar/core/locales/fr'
import { useRouter } from 'next/navigation'
import type { Booking } from '@/types'

function getEventColor(status: string) {
  switch (status) {
    case 'CONFIRME':
      return '#16a34a'
    case 'ANNULE':
      return '#dc2626'
    default:
      return '#d97706'
  }
}

interface BookingCalendarProps {
  bookings: Booking[]
}

export default function BookingCalendar({ bookings }: BookingCalendarProps) {
  const router = useRouter()

  const events = bookings.map((b) => ({
    id: b.id,
    title: `${(b.vehicles as any)?.brand} ${(b.vehicles as any)?.model} — ${(b.clients as any)?.firstname} ${(b.clients as any)?.name}`,
    start: b.from,
    end: b.to,
    backgroundColor: getEventColor(b.status),
    borderColor: getEventColor(b.status),
  }))

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <FullCalendar
        plugins={[dayGridPlugin, listPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale={frLocale}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,listMonth',
        }}
        events={events}
        eventClick={(info) => router.push(`/reservations/${info.event.id}`)}
        height={600}
        eventDisplay="block"
      />
    </div>
  )
}
