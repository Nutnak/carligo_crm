import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import { startOfMonth, endOfMonth, format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { CalendarDays, TrendingUp, Car, Euro } from 'lucide-react'
import DashboardHeader from '@/components/DashboardHeader'
import { getBookingStatusBadge } from '@/components/ui/Badge'
import type { Booking } from '@/types'

async function getStats() {
  const now = new Date()
  const monthStart = startOfMonth(now).toISOString()
  const monthEnd = endOfMonth(now).toISOString()

  const [
    { count: totalBookings },
    { count: monthlyBookings },
    { data: revenueData },
    { data: monthlyRevenueData },
    { count: activeVehicles },
    { data: recentBookings },
  ] = await Promise.all([
    supabaseAdmin.from('bookings').select('*', { count: 'exact', head: true }),
    supabaseAdmin
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', monthStart)
      .lte('created_at', monthEnd),
    supabaseAdmin.from('bookings').select('amount_total').eq('status', 'CONFIRME'),
    supabaseAdmin
      .from('bookings')
      .select('amount_total')
      .eq('status', 'CONFIRME')
      .gte('created_at', monthStart)
      .lte('created_at', monthEnd),
    supabaseAdmin.from('vehicles').select('*', { count: 'exact', head: true }),
    supabaseAdmin
      .from('bookings')
      .select('*, vehicles(brand, model), clients(firstname, name, mail)')
      .order('created_at', { ascending: false })
      .limit(8),
  ])

  const totalRevenue = revenueData?.reduce((s, b) => s + (b.amount_total || 0), 0) ?? 0
  const monthlyRevenue = monthlyRevenueData?.reduce((s, b) => s + (b.amount_total || 0), 0) ?? 0

  return {
    totalBookings: totalBookings ?? 0,
    monthlyBookings: monthlyBookings ?? 0,
    totalRevenue,
    monthlyRevenue,
    activeVehicles: activeVehicles ?? 0,
    recentBookings: (recentBookings ?? []) as Booking[],
  }
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const stats = await getStats()

  const statCards = [
    {
      label: 'Réservations totales',
      value: stats.totalBookings,
      sub: `${stats.monthlyBookings} ce mois`,
      icon: CalendarDays,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Revenus totaux',
      value: `${stats.totalRevenue.toLocaleString('fr-FR')} €`,
      sub: `${stats.monthlyRevenue.toLocaleString('fr-FR')} € ce mois`,
      icon: Euro,
      color: 'text-green-600 bg-green-50',
    },
    {
      label: 'Véhicules',
      value: stats.activeVehicles,
      sub: 'en base',
      icon: Car,
      color: 'text-purple-600 bg-purple-50',
    },
    {
      label: 'Taux mensuel',
      value: stats.monthlyBookings,
      sub: 'réservations ce mois',
      icon: TrendingUp,
      color: 'text-orange-600 bg-orange-50',
    },
  ]

  return (
    <div>
      <DashboardHeader
        title="Dashboard"
        description={`Bienvenue — ${format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500 font-medium">{label}</span>
              <div className={`p-2 rounded-lg ${color}`}>
                <Icon size={18} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-400 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Dernières réservations</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Client</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Véhicule</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Du</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Au</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentBookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    Aucune réservation
                  </td>
                </tr>
              ) : (
                stats.recentBookings.map((b) => (
                  <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-gray-900">
                      {(b.clients as any)?.firstname} {(b.clients as any)?.name}
                    </td>
                    <td className="px-6 py-3 text-gray-600">
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
