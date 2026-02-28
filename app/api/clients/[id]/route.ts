import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const [{ data: client, error }, { data: bookings, error: bookingsError }] = await Promise.all([
    supabaseAdmin.from('clients').select('*').eq('id', id).single(),
    supabaseAdmin
      .from('bookings')
      .select('*, vehicles(brand, model)')
      .eq('client_id', id)
      .order('from', { ascending: false }),
  ])

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  if (bookingsError) return NextResponse.json({ error: bookingsError.message }, { status: 500 })

  return NextResponse.json({ client, bookings })
}
