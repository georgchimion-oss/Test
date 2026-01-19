import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDeliverables, getWorkstreams, getStaff } from '../data/dataLayer'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns'

export default function Gantt() {
  const navigate = useNavigate()
  const deliverables = getDeliverables()
  const workstreams = getWorkstreams()
  const staff = getStaff()

  const { startDate, endDate, dateRange } = useMemo(() => {
    const today = new Date()
    const start = startOfMonth(new Date(today.getFullYear(), today.getMonth() - 1))
    const end = endOfMonth(new Date(today.getFullYear(), today.getMonth() + 2))
    const range = eachDayOfInterval({ start, end })
    return { startDate: start, endDate: end, dateRange: range }
  }, [])

  const getBarPosition = (taskStart: string, taskEnd: string) => {
    const start = new Date(taskStart)
    const end = new Date(taskEnd)

    const totalDays = dateRange.length
    const startDay = dateRange.findIndex(d => isSameDay(d, start) || d > start)
    const endDay = dateRange.findIndex(d => isSameDay(d, end) || d > end)

    const left = ((startDay / totalDays) * 100).toFixed(2)
    const width = (((endDay - startDay) / totalDays) * 100).toFixed(2)

    return { left: `${left}%`, width: `${width}%` }
  }

  const groupedByWorkstream = useMemo(() => {
    return workstreams.map((w) => ({
      workstream: w,
      deliverables: deliverables.filter((d) => d.workstreamId === w.id),
    }))
  }, [workstreams, deliverables])

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          Gantt Chart
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Timeline view of all deliverables across {format(startDate, 'MMM yyyy')} - {format(endDate, 'MMM yyyy')}
        </p>
      </div>

      <div className="card" style={{ overflow: 'auto' }}>
        <div style={{ minWidth: '1200px' }}>
          {/* Timeline Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '250px 1fr',
              borderBottom: '2px solid var(--border)',
              background: 'var(--bg-main)',
              position: 'sticky',
              top: 0,
              zIndex: 10,
            }}
          >
            <div style={{ padding: '1rem', fontWeight: '600', borderRight: '1px solid var(--border)' }}>
              Deliverable
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

          {/* Day Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '250px 1fr',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div style={{ borderRight: '1px solid var(--border)' }} />
            <div style={{ display: 'flex', position: 'relative', height: '30px' }}>
              {dateRange.map((date, i) => {
                const isWeekend = date.getDay() === 0 || date.getDay() === 6
                const isToday = isSameDay(date, new Date())
                return (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      borderRight: '1px solid var(--border)',
                      background: isWeekend ? 'rgba(148, 163, 184, 0.05)' : 'transparent',
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

          {/* Deliverables by Workstream */}
          {groupedByWorkstream.map(({ workstream, deliverables: wsDeliverables }) => (
            <div key={workstream.id}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '250px 1fr',
                  background: 'var(--bg-main)',
                  borderBottom: '1px solid var(--border)',
                }}
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
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: workstream.color,
                    }}
                  />
                  {workstream.name}
                </div>
                <div />
              </div>

              {wsDeliverables.map((deliverable) => {
                const owner = staff.find((s) => s.id === deliverable.ownerId)
                const barPosition = getBarPosition(deliverable.startDate, deliverable.dueDate)

                return (
                  <div
                    key={deliverable.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '250px 1fr',
                      borderBottom: '1px solid var(--border)',
                      minHeight: '60px',
                    }}
                  >
                    <div
                      style={{
                        padding: '1rem',
                        borderRight: '1px solid var(--border)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem',
                      }}
                    >
                      <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                        {deliverable.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {owner?.name || 'Unassigned'}
                      </div>
                    </div>

                    <div style={{ position: 'relative', display: 'flex' }}>
                      {dateRange.map((date, i) => {
                        const isWeekend = date.getDay() === 0 || date.getDay() === 6
                        const isToday = isSameDay(date, new Date())
                        return (
                          <div
                            key={i}
                            style={{
                              flex: 1,
                              borderRight: '1px solid var(--border)',
                              background: isWeekend ? 'rgba(148, 163, 184, 0.05)' : 'transparent',
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
                          height: '32px',
                          background: `linear-gradient(90deg, ${workstream.color}, ${workstream.color}dd)`,
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '0 0.75rem',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          color: 'white',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                          zIndex: 1,
                          overflow: 'hidden',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
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
          ))}
        </div>
      </div>
    </div>
  )
}
