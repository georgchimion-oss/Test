import { useEffect, useMemo, useState } from 'react'
import { getStaff, getWorkstreams, onDataRefresh } from '../data/dataLayer'
import { Layers, Users, User } from 'lucide-react'

export default function OrgChartWorkstream() {
  const [staffData, setStaffData] = useState(getStaff())
  const [workstreams, setWorkstreams] = useState(getWorkstreams())

  useEffect(() => {
    return onDataRefresh(() => {
      setStaffData(getStaff())
      setWorkstreams(getWorkstreams())
    })
  }, [])

  const staff = useMemo(() => staffData.filter((s) => s.isActive), [staffData])

  const workstreamTeams = useMemo(() => {
    return workstreams.map((ws) => {
      const lead = staff.find((s) => s.id === ws.lead)
      const members = staff.filter((s) => s.workstreamIds.includes(ws.id) && s.id !== ws.lead)

      return {
        ...ws,
        lead,
        members,
      }
    })
  }, [workstreams, staff])

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          Workstream Organization
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Staff organized by workstream assignments
        </p>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {workstreamTeams.map((ws) => (
          <div
            key={ws.id}
            className="card"
            style={{
              borderTop: `4px solid ${ws.color}`,
            }}
          >
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      background: `${ws.color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Layers size={20} style={{ color: ws.color }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.125rem' }}>
                      {ws.name}
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {ws.description}
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    background: 'var(--bg-hover)',
                    padding: '0.5rem 1rem',
                    borderRadius: '9999px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                  }}
                >
                  <Users size={14} />
                  {(ws.members?.length || 0) + 1} Members
                </div>
              </div>
            </div>

            {ws.lead && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div
                  style={{
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.75rem',
                    fontWeight: '600',
                  }}
                >
                  Workstream Lead
                </div>
                <div
                  style={{
                    background: `linear-gradient(135deg, ${ws.color}20, ${ws.color}10)`,
                    border: `1px solid ${ws.color}40`,
                    borderRadius: '8px',
                    padding: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: ws.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '1.125rem',
                      }}
                    >
                      {ws.lead.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '1rem', marginBottom: '0.125rem' }}>
                        {ws.lead.name}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: ws.color, fontWeight: '500' }}>
                        {ws.lead.title}
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        {ws.lead.role}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {ws.members && ws.members.length > 0 && (
              <div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.75rem',
                    fontWeight: '600',
                  }}
                >
                  Team Members
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.75rem' }}>
                  {ws.members.map((member) => (
                    <div
                      key={member.id}
                      style={{
                        background: 'var(--bg-main)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        padding: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                      }}
                    >
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: 'var(--bg-hover)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        <User size={16} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: '500',
                            fontSize: '0.875rem',
                            marginBottom: '0.125rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {member.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {member.title}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {workstreamTeams.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Layers size={48} style={{ color: 'var(--text-secondary)', margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--text-secondary)' }}>No workstreams found</p>
        </div>
      )}
    </div>
  )
}
