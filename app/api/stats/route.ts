import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { startOfMonth, endOfMonth } from 'date-fns'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
    supabaseAdmin
      .from('bookings')
      .select('amount_total')
      .eq('status', 'CONFIRME'),
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
      .limit(5),
  ])

  const totalRevenue = revenueData?.reduce((s, b) => s + (b.amount_total || 0), 0) ?? 0
  const monthlyRevenue = monthlyRevenueData?.reduce((s, b) => s + (b.amount_total || 0), 0) ?? 0

  return NextResponse.json({
    totalBookings: totalBookings ?? 0,
    monthlyBookings: monthlyBookings ?? 0,
    totalRevenue,
    monthlyRevenue,
    activeVehicles: activeVehicles ?? 0,
    recentBookings: recentBookings ?? [],
  })
}
