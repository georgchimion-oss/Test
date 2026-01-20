import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDeliverables, getWorkstreams, getStaff } from '../data/dataLayer'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns'
import { ChevronDown, ChevronRight, Filter, ZoomIn, ZoomOut, ChevronLeft, ChevronRightIcon } from 'lucide-react'

export default function Gantt() {
  const navigate = useNavigate()
  const deliverables = getDeliverables()
  const workstreams = getWorkstreams()
  const staff = getStaff()

  // Expand/collapse state for each workstream
  const [expandedWorkstreams, setExpandedWorkstreams] = useState<Set<string>>(
    new Set(workstreams.map(w => w.id))
  )

  // Workstream filter
  const [selectedWorkstreams, setSelectedWorkstreams] = useState<Set<string>>(
    new Set(workstreams.map(w => w.id))
  )
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)

  // Time range state
  const [viewMonths, setViewMonths] = useState(4) // How many months to show
  const [startMonth, setStartMonth] = useState(() => {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth() - 1, 1)
  })

  const toggleWorkstream = (id: string) => {
    setExpandedWorkstreams(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const expandAll = () => {
    setExpandedWorkstreams(new Set(workstreams.map(w => w.id)))
  }

  const collapseAll = () => {
    setExpandedWorkstreams(new Set())
  }

  const toggleWorkstreamFilter = (id: string) => {
    setSelectedWorkstreams(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const selectAllWorkstreams = () => {
    setSelectedWorkstreams(new Set(workstreams.map(w => w.id)))
  }

  const clearAllWorkstreams = () => {
    setSelectedWorkstreams(new Set())
  }

  // Navigate time range
  const shiftTimeRange = (direction: 'prev' | 'next') => {
    setStartMonth(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1))
  }

  const zoomIn = () => {
    if (viewMonths > 1) setViewMonths(prev => prev - 1)
  }

  const zoomOut = () => {
    if (viewMonths < 12) setViewMonths(prev => prev + 1)
  }

  const { startDate, endDate, dateRange } = useMemo(() => {
    const start = startOfMonth(startMonth)
    const end = endOfMonth(addMonths(startMonth, viewMonths - 1))
    const range = eachDayOfInterval({ start, end })
    return { startDate: start, endDate: end, dateRange: range }
  }, [startMonth, viewMonths])

  const getBarPosition = (taskStart: string, taskEnd: string) => {
    const start = new Date(taskStart)
    const end = new Date(taskEnd)

    const totalDays = dateRange.length
    let startDay = dateRange.findIndex(d => isSameDay(d, start) || d > start)
    let endDay = dateRange.findIndex(d => isSameDay(d, end) || d > end)

    // Handle cases where dates are outside visible range
    if (startDay === -1) startDay = start < dateRange[0] ? 0 : totalDays
    if (endDay === -1) endDay = end > dateRange[totalDays - 1] ? totalDays : 0

    const left = Math.max(0, (startDay / totalDays) * 100)
    const width = Math.max(0, ((endDay - startDay) / totalDays) * 100)

    return { left: `${left.toFixed(2)}%`, width: `${Math.max(width, 1).toFixed(2)}%` }
  }

  const groupedByWorkstream = useMemo(() => {
    return workstreams
      .filter(w => selectedWorkstreams.has(w.id))
      .map((w) => {
        const wsDeliverables = deliverables.filter((d) => d.workstreamId === w.id)
        const completedCount = wsDeliverables.filter(d => d.status === 'Completed').length
        const totalProgress = wsDeliverables.length > 0
          ? Math.round(wsDeliverables.reduce((sum, d) => sum + d.progress, 0) / wsDeliverables.length)
          : 0
        return {
          workstream: w,
          deliverables: wsDeliverables,
          completedCount,
          totalProgress,
        }
      })
  }, [workstreams, deliverables, selectedWorkstreams])

  return (
    <div>
      {/* Controls */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '1rem',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        {/* Expand/Collapse buttons */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={expandAll}>
            Expand All
          </button>
          <button className="btn btn-secondary btn-sm" onClick={collapseAll}>
            Collapse All
          </button>
        </div>

        {/* Workstream filter */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Filter size={14} />
            Workstreams ({selectedWorkstreams.size}/{workstreams.length})
          </button>
          {showFilterDropdown && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: '0.25rem',
              background: 'var(--card-bg)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              zIndex: 100,
              minWidth: '220px',
              padding: '0.5rem',
            }}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', padding: '0 0.5rem' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={selectAllWorkstreams}
                  style={{ flex: 1, fontSize: '0.75rem', padding: '0.25rem' }}
                >
                  All
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={clearAllWorkstreams}
                  style={{ flex: 1, fontSize: '0.75rem', padding: '0.25rem' }}
                >
                  None
                </button>
              </div>
              {workstreams.map(ws => (
                <label
                  key={ws.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem',
                    cursor: 'pointer',
                    borderRadius: '4px',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <input
                    type="checkbox"
                    checked={selectedWorkstreams.has(ws.id)}
                    onChange={() => toggleWorkstreamFilter(ws.id)}
                    style={{ width: 'auto', cursor: 'pointer' }}
                  />
                  <div
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: ws.color,
                    }}
                  />
                  <span style={{ fontSize: '0.875rem' }}>{ws.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Time range controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => shiftTimeRange('prev')} title="Previous month">
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: '0.875rem', fontWeight: '500', minWidth: '180px', textAlign: 'center' }}>
            {format(startDate, 'MMM yyyy')} - {format(endDate, 'MMM yyyy')}
          </span>
          <button className="btn btn-secondary btn-sm" onClick={() => shiftTimeRange('next')} title="Next month">
            <ChevronRightIcon size={16} />
          </button>
          <div style={{ width: '1px', height: '24px', background: 'var(--border)', margin: '0 0.5rem' }} />
          <button className="btn btn-secondary btn-sm" onClick={zoomIn} title="Zoom in (fewer months)" disabled={viewMonths <= 1}>
            <ZoomIn size={16} />
          </button>
          <button className="btn btn-secondary btn-sm" onClick={zoomOut} title="Zoom out (more months)" disabled={viewMonths >= 12}>
            <ZoomOut size={16} />
          </button>
        </div>
      </div>

      {/* Click outside to close filter dropdown */}
      {showFilterDropdown && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 99 }}
          onClick={() => setShowFilterDropdown(false)}
        />
      )}

      <div className="card" style={{ overflow: 'auto' }}>
        <div style={{ minWidth: '1000px' }}>
          {/* Timeline Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '280px 1fr',
              borderBottom: '2px solid var(--border)',
              background: 'var(--bg-main)',
              position: 'sticky',
              top: 0,
              zIndex: 10,
            }}
          >
            <div style={{ padding: '1rem', fontWeight: '600', borderRight: '1px solid var(--border)' }}>
              Workstream / Deliverable
            </div>
            <div style={{ display: 'flex', padding: '0.5rem 1rem' }}>
              {Array.from(new Set(dateRange.map((d) => format(d, 'MMM yyyy')))).map((month) => {
                const daysInMonth = dateRange.filter((d) => format(d, 'MMM yyyy') === month).length
                const width = ((daysInMonth / dateRange.length) * 100).toFixed(2)
                return (
                  <div
                    key={month}
                    style={{
                      width: `${width}%`,
                      textAlign: 'center',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      borderRight: '1px solid var(--border)',
                    }}
                  >
                    {month}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Day Grid Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '280px 1fr',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div style={{ borderRight: '1px solid var(--border)' }} />
            <div style={{ display: 'flex', position: 'relative', height: '24px' }}>
              {dateRange.map((date, i) => {
                const isWeekend = date.getDay() === 0 || date.getDay() === 6
                const isToday = isSameDay(date, new Date())
                const isFirstOfMonth = date.getDate() === 1
                return (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      borderRight: isFirstOfMonth ? '2px solid var(--border)' : '1px solid var(--border)',
                      background: isWeekend ? 'rgba(148, 163, 184, 0.08)' : 'transparent',
                      position: 'relative',
                    }}
                  >
                    {isToday && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          bottom: 0,
                          left: '50%',
                          width: '2px',
                          background: 'var(--primary)',
                          zIndex: 5,
                        }}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Workstreams and Deliverables */}
          {groupedByWorkstream.map(({ workstream, deliverables: wsDeliverables, totalProgress }) => {
            const isExpanded = expandedWorkstreams.has(workstream.id)

            return (
              <div key={workstream.id}>
                {/* Workstream Header Row */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '280px 1fr',
                    background: 'var(--bg-main)',
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                  }}
                  onClick={() => toggleWorkstream(workstream.id)}
                >
                  <div
                    style={{
                      padding: '0.75rem 1rem',
                      fontWeight: '600',
                      borderRight: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: workstream.color,
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ flex: 1 }}>{workstream.name}</span>
                    <span style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                      fontWeight: '500',
                    }}>
                      {wsDeliverables.length} items
                    </span>
                  </div>
                  {/* Workstream progress bar */}
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    {dateRange.map((date, i) => {
                      const isWeekend = date.getDay() === 0 || date.getDay() === 6
                      const isToday = isSameDay(date, new Date())
                      const isFirstOfMonth = date.getDate() === 1
                      return (
                        <div
                          key={i}
                          style={{
                            flex: 1,
                            height: '100%',
                            borderRight: isFirstOfMonth ? '2px solid var(--border)' : '1px solid var(--border)',
                            background: isWeekend ? 'rgba(148, 163, 184, 0.08)' : 'transparent',
                            position: 'relative',
                          }}
                        >
                          {isToday && (
                            <div
                              style={{
                                position: 'absolute',
                                top: 0,
                                bottom: 0,
                                left: '50%',
                                width: '2px',
                                background: 'var(--primary)',
                                zIndex: 5,
                              }}
                            />
                          )}
                        </div>
                      )
                    })}
                    {/* Workstream summary bar */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        left: '2%',
                        right: '2%',
                        height: '24px',
                        background: `${workstream.color}30`,
                        borderRadius: '4px',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: `${totalProgress}%`,
                          background: workstream.color,
                          opacity: 0.6,
                        }}
                      />
                      <span style={{
                        position: 'relative',
                        zIndex: 1,
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                      }}>
                        {totalProgress}% Complete
                      </span>
                    </div>
                  </div>
                </div>

                {/* Deliverable Rows (when expanded) */}
                {isExpanded && wsDeliverables.map((deliverable) => {
                  const owner = staff.find((s) => s.id === deliverable.ownerId)
                  const barPosition = getBarPosition(deliverable.startDate, deliverable.dueDate)

                  return (
                    <div
                      key={deliverable.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '280px 1fr',
                        borderBottom: '1px solid var(--border)',
                        minHeight: '52px',
                      }}
                    >
                      <div
                        style={{
                          padding: '0.75rem 1rem 0.75rem 2.5rem',
                          borderRight: '1px solid var(--border)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          gap: '0.125rem',
                        }}
                      >
                        <div style={{ fontSize: '0.875rem', fontWeight: '500', lineHeight: 1.3 }}>
                          {deliverable.title}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                          {owner?.name || 'Unassigned'} | {format(new Date(deliverable.dueDate), 'MMM d')}
                        </div>
                      </div>

                      <div style={{ position: 'relative', display: 'flex' }}>
                        {dateRange.map((date, i) => {
                          const isWeekend = date.getDay() === 0 || date.getDay() === 6
                          const isToday = isSameDay(date, new Date())
                          const isFirstOfMonth = date.getDate() === 1
                          return (
                            <div
                              key={i}
                              style={{
                                flex: 1,
                                borderRight: isFirstOfMonth ? '2px solid var(--border)' : '1px solid var(--border)',
                                background: isWeekend ? 'rgba(148, 163, 184, 0.08)' : 'transparent',
                                position: 'relative',
                              }}
                            >
                              {isToday && (
                                <div
                                  style={{
                                    position: 'absolute',
                                    top: 0,
                                    bottom: 0,
                                    left: '50%',
                                    width: '2px',
                                    background: 'var(--primary)',
                                    zIndex: 5,
                                  }}
                                />
                              )}
                            </div>
                          )
                        })}

                        <div
                          onClick={() => navigate('/deliverables')}
                          style={{
                            position: 'absolute',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            left: barPosition.left,
                            width: barPosition.width,
                            minWidth: '40px',
                            height: '28px',
                            background: `linear-gradient(90deg, ${workstream.color}, ${workstream.color}dd)`,
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0 0.5rem',
                            fontSize: '0.7rem',
                            fontWeight: '500',
                            color: 'white',
                            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.2)',
                            zIndex: 1,
                            overflow: 'hidden',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = '0.85'
                            e.currentTarget.style.transform = 'translateY(-50%) scale(1.02)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = '1'
                            e.currentTarget.style.transform = 'translateY(-50%)'
                          }}
                        >
                          <div
                            style={{
                              position: 'absolute',
                              left: 0,
                              top: 0,
                              bottom: 0,
                              width: `${deliverable.progress}%`,
                              background: 'rgba(255, 255, 255, 0.3)',
                              transition: 'width 0.3s ease',
                            }}
                          />
                          <span style={{ position: 'relative', zIndex: 1, whiteSpace: 'nowrap' }}>
                            {deliverable.progress}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })}

          {/* Empty state */}
          {groupedByWorkstream.length === 0 && (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No workstreams selected. Use the filter to select workstreams.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
