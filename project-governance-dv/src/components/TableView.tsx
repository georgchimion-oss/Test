import { useState, useMemo } from 'react'
import { ArrowUp, ArrowDown } from 'lucide-react'
import type { Deliverable } from '../types'
import { getStaff, getWorkstreams } from '../data/dataLayer'
import Avatar from './Avatar'
import StatusBadge from './StatusBadge'
import PriorityBadge from './PriorityBadge'

interface TableViewProps {
  deliverables: Deliverable[]
  onUpdate?: (id: string, updates: Partial<Deliverable>) => void
}

type SortField = 'title' | 'status' | 'dueDate' | 'priority' | 'progress'
type SortDirection = 'asc' | 'desc'

export default function TableView({ deliverables }: TableViewProps) {
  const [sortBy, setSortBy] = useState<SortField>('dueDate')
  const [sortDir, setSortDir] = useState<SortDirection>('asc')
  const staff = getStaff()
  const workstreams = getWorkstreams()

  const sortedDeliverables = useMemo(() => {
    const sorted = [...deliverables].sort((a, b) => {
      let aVal: any = a[sortBy]
      let bVal: any = b[sortBy]

      if (sortBy === 'dueDate') {
        aVal = new Date(aVal).getTime()
        bVal = new Date(bVal).getTime()
      }

      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return sorted
  }, [deliverables, sortBy, sortDir])

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortDir('asc')
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortBy !== field) return null
    return sortDir === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
  }

  return (
    <div style={{ overflowX: 'auto', padding: 'var(--spacing-2xl)' }}>
      <table className="monday-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('title')} style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                Title
                <SortIcon field="title" />
              </div>
            </th>
            <th>Workstream</th>
            <th>Owner</th>
            <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                Status
                <SortIcon field="status" />
              </div>
            </th>
            <th onClick={() => handleSort('dueDate')} style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                Due Date
                <SortIcon field="dueDate" />
              </div>
            </th>
            <th onClick={() => handleSort('priority')} style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                Priority
                <SortIcon field="priority" />
              </div>
            </th>
            <th onClick={() => handleSort('progress')} style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                Progress
                <SortIcon field="progress" />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedDeliverables.map((deliverable) => {
            const owner = staff.find((s) => s.id === deliverable.ownerId)
            const workstream = workstreams.find((w) => w.id === deliverable.workstreamId)

            return (
              <tr key={deliverable.id}>
                <td style={{ fontWeight: 600 }}>{deliverable.title}</td>
                <td>
                  {workstream && (
                    <span
                      style={{
                        display: 'inline-block',
                        padding: 'var(--spacing-xs) var(--spacing-sm)',
                        borderRadius: 'var(--border-radius-sm)',
                        fontSize: 'var(--font-size-xs)',
                        background: `${workstream.color}20`,
                        color: workstream.color,
                        fontWeight: 600,
                      }}
                    >
                      {workstream.name}
                    </span>
                  )}
                </td>
                <td>
                  {owner && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                      <Avatar user={owner} size={24} />
                      <span>{owner.name}</span>
                    </div>
                  )}
                </td>
                <td>
                  <StatusBadge status={deliverable.status} />
                </td>
                <td>{new Date(deliverable.dueDate).toLocaleDateString()}</td>
                <td>
                  <PriorityBadge priority={deliverable.priority} />
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                    <div
                      style={{
                        flex: 1,
                        height: '6px',
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
                    <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>
                      {deliverable.progress}%
                    </span>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
