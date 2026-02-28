'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Check, X, Package } from 'lucide-react'
import DashboardHeader from '@/components/DashboardHeader'
import type { Supplement, Vehicle } from '@/types'

function VehicleBadges({ vehicleIds, vehicles }: { vehicleIds: number[], vehicles: Vehicle[] }) {
  if (!vehicleIds.length) return <span className="text-gray-400 italic text-xs">Aucun</span>
  return (
    <div className="flex flex-wrap gap-1">
      {vehicleIds.map((vid) => {
        const v = vehicles.find((x) => x.id === vid)
        if (!v) return null
        const isUtilitaire = v.vehicle_type === 'utilitaire'
        return (
          <span
            key={vid}
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
              isUtilitaire ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
            }`}
          >
            {v.brand} {v.model}
          </span>
        )
      })}
    </div>
  )
}

function VehicleCheckboxes({
  vehicles,
  selected,
  onChange,
}: {
  vehicles: Vehicle[]
  selected: number[]
  onChange: (ids: number[]) => void
}) {
  const tourisme = vehicles.filter((v) => v.vehicle_type === 'tourisme')
  const utilitaire = vehicles.filter((v) => v.vehicle_type === 'utilitaire')

  function toggle(id: number) {
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id])
  }

  function toggleGroup(ids: number[]) {
    const allSelected = ids.every((id) => selected.includes(id))
    if (allSelected) {
      onChange(selected.filter((id) => !ids.includes(id)))
    } else {
      onChange([...new Set([...selected, ...ids])])
    }
  }

  const groups = [
    { label: 'Tourisme', items: tourisme, color: 'text-blue-600' },
    { label: 'Utilitaire', items: utilitaire, color: 'text-orange-600' },
  ]

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {groups.map(({ label, items, color }) => (
        <div key={label} className="border-b border-gray-100 last:border-0">
          <div
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 cursor-pointer select-none"
            onClick={() => toggleGroup(items.map((v) => v.id))}
          >
            <input
              type="checkbox"
              readOnly
              checked={items.length > 0 && items.every((v) => selected.includes(v.id))}
              className="rounded"
            />
            <span className={`text-xs font-semibold ${color}`}>{label}</span>
          </div>
          {items.map((v) => (
            <label
              key={v.id}
              className="flex items-center gap-2 px-4 py-1.5 hover:bg-gray-50 cursor-pointer text-sm"
            >
              <input
                type="checkbox"
                checked={selected.includes(v.id)}
                onChange={() => toggle(v.id)}
                className="rounded"
              />
              <span className="text-gray-700">{v.brand} {v.model}</span>
              <span className="text-gray-400 text-xs ml-auto">{v.city}</span>
            </label>
          ))}
        </div>
      ))}
    </div>
  )
}

function SupplementRow({
  supplement,
  vehicles,
  onUpdate,
  onDelete,
}: {
  supplement: Supplement
  vehicles: Vehicle[]
  onUpdate: (id: number, data: Partial<Supplement> & { vehicle_ids: number[] }) => Promise<void>
  onDelete: (id: number) => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(supplement.name)
  const [price, setPrice] = useState(supplement.price)
  const [vehicleIds, setVehicleIds] = useState<number[]>(supplement.vehicle_ids ?? [])

  async function save() {
    await onUpdate(supplement.id, { name, price: Number(price), vehicle_ids: vehicleIds })
    setEditing(false)
  }

  if (editing) {
    return (
      <tr className="border-b border-gray-100 align-top">
        <td className="px-4 py-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-2 py-1.5 border border-blue-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </td>
        <td className="px-4 py-3">
          <VehicleCheckboxes vehicles={vehicles} selected={vehicleIds} onChange={setVehicleIds} />
        </td>
        <td className="px-4 py-3">
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="w-20 px-2 py-1.5 border border-blue-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </td>
        <td className="px-4 py-3">
          <div className="flex gap-1">
            <button onClick={save} className="p-1.5 text-green-600 hover:bg-green-50 rounded">
              <Check size={15} />
            </button>
            <button onClick={() => setEditing(false)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded">
              <X size={15} />
            </button>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50 transition-colors align-middle">
      <td className="px-4 py-3 font-medium text-gray-900">{supplement.name}</td>
      <td className="px-4 py-3">
        <VehicleBadges vehicleIds={supplement.vehicle_ids ?? []} vehicles={vehicles} />
      </td>
      <td className="px-4 py-3 text-gray-900 font-medium">{supplement.price} €</td>
      <td className="px-4 py-3">
        <div className="flex gap-1">
          <button
            onClick={() => setEditing(true)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(supplement.id)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  )
}

function AddForm({ vehicles, onAdd }: { vehicles: Vehicle[]; onAdd: (s: Supplement) => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [price, setPrice] = useState(0)
  const [vehicleIds, setVehicleIds] = useState<number[]>([])
  const [loading, setLoading] = useState(false)

  async function handleAdd() {
    if (!name) return
    setLoading(true)
    const res = await fetch('/api/supplements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, price: Number(price), vehicle_ids: vehicleIds }),
    })
    if (res.ok) {
      const data = await res.json()
      onAdd(data)
      setName('')
      setPrice(0)
      setVehicleIds([])
      setOpen(false)
    }
    setLoading(false)
  }

  if (!open) {
    return (
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          <Plus size={15} />
          Ajouter un supplément
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 border-t border-gray-200 bg-blue-50">
      <p className="text-sm font-semibold text-gray-700 mb-3">Nouveau supplément</p>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Nom *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="GPS, Siège bébé..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Prix/jour (€) *</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-600 mb-1">Véhicules associés</label>
        <VehicleCheckboxes vehicles={vehicles} selected={vehicleIds} onChange={setVehicleIds} />
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleAdd}
          disabled={loading || !name}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? 'Ajout...' : 'Ajouter'}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="px-4 py-2 rounded-lg text-sm text-gray-600 border border-gray-300 hover:bg-gray-50"
        >
          Annuler
        </button>
      </div>
    </div>
  )
}

export default function SupplementsPage() {
  const [supplements, setSupplements] = useState<Supplement[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/supplements').then((r) => r.json()),
      fetch('/api/vehicles').then((r) => r.json()),
    ]).then(([supData, vehData]) => {
      if (Array.isArray(supData)) setSupplements(supData)
      if (Array.isArray(vehData)) setVehicles(vehData)
    }).finally(() => setLoading(false))
  }, [])

  async function handleUpdate(id: number, data: Partial<Supplement> & { vehicle_ids: number[] }) {
    const res = await fetch(`/api/supplements/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      const updated = await res.json()
      setSupplements((s) => s.map((x) => (x.id === id ? { ...x, ...updated } : x)))
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Supprimer ce supplément ?')) return
    await fetch(`/api/supplements/${id}`, { method: 'DELETE' })
    setSupplements((s) => s.filter((x) => x.id !== id))
  }

  return (
    <div>
      <DashboardHeader
        title="Suppléments"
        description={`${supplements.length} supplément(s)`}
      />

      {loading ? (
        <div className="text-center py-16 text-gray-400">Chargement...</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Nom</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Véhicules</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Prix/jour</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {supplements.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                    <Package size={32} className="mx-auto mb-2 opacity-30" />
                    Aucun supplément
                  </td>
                </tr>
              ) : (
                supplements.map((s) => (
                  <SupplementRow
                    key={s.id}
                    supplement={s}
                    vehicles={vehicles}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </tbody>
          </table>
          <AddForm vehicles={vehicles} onAdd={(s) => setSupplements((prev) => [...prev, s])} />
        </div>
      )}
    </div>
  )
}
