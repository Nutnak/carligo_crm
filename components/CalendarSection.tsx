'use client'

import dynamic from 'next/dynamic'
import type { Booking } from '@/types'

const BookingCalendar = dynamic(() => import('@/components/BookingCalendar'), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-xl border border-gray-200 h-[600px] flex items-center justify-center text-gray-400">
      Chargement du calendrier...
    </div>
  ),
})

export default function CalendarSection({ bookings }: { bookings: Booking[] }) {
  return <BookingCalendar bookings={bookings} />
}
