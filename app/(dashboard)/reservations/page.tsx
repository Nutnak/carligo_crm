import { supabaseAdmin } from '@/lib/supabase'
import { format } from 'date-fns'
import Link from 'next/link'
import DashboardHeader from '@/components/DashboardHeader'
import CalendarSection from '@/components/CalendarSection'
import { getBookingStatusBadge } from '@/components/ui/Badge'
import type { Booking } from '@/types'

async function getBookings(): Promise<Booking[]> {
  const { data } = await supabaseAdmin
    .from('bookings')
    .select('*, vehicles(brand, model, city), clients(firstname, name, mail, phone_number)')
    .order('from', { ascending: false })

  return (data ?? []) as Booking[]
}

export default async function ReservationsPage() {
  const bookings = await getBookings()

  return (
    <div>
      <DashboardHeader
        title="Réservations"
        description={`${bookings.length} réservation(s) au total`}
      />

      <div className="mb-8">
        <CalendarSection bookings={bookings} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Liste des réservations</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Client</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Véhicule</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Du</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Au</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Ville</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Statut</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    Aucune réservation
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-gray-900">
                      {(b.clients as any)?.firstname} {(b.clients as any)?.name}
                    </td>
                    <td className="px-6 py-3 text-gray-600">
                      {(b.vehicles as any)?.brand} {(b.vehicles as any)?.model}
                    </td>
                    <td className="px-6 py-3 text-gray-600">
                      {format(new Date(b.from), 'dd/MM/yy HH:mm')}
                    </td>
                    <td className="px-6 py-3 text-gray-600">
                      {format(new Date(b.to), 'dd/MM/yy HH:mm')}
                    </td>
                    <td className="px-6 py-3 text-gray-600">{b.city || (b.vehicles as any)?.city || '—'}</td>
                    <td className="px-6 py-3">{getBookingStatusBadge(b.status)}</td>
                    <td className="px-6 py-3">
                      <Link
                        href={`/reservations/${b.id}`}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        Détail
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
