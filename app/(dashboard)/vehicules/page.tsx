'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Car } from 'lucide-react'
import DashboardHeader from '@/components/DashboardHeader'
import type { Vehicle } from '@/types'

export default function VehiculesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetch('/api/vehicles')
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setVehicles(d) })
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete(id: number) {
    if (!confirm('Supprimer ce véhicule ?')) return
    await fetch(`/api/vehicles/${id}`, { method: 'DELETE' })
    setVehicles((v) => v.filter((x) => x.id !== id))
  }

  return (
    <div>
      <DashboardHeader
        title="Véhicules"
        description={`${vehicles.length} véhicule(s) en base`}
        action={
          <Link
            href="/vehicules/nouveau"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            Ajouter
          </Link>
        }
      />

      {loading ? (
        <div className="text-center py-16 text-gray-400">Chargement...</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Véhicule</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Type</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Ville</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Prix/jour</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Caution</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {vehicles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <Car size={32} className="mx-auto mb-2 opacity-30" />
                    Aucun véhicule
                  </td>
                </tr>
              ) : (
                vehicles.map((v) => (
                  <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        {v.img_url ? (
                          <img
                            src={v.img_url}
                            alt={`${v.brand} ${v.model}`}
                            className="w-12 h-8 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                            <Car size={16} className="text-gray-300" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{v.brand} {v.model}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-gray-600 capitalize">{v.vehicle_type || '—'}</td>
                    <td className="px-6 py-3 text-gray-600">{v.city}</td>
                    <td className="px-6 py-3 text-gray-900 font-medium">{v.price_per_day} €</td>
                    <td className="px-6 py-3 text-gray-600">{v.caution} €</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <Link
                          href={`/vehicules/${v.id}`}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Pencil size={15} />
                        </Link>
                        <button
                          onClick={() => handleDelete(v.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
