export interface Vehicle {
  id: number
  brand: string
  model: string
  vehicle_type: 'tourisme' | 'utilitaire' | string
  price_per_day: number
  caution: number
  city: string
  img_url?: string
  description?: string
  images?: string
  place?: number
  motorisation?: string
  carburant?: string
  created_at?: string
}

export interface Client {
  id: string
  firstname: string
  name: string
  phone_number: string
  mail: string
  created_at?: string
}

export interface Booking {
  id: string
  from: string
  to: string
  vehicle_id: number
  client_id: string
  status: 'CONFIRME' | 'ANNULE' | 'EN_ATTENTE'
  numFacture?: string
  city?: string
  amount_total?: number
  created_at?: string
  vehicles?: Vehicle
  clients?: Client
}

export interface Supplement {
  id: number
  name: string
  price: number
  description?: string
  active?: boolean
  created_at?: string
  // enrichi côté client à partir de vehicle_supplement
  vehicle_ids?: number[]
}

export interface VehicleSupplement {
  id: number
  vehicle_id: number
  supplement_id: number
}
