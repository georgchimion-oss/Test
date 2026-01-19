import type { DeliverableStatus } from '../types'

interface StatusBadgeProps {
  status: DeliverableStatus
  onClick?: () => void
}

export default function StatusBadge({ status, onClick }: StatusBadgeProps) {
  const getClassName = () => {
    const baseClass = 'monday-status-badge'
    const statusClass = status.toLowerCase().replace(' ', '-')
    return `${baseClass} ${statusClass}`
  }

  return (
    <span
      className={getClassName()}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {status}
    </span>
  )
}
