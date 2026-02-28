import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ArrowLeft, Mail, Phone, CalendarDays } from 'lucide-react'
import Link from 'next/link'
import DashboardHeader from '@/components/DashboardHeader'
import { getBookingStatusBadge } from '@/components/ui/Badge'
import type { Booking, Client } from '@/types'

async function getClient(id: string) {
  const [{ data: client, error }, { data: bookings }] = await Promise.all([
    supabaseAdmin.from('clients').select('*').eq('id', id).single(),
    supabaseAdmin
      .from('bookings')
      .select('*, vehicles(brand, model)')
      .eq('client_id', id)
      .order('from', { ascending: false }),
  ])

  if (error || !client) return null
  return { client: client as Client, bookings: (bookings ?? []) as Booking[] }
}

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const result = await getClient(id)
  if (!result) notFound()

  const { client, bookings } = result

  return (
    <div>
      <Link
        href="/clients"
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4 transition-colors"
      >
        <ArrowLeft size={15} />
        Retour aux clients
      </Link>

      <DashboardHeader
        title={`${client.firstname} ${client.name}`}
        description={`${bookings.length} réservation(s)`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Coordonnées</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Mail size={15} className="shrink-0" />
              <span>{client.mail}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Phone size={15} className="shrink-0" />
              <span>{client.phone_number || '—'}</span>
            </div>
            {client.created_at && (
              <div className="flex items-center gap-2 text-gray-600">
                <CalendarDays size={15} className="shrink-0" />
                <span>Client depuis {format(new Date(client.created_at), 'MMMM yyyy', { locale: fr })}</span>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Historique des réservations</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Véhicule</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Du</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Au</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                    Aucune réservation
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 text-gray-900">
                      {(b.vehicles as any)?.brand} {(b.vehicles as any)?.model}
                    </td>
                    <td className="px-6 py-3 text-gray-600">
                      {format(new Date(b.from), 'dd/MM/yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-3 text-gray-600">
                      {format(new Date(b.to), 'dd/MM/yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-3">{getBookingStatusBadge(b.status)}</td>
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
