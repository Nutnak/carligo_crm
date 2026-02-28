'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, UserCircle, Loader2 } from 'lucide-react'
import DashboardHeader from '@/components/DashboardHeader'

interface CrmUser {
  id: string
  name: string
  email: string
  created_at: string
}

export default function UtilisateursPage() {
  const [users, setUsers] = useState<CrmUser[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetch('/api/crm-users')
      .then((r) => r.json())
      .then(setUsers)
      .finally(() => setLoading(false))
  }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setAdding(true)
    setError('')
    setSuccess('')

    const res = await fetch('/api/crm-users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Erreur lors de la création')
    } else {
      setUsers((u) => [...u, data])
      setName('')
      setEmail('')
      setPassword('')
      setSuccess(`Utilisateur "${data.name}" créé avec succès`)
    }
    setAdding(false)
  }

  async function handleDelete(id: string, userName: string) {
    if (!confirm(`Supprimer l'utilisateur "${userName}" ?`)) return
    const res = await fetch(`/api/crm-users/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setUsers((u) => u.filter((x) => x.id !== id))
    } else {
      const data = await res.json()
      alert(data.error || 'Erreur lors de la suppression')
    }
  }

  return (
    <div>
      <DashboardHeader
        title="Utilisateurs CRM"
        description="Gérer les comptes administrateurs"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Liste */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Comptes existants</h2>
          </div>

          {loading ? (
            <div className="px-6 py-8 text-center text-gray-400">Chargement...</div>
          ) : users.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-400">
              <UserCircle size={32} className="mx-auto mb-2 opacity-30" />
              Aucun utilisateur
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {users.map((u) => (
                <li key={u.id} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{u.name}</p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(u.id, u.name)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 size={15} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Formulaire ajout */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Ajouter un utilisateur</h2>

          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Marie Dupont"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="marie@carligo.fr"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="8 caractères minimum"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
            )}
            {success && (
              <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{success}</p>
            )}

            <button
              type="submit"
              disabled={adding}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60 w-full justify-center"
            >
              {adding ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
              {adding ? 'Création...' : 'Créer le compte'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
