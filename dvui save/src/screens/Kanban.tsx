import { useEffect, useMemo, useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { getDeliverables, updateDeliverable, getStaff, getWorkstreams, onDataRefresh } from '../data/dataLayer'
import type { DeliverableStatus } from '../types'
import { Clock, User, AlertTriangle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { logAudit } from '../data/auditLayer'

const STATUSES: DeliverableStatus[] = ['Not Started', 'In Progress', 'At Risk', 'Blocked', 'Completed']

const STATUS_COLORS: Record<DeliverableStatus, string> = {
  'Not Started': '#94a3b8',
  'In Progress': '#3b82f6',
  'At Risk': '#ef4444',
  'Blocked': '#6b7280',
  'Completed': '#10b981',
}

type GroupByType = 'status' | 'workstream' | 'owner'

export default function Kanban() {
  const { currentUser } = useAuth()
  const [deliverables, setDeliverables] = useState(getDeliverables())
  const [groupBy, setGroupBy] = useState<GroupByType>('status')
  const staff = getStaff()
  const workstreams = getWorkstreams()

  useEffect(() => {
    return onDataRefresh(() => setDeliverables(getDeliverables()))
  }, [])

  const columns = useMemo(() => {
    if (groupBy === 'status') {
      return STATUSES.map(status => ({ id: status, name: status, color: STATUS_COLORS[status] }))
    } else if (groupBy === 'workstream') {
      return [
        ...workstreams.map((w) => ({ id: w.id, name: w.name, color: w.color })),
        { id: 'unassigned', name: 'Unassigned', color: '#94a3b8' },
      ]
    } else {
      return staff.map(s => ({ id: s.id, name: s.name, color: '#64748b' }))
    }
  }, [groupBy, workstreams, staff])

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const { draggableId, destination } = result

    if (groupBy === 'status') {
      const newStatus = destination.droppableId as DeliverableStatus
      updateDeliverable(draggableId, { status: newStatus })
      if (currentUser) {
        logAudit(
          currentUser.id,
          currentUser.name,
          'Updated Status',
          'Deliverable',
          draggableId,
          `Status -> ${newStatus}`
        )
      }
      setDeliverables(getDeliverables())
    }
    // For workstream and owner grouping, drag-drop updates would need more complex logic
  }

  const getColumnDeliverables = (columnId: string) => {
    if (groupBy === 'status') {
      return deliverables.filter((d) => d.status === columnId)
    } else if (groupBy === 'workstream') {
      if (columnId === 'unassigned') {
        return deliverables.filter((d) => !d.workstreamId)
      }
      return deliverables.filter((d) => d.workstreamId === columnId)
    } else {
      return deliverables.filter((d) => d.ownerId === columnId)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            Project Kanban Board
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Drag and drop deliverables between columns {groupBy === 'status' ? 'to update their status' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Group by:</label>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as GroupByType)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            <option value="status">Status</option>
            <option value="workstream">Workstream</option>
            <option value="owner">Owner</option>
          </select>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
            gap: '1rem',
            height: 'calc(100vh - 250px)',
          }}
        >
          {columns.map((column) => {
            const columnDeliverables = getColumnDeliverables(column.id)
            return (
              <div key={column.id} style={{ display: 'flex', flexDirection: 'column' }}>
                <div
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px 12px 0 0',
                    padding: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: column.color,
                      }}
                    />
                    <h3 style={{ fontSize: '0.875rem', fontWeight: '600' }}>{column.name}</h3>
                  </div>
                  <span
                    style={{
                      background: 'var(--bg-main)',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                    }}
                  >
                    {columnDeliverables.length}
                  </span>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{
                        flex: 1,
                        background: snapshot.isDraggingOver
                          ? 'rgba(59, 130, 246, 0.05)'
                          : 'var(--bg-main)',
                        border: '1px solid var(--border)',
                        borderTop: 'none',
                        borderRadius: '0 0 12px 12px',
                        padding: '1rem',
                        overflowY: 'auto',
                      }}
                    >
                      {columnDeliverables.map((deliverable, index) => {
                        const owner = staff.find((s) => s.id === deliverable.ownerId)
                        const workstream = workstreams.find((w) => w.id === deliverable.workstreamId)
                        return (
                          <Draggable key={deliverable.id} draggableId={deliverable.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{
                                  ...provided.draggableProps.style,
                                  background: snapshot.isDragging
                                    ? 'var(--bg-hover)'
                                    : 'var(--bg-card)',
                                  border: '1px solid var(--border)',
                                  borderRadius: '8px',
                                  padding: '1rem',
                                  marginBottom: '0.75rem',
                                  cursor: 'grab',
                                  transition: 'box-shadow 0.2s ease',
                                  boxShadow: snapshot.isDragging
                                    ? '0 8px 16px rgba(0, 0, 0, 0.3)'
                                    : '0 2px 4px rgba(0, 0, 0, 0.1)',
                                }}
                              >
                                <div style={{ marginBottom: '0.5rem' }}>
                                  <h4
                                    style={{
                                      fontSize: '0.875rem',
                                      fontWeight: '600',
                                      marginBottom: '0.25rem',
                                    }}
                                  >
                                    {deliverable.title}
                                  </h4>
                                  {workstream && (
                                    <div
                                      style={{
                                        display: 'inline-block',
                                        padding: '0.125rem 0.5rem',
                                        borderRadius: '4px',
                                        fontSize: '0.6875rem',
                                        background: `${workstream.color}20`,
                                        color: workstream.color,
                                      }}
                                    >
                                      {workstream.name}
                                    </div>
                                  )}
                                </div>

                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontSize: '0.75rem',
                                    color: 'var(--text-secondary)',
                                    marginBottom: '0.5rem',
                                  }}
                                >
                                  <User size={12} />
                                  <span>{owner?.name || 'Unassigned'}</span>
                                </div>

                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontSize: '0.75rem',
                                    color: 'var(--text-secondary)',
                                    marginBottom: '0.5rem',
                                  }}
                                >
                                  <Clock size={12} />
                                  <span>{new Date(deliverable.dueDate).toLocaleDateString()}</span>
                                </div>

                                {deliverable.risk !== 'Low' && (
                                  <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.5rem',
                                      fontSize: '0.75rem',
                                      color: deliverable.risk === 'High' || deliverable.risk === 'Critical' ? '#ef4444' : '#f59e0b',
                                    }}
                                  >
                                    <AlertTriangle size={12} />
                                    <span>{deliverable.risk} Risk</span>
                                  </div>
                                )}

                                <div style={{ marginTop: '0.75rem' }}>
                                  <div
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      fontSize: '0.6875rem',
                                      marginBottom: '0.25rem',
                                      color: 'var(--text-secondary)',
                                    }}
                                  >
                                    <span>Progress</span>
                                    <span>{deliverable.progress}%</span>
                                  </div>
                                  <div className="progress-bar" style={{ height: '4px' }}>
                                    <div
                                      className="progress-fill"
                                      style={{ width: `${deliverable.progress}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        )
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            )
          })}
        </div>
      </DragDropContext>
    </div>
  )
}
