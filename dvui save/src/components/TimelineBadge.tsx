import { format } from 'date-fns'

interface TimelineBadgeProps {
  startDate: string
  dueDate: string
}

export default function TimelineBadge({ startDate, dueDate }: TimelineBadgeProps) {
  const isOverdue = new Date(dueDate) < new Date() && new Date(startDate) < new Date()
  const isUpcoming = new Date(startDate) > new Date()

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: 'var(--spacing-xs) var(--spacing-sm)',
        borderRadius: 'var(--border-radius-sm)',
        fontSize: 'var(--font-size-xs)',
        fontWeight: 600,
        background: isOverdue ? 'var(--monday-red)' : isUpcoming ? 'var(--monday-gray)' : 'var(--monday-blue)',
        color: 'white',
      }}
    >
      {format(new Date(startDate), 'MMM d')} - {format(new Date(dueDate), 'MMM d')}
    </div>
  )
}
