import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [{ data: supplements, error }, { data: links }] = await Promise.all([
    supabaseAdmin.from('supplements').select('*').order('id'),
    supabaseAdmin.from('vehicle_supplement').select('supplement_id, vehicle_id'),
  ])

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Enrichir chaque supplement avec ses vehicle_ids
  const data = (supplements ?? []).map((s) => ({
    ...s,
    vehicle_ids: (links ?? [])
      .filter((l) => l.supplement_id === s.id)
      .map((l) => l.vehicle_id),
  }))

  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { vehicle_ids, ...body } = await req.json()

  const { data: supplement, error } = await supabaseAdmin
    .from('supplements')
    .insert(body)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Créer les associations véhicules
  if (vehicle_ids?.length) {
    await supabaseAdmin.from('vehicle_supplement').insert(
      vehicle_ids.map((vid: number) => ({ vehicle_id: vid, supplement_id: supplement.id }))
    )
  }

  return NextResponse.json({ ...supplement, vehicle_ids: vehicle_ids ?? [] }, { status: 201 })
}
