'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ArrowLeft, Loader2, Car, User, FileText } from 'lucide-react'
import DashboardHeader from '@/components/DashboardHeader'
import { getBookingStatusBadge } from '@/components/ui/Badge'
import type { Booking } from '@/types'

export default function ReservationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/bookings/${id}`)
      .then((r) => r.json())
      .then((data) => { if (data?.id) setBooking(data) })
      .finally(() => setLoading(false))
  }, [id])

  async function updateStatus(status: string) {
    if (!booking) return
    setSaving(true)
    const res = await fetch(`/api/bookings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      const updated = await res.json()
      setBooking((b) => b ? { ...b, status: updated.status } : b)
    }
    setSaving(false)
  }

  if (loading) return <div className="text-center py-16 text-gray-400">Chargement...</div>
  if (!booking) return <div className="text-center py-16 text-gray-400">Réservation introuvable</div>

  const vehicle = booking.vehicles as any
  const client = booking.clients as any

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4 transition-colors"
        >
          <ArrowLeft size={15} />
          Retour
        </button>
        <DashboardHeader
          title="Détail réservation"
          description={`Réf. ${booking.numFacture || booking.id}`}
          action={
            <div className="flex items-center gap-2">
              {getBookingStatusBadge(booking.status)}
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Car size={18} className="text-blue-600" />
            <h2 className="font-semibold text-gray-800">Véhicule</h2>
          </div>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Modèle</dt>
              <dd className="font-medium text-gray-900">{vehicle?.brand} {vehicle?.model}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Ville</dt>
              <dd className="text-gray-700">{booking.city || vehicle?.city || '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Du</dt>
              <dd className="text-gray-700">{format(new Date(booking.from), "dd MMM yyyy 'à' HH:mm", { locale: fr })}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Au</dt>
              <dd className="text-gray-700">{format(new Date(booking.to), "dd MMM yyyy 'à' HH:mm", { locale: fr })}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <User size={18} className="text-blue-600" />
            <h2 className="font-semibold text-gray-800">Client</h2>
          </div>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Nom</dt>
              <dd className="font-medium text-gray-900">{client?.firstname} {client?.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Email</dt>
              <dd className="text-gray-700">{client?.mail}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Téléphone</dt>
              <dd className="text-gray-700">{client?.phone_number || '—'}</dd>
            </div>
          </dl>
        </div>

        {booking.numFacture && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText size={18} className="text-blue-600" />
              <h2 className="font-semibold text-gray-800">Facture</h2>
            </div>
            <p className="text-sm text-gray-600 break-all">{booking.numFacture}</p>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Changer le statut</h2>
          <div className="flex gap-3">
            <button
              onClick={() => updateStatus('CONFIRME')}
              disabled={saving || booking.status === 'CONFIRME'}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              Confirmer
            </button>
            <button
              onClick={() => updateStatus('ANNULE')}
              disabled={saving || booking.status === 'ANNULE'}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
