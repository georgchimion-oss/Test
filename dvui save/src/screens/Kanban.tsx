import { useEffect, useMemo, useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { getDeliverables, updateDeliverable, getStaff, getWorkstreams, onDataRefresh } from '../data/dataLayer'
import { useUpdateDeliverable } from '../services/dataverseService'
import type { DeliverableStatus } from '../types'
import { Clock, User, AlertTriangle, Filter } from 'lucide-react'
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

  // Filter states
  const [filterWorkstream, setFilterWorkstream] = useState<string>('all')
  const [filterUser, setFilterUser] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Dataverse mutation for persisting changes
  const updateMutation = useUpdateDeliverable()

  useEffect(() => {
    return onDataRefresh(() => setDeliverables(getDeliverables()))
  }, [])

  // Apply filters to deliverables
  const filteredDeliverables = useMemo(() => {
    return deliverables.filter((d) => {
      if (filterWorkstream !== 'all' && d.workstreamId !== filterWorkstream) return false
      if (filterUser !== 'all' && d.ownerId !== filterUser) return false
      if (filterStatus !== 'all' && d.status !== filterStatus) return false
      return true
    })
  }, [deliverables, filterWorkstream, filterUser, filterStatus])

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
    const deliverable = deliverables.find((d) => d.id === draggableId)
    if (!deliverable) return

    if (groupBy === 'status') {
      const newStatus = destination.droppableId as DeliverableStatus
      if (deliverable.status === newStatus) return // No change

      // Update localStorage immediately for UI
      updateDeliverable(draggableId, { status: newStatus })
      setDeliverables(getDeliverables())

      // Persist to Dataverse
      updateMutation.mutate(
        { id: draggableId, updates: { crda8_status: newStatus } },
        {
          onSuccess: () => {
            if (currentUser) {
              logAudit(
                currentUser.id,
                currentUser.name,
                'Updated Status',
                'Deliverable',
                draggableId,
                `Status -> ${newStatus} (Kanban drag)`
              )
            }
          },
          onError: (error) => {
            console.error('Failed to persist status change to Dataverse:', error)
            // Revert localStorage on failure
            updateDeliverable(draggableId, { status: deliverable.status })
            setDeliverables(getDeliverables())
          },
        }
      )
    } else if (groupBy === 'workstream') {
      const newWorkstreamId = destination.droppableId === 'unassigned' ? null : destination.droppableId
      if (deliverable.workstreamId === newWorkstreamId) return // No change

      // Update localStorage immediately
      updateDeliverable(draggableId, { workstreamId: newWorkstreamId || '' })
      setDeliverables(getDeliverables())

      // Persist to Dataverse
      updateMutation.mutate(
        { id: draggableId, updates: { _crda8_workstream_value: newWorkstreamId || undefined } },
        {
          onSuccess: () => {
            const wsName = workstreams.find((w) => w.id === newWorkstreamId)?.name || 'Unassigned'
            if (currentUser) {
              logAudit(
                currentUser.id,
                currentUser.name,
                'Updated Workstream',
                'Deliverable',
                draggableId,
                `Workstream -> ${wsName} (Kanban drag)`
              )
            }
          },
          onError: (error) => {
            console.error('Failed to persist workstream change to Dataverse:', error)
            updateDeliverable(draggableId, { workstreamId: deliverable.workstreamId || '' })
            setDeliverables(getDeliverables())
          },
        }
      )
    } else if (groupBy === 'owner') {
      const newOwnerId = destination.droppableId
      if (deliverable.ownerId === newOwnerId) return // No change

      // Update localStorage immediately
      updateDeliverable(draggableId, { ownerId: newOwnerId })
      setDeliverables(getDeliverables())

      // Persist to Dataverse
      updateMutation.mutate(
        { id: draggableId, updates: { _crda8_owner_value: newOwnerId } },
        {
          onSuccess: () => {
            const ownerName = staff.find((s) => s.id === newOwnerId)?.name || 'Unknown'
            if (currentUser) {
              logAudit(
                currentUser.id,
                currentUser.name,
                'Updated Owner',
                'Deliverable',
                draggableId,
                `Owner -> ${ownerName} (Kanban drag)`
              )
            }
          },
          onError: (error) => {
            console.error('Failed to persist owner change to Dataverse:', error)
            updateDeliverable(draggableId, { ownerId: deliverable.ownerId })
            setDeliverables(getDeliverables())
          },
        }
      )
    }
  }

  const getColumnDeliverables = (columnId: string) => {
    if (groupBy === 'status') {
      return filteredDeliverables.filter((d) => d.status === columnId)
    } else if (groupBy === 'workstream') {
      if (columnId === 'unassigned') {
        return filteredDeliverables.filter((d) => !d.workstreamId)
      }
      return filteredDeliverables.filter((d) => d.workstreamId === columnId)
    } else {
      return filteredDeliverables.filter((d) => d.ownerId === columnId)
    }
  }

  const selectStyle = {
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    background: 'var(--bg-card)',
    color: 'var(--text-primary)',
    fontSize: '0.875rem',
    cursor: 'pointer',
    minWidth: '140px',
  }

  const activeFilterCount = [filterWorkstream, filterUser, filterStatus].filter((f) => f !== 'all').length

  return (
    <div>
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            Project Kanban Board
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Drag and drop deliverables between columns to update {groupBy === 'status' ? 'status' : groupBy === 'workstream' ? 'workstream' : 'owner'}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Group by:</label>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as GroupByType)}
            style={selectStyle}
          >
            <option value="status">Status</option>
            <option value="workstream">Workstream</option>
            <option value="owner">Owner</option>
          </select>
        </div>
      </div>

      {/* Filter Row */}
      <div
        style={{
          marginBottom: '1rem',
          padding: '1rem',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} style={{ color: 'var(--text-secondary)' }} />
          <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
            Filters
            {activeFilterCount > 0 && (
              <span
                style={{
                  marginLeft: '0.5rem',
                  background: 'var(--pwc-orange)',
                  color: 'white',
                  padding: '0.125rem 0.5rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                }}
              >
                {activeFilterCount}
              </span>
            )}
          </span>
        </div>

        <select
          value={filterWorkstream}
          onChange={(e) => setFilterWorkstream(e.target.value)}
          style={selectStyle}
        >
          <option value="all">All Workstreams</option>
          {workstreams.map((ws) => (
            <option key={ws.id} value={ws.id}>
              {ws.name}
            </option>
          ))}
        </select>

        <select
          value={filterUser}
          onChange={(e) => setFilterUser(e.target.value)}
          style={selectStyle}
        >
          <option value="all">All Users</option>
          {staff.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={selectStyle}
        >
          <option value="all">All Statuses</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        {activeFilterCount > 0 && (
          <button
            onClick={() => {
              setFilterWorkstream('all')
              setFilterUser('all')
              setFilterStatus('all')
            }}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--text-secondary)',
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            Clear Filters
          </button>
        )}

        <span style={{ marginLeft: 'auto', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          {filteredDeliverables.length} of {deliverables.length} items
        </span>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
            gap: '1rem',
            height: 'calc(100vh - 320px)',
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
