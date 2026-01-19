import type { Priority } from '../types'

interface PriorityBadgeProps {
  priority: Priority
}

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  const getStyle = () => {
    const baseStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--spacing-xs) var(--spacing-sm)',
      borderRadius: 'var(--border-radius-sm)',
      fontSize: 'var(--font-size-xs)',
      fontWeight: 600,
    }

    switch (priority) {
      case 'Critical':
        return { ...baseStyle, background: 'var(--monday-red)', color: 'white' }
      case 'High':
        return { ...baseStyle, background: 'var(--monday-orange)', color: 'white' }
      case 'Medium':
        return { ...baseStyle, background: 'var(--monday-blue)', color: 'white' }
      case 'Low':
        return { ...baseStyle, background: 'var(--monday-gray)', color: 'white' }
      default:
        return { ...baseStyle, background: 'var(--monday-gray-light)', color: 'white' }
    }
  }

  return <span style={getStyle()}>{priority}</span>
}
