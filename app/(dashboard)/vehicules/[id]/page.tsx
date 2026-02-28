import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import DashboardHeader from '@/components/DashboardHeader'
import VehicleForm from '@/components/VehicleForm'

export default async function EditVehiculePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: vehicle, error } = await supabaseAdmin
    .from('vehicles')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !vehicle) notFound()

  return (
    <div>
      <DashboardHeader
        title={`${vehicle.brand} ${vehicle.model}`}
        description="Modifier les informations du véhicule"
      />
      <VehicleForm initial={vehicle} vehicleId={Number(id)} />
    </div>
  )
}
