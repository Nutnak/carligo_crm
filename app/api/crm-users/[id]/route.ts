import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  // Empêcher la suppression de son propre compte
  if (session.user?.email) {
    const { data: self } = await supabaseAdmin
      .from('crm_users')
      .select('email')
      .eq('id', id)
      .single()
    if (self?.email === session.user.email) {
      return NextResponse.json({ error: 'Impossible de supprimer votre propre compte' }, { status: 403 })
    }
  }

  const { error } = await supabaseAdmin.from('crm_users').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { name, password } = await req.json()

  const updates: Record<string, string> = {}
  if (name) updates.name = name
  if (password) updates.password_hash = await bcrypt.hash(password, 12)

  const { data, error } = await supabaseAdmin
    .from('crm_users')
    .update(updates)
    .eq('id', id)
    .select('id, name, email, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
