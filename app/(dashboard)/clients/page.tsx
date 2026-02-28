import { supabaseAdmin } from '@/lib/supabase'
import Link from 'next/link'
import { Users, Mail, Phone } from 'lucide-react'
import DashboardHeader from '@/components/DashboardHeader'
import type { Client } from '@/types'

async function getClients() {
  const { data } = await supabaseAdmin
    .from('clients')
    .select('*, bookings(count)')
    .order('created_at', { ascending: false })

  return (data ?? []) as (Client & { bookings: { count: number }[] })[]
}

export default async function ClientsPage() {
  const clients = await getClients()

  return (
    <div>
      <DashboardHeader
        title="Clients"
        description={`${clients.length} client(s) enregistré(s)`}
      />

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Nom</th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Email</th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Téléphone</th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Réservations</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                  <Users size={32} className="mx-auto mb-2 opacity-30" />
                  Aucun client
                </td>
              </tr>
            ) : (
              clients.map((c) => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3 font-medium text-gray-900">
                    {c.firstname} {c.name}
                  </td>
                  <td className="px-6 py-3">
                    <span className="flex items-center gap-1.5 text-gray-600">
                      <Mail size={13} />
                      {c.mail}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    {c.phone_number ? (
                      <span className="flex items-center gap-1.5 text-gray-600">
                        <Phone size={13} />
                        {c.phone_number}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-gray-700">
                    {c.bookings?.[0]?.count ?? 0} résa
                  </td>
                  <td className="px-6 py-3">
                    <Link
                      href={`/clients/${c.id}`}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      Voir détail
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
