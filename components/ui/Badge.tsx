type BadgeVariant = 'green' | 'red' | 'yellow' | 'blue' | 'gray'

const variants: Record<BadgeVariant, string> = {
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  blue: 'bg-blue-100 text-blue-700',
  gray: 'bg-gray-100 text-gray-700',
}

interface BadgeProps {
  label: string
  variant: BadgeVariant
}

export default function Badge({ label, variant }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {label}
    </span>
  )
}

export function getBookingStatusBadge(status: string) {
  switch (status) {
    case 'CONFIRME':
      return <Badge label="Confirmé" variant="green" />
    case 'ANNULE':
      return <Badge label="Annulé" variant="red" />
    case 'EN_ATTENTE':
      return <Badge label="En attente" variant="yellow" />
    default:
      return <Badge label={status} variant="gray" />
  }
}
