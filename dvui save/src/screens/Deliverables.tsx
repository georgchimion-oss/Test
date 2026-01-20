import { useEffect, useMemo, useState } from 'react'
import {
  useCreateDeliverable,
  useDeleteDeliverable,
  useGetDeliverables,
  useGetStaff,
  useGetWorkstreams,
  useUpdateDeliverable,
} from '../services/dataverseService'
import type { Deliverable, DeliverableStatus, Priority, RiskLevel, Staff, Workstream } from '../types'
import { Plus, Edit2, Trash2, X, MessageSquare } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { logAudit } from '../data/auditLayer'

const COLOR_PALETTE = ['#D04A02', '#2563eb', '#059669', '#f59e0b', '#7c3aed']
const LOGICAL_TABLES = {
  deliverables: 'crda8_deliverables',
  staff: 'crda8_staff4',
  workstreams: 'crda8_workstreams',
}

function pickField<T = any>(source: Record<string, any>, keys: string[]): T | undefined {
  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null) {
      return source[key] as T
    }
  }
  return undefined
}

function normalizeChoice(value: any): string {
  if (value && typeof value === 'object' && 'Value' in value) {
    return String(value.Value)
  }
  return value === undefined || value === null ? '' : String(value)
}

function normalizeKey(value: string): string {
  return value.trim().toLowerCase()
}

function normalizePersonKey(value: string): string {
  return normalizeKey(value.replace(/\s*\(.*?\)\s*/g, ' ').replace(/\s+/g, ' ').trim())
}

function formatDateOnly(value?: string): string | undefined {
  if (!value) return undefined
  if (value.includes('T')) {
    return value.split('T')[0]
  }
  return value
}

function parseDelimitedList(value: any): string[] {
  if (!value) return []
  if (Array.isArray(value)) return value.map((item) => `${item}`)
  if (typeof value === 'string') {
    return value.split(/[;,]/).map((item) => item.trim()).filter(Boolean)
  }
  return []
}

function parseBoolean(value: any): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value.toLowerCase() === 'yes'
  }
  return Boolean(value)
}

function getLookupId(value: any): string | undefined {
  if (!value) return undefined
  if (typeof value === 'string') return value
  if (typeof value === 'object') {
    return value.id || value.Id || value.ID || value.value || value.Value
  }
  return undefined
}

function getPersonEmail(value: any): string | undefined {
  if (!value) return undefined
  if (typeof value === 'string') return value
  return value.Email || value.email || value.EMail || value.UserEmail
}

function getRecordId(item: Record<string, any>, tableName: string): string {
  const normalized = tableName.toLowerCase()
  const simple = normalized.replace(/[^a-z0-9]/g, '')
  const singular = normalized.endsWith('s') ? normalized.slice(0, -1) : normalized
  const singularSimple = singular.replace(/[^a-z0-9]/g, '')
  return (
    item.id ||
    item[`${tableName}id`] ||
    item[`${normalized}id`] ||
    item[`${simple}id`] ||
    item[`${singular}id`] ||
    item[`${singularSimple}id`] ||
    item[`${tableName}Id`] ||
    item[`${normalized}Id`] ||
    item[`${simple}Id`] ||
    item[`${singular}Id`] ||
    item[`${singularSimple}Id`] ||
    `${item.Id || item.ID || item._id || ''}`
  )
}

function resolveStaffId(
  value: any,
  staffByEmail: Map<string, Staff>,
  staffByName: Map<string, Staff>,
  staffById: Map<string, Staff>
): string {
  if (!value) return ''
  const raw = typeof value === 'string' ? value : `${value}`
  const email = getPersonEmail(value)
  if (email) {
    return staffByEmail.get(email.toLowerCase())?.id || staffById.get(email)?.id || email
  }
  const rawLower = raw.toLowerCase()
  return (
    staffById.get(raw)?.id ||
    staffByEmail.get(rawLower)?.id ||
    staffByName.get(normalizePersonKey(raw))?.id ||
    raw
  )
}

function resolveWorkstreamId(
  value: any,
  workstreamByName: Map<string, string>,
  workstreamById: Map<string, Workstream>
): string {
  if (!value) return ''
  const raw = typeof value === 'string' ? value : `${value}`
  return workstreamById.get(raw)?.id || workstreamByName.get(normalizeKey(raw)) || raw
}

function normalizeDeliverableForUi(
  deliverable: Deliverable,
  staffByEmail: Map<string, Staff>,
  staffByName: Map<string, Staff>,
  staffById: Map<string, Staff>,
  workstreamByName: Map<string, string>,
  workstreamById: Map<string, Workstream>
): Deliverable {
  const ownerId = resolveStaffId(deliverable.ownerId, staffByEmail, staffByName, staffById)
  const workstreamId = resolveWorkstreamId(deliverable.workstreamId, workstreamByName, workstreamById)
  return {
    ...deliverable,
    ownerId,
    workstreamId,
  }
}

function resolveOwnerDisplay(
  ownerId: string,
  staffById: Map<string, Staff>,
  staffByEmail: Map<string, Staff>,
  staffByName: Map<string, Staff>
): string {
  if (!ownerId) return ''
  const normalizedEmail = ownerId.toLowerCase?.() || ownerId
  return (
    staffById.get(ownerId)?.name ||
    staffByEmail.get(normalizedEmail)?.name ||
    staffByName.get(normalizePersonKey(ownerId))?.name ||
    ownerId
  )
}

function resolveWorkstreamDisplay(
  workstreamId: string,
  workstreamById: Map<string, Workstream>,
  workstreams: Workstream[]
): string {
  if (!workstreamId) return ''
  return (
    workstreamById.get(workstreamId)?.name ||
    workstreams.find((w) => normalizeKey(w.name) === normalizeKey(workstreamId))?.name ||
    workstreamId
  )
}

function normalizeUserRole(value: string | number | undefined): Staff['userRole'] {
  if (value === 0 || value === 'Admin') return 'Admin'
  if (value === 1 || value === 'WorkstreamLeader' || value === 'Manager') return 'Manager'
  if (value === 2 || value === 'Member' || value === 'User') return 'User'
  if (typeof value === 'string') {
    const normalized = value.toLowerCase()
    if (normalized.includes('admin')) return 'Admin'
    if (normalized.includes('workstreamleader') || normalized.includes('manager')) return 'Manager'
    if (normalized.includes('member') || normalized.includes('user')) return 'User'
  }
  return 'User'
}

function normalizeStaffTitle(value: string | number | undefined): Staff['title'] {
  if (value === 0) return 'Partner'
  if (value === 1) return 'Director'
  if (value === 2) return 'Senior Manager'
  if (value === 3) return 'Manager'
  if (value === 4) return 'Senior Associate'
  if (value === 5) return 'Associate'
  if (!value) return 'Associate'
  const normalized = String(value).toLowerCase()
  if (normalized.includes('partner')) return 'Partner'
  if (normalized.includes('director')) return 'Director'
  if (normalized.includes('seniormanager') || normalized.includes('senior manager')) return 'Senior Manager'
  if (normalized.includes('manager')) return 'Manager'
  if (normalized.includes('seniorassociate') || normalized.includes('senior associate')) return 'Senior Associate'
  return 'Associate'
}

function normalizeDeliverableStatus(value: string | number | undefined): DeliverableStatus {
  if (value === 0 || value === 'NotStarted') return 'Not Started'
  if (value === 1 || value === 'InProgress') return 'In Progress'
  if (value === 2 || value === 'Completed') return 'Completed'
  if (value === 3 || value === 'OnHold') return 'Blocked'
  if (value === 4 || value === 'Deferred') return 'Blocked'
  if (value === 5 || value === 'Descoped') return 'Blocked'
  if (typeof value === 'string') {
    const normalized = value.toLowerCase()
    if (normalized.includes('notstarted')) return 'Not Started'
    if (normalized.includes('inprogress')) return 'In Progress'
    if (normalized.includes('completed')) return 'Completed'
    if (normalized.includes('onhold') || normalized.includes('deferred') || normalized.includes('descoped')) return 'Blocked'
  }
  return 'Not Started'
}

function normalizeRisk(value: string | number | undefined): RiskLevel {
  if (value === 0 || value === 'Green') return 'Low'
  if (value === 1 || value === 'Amber') return 'Medium'
  if (value === 2 || value === 'Red') return 'High'
  if (value === 3) return 'High'
  if (typeof value === 'string') {
    const normalized = value.toLowerCase()
    if (normalized.includes('green')) return 'Low'
    if (normalized.includes('amber')) return 'Medium'
    if (normalized.includes('red')) return 'High'
  }
  return 'Low'
}

function formatSaveError(error: unknown): string {
  if (error instanceof Error) return error.message
  if (error && typeof error === 'object') {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string') {
      try {
        const parsed = JSON.parse(message) as { error?: { message?: string } }
        if (parsed?.error?.message) return parsed.error.message
      } catch {
        return message
      }
      return message
    }
    try {
      return JSON.stringify(error)
    } catch {
      return String(error)
    }
  }
  return String(error)
}

function mapRiskToDataverse(value: RiskLevel): number {
  switch (value) {
    case 'Low':
      return 0
    case 'Medium':
      return 1
    case 'High':
    case 'Critical':
      return 2
    default:
      return 0
  }
}

function mapStatusToDataverse(value: DeliverableStatus): number {
  switch (value) {
    case 'Not Started':
      return 0
    case 'In Progress':
      return 1
    case 'At Risk':
      return 2
    case 'Completed':
      return 3
    case 'Blocked':
      return 4
    default:
      return 0
  }
}

function mapStaffRecord(item: Record<string, any>): Staff {
  const name =
    pickField<string>(item, ['crda8_title', 'crda8_name', 'FullName', 'Title', 'Name']) || 'Unknown'
  const email =
    pickField<string>(item, ['crda8_email', 'Email', 'UserEmail', 'EmailAddress']) ||
    pickField<string>(
      item,
      Object.keys(item).filter((key) => key.toLowerCase().includes('email'))
    ) ||
    ''
  const roleValue = pickField(item, ['crda8_role', 'crda8_rolename', 'Role', 'UserRole'])
  const jobTitle = pickField(item, ['crda8_jobtitle', 'crda8_jobtitlename', 'JobTitle', 'Title'])
  const workstreamIds = parseDelimitedList(
    pickField(item, ['crda8_workstreams', 'WorkstreamsLookupId', 'WorkstreamsId', 'Workstreams'])
  )
  const supervisorLookup = pickField(item, ['crda8_supervisor', 'SupervisorId', 'Supervisor', 'ManagerId'])

  return {
    id: getRecordId(item, LOGICAL_TABLES.staff),
    name,
    title: normalizeStaffTitle(jobTitle),
    role: String(jobTitle || roleValue || 'Staff'),
    email,
    department: pickField<string>(item, ['crda8_department', 'Department']) || 'General',
    supervisorId: getLookupId(supervisorLookup),
    workstreamIds,
    userRole: normalizeUserRole(roleValue),
    isActive: parseBoolean(pickField(item, ['crda8_active', 'Active', 'IsActive'])),
    createdAt: pickField<string>(item, ['createdon', 'Created', 'CreatedDateTime']) || new Date().toISOString(),
  }
}

function mapWorkstreamRecord(
  item: Record<string, any>,
  staffByEmail: Map<string, Staff>,
  staffByName: Map<string, Staff>,
  staffById: Map<string, Staff>,
  colorIndex: number
): Workstream {
  const leader = pickField(item, ['crda8_leader', 'Leader', 'Lead', 'WorkstreamLead'])
  const leadId = resolveStaffId(leader, staffByEmail, staffByName, staffById)

  return {
    id: getRecordId(item, LOGICAL_TABLES.workstreams),
    name: pickField<string>(
      item,
      ['crda8_title', 'crda8_workstreamname', 'WorkstreamName', 'Title', 'Name']
    ) || 'Workstream',
    description: pickField<string>(item, ['crda8_description', 'Description', 'Summary']) || '',
    lead: leadId,
    color: COLOR_PALETTE[colorIndex % COLOR_PALETTE.length],
    createdAt: pickField<string>(item, ['createdon', 'Created', 'CreatedDateTime']) || new Date().toISOString(),
  }
}

function mapDeliverableRecord(
  item: Record<string, any>,
  staffByEmail: Map<string, Staff>,
  staffByName: Map<string, Staff>,
  staffById: Map<string, Staff>,
  workstreamByName: Map<string, string>,
  workstreamById: Map<string, Workstream>
): Deliverable {
  const ownerValue = pickField(item, [
    'crda8_owner',
    'crda8_ownername',
    'OwnerName',
    'OwnerId',
    'Owner',
    'DeliverableOwner',
    'AssignedTo',
  ])
  const ownerId = resolveStaffId(ownerValue, staffByEmail, staffByName, staffById)
  const progressRaw = pickField(item, ['crda8_completion_x0020__x0025_', 'Completion_x0025_', 'Completion%', 'CompletionPct', 'Progress'])
  const progress = typeof progressRaw === 'number' ? progressRaw : Number(progressRaw || 0)
  const workstreamValue = pickField(item, [
    'crda8_workstream',
    'crda8_workstreamname',
    'WorkstreamName',
    'WorkstreamLookupId',
    'WorkstreamId',
    'Workstream',
  ])
  const workstreamId = resolveWorkstreamId(workstreamValue, workstreamByName, workstreamById)
  const status = normalizeDeliverableStatus(pickField(item, ['crda8_status', 'Status']))
  const risk = normalizeRisk(pickField(item, ['crda8_risk', 'Risk']))
  const priority = (normalizeChoice(pickField(item, ['Priority'])) || 'Medium') as Priority
  const dueDate = pickField<string>(item, ['crda8_targetdate', 'TargetDate', 'DueDate'])
  const startDate = pickField<string>(item, ['crda8_startdate', 'StartDate', 'createdon', 'Created', 'CreatedDateTime'])

  return {
    id: getRecordId(item, LOGICAL_TABLES.deliverables),
    title: pickField<string>(item, ['crda8_title', 'crda8_deliverablename', 'DeliverableName', 'Title']) || 'Untitled',
    description: pickField<string>(item, ['crda8_description', 'Description', 'Notes', 'Comment']) || '',
    workstreamId,
    ownerId,
    status,
    priority,
    risk,
    startDate: startDate || new Date().toISOString(),
    dueDate: dueDate || new Date().toISOString(),
    partnerReviewDate: pickField<string>(item, ['crda8_partnerreviewdate', 'PartnerReviewDate']),
    clientReviewDate: pickField<string>(item, ['crda8_clientreviewdate', 'crda8_clientsignoffdate', 'ClientReviewDate', 'ClientSignOffDate']),
    testingDate: pickField<string>(item, ['crda8_testingdate', 'TestingDate']),
    milestone: pickField<string>(item, ['crda8_milestone', 'Milestone']),
    completedDate: pickField<string>(item, ['crda8_completiondate', 'CompletionDate']),
    progress: Number.isNaN(progress) ? 0 : progress,
    dependencies: parseDelimitedList(pickField(item, ['crda8_dependencies', 'Dependencies'])),
    tags: parseDelimitedList(pickField(item, ['Tags'])),
    comment: pickField<string>(item, ['crda8_comment', 'Comment']),
    createdAt: pickField<string>(item, ['createdon', 'Created', 'CreatedDateTime']) || new Date().toISOString(),
    updatedAt: pickField<string>(item, ['modifiedon', 'Modified', 'ModifiedDateTime']) || new Date().toISOString(),
  }
}

function toDataverseDeliverableFields(
  deliverable: Deliverable,
  staff: Staff[],
  workstreams: Workstream[]
): Record<string, any> {
  const owner =
    staff.find((member) => member.id === deliverable.ownerId) ||
    staff.find((member) => normalizePersonKey(member.name) === normalizePersonKey(deliverable.ownerId)) ||
    staff.find((member) => (member.email || '').toLowerCase() === String(deliverable.ownerId).toLowerCase())
  const workstream =
    workstreams.find((item) => item.id === deliverable.workstreamId) ||
    workstreams.find((item) => normalizeKey(item.name) === normalizeKey(deliverable.workstreamId))
  const ownerValue = owner?.email || owner?.name || deliverable.ownerId || null
  const workstreamValue = workstream?.name || deliverable.workstreamId || null

  if (!ownerValue || !workstreamValue) {
    throw new Error('Owner and Workstream are required.')
  }
  return {
    crda8_title: deliverable.title,
    crda8_deliverablename: deliverable.title,
    crda8_description: deliverable.description,
    crda8_workstream: workstreamValue,
    crda8_owner: ownerValue,
    crda8_status: mapStatusToDataverse(deliverable.status),
    crda8_risk: mapRiskToDataverse(deliverable.risk),
    crda8_targetdate: formatDateOnly(deliverable.dueDate),
    crda8_partnerreviewdate: formatDateOnly(deliverable.partnerReviewDate),
    crda8_clientreviewdate: formatDateOnly(deliverable.clientReviewDate),
    crda8_testingdate: formatDateOnly(deliverable.testingDate),
    crda8_milestone: deliverable.milestone,
    crda8_completiondate: formatDateOnly(deliverable.completedDate),
    crda8_completion_x0020__x0025_: Number(deliverable.progress || 0),
    crda8_comment: deliverable.comment,
    crda8_dependencies: deliverable.dependencies.join('; '),
  }
}

export default function Deliverables() {
  const { currentUser } = useAuth()
  const deliverablesQuery = useGetDeliverables()
  const staffQuery = useGetStaff()
  const workstreamsQuery = useGetWorkstreams()
  const createMutation = useCreateDeliverable()
  const updateMutation = useUpdateDeliverable()
  const deleteMutation = useDeleteDeliverable()
  const [showModal, setShowModal] = useState(false)
  const [editingDeliverable, setEditingDeliverable] = useState<Deliverable | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [selectedDeliverableIds, setSelectedDeliverableIds] = useState<string[]>([])
  const [bulkWorkstream, setBulkWorkstream] = useState('')
  const [bulkStatus, setBulkStatus] = useState('')
  const [bulkRisk, setBulkRisk] = useState('')
  const [bulkProgress, setBulkProgress] = useState('')
  const [bulkComment, setBulkComment] = useState('')
  const [bulkMessage, setBulkMessage] = useState('')
  const [isBulkUpdating, setIsBulkUpdating] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [updatingDeliverable, setUpdatingDeliverable] = useState<Deliverable | null>(null)
  const [updateForm, setUpdateForm] = useState({
    dueDate: '',
    partnerReviewDate: '',
    clientReviewDate: '',
    testingDate: '',
    status: '',
    risk: '',
    progress: 0,
    comment: '',
  })
  const staff = useMemo<Staff[]>(() => {
    const records = (staffQuery.data ?? []) as Record<string, any>[]
    return records.map((item: Record<string, any>) => mapStaffRecord(item))
  }, [staffQuery.data])
  const staffByEmail = useMemo<Map<string, Staff>>(
    () => new Map(staff.filter((s: Staff) => s.email).map((s: Staff) => [s.email.toLowerCase(), s])),
    [staff]
  )
  const staffByName = useMemo<Map<string, Staff>>(
    () => new Map(staff.map((s: Staff) => [normalizePersonKey(s.name), s])),
    [staff]
  )
  const staffById = useMemo<Map<string, Staff>>(
    () => new Map(staff.map((s: Staff) => [s.id, s])),
    [staff]
  )
  const workstreams = useMemo<Workstream[]>(() => {
    const records = (workstreamsQuery.data ?? []) as Record<string, any>[]
    return records.map((item: Record<string, any>, index: number) =>
      mapWorkstreamRecord(item, staffByEmail, staffByName, staffById, index)
    )
  }, [workstreamsQuery.data, staffByEmail, staffByName, staffById])
  const workstreamByName = useMemo<Map<string, string>>(
    () => new Map(workstreams.map((w: Workstream) => [normalizeKey(w.name), w.id])),
    [workstreams]
  )
  const workstreamById = useMemo<Map<string, Workstream>>(
    () => new Map(workstreams.map((w: Workstream) => [w.id, w])),
    [workstreams]
  )
  const deliverables = useMemo<Deliverable[]>(() => {
    const records = (deliverablesQuery.data ?? []) as Record<string, any>[]
    return records
      .map((item: Record<string, any>) =>
        mapDeliverableRecord(item, staffByEmail, staffByName, staffById, workstreamByName, workstreamById)
      )
      .map((item) => normalizeDeliverableForUi(item, staffByEmail, staffByName, staffById, workstreamByName, workstreamById))
  }, [deliverablesQuery.data, staffByEmail, staffByName, staffById, workstreamByName, workstreamById])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [workstreamFilter, setWorkstreamFilter] = useState('All')
  const [ownerFilter, setOwnerFilter] = useState('All')
  const [riskFilter, setRiskFilter] = useState('All')
  const [sortKey, setSortKey] = useState<'title' | 'status' | 'priority' | 'risk' | 'dueDate' | 'owner' | 'workstream'>('dueDate')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const [formData, setFormData] = useState<Partial<Deliverable>>({
    title: '',
    description: '',
    workstreamId: '',
    ownerId: '',
    status: 'Not Started',
    priority: 'Medium',
    risk: 'Low',
    startDate: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
    progress: 0,
    dependencies: [],
    tags: [],
  })

  useEffect(() => {
    if (!editingDeliverable) return
    const normalized = normalizeDeliverableForUi(
      editingDeliverable,
      staffByEmail,
      staffByName,
      staffById,
      workstreamByName,
      workstreamById
    )
    const ownerDisplay = resolveOwnerDisplay(normalized.ownerId, staffById, staffByEmail, staffByName)
    const workstreamDisplay = resolveWorkstreamDisplay(normalized.workstreamId, workstreamById, workstreams)
    setFormData((prev) => ({
      ...prev,
      workstreamId: workstreamDisplay || '',
      ownerId: ownerDisplay || '',
    }))
  }, [editingDeliverable, staffByEmail, staffByName, staffById, workstreamByName, workstreamById, workstreams, workstreamById])

  const loadError = deliverablesQuery.error || staffQuery.error || workstreamsQuery.error
  const isLoading = deliverablesQuery.isLoading || staffQuery.isLoading || workstreamsQuery.isLoading

  const filteredDeliverables = useMemo(() => {
    const searchTerm = search.trim().toLowerCase()
    const normalizedOwnerFilter =
      ownerFilter === 'All' || ownerFilter === 'Unassigned'
        ? ownerFilter
        : normalizePersonKey(ownerFilter)
    const normalizedWorkstreamFilter =
      workstreamFilter === 'All' || workstreamFilter === 'Unassigned'
        ? workstreamFilter
        : normalizeKey(workstreamFilter)
    let items = deliverables.filter((d: Deliverable) => {
      if (statusFilter !== 'All' && d.status !== statusFilter) return false
      if (riskFilter !== 'All' && d.risk !== riskFilter) return false
      if (normalizedWorkstreamFilter !== 'All') {
        const resolvedWorkstream = resolveWorkstreamDisplay(d.workstreamId, workstreamById, workstreams)
        if (normalizedWorkstreamFilter === 'Unassigned') {
          if (resolvedWorkstream) return false
        } else if (normalizeKey(resolvedWorkstream) !== normalizedWorkstreamFilter) {
          return false
        }
      }
      if (normalizedOwnerFilter !== 'All') {
        const resolvedOwner = resolveOwnerDisplay(d.ownerId, staffById, staffByEmail, staffByName)
        if (normalizedOwnerFilter === 'Unassigned') {
          if (resolvedOwner) return false
        } else if (normalizePersonKey(resolvedOwner) !== normalizedOwnerFilter) {
          return false
        }
      }
      if (!searchTerm) return true
      return (
        d.title.toLowerCase().includes(searchTerm) ||
        d.description.toLowerCase().includes(searchTerm)
      )
    })

    const getSortValue = (d: Deliverable) => {
      switch (sortKey) {
        case 'status':
          return d.status
        case 'priority':
          return d.priority
        case 'risk':
          return d.risk
        case 'owner':
          return resolveOwnerDisplay(d.ownerId, staffById, staffByEmail, staffByName)
        case 'workstream':
          return resolveWorkstreamDisplay(d.workstreamId, workstreamById, workstreams)
        case 'dueDate':
          return d.dueDate
        default:
          return d.title
      }
    }

    items = items.slice().sort((a: Deliverable, b: Deliverable) => {
      const aValue = getSortValue(a)
      const bValue = getSortValue(b)
      if (sortKey === 'dueDate') {
        const aTime = new Date(aValue as string).getTime()
        const bTime = new Date(bValue as string).getTime()
        return sortDirection === 'asc' ? aTime - bTime : bTime - aTime
      }
      const aStr = String(aValue).toLowerCase()
      const bStr = String(bValue).toLowerCase()
      if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1
      if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return items
  }, [
    deliverables,
    search,
    statusFilter,
    riskFilter,
    workstreamFilter,
    ownerFilter,
    sortKey,
    sortDirection,
    staff,
    workstreams,
    staffByEmail,
    staffById,
    staffByName,
    workstreamById,
  ])

  const allFilteredSelected =
    filteredDeliverables.length > 0 &&
    filteredDeliverables.every((deliverable) => selectedDeliverableIds.includes(deliverable.id))

  const toggleSelectAllFiltered = () => {
    if (allFilteredSelected) {
      const filteredIds = new Set(filteredDeliverables.map((item) => item.id))
      setSelectedDeliverableIds((prev) => prev.filter((id) => !filteredIds.has(id)))
      return
    }
    const merged = new Set(selectedDeliverableIds)
    filteredDeliverables.forEach((item) => merged.add(item.id))
    setSelectedDeliverableIds(Array.from(merged))
  }

  const toggleDeliverableSelection = (id: string) => {
    setSelectedDeliverableIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const clearBulkSelection = () => {
    setSelectedDeliverableIds([])
  }

  const handleBulkUpdate = async () => {
    if (selectedDeliverableIds.length === 0) {
      setBulkMessage('Select at least one deliverable to update.')
      return
    }

    const updates: Record<string, any> = {}

    if (bulkWorkstream) updates.crda8_workstream = bulkWorkstream
    if (bulkStatus) updates.crda8_status = mapStatusToDataverse(bulkStatus as DeliverableStatus)
    if (bulkRisk) updates.crda8_risk = mapRiskToDataverse(bulkRisk as RiskLevel)
    if (bulkProgress) {
      const raw = Number(bulkProgress)
      if (!Number.isNaN(raw)) {
        const normalized = raw > 1 ? Math.min(raw / 100, 1) : Math.max(raw, 0)
        updates.crda8_completion_x0020__x0025_ = normalized
      }
    }
    if (bulkComment) updates.crda8_comment = bulkComment

    if (Object.keys(updates).length === 0) {
      setBulkMessage('Choose at least one field to update.')
      return
    }

    setIsBulkUpdating(true)
    setBulkMessage('Updating deliverables...')
    try {
      let updatedCount = 0
      for (const id of selectedDeliverableIds) {
        await updateMutation.mutateAsync({ id, updates })
        updatedCount += 1
      }
      setBulkMessage(`Updated ${updatedCount} deliverables.`)
      clearBulkSelection()
    } catch (error) {
      setBulkMessage(formatSaveError(error))
    } finally {
      setIsBulkUpdating(false)
    }
  }

  if (isLoading) {
    return <div>Loading deliverables...</div>
  }

  if (loadError) {
    const message = loadError instanceof Error ? loadError.message : String(loadError)
    return <div>Error: {message}</div>
  }

  const handleOpenModal = (deliverable?: Deliverable) => {
    setSaveError(null)
    if (deliverable) {
      setEditingDeliverable(deliverable)
      const normalized = normalizeDeliverableForUi(
        deliverable,
        staffByEmail,
        staffByName,
        staffById,
        workstreamByName,
        workstreamById
      )
      const ownerDisplay = resolveOwnerDisplay(normalized.ownerId, staffById, staffByEmail, staffByName)
      const workstreamDisplay = resolveWorkstreamDisplay(normalized.workstreamId, workstreamById, workstreams)
      setFormData({
        ...normalized,
        workstreamId: workstreamDisplay || '',
        ownerId: ownerDisplay || '',
      })
    } else {
      setEditingDeliverable(null)
      setFormData({
        title: '',
        description: '',
        workstreamId: workstreams[0]?.name || '',
        ownerId: staff[0]?.name || '',
        status: 'Not Started',
        priority: 'Medium',
        risk: 'Low',
        startDate: new Date().toISOString().split('T')[0],
        dueDate: new Date().toISOString().split('T')[0],
        progress: 0,
        dependencies: [],
        tags: [],
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingDeliverable(null)
    setSaveError(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSaveError(null)

    if (!formData.workstreamId || !formData.ownerId) {
      setSaveError('Owner and Workstream are required.')
      return
    }

    if (editingDeliverable) {
      const updatedDeliverable: Deliverable = {
        ...editingDeliverable,
        ...formData,
      }
      let updates: Record<string, any>
      try {
        updates = toDataverseDeliverableFields(updatedDeliverable, staff, workstreams)
      } catch (error) {
        setSaveError(formatSaveError(error))
        return
      }
      updateMutation.mutate(
        {
          id: editingDeliverable.id,
          updates,
        },
        {
          onSuccess: handleCloseModal,
          onError: (error) => {
            console.error('Deliverable update failed:', error)
            setSaveError(formatSaveError(error))
          },
        }
      )
      if (currentUser) {
        const changes: string[] = []
        if (formData.title && formData.title !== editingDeliverable.title) {
          changes.push(`Title -> ${formData.title}`)
        }
        if (formData.description && formData.description !== editingDeliverable.description) {
          changes.push('Description updated')
        }
        if (formData.workstreamId && formData.workstreamId !== editingDeliverable.workstreamId) {
          const wsName = workstreams.find((w: Workstream) => w.id === formData.workstreamId)?.name || formData.workstreamId
          changes.push(`Workstream -> ${wsName}`)
        }
        if (formData.ownerId && formData.ownerId !== editingDeliverable.ownerId) {
          const ownerName = staff.find((s: Staff) => s.id === formData.ownerId)?.name || formData.ownerId
          changes.push(`Owner -> ${ownerName}`)
        }
        if (formData.status && formData.status !== editingDeliverable.status) {
          changes.push(`Status -> ${formData.status}`)
        }
        if (formData.priority && formData.priority !== editingDeliverable.priority) {
          changes.push(`Priority -> ${formData.priority}`)
        }
        if (formData.risk && formData.risk !== editingDeliverable.risk) {
          changes.push(`Risk -> ${formData.risk}`)
        }
        if (formData.dueDate && formData.dueDate !== editingDeliverable.dueDate) {
          changes.push(`Due Date -> ${formData.dueDate}`)
        }
        if (formData.progress !== undefined && formData.progress !== editingDeliverable.progress) {
          changes.push(`Progress -> ${formData.progress}%`)
        }

        logAudit(
          currentUser.id,
          currentUser.name,
          'Updated Deliverable',
          'Deliverable',
          editingDeliverable.id,
          changes.length ? changes.join('; ') : 'Updated deliverable'
        )
      }
    } else {
      const newDeliverable: Deliverable = {
        id: Date.now().toString(),
        title: formData.title!,
        description: formData.description!,
        workstreamId: formData.workstreamId!,
        ownerId: formData.ownerId!,
        status: formData.status as DeliverableStatus,
        priority: formData.priority as Priority,
        risk: formData.risk as RiskLevel,
        startDate: formData.startDate!,
        dueDate: formData.dueDate!,
        progress: formData.progress!,
        dependencies: [],
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      let payload: Record<string, any>
      try {
        payload = toDataverseDeliverableFields(newDeliverable, staff, workstreams)
      } catch (error) {
        setSaveError(formatSaveError(error))
        return
      }
      createMutation.mutate(payload, {
        onSuccess: handleCloseModal,
        onError: (error) => {
          console.error('Deliverable create failed:', error)
          setSaveError(formatSaveError(error))
        },
      })
      if (currentUser) {
        logAudit(
          currentUser.id,
          currentUser.name,
          'Created Deliverable',
          'Deliverable',
          newDeliverable.id,
          `Created ${newDeliverable.title}`
        )
      }
    }

    if (!editingDeliverable && createMutation.isPending) return
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this deliverable?')) {
      deleteMutation.mutate(id)
      if (currentUser) {
        logAudit(
          currentUser.id,
          currentUser.name,
          'Deleted Deliverable',
          'Deliverable',
          id,
          'Deleted deliverable'
        )
      }
    }
  }

  const handleOpenUpdate = (deliverable: Deliverable) => {
    setUpdatingDeliverable(deliverable)
    setUpdateForm({
      dueDate: deliverable.dueDate?.split('T')[0] || '',
      partnerReviewDate: deliverable.partnerReviewDate?.split('T')[0] || '',
      clientReviewDate: deliverable.clientReviewDate?.split('T')[0] || '',
      testingDate: deliverable.testingDate?.split('T')[0] || '',
      status: deliverable.status,
      risk: deliverable.risk,
      progress: deliverable.progress,
      comment: deliverable.comment || '',
    })
    setShowUpdateModal(true)
  }

  const handleSaveUpdate = () => {
    if (!updatingDeliverable || !updateForm.comment.trim()) return

    const updates: Record<string, any> = {
      crda8_comment: updateForm.comment.trim(),
    }

    updateMutation.mutate(
      { id: updatingDeliverable.id, updates },
      {
        onSuccess: () => {
          if (currentUser) {
            logAudit(
              currentUser.id,
              currentUser.name,
              'Added Comment',
              'Deliverable',
              updatingDeliverable.id,
              `Comment: ${updateForm.comment.trim()}`
            )
          }
          setShowUpdateModal(false)
          setUpdatingDeliverable(null)
        },
        onError: (error) => {
          console.error('Update failed:', error)
          alert('Update failed: ' + formatSaveError(error))
        },
      }
    )
  }

  return (
    <>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">All Deliverables</h3>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={16} />
            Add Deliverable
          </button>
        </div>

        <div style={{ display: 'grid', gap: '1rem', padding: '0 1.5rem 1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr repeat(4, 1fr)', gap: '1rem' }}>
            <input
              type="text"
              placeholder="Search by title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="At Risk">At Risk</option>
              <option value="Blocked">Blocked</option>
              <option value="Completed">Completed</option>
            </select>
            <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)}>
              <option value="All">All Risk</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
            <select value={workstreamFilter} onChange={(e) => setWorkstreamFilter(e.target.value)}>
              <option value="All">All Workstreams</option>
              <option value="Unassigned">Unassigned</option>
              {workstreams.map((w: Workstream) => (
                <option key={w.id} value={w.name}>
                  {w.name}
                </option>
              ))}
            </select>
            <select value={ownerFilter} onChange={(e) => setOwnerFilter(e.target.value)}>
              <option value="All">All Owners</option>
              <option value="Unassigned">Unassigned</option>
              {staff.map((s: Staff) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Sort by</label>
            <select value={sortKey} onChange={(e) => setSortKey(e.target.value as any)} style={{ maxWidth: '200px' }}>
              <option value="dueDate">Due Date</option>
              <option value="title">Title</option>
              <option value="status">Status</option>
              <option value="priority">Priority</option>
              <option value="risk">Risk</option>
              <option value="owner">Owner</option>
              <option value="workstream">Workstream</option>
            </select>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              style={{ padding: '0.4rem 0.75rem' }}
            >
              {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
            </button>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              {filteredDeliverables.length} results
            </span>
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" checked={allFilteredSelected} onChange={toggleSelectAllFiltered} />
                Select all filtered ({filteredDeliverables.length})
              </label>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Selected: {selectedDeliverableIds.length}
              </span>
              <button className="btn btn-secondary btn-sm" onClick={clearBulkSelection}>
                Clear selection
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowBulkModal(true)}
                disabled={selectedDeliverableIds.length === 0}
              >
                Bulk Update
              </button>
            </div>
            {bulkMessage && (
              <div style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {bulkMessage}
              </div>
            )}
          </div>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <input type="checkbox" checked={allFilteredSelected} onChange={toggleSelectAllFiltered} />
              </th>
              <th>Title</th>
              <th>Workstream</th>
              <th>Owner</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Risk</th>
              <th>Due Date</th>
              <th>Progress</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDeliverables.map((d: Deliverable) => {
              const ownerName = resolveOwnerDisplay(d.ownerId, staffById, staffByEmail, staffByName)
              const workstream =
                workstreamById.get(d.workstreamId) ||
                workstreams.find((w: Workstream) => normalizeKey(w.name) === normalizeKey(d.workstreamId || ''))
              return (
                <tr key={d.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedDeliverableIds.includes(d.id)}
                      onChange={() => toggleDeliverableSelection(d.id)}
                    />
                  </td>
                  <td style={{ fontWeight: '500' }}>{d.title}</td>
                  <td>
                    {workstream && (
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          background: `${workstream.color}20`,
                          color: workstream.color,
                        }}
                      >
                        {workstream.name}
                      </span>
                    )}
                    {!workstream && d.workstreamId && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {d.workstreamId}
                      </span>
                    )}
                    {!workstream && !d.workstreamId && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Unassigned
                      </span>
                    )}
                  </td>
                  <td>{ownerName || 'Unassigned'}</td>
                  <td>
                    <span className={`badge badge-${d.status.toLowerCase().replace(' ', '-')}`}>
                      {d.status}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${d.priority.toLowerCase()}`}>{d.priority}</span>
                  </td>
                  <td>
                    <span className={`badge badge-${d.risk.toLowerCase()}`}>{d.risk}</span>
                  </td>
                  <td>{new Date(d.dueDate).toLocaleDateString()}</td>
                  <td>
                    <div style={{ minWidth: '80px' }}>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${d.progress}%` }} />
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleOpenUpdate(d)}
                        style={{ padding: '0.375rem' }}
                        title="Quick Update"
                      >
                        <MessageSquare size={14} />
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleOpenModal(d)}
                        style={{ padding: '0.375rem' }}
                        title="Edit All Fields"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(d.id)}
                        style={{ padding: '0.375rem' }}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingDeliverable ? 'Edit Deliverable' : 'New Deliverable'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.5rem', minWidth: 'auto' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {saveError && (
                  <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                    {saveError}
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Workstream *</label>
                    <select
                      required
                      value={formData.workstreamId}
                      onChange={(e) => setFormData({ ...formData, workstreamId: e.target.value })}
                    >
                      <option value="">Select workstream</option>
                      {workstreams.map((w: Workstream) => (
                        <option key={w.id} value={w.name}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Owner *</label>
                    <select
                      required
                      value={formData.ownerId}
                      onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
                    >
                      <option value="">Select owner</option>
                      {staff.map((s: Staff) => (
                        <option key={s.id} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => {
                        const newStatus = e.target.value as DeliverableStatus
                        // If status is Completed, auto-set progress to 100%
                        if (newStatus === 'Completed') {
                          setFormData({ ...formData, status: newStatus, progress: 100 })
                        } else {
                          setFormData({ ...formData, status: newStatus })
                        }
                      }}
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="At Risk">At Risk</option>
                      <option value="Blocked">Blocked</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Risk</label>
                    <select
                      value={formData.risk}
                      onChange={(e) => setFormData({ ...formData, risk: e.target.value as RiskLevel })}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Due Date</label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Progress (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.progress}
                      onChange={(e) => {
                        const newProgress = parseInt(e.target.value) || 0
                        // If progress is 100%, auto-set status to Completed
                        if (newProgress >= 100) {
                          setFormData({ ...formData, progress: 100, status: 'Completed' })
                        } else {
                          setFormData({ ...formData, progress: newProgress })
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingDeliverable ? 'Save Changes' : 'Create Deliverable'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showBulkModal && (
        <div className="modal-overlay" onClick={() => setShowBulkModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Bulk Update Deliverables</h3>
              <button
                onClick={() => setShowBulkModal(false)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.5rem', minWidth: 'auto' }}
              >
                <X size={16} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Set Workstream</label>
                  <select value={bulkWorkstream} onChange={(e) => setBulkWorkstream(e.target.value)}>
                    <option value="">Leave unchanged</option>
                    {workstreams.map((workstream) => (
                      <option key={workstream.id} value={workstream.name}>
                        {workstream.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Set Status</label>
                  <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)}>
                    <option value="">Leave unchanged</option>
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="At Risk">At Risk</option>
                    <option value="Blocked">Blocked</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Set Risk</label>
                  <select value={bulkRisk} onChange={(e) => setBulkRisk(e.target.value)}>
                    <option value="">Leave unchanged</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Set Completion %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0-100"
                    value={bulkProgress}
                    onChange={(e) => setBulkProgress(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Set Comment</label>
                  <textarea value={bulkComment} onChange={(e) => setBulkComment(e.target.value)} rows={3} />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowBulkModal(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={handleBulkUpdate} disabled={isBulkUpdating}>
                {isBulkUpdating ? 'Updating...' : 'Apply Bulk Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showUpdateModal && updatingDeliverable && (
        <div className="modal-overlay" onClick={() => setShowUpdateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Add Comment: {updatingDeliverable.title}</h3>
              <button
                onClick={() => setShowUpdateModal(false)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.5rem', minWidth: 'auto' }}
              >
                <X size={16} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Comment / Status Update</label>
                <textarea
                  rows={4}
                  value={updateForm.comment}
                  onChange={(e) => setUpdateForm({ ...updateForm, comment: e.target.value })}
                  placeholder="Add a comment or status update..."
                  autoFocus
                />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowUpdateModal(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={handleSaveUpdate}>
                Post Comment
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
