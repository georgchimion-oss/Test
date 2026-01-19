import { Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { Deliverable } from '../types'
import { getStaff, getWorkstreams } from '../data/dataLayer'
import Avatar from './Avatar'
import TimelineBadge from './TimelineBadge'

interface KanbanCardProps {
  deliverable: Deliverable
  provided: any
}

export default function KanbanCard({ deliverable, provided }: KanbanCardProps) {
  const owner = getStaff().find((s) => s.id === deliverable.ownerId)
  const workstream = getWorkstreams().find((w) => w.id === deliverable.workstreamId)

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      style={{
        ...provided.draggableProps.style,
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--border-radius-md)',
        padding: 'var(--spacing-md)',
        marginBottom: 'var(--spacing-md)',
        cursor: 'grab',
        transition: 'box-shadow 0.2s ease',
      }}
    >
      <h4
        style={{
          fontSize: 'var(--font-size-md)',
          fontWeight: 600,
          marginBottom: 'var(--spacing-sm)',
          color: 'var(--text-primary)',
        }}
      >
        {deliverable.title}
      </h4>

      {workstream && (
        <div
          style={{
            display: 'inline-block',
            padding: 'var(--spacing-xs) var(--spacing-sm)',
            borderRadius: 'var(--border-radius-sm)',
            fontSize: 'var(--font-size-xs)',
            background: `${workstream.color}20`,
            color: workstream.color,
            fontWeight: 600,
            marginBottom: 'var(--spacing-sm)',
          }}
        >
          {workstream.name}
        </div>
      )}

      {owner && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-sm)',
            marginBottom: 'var(--spacing-sm)',
            color: 'var(--text-secondary)',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          <Avatar user={owner} size={20} />
          <span>{owner.name}</span>
        </div>
      )}

      <div style={{ marginBottom: 'var(--spacing-sm)' }}>
        <TimelineBadge startDate={deliverable.startDate} dueDate={deliverable.dueDate} />
      </div>

      <div style={{ marginBottom: 'var(--spacing-sm)' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 'var(--font-size-xs)',
            marginBottom: 'var(--spacing-xs)',
            color: 'var(--text-secondary)',
          }}
        >
          <span>Progress</span>
          <span>{deliverable.progress}%</span>
        </div>
        <div
          style={{
            height: '4px',
            background: 'var(--bg-main)',
            borderRadius: '9999px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${deliverable.progress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--monday-blue), var(--monday-green))',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-xs)',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--text-secondary)',
        }}
      >
        <Clock size={12} />
        <span>Updated {formatDistanceToNow(new Date(deliverable.updatedAt), { addSuffix: true })}</span>
      </div>
    </div>
  )
}
