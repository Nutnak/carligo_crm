import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { vehicle_ids, ...body } = await req.json()

  const { data, error } = await supabaseAdmin
    .from('supplements')
    .update(body)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Sync associations : supprimer les anciennes, insérer les nouvelles
  if (vehicle_ids !== undefined) {
    await supabaseAdmin.from('vehicle_supplement').delete().eq('supplement_id', id)
    if (vehicle_ids.length) {
      await supabaseAdmin.from('vehicle_supplement').insert(
        vehicle_ids.map((vid: number) => ({ vehicle_id: vid, supplement_id: Number(id) }))
      )
    }
  }

  return NextResponse.json({ ...data, vehicle_ids: vehicle_ids ?? [] })
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  // Supprimer d'abord les associations
  await supabaseAdmin.from('vehicle_supplement').delete().eq('supplement_id', id)
  const { error } = await supabaseAdmin.from('supplements').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
