import { useEffect, useMemo, useState } from 'react'
import { getStaff, getWorkstreams, onDataRefresh } from '../data/dataLayer'
import type { Staff, Workstream } from '../types'
import { Users, Network, ChevronDown, ChevronRight, Briefcase, Mail, Star } from 'lucide-react'

const TITLE_ORDER = ['Partner', 'Director', 'Senior Manager', 'Manager', 'Senior Associate', 'Associate']
const TITLE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  Partner: { bg: 'linear-gradient(135deg, #D04A02 0%, #ff6b35 100%)', border: '#D04A02', text: '#ffffff' },
  Director: { bg: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)', border: '#2563eb', text: '#ffffff' },
  'Senior Manager': { bg: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)', border: '#7c3aed', text: '#ffffff' },
  Manager: { bg: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', border: '#059669', text: '#ffffff' },
  'Senior Associate': { bg: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)', border: '#0891b2', text: '#ffffff' },
  Associate: { bg: 'linear-gradient(135deg, #64748b 0%, #94a3b8 100%)', border: '#64748b', text: '#ffffff' },
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function sortByTitle(a: Staff, b: Staff): number {
  const aIndex = TITLE_ORDER.indexOf(a.title)
  const bIndex = TITLE_ORDER.indexOf(b.title)
  if (aIndex === bIndex) return a.name.localeCompare(b.name)
  return aIndex - bIndex
}

interface PersonCardProps {
  person: Staff
  isLead?: boolean
  workstreamColor?: string
  compact?: boolean
  onClick?: () => void
}

function PersonCard({ person, isLead, workstreamColor, compact, onClick }: PersonCardProps) {
  const [hovered, setHovered] = useState(false)
  const titleStyle = TITLE_COLORS[person.title] || TITLE_COLORS.Associate
  const cardBg = workstreamColor
    ? `linear-gradient(135deg, ${workstreamColor}15 0%, ${workstreamColor}05 100%)`
    : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: cardBg,
        border: `2px solid ${hovered ? (workstreamColor || titleStyle.border) : '#e2e8f0'}`,
        borderRadius: compact ? '12px' : '16px',
        padding: compact ? '12px' : '20px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered
          ? '0 20px 40px -12px rgba(0, 0, 0, 0.15), 0 8px 16px -8px rgba(0, 0, 0, 0.1)'
          : '0 4px 12px -4px rgba(0, 0, 0, 0.08)',
        minWidth: compact ? '200px' : '240px',
        position: 'relative',
      }}
    >
      {isLead && (
        <div style={{
          position: 'absolute',
          top: '-10px',
          right: '12px',
          background: workstreamColor || '#f59e0b',
          color: 'white',
          padding: '4px 10px',
          borderRadius: '20px',
          fontSize: '10px',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}>
          <Star size={10} fill="white" />
          Lead
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: compact ? '12px' : '16px' }}>
        <div style={{
          width: compact ? '48px' : '64px',
          height: compact ? '48px' : '64px',
          borderRadius: '50%',
          background: titleStyle.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: titleStyle.text,
          fontWeight: '700',
          fontSize: compact ? '16px' : '20px',
          boxShadow: `0 4px 12px ${titleStyle.border}40`,
          flexShrink: 0,
        }}>
          {getInitials(person.name)}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontWeight: '700',
            fontSize: compact ? '14px' : '16px',
            color: '#1e293b',
            marginBottom: '4px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {person.name}
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: `${titleStyle.border}15`,
            color: titleStyle.border,
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '600',
            marginBottom: compact ? '4px' : '8px',
          }}>
            <Briefcase size={11} />
            {person.title}
          </div>

          {!compact && person.role && (
            <div style={{
              fontSize: '12px',
              color: '#64748b',
              marginTop: '4px',
            }}>
              {person.role}
            </div>
          )}

          {!compact && person.email && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              color: '#94a3b8',
              marginTop: '6px',
            }}>
              <Mail size={11} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {person.email}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface HierarchyNodeProps {
  person: Staff
  staff: Staff[]
  level: number
  expanded: Set<string>
  toggleExpand: (id: string) => void
}

function HierarchyNode({ person, staff, level, expanded, toggleExpand }: HierarchyNodeProps) {
  const children = staff.filter((s) => s.supervisorId === person.id).sort(sortByTitle)
  const hasChildren = children.length > 0
  const isExpanded = expanded.has(person.id)

  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        marginLeft: level > 0 ? '40px' : '0',
        position: 'relative',
      }}>
        {level > 0 && (
          <>
            <div style={{
              position: 'absolute',
              left: '-24px',
              top: '0',
              bottom: hasChildren && isExpanded ? '0' : 'auto',
              width: '2px',
              height: hasChildren && isExpanded ? '100%' : '32px',
              background: 'linear-gradient(180deg, #e2e8f0 0%, transparent 100%)',
            }} />
            <div style={{
              position: 'absolute',
              left: '-24px',
              top: '32px',
              width: '24px',
              height: '2px',
              background: '#e2e8f0',
            }} />
          </>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {hasChildren && (
            <button
              onClick={() => toggleExpand(person.id)}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                border: '2px solid #e2e8f0',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                flexShrink: 0,
              }}
            >
              {isExpanded ? <ChevronDown size={14} color="#64748b" /> : <ChevronRight size={14} color="#64748b" />}
            </button>
          )}
          {!hasChildren && <div style={{ width: '36px' }} />}

          <PersonCard person={person} />

          {hasChildren && (
            <div style={{
              background: '#f1f5f9',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '11px',
              color: '#64748b',
              fontWeight: '600',
              marginLeft: '8px',
            }}>
              {children.length} direct report{children.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div style={{ marginTop: '16px' }}>
          {children.map((child) => (
            <HierarchyNode
              key={child.id}
              person={child}
              staff={staff}
              level={level + 1}
              expanded={expanded}
              toggleExpand={toggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface WorkstreamCardProps {
  workstream: Workstream
  lead?: Staff
  members: Staff[]
  expanded: boolean
  onToggle: () => void
}

function WorkstreamCard({ workstream, lead, members, expanded, onToggle }: WorkstreamCardProps) {
  const [hovered, setHovered] = useState(false)
  const totalMembers = (lead ? 1 : 0) + members.length

  return (
    <div
      style={{
        background: 'white',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: hovered
          ? '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
          : '0 10px 30px -10px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Header */}
      <div
        onClick={onToggle}
        style={{
          background: `linear-gradient(135deg, ${workstream.color} 0%, ${workstream.color}dd 100%)`,
          padding: '24px',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <div style={{
          position: 'absolute',
          top: '-30px',
          right: '-30px',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-40px',
          left: '20%',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{
                color: 'white',
                fontSize: '22px',
                fontWeight: '700',
                marginBottom: '8px',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}>
                {workstream.name}
              </h3>
              {workstream.description && (
                <p style={{
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: '14px',
                  maxWidth: '400px',
                }}>
                  {workstream.description}
                </p>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(8px)',
                padding: '12px 20px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
                <Users size={18} color="white" />
                <span style={{ color: 'white', fontWeight: '700', fontSize: '18px' }}>
                  {totalMembers}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
                  member{totalMembers !== 1 ? 's' : ''}
                </span>
              </div>

              <div style={{
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '12px',
                padding: '10px',
                transition: 'transform 0.3s ease',
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              }}>
                <ChevronDown size={20} color="white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{
        maxHeight: expanded ? '2000px' : '0',
        overflow: 'hidden',
        transition: 'max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        <div style={{ padding: '24px' }}>
          {/* Lead Section */}
          {lead && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
              }}>
                <div style={{
                  width: '4px',
                  height: '20px',
                  background: workstream.color,
                  borderRadius: '2px',
                }} />
                <span style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  color: '#64748b',
                }}>
                  Workstream Lead
                </span>
              </div>
              <PersonCard person={lead} isLead workstreamColor={workstream.color} />
            </div>
          )}

          {/* Members Section */}
          {members.length > 0 && (
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
              }}>
                <div style={{
                  width: '4px',
                  height: '20px',
                  background: '#94a3b8',
                  borderRadius: '2px',
                }} />
                <span style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  color: '#64748b',
                }}>
                  Team Members ({members.length})
                </span>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '16px',
              }}>
                {members.sort(sortByTitle).map((member) => (
                  <PersonCard key={member.id} person={member} compact workstreamColor={workstream.color} />
                ))}
              </div>
            </div>
          )}

          {!lead && members.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#94a3b8',
            }}>
              <Users size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
              <p>No team members assigned to this workstream</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function OrgChart() {
  const [staffData, setStaffData] = useState(getStaff())
  const [workstreams, setWorkstreamsData] = useState(getWorkstreams())
  const [viewMode, setViewMode] = useState<'workstream' | 'hierarchy'>('workstream')
  const [expandedHierarchy, setExpandedHierarchy] = useState<Set<string>>(new Set())
  const [expandedWorkstreams, setExpandedWorkstreams] = useState<Set<string>>(new Set())

  useEffect(() => {
    return onDataRefresh(() => {
      setStaffData(getStaff())
      setWorkstreamsData(getWorkstreams())
    })
  }, [])

  // Expand all by default on first load
  useEffect(() => {
    if (workstreams.length > 0 && expandedWorkstreams.size === 0) {
      setExpandedWorkstreams(new Set(workstreams.map(w => w.id)))
    }
  }, [workstreams])

  useEffect(() => {
    if (staff.length > 0 && expandedHierarchy.size === 0) {
      // Expand top 2 levels by default
      const roots = staff.filter((s) => !s.supervisorId || !staffIds.has(s.supervisorId))
      const level1Ids = roots.map(r => r.id)
      const level2Ids = staff.filter(s => level1Ids.includes(s.supervisorId || '')).map(s => s.id)
      setExpandedHierarchy(new Set([...level1Ids, ...level2Ids]))
    }
  }, [staffData])

  const staff = useMemo(() => staffData.filter((s) => s.isActive), [staffData])
  const staffIds = useMemo(() => new Set(staff.map((s) => s.id)), [staff])

  const workstreamTeams = useMemo(() => {
    return workstreams.map((ws) => {
      const lead = staff.find((s) => s.id === ws.lead)
      const members = staff.filter((s) => s.workstreamIds.includes(ws.id) && s.id !== ws.lead)
      return { ...ws, lead, members }
    })
  }, [workstreams, staff])

  const rootStaff = useMemo(() => {
    return staff.filter((s) => !s.supervisorId || !staffIds.has(s.supervisorId)).sort(sortByTitle)
  }, [staff, staffIds])

  const toggleHierarchyExpand = (id: string) => {
    setExpandedHierarchy((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const toggleWorkstreamExpand = (id: string) => {
    setExpandedWorkstreams((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const expandAllHierarchy = () => {
    setExpandedHierarchy(new Set(staff.map(s => s.id)))
  }

  const collapseAllHierarchy = () => {
    setExpandedHierarchy(new Set())
  }

  const expandAllWorkstreams = () => {
    setExpandedWorkstreams(new Set(workstreams.map(w => w.id)))
  }

  const collapseAllWorkstreams = () => {
    setExpandedWorkstreams(new Set())
  }

  // Stats
  const totalStaff = staff.length
  const titleCounts = useMemo(() => {
    return TITLE_ORDER.reduce((acc, title) => {
      acc[title] = staff.filter(s => s.title === title).length
      return acc
    }, {} as Record<string, number>)
  }, [staff])

  return (
    <div>
      {/* Header */}
      <div style={{
        marginBottom: '32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '24px',
      }}>
        <div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '800',
            color: '#1e293b',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #D04A02 0%, #ff6b35 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px -4px rgba(208, 74, 2, 0.4)',
            }}>
              <Network size={24} color="white" />
            </div>
            Organization Chart
          </h1>
          <p style={{ color: '#64748b', fontSize: '15px' }}>
            {viewMode === 'workstream'
              ? 'Team structure organized by workstreams and project assignments'
              : 'Reporting hierarchy from leadership to team members'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Expand/Collapse buttons */}
          <div style={{
            display: 'flex',
            gap: '8px',
          }}>
            <button
              onClick={viewMode === 'workstream' ? expandAllWorkstreams : expandAllHierarchy}
              style={{
                padding: '10px 16px',
                borderRadius: '10px',
                border: '2px solid #e2e8f0',
                background: 'white',
                color: '#64748b',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              Expand All
            </button>
            <button
              onClick={viewMode === 'workstream' ? collapseAllWorkstreams : collapseAllHierarchy}
              style={{
                padding: '10px 16px',
                borderRadius: '10px',
                border: '2px solid #e2e8f0',
                background: 'white',
                color: '#64748b',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              Collapse All
            </button>
          </div>

          {/* View Toggle */}
          <div style={{
            display: 'flex',
            background: '#f1f5f9',
            borderRadius: '14px',
            padding: '4px',
          }}>
            <button
              onClick={() => setViewMode('workstream')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                borderRadius: '10px',
                border: 'none',
                background: viewMode === 'workstream'
                  ? 'linear-gradient(135deg, #D04A02 0%, #ff6b35 100%)'
                  : 'transparent',
                color: viewMode === 'workstream' ? 'white' : '#64748b',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: viewMode === 'workstream' ? '0 4px 12px rgba(208, 74, 2, 0.3)' : 'none',
              }}
            >
              <Users size={16} />
              Workstreams
            </button>
            <button
              onClick={() => setViewMode('hierarchy')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                borderRadius: '10px',
                border: 'none',
                background: viewMode === 'hierarchy'
                  ? 'linear-gradient(135deg, #D04A02 0%, #ff6b35 100%)'
                  : 'transparent',
                color: viewMode === 'hierarchy' ? 'white' : '#64748b',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: viewMode === 'hierarchy' ? '0 4px 12px rgba(208, 74, 2, 0.3)' : 'none',
              }}
            >
              <Network size={16} />
              Hierarchy
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '32px',
        flexWrap: 'wrap',
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          borderRadius: '16px',
          padding: '20px 28px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          boxShadow: '0 10px 25px -5px rgba(30, 41, 59, 0.3)',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Users size={24} color="white" />
          </div>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Staff
            </div>
            <div style={{ color: 'white', fontSize: '28px', fontWeight: '800' }}>
              {totalStaff}
            </div>
          </div>
        </div>

        {TITLE_ORDER.filter(title => titleCounts[title] > 0).map((title) => {
          const style = TITLE_COLORS[title]
          return (
            <div
              key={title}
              style={{
                background: 'white',
                borderRadius: '14px',
                padding: '16px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                border: `2px solid ${style.border}20`,
                boxShadow: '0 4px 12px -4px rgba(0,0,0,0.08)',
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: style.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: '700',
                fontSize: '14px',
              }}>
                {titleCounts[title]}
              </div>
              <div style={{
                fontSize: '13px',
                fontWeight: '600',
                color: '#475569',
              }}>
                {title}{titleCounts[title] !== 1 ? 's' : ''}
              </div>
            </div>
          )
        })}
      </div>

      {/* Content */}
      {viewMode === 'workstream' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {workstreamTeams.length > 0 ? (
            workstreamTeams.map((ws) => (
              <WorkstreamCard
                key={ws.id}
                workstream={ws}
                lead={ws.lead}
                members={ws.members}
                expanded={expandedWorkstreams.has(ws.id)}
                onToggle={() => toggleWorkstreamExpand(ws.id)}
              />
            ))
          ) : (
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '60px',
              textAlign: 'center',
              boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.1)',
            }}>
              <Users size={64} style={{ color: '#cbd5e1', margin: '0 auto 24px' }} />
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>
                No Workstreams Found
              </h3>
              <p style={{ color: '#94a3b8' }}>
                Create workstreams and assign team members to see them here
              </p>
            </div>
          )}
        </div>
      ) : (
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '32px',
          boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.1)',
        }}>
          {rootStaff.length > 0 ? (
            rootStaff.map((person) => (
              <HierarchyNode
                key={person.id}
                person={person}
                staff={staff}
                level={0}
                expanded={expandedHierarchy}
                toggleExpand={toggleHierarchyExpand}
              />
            ))
          ) : (
            <div style={{
              padding: '60px',
              textAlign: 'center',
            }}>
              <Network size={64} style={{ color: '#cbd5e1', margin: '0 auto 24px' }} />
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>
                No Hierarchy Data
              </h3>
              <p style={{ color: '#94a3b8' }}>
                Add staff members with supervisor relationships to see the hierarchy
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
