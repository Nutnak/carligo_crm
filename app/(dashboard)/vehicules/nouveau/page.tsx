import DashboardHeader from '@/components/DashboardHeader'
import VehicleForm from '@/components/VehicleForm'

export default function NouveauVehiculePage() {
  return (
    <div>
      <DashboardHeader title="Nouveau véhicule" description="Ajouter un véhicule à la flotte" />
      <VehicleForm />
    </div>
  )
}
