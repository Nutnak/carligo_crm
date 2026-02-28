'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus, Trash2, Star } from 'lucide-react'
import type { Vehicle } from '@/types'

// Parse la colonne images (URLs séparées par ", ")
function parseImages(raw?: string): string[] {
  if (!raw) return []
  return raw.split(',').map((s) => s.trim()).filter(Boolean)
}

interface VehicleFormProps {
  initial?: Partial<Vehicle>
  vehicleId?: number
}

export default function VehicleForm({ initial, vehicleId }: VehicleFormProps) {
  const router = useRouter()
  const [form, setForm] = useState({
    brand: initial?.brand ?? '',
    model: initial?.model ?? '',
    vehicle_type: initial?.vehicle_type ?? 'tourisme',
    price_per_day: initial?.price_per_day ?? 0,
    caution: initial?.caution ?? 0,
    city: initial?.city ?? '',
    img_url: initial?.img_url ?? '',
    description: initial?.description ?? '',
    place: initial?.place ?? 5,
    motorisation: initial?.motorisation ?? 'Automatique',
    carburant: initial?.carburant ?? 'Essence',
  })
  // Liste des images du carrousel (colonne `images`)
  const [images, setImages] = useState<string[]>(parseImages(initial?.images))
  const [newImageUrl, setNewImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function addImage() {
    const url = newImageUrl.trim()
    if (!url || images.includes(url)) return
    setImages((prev) => [...prev, url])
    setNewImageUrl('')
  }

  function removeImage(url: string) {
    setImages((prev) => prev.filter((u) => u !== url))
    // Si on supprime l'image principale, prendre la suivante
    if (form.img_url === url) {
      const remaining = images.filter((u) => u !== url)
      setForm((f) => ({ ...f, img_url: remaining[0] ?? '' }))
    }
  }

  function setMain(url: string) {
    setForm((f) => ({ ...f, img_url: url }))
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Synchroniser img_url : si vide, prendre la première image du carrousel
    const img_url = form.img_url || images[0] || ''

    const payload = {
      ...form,
      img_url,
      price_per_day: Number(form.price_per_day),
      caution: Number(form.caution),
      place: Number(form.place),
      images: images.join(', '),
    }

    const url = vehicleId ? `/api/vehicles/${vehicleId}` : '/api/vehicles'
    const method = vehicleId ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Une erreur est survenue')
      setLoading(false)
      return
    }

    router.push('/vehicules')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800 mb-2">Informations générales</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Marque *</label>
            <input
              name="brand"
              value={form.brand}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Modèle *</label>
            <input
              name="model"
              value={form.model}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
            <select
              name="vehicle_type"
              value={form.vehicle_type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="tourisme">Tourisme</option>
              <option value="utilitaire">Utilitaire</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prix/jour (€) *</label>
            <input
              name="price_per_day"
              type="number"
              min="0"
              value={form.price_per_day}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Caution (€)</label>
            <input
              name="caution"
              type="number"
              min="0"
              value={form.caution}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Places</label>
            <input
              name="place"
              type="number"
              min="1"
              max="20"
              value={form.place}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motorisation</label>
            <select
              name="motorisation"
              value={form.motorisation}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Automatique</option>
              <option>Manuelle</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Carburant</label>
            <select
              name="carburant"
              value={form.carburant}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Essence</option>
              <option>Diesel</option>
              <option>Électrique</option>
              <option>Hybride</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800 mb-2">Photos du carrousel</h2>

        {/* Grille des images existantes */}
        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {images.map((url) => (
              <div key={url} className="relative group rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={url}
                  alt=""
                  className="w-full h-28 object-cover"
                  onError={(e) => (e.currentTarget.style.opacity = '0.3')}
                />
                {/* Badge image principale */}
                {form.img_url === url && (
                  <span className="absolute top-1 left-1 bg-yellow-400 text-yellow-900 text-xs font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                    <Star size={10} fill="currentColor" /> Principale
                  </span>
                )}
                {/* Actions au survol */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {form.img_url !== url && (
                    <button
                      type="button"
                      onClick={() => setMain(url)}
                      className="bg-yellow-400 text-yellow-900 text-xs font-medium px-2 py-1 rounded hover:bg-yellow-300"
                      title="Définir comme image principale"
                    >
                      <Star size={13} fill="currentColor" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                    title="Supprimer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Ajouter une image */}
        <div className="flex gap-2">
          <input
            type="url"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
            placeholder="https://... (URL de l'image)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={addImage}
            disabled={!newImageUrl.trim()}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium disabled:opacity-40 transition-colors"
          >
            <Plus size={15} />
            Ajouter
          </button>
        </div>
        <p className="text-xs text-gray-400">
          Cliquez sur ⭐ pour définir l&apos;image principale affichée dans les listings.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-800 mb-3">Description</h2>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-60 text-sm"
        >
          {loading && <Loader2 size={15} className="animate-spin" />}
          {vehicleId ? 'Enregistrer' : 'Ajouter le véhicule'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/vehicules')}
          className="px-5 py-2.5 rounded-lg font-medium text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors text-sm"
        >
          Annuler
        </button>
      </div>
    </form>
  )
}
