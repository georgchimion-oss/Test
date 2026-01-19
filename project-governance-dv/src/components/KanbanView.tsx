import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { Plus } from 'lucide-react'
import type { Deliverable, DeliverableStatus } from '../types'
import { updateDeliverable } from '../data/dataLayer'
import KanbanCard from './KanbanCard'

interface KanbanViewProps {
  deliverables: Deliverable[]
  onUpdate?: () => void
}

const STATUS_CONFIGS: Record<DeliverableStatus, { color: string; bgColor: string }> = {
  'Not Started': { color: '#C4C4C4', bgColor: 'rgba(196, 196, 196, 0.15)' },
  'In Progress': { color: '#0073EA', bgColor: 'rgba(0, 115, 234, 0.15)' },
  'At Risk': { color: '#E44258', bgColor: 'rgba(228, 66, 88, 0.15)' },
  'Blocked': { color: '#6b7280', bgColor: 'rgba(107, 114, 128, 0.15)' },
  'Completed': { color: '#00CA72', bgColor: 'rgba(0, 202, 114, 0.15)' },
}

const STATUSES: DeliverableStatus[] = ['Not Started', 'In Progress', 'At Risk', 'Blocked', 'Completed']

export default function KanbanView({ deliverables, onUpdate }: KanbanViewProps) {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const { draggableId, destination } = result
    const newStatus = destination.droppableId as DeliverableStatus

    updateDeliverable(draggableId, { status: newStatus })
    onUpdate?.()
  }

  const getColumnDeliverables = (status: DeliverableStatus) => {
    return deliverables.filter((d) => d.status === status)
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${STATUSES.length}, 1fr)`,
          gap: 'var(--spacing-lg)',
          padding: 'var(--spacing-2xl)',
          height: 'calc(100vh - 300px)',
        }}
      >
        {STATUSES.map((status) => {
          const config = STATUS_CONFIGS[status]
          const columnDeliverables = getColumnDeliverables(status)

          return (
            <div key={status} style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              {/* Column Header */}
              <div
                style={{
                  background: config.bgColor,
                  borderTop: `3px solid ${config.color}`,
                  padding: 'var(--spacing-md) var(--spacing-lg)',
                  borderRadius: 'var(--border-radius-md) var(--border-radius-md) 0 0',
                  marginBottom: 'var(--spacing-sm)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 'var(--spacing-sm)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: config.color,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 'var(--font-size-md)',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                      }}
                    >
                      {status}
                    </span>
                  </div>
                  <span
                    style={{
                      background: 'var(--bg-main)',
                      padding: 'var(--spacing-xs) var(--spacing-sm)',
                      borderRadius: '9999px',
                      fontSize: 'var(--font-size-xs)',
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {columnDeliverables.length}
                  </span>
                </div>
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-xs)',
                    background: 'transparent',
                    border: '1px dashed var(--border)',
                    borderRadius: 'var(--border-radius-sm)',
                    padding: 'var(--spacing-xs) var(--spacing-sm)',
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    width: '100%',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = config.color
                    e.currentTarget.style.color = config.color
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.color = 'var(--text-secondary)'
                  }}
                >
                  <Plus size={14} /> New
                </button>
              </div>

              {/* Droppable Column */}
              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      flex: 1,
                      background: snapshot.isDraggingOver ? config.bgColor : 'transparent',
                      border: '1px solid var(--border)',
                      borderTop: 'none',
                      borderRadius: '0 0 var(--border-radius-md) var(--border-radius-md)',
                      padding: 'var(--spacing-md)',
                      overflowY: 'auto',
                      minHeight: '200px',
                    }}
                  >
                    {columnDeliverables.map((deliverable, index) => (
                      <Draggable key={deliverable.id} draggableId={deliverable.id} index={index}>
                        {(provided) => <KanbanCard deliverable={deliverable} provided={provided} />}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          )
        })}
      </div>
    </DragDropContext>
  )
}
