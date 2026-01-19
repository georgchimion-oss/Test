import { useEffect, useMemo, useState } from 'react'
import { OrganizationChart } from 'primereact/organizationchart'
import type { TreeNode } from 'primereact/treenode'
import { getStaff, getWorkstreams, onDataRefresh } from '../data/dataLayer'
import type { Staff, Workstream } from '../types'

type OrgNodeData =
  | {
      type: 'staff'
      person: Staff
      directReports: number
      workstreams: number
    }
  | {
      type: 'workstream'
      workstream: Workstream
      lead?: Staff
      members: Staff[]
    }

const TITLE_ORDER = ['Partner', 'Director', 'Senior Manager', 'Manager', 'Senior Associate', 'Associate']

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

export default function OrgChartHierarchy() {
  const [staffData, setStaffData] = useState(getStaff())
  const [workstreamData, setWorkstreamData] = useState(getWorkstreams())
  const [viewMode, setViewMode] = useState<'workstream' | 'hierarchy'>('workstream')

  useEffect(() => {
    return onDataRefresh(() => {
      setStaffData(getStaff())
      setWorkstreamData(getWorkstreams())
    })
  }, [])

  const staff = useMemo(() => staffData.filter((member) => member.isActive), [staffData])
  const workstreams = useMemo(() => workstreamData, [workstreamData])

  const treeData = useMemo<TreeNode[]>(() => {
    if (staff.length === 0) return []

    const staffIds = new Set(staff.map((member) => member.id))
    const roots = staff.filter((member) => !member.supervisorId || !staffIds.has(member.supervisorId))
    const rootNodes = roots.length > 0 ? roots : staff

    const buildNode = (person: Staff): TreeNode => {
      const children = staff
        .filter((member) => member.supervisorId === person.id)
        .sort(sortByTitle)
        .map(buildNode)

      return {
        key: person.id,
        data: {
          type: 'staff',
          person,
          directReports: children.length,
          workstreams: person.workstreamIds.length,
        } as OrgNodeData,
        children,
      }
    }

    return rootNodes.sort(sortByTitle).map(buildNode)
  }, [staff])

  const workstreamTreeData = useMemo<TreeNode[]>(() => {
    if (workstreams.length === 0) return []

    return workstreams.map((workstream) => {
      const lead = staff.find((member) => member.id === workstream.lead)
      const members = staff
        .filter((member) => member.workstreamIds.includes(workstream.id) && member.id !== workstream.lead)
        .sort(sortByTitle)

      const leadNode = lead
        ? {
            key: `${workstream.id}-lead`,
            data: {
              type: 'staff',
              person: lead,
              directReports: members.length,
              workstreams: lead.workstreamIds.length,
            } as OrgNodeData,
            children: members.map((member) => ({
              key: `${workstream.id}-member-${member.id}`,
              data: {
                type: 'staff',
                person: member,
                directReports: 0,
                workstreams: member.workstreamIds.length,
              } as OrgNodeData,
            })),
          }
        : null

      return {
        key: workstream.id,
        data: {
          type: 'workstream',
          workstream,
          lead,
          members,
        } as OrgNodeData,
        children: leadNode
          ? [leadNode]
          : members.map((member) => ({
              key: `${workstream.id}-member-${member.id}`,
              data: {
                type: 'staff',
                person: member,
                directReports: 0,
                workstreams: member.workstreamIds.length,
              } as OrgNodeData,
            })),
      }
    })
  }, [staff, workstreams])

  const nodeTemplate = (node: TreeNode) => {
    const data = node.data as OrgNodeData
    if (!data) return null

    if (data.type === 'workstream') {
      const { workstream, lead, members } = data
      return (
        <div className="org-node org-node--workstream" style={{ borderTopColor: workstream.color }}>
          <div className="org-workstream-title">{workstream.name}</div>
          {workstream.description && (
            <div className="org-workstream-desc">{workstream.description}</div>
          )}
          <div className="org-footer">
            <span className="org-badge">Lead: {lead?.name || 'Unassigned'}</span>
            <span className="org-muted">{members.length} members</span>
          </div>
        </div>
      )
    }

    const { person, directReports, workstreams: staffWorkstreams } = data
    const showDepartment = person.department && person.department.toLowerCase() !== 'general'
    return (
      <div className="org-node">
        <div className="org-node-header">
          <div className="org-avatar">{getInitials(person.name)}</div>
          <div className="org-header-text">
            <div className="org-name">{person.name}</div>
            <div className="org-title">{person.title}</div>
          </div>
        </div>
        <div className="org-meta">
          <span className="org-pill">{person.role}</span>
          {showDepartment && <span className="org-pill">{person.department}</span>}
        </div>
        <div className="org-footer">
          <span className="org-badge">{directReports} reports</span>
          <span className="org-muted">{staffWorkstreams} workstreams</span>
        </div>
      </div>
    )
  }

  const activeData = viewMode === 'workstream' ? workstreamTreeData : treeData

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            Organization Hierarchy
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            {viewMode === 'workstream'
              ? 'Workstream pyramid with leads and members'
              : 'Reporting structure from Partner to Associate'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '999px', padding: '0.25rem' }}>
          <button
            type="button"
            onClick={() => setViewMode('workstream')}
            style={{
              borderRadius: '999px',
              padding: '0.4rem 0.9rem',
              border: 'none',
              background: viewMode === 'workstream' ? 'var(--primary)' : 'transparent',
              color: viewMode === 'workstream' ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '0.8125rem',
              fontWeight: 600,
            }}
          >
            Workstreams
          </button>
          <button
            type="button"
            onClick={() => setViewMode('hierarchy')}
            style={{
              borderRadius: '999px',
              padding: '0.4rem 0.9rem',
              border: 'none',
              background: viewMode === 'hierarchy' ? 'var(--primary)' : 'transparent',
              color: viewMode === 'hierarchy' ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '0.8125rem',
              fontWeight: 600,
            }}
          >
            Reporting
          </button>
        </div>
      </div>

      {activeData.length > 0 ? (
        <div className="org-chart">
          <OrganizationChart value={activeData} nodeTemplate={nodeTemplate} />
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-secondary)' }}>
            {viewMode === 'workstream' ? 'No workstreams found' : 'No organizational hierarchy found'}
          </p>
        </div>
      )}
    </div>
  )
}
