import { getClient } from '@microsoft/power-apps/data'
import { dataSourcesInfo } from '../../.power/schemas/appschemas/dataSourcesInfo'
import type { Staff, Workstream, Deliverable, PTORequest, HoursLog, UserRole } from '../types'
import { DATAVERSE_TABLES } from './dataverseConfig'
import { setAuditLogs } from './auditLayer'

const STAFF_KEY = 'gov_staff'
const WORKSTREAMS_KEY = 'gov_workstreams'
const DELIVERABLES_KEY = 'gov_deliverables'
const PTO_KEY = 'gov_pto'
const HOURS_KEY = 'gov_hours'
const DATA_REFRESH_EVENT = 'gov:data-refresh'
const DATAVERSE_WRITES = import.meta.env.VITE_DATAVERSE_WRITES !== 'false'
const DATAVERSE_STATUS_EVENT = 'gov:dataverse-status'

let dataverseClient: ReturnType<typeof getClient> | null = null
let dataverseStatus = {
  connected: false,
  lastSync: null as string | null,
  error: null as string | null,
}

export async function configureDataverse(): Promise<boolean> {
  const client = await getDataverseClient()
  return Boolean(client)
}

export function onDataRefresh(callback: () => void): () => void {
  window.addEventListener(DATA_REFRESH_EVENT, callback)
  return () => window.removeEventListener(DATA_REFRESH_EVENT, callback)
}

function emitDataRefresh(): void {
  window.dispatchEvent(new Event(DATA_REFRESH_EVENT))
}

function emitDataverseStatus(): void {
  window.dispatchEvent(new Event(DATAVERSE_STATUS_EVENT))
}

export function onDataverseStatus(callback: () => void): () => void {
  window.addEventListener(DATAVERSE_STATUS_EVENT, callback)
  return () => window.removeEventListener(DATAVERSE_STATUS_EVENT, callback)
}

export function getDataverseStatus() {
  return dataverseStatus
}

function normalizeDataverseRecords(result: any): any[] {
  if (!result) return []
  if (Array.isArray(result)) return result
  if (result.data) {
    return normalizeDataverseRecords(result.data)
  }
  if (Array.isArray(result.records)) return result.records
  if (Array.isArray(result.value)) return result.value
  if (Array.isArray(result.entities)) return result.entities
  return []
}

function getLookupId(value: any): string | undefined {
  if (!value) return undefined
  if (typeof value === 'string') return value
  if (typeof value === 'object') {
    return value.id || value.Id || value.ID || value.value || value.Value
  }
  return undefined
}

async function getDataverseClient(): Promise<ReturnType<typeof getClient> | null> {
  if (dataverseClient) return dataverseClient
  try {
    if (!dataSourcesInfo || Object.keys(dataSourcesInfo).length === 0) {
      dataverseStatus = {
        connected: false,
        lastSync: dataverseStatus.lastSync,
        error: 'Dataverse dataSourcesInfo not available',
      }
      emitDataverseStatus()
      return null
    }

    dataverseClient = getClient(dataSourcesInfo)
    dataverseStatus = {
      connected: true,
      lastSync: dataverseStatus.lastSync,
      error: null,
    }
    emitDataverseStatus()
    return dataverseClient
  } catch (error) {
    console.error('Dataverse initialization failed:', error)
    dataverseStatus = {
      connected: false,
      lastSync: dataverseStatus.lastSync,
      error: error instanceof Error ? error.message : String(error),
    }
    emitDataverseStatus()
    return null
  }
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

function formatDataverseError(error: any): string {
  if (!error) return 'Dataverse error: unknown failure.'
  if (typeof error === 'string') return error
  if (error.message && typeof error.message === 'string') return error.message
  if (error.error?.message && typeof error.error.message === 'string') return error.error.message
  if (error.details && typeof error.details === 'string') return error.details
  if (error.statusText && typeof error.statusText === 'string') return error.statusText
  try {
    return JSON.stringify(error)
  } catch {
    return String(error)
  }
}

function formatDateOnly(value?: string): string | undefined {
  if (!value) return undefined
  if (value.includes('T')) {
    return value.split('T')[0]
  }
  return value
}

function parseBoolean(value: any): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value.toLowerCase() === 'yes'
  }
  return Boolean(value)
}

function getPersonEmail(value: any): string | undefined {
  if (!value) return undefined
  if (typeof value === 'string') return value
  return value.Email || value.email || value.EMail || value.UserEmail
}

function parseDelimitedList(value: any): string[] {
  if (!value) return []
  if (Array.isArray(value)) return value.map((item) => `${item}`)
  if (typeof value === 'string') {
    return value.split(/[;,]/).map((item) => item.trim()).filter(Boolean)
  }
  return []
}

function getRecordId(item: Record<string, any>, tableName: string): string {
  const primaryKey = (dataSourcesInfo as Record<string, any>)[tableName]?.primaryKey
  if (primaryKey && item[primaryKey]) {
    return `${item[primaryKey]}`
  }
  const normalized = tableName.toLowerCase()
  const simple = normalized.replace(/[^a-z0-9]/g, '')
  return (
    item.id ||
    item[`${tableName}id`] ||
    item[`${normalized}id`] ||
    item[`${simple}id`] ||
    item[`${tableName}Id`] ||
    item[`${normalized}Id`] ||
    item[`${simple}Id`] ||
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

function normalizeUserRole(value: string | number | undefined): UserRole {
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

function mapUserRoleToDataverseValue(role: UserRole): number {
  if (role === 'Admin') return 0
  if (role === 'Manager') return 1
  return 2
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

function mapStaffTitleToDataverseValue(title: Staff['title']): number {
  if (title === 'Partner') return 0
  if (title === 'Director') return 1
  if (title === 'Senior Manager') return 2
  if (title === 'Manager') return 3
  if (title === 'Senior Associate') return 4
  if (title === 'Associate') return 5
  return 6
}

function normalizeDeliverableStatus(value: string | number | undefined): Deliverable['status'] {
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

function normalizeRisk(value: string | number | undefined): Deliverable['risk'] {
  if (value === 0 || value === 'Green') return 'Low'
  if (value === 1 || value === 'Amber') return 'Medium'
  if (value === 2 || value === 'Red') return 'High'
  if (typeof value === 'string') {
    const normalized = value.toLowerCase()
    if (normalized.includes('green')) return 'Low'
    if (normalized.includes('amber')) return 'Medium'
    if (normalized.includes('red')) return 'High'
  }
  return 'Low'
}

function mapStaffRecord(item: Record<string, any>): Staff {
  const name =
    pickField<string>(item, ['crda8_title', 'crda8_name', 'FullName', 'Title', 'Name']) || 'Unknown'
  const email = pickField<string>(item, ['crda8_email', 'Email', 'UserEmail']) || ''
  const roleValue = pickField(item, ['crda8_role', 'crda8_rolename', 'Role', 'UserRole'])
  const jobTitle = pickField(item, ['crda8_jobtitle', 'crda8_jobtitlename', 'JobTitle', 'Title'])
  const workstreamIds = parseDelimitedList(
    pickField(item, ['crda8_workstreams', 'WorkstreamsLookupId', 'WorkstreamsId', 'Workstreams'])
  )
  const supervisorLookup = pickField(item, ['crda8_supervisor', 'SupervisorId', 'Supervisor', 'ManagerId'])

  return {
    id: getRecordId(item, DATAVERSE_TABLES.staff),
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

// Color palette for workstreams - TEST v11b: RED COLORS REMOVED FOR TESTING
const WORKSTREAM_COLORS = [
  '#2563eb', // Blue
  '#059669', // Green
  '#f59e0b', // Amber
  '#7c3aed', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#14b8a6', // Teal
  '#f97316', // Orange
  '#8b5cf6', // Violet
  '#22c55e', // Emerald
  '#eab308', // Yellow
  '#6366f1', // Indigo
  '#a855f7', // Fuchsia
  '#0ea5e9', // Sky
  '#10b981', // Green-600
  '#64748b', // Slate
]

function mapWorkstreamRecord(
  item: Record<string, any>,
  staffByEmail: Map<string, Staff>,
  staffByName: Map<string, Staff>,
  staffById: Map<string, Staff>,
  colorIndex: number
): Workstream {
  const leader = pickField(item, ['crda8_leader', 'Leader', 'Lead', 'WorkstreamLead'])
  const leadId = resolveStaffId(leader, staffByEmail, staffByName, staffById)
  const name = pickField<string>(
    item,
    ['crda8_title', 'crda8_workstreamname', 'WorkstreamName', 'Title', 'Name']
  ) || 'Workstream'

  return {
    id: getRecordId(item, DATAVERSE_TABLES.workstreams),
    name,
    description: pickField<string>(item, ['crda8_description', 'Description', 'Summary']) || '',
    lead: leadId,
    color: WORKSTREAM_COLORS[colorIndex % WORKSTREAM_COLORS.length],
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
  const priority = (normalizeChoice(pickField(item, ['Priority'])) || 'Medium') as Deliverable['priority']
  const dueDate = pickField<string>(item, ['crda8_targetdate', 'TargetDate', 'DueDate'])
  const startDate = pickField<string>(item, ['crda8_startdate', 'StartDate', 'createdon', 'Created', 'CreatedDateTime'])

  return {
    id: getRecordId(item, DATAVERSE_TABLES.deliverables),
    title: pickField<string>(item, ['crda8_title', 'crda8_deliverablename', 'DeliverableName', 'Title']) || 'Untitled',
    description: pickField<string>(item, ['crda8_description', 'Description', 'Notes', 'Comment']) || '',
    workstreamId,
    ownerId,
    status,
    priority: priority as Deliverable['priority'],
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

function mapPtoRecord(item: Record<string, any>): PTORequest {
  const staffLookup = pickField(item, ['crda8_person', 'StaffId', 'Staff', 'Employee', 'Requester'])
  const statusRaw = pickField(item, ['crda8_status', 'Status'])
  const normalizedStatus = normalizeChoice(statusRaw).toLowerCase()
  const status: PTORequest['status'] =
    normalizedStatus.includes('approved') ? 'Approved' :
    normalizedStatus.includes('rejected') || normalizedStatus.includes('cancelled') ? 'Rejected' :
    'Pending'
  return {
    id: getRecordId(item, DATAVERSE_TABLES.timeOffRequests),
    staffId: getLookupId(staffLookup) || pickField<string>(item, ['crda8_employeeemail']) || `${staffLookup || ''}`,
    startDate: pickField<string>(item, ['crda8_startdate', 'StartDate']) || new Date().toISOString(),
    endDate: pickField<string>(item, ['crda8_enddate', 'EndDate']) || new Date().toISOString(),
    type: (normalizeChoice(pickField(item, ['Type'])) || 'Vacation') as PTORequest['type'],
    status,
    notes: pickField<string>(item, ['crda8_comments', 'Notes', 'Comments']) || '',
    approvedBy: getLookupId(pickField(item, ['crda8_approvedby', 'ApprovedBy'])) || undefined,
    approvedAt: pickField<string>(item, ['crda8_approvedon', 'ApprovedAt', 'ApprovedOn']) || undefined,
    createdAt: pickField<string>(item, ['crda8_submittedon', 'Created', 'CreatedDateTime', 'SubmittedOn']) || new Date().toISOString(),
  }
}

function mapHoursRecord(item: Record<string, any>): HoursLog {
  const staffLookup = pickField(item, ['crda8_employeeemail', 'StaffId', 'Staff', 'Employee'])
  const deliverableLookup = pickField(item, ['DeliverableId', 'Deliverable'])
  return {
    id: getRecordId(item, DATAVERSE_TABLES.weeklyHours),
    staffId: getLookupId(staffLookup) || `${staffLookup || ''}`,
    deliverableId: getLookupId(deliverableLookup) || `${deliverableLookup || ''}`,
    date: pickField<string>(item, ['crda8_date', 'crda8_weekstart', 'Date']) || new Date().toISOString(),
    hours: Number(pickField(item, ['crda8_hoursworked', 'Hours']) || 0),
    description: pickField<string>(item, ['crda8_notes', 'Description', 'crda8_title']) || '',
    createdAt: pickField<string>(item, ['createdon', 'Created', 'CreatedDateTime']) || new Date().toISOString(),
  }
}

function mapAuditRecord(item: Record<string, any>): any {
  const userLookup = pickField(item, ['crda8_changedby', 'UserId', 'User'])
  const changeType = normalizeChoice(pickField(item, ['crda8_changetype'])) || 'Updated'
  const details = pickField<string>(item, ['crda8_fieldchanged'])
  const newValue = pickField<string>(item, ['crda8_newvalue'])
  const oldValue = pickField<string>(item, ['crda8_oldvalue'])
  return {
    id: getRecordId(item, DATAVERSE_TABLES.auditTrail),
    userId: getLookupId(userLookup) || `${userLookup || ''}`,
    userName: pickField<string>(item, ['crda8_changedby', 'UserName', 'Title']) || 'Unknown',
    action: changeType,
    entityType: 'App',
    entityId: pickField<string>(item, ['crda8_deliverable', 'crda8_workstream', 'EntityId']) || undefined,
    details: [details, oldValue ? `Old: ${oldValue}` : '', newValue ? `New: ${newValue}` : ''].filter(Boolean).join(' | '),
    timestamp: pickField<string>(item, ['crda8_changedate', 'Timestamp', 'Created', 'CreatedDateTime']) || new Date().toISOString(),
  }
}

function mapDeliverableStatusToDataverse(status: Deliverable['status']): string {
  if (status === 'Not Started') return 'NotStarted'
  if (status === 'In Progress') return 'InProgress'
  if (status === 'Completed') return 'Completed'
  if (status === 'At Risk') return 'InProgress'
  return 'OnHold'
}

function mapDeliverableRiskToDataverse(risk: Deliverable['risk']): string {
  if (risk === 'High' || risk === 'Critical') return 'Red'
  if (risk === 'Medium') return 'Amber'
  return 'Green'
}

function mapPtoStatusToDataverse(status: PTORequest['status']): string {
  if (status === 'Approved') return 'Approved'
  if (status === 'Rejected') return 'Rejected'
  return 'Requested'
}

function toDataverseStaffFields(staff: Staff): Record<string, any> {
  const workstreamsById = new Map(getWorkstreams().map((item) => [item.id, item]))
  const workstreamNames = staff.workstreamIds
    .map((id) => workstreamsById.get(id)?.name || id)
    .filter(Boolean)
  return {
    crda8_title: staff.name,
    crda8_email: staff.email,
    crda8_jobtitle: mapStaffTitleToDataverseValue(staff.title),
    crda8_role: mapUserRoleToDataverseValue(staff.userRole),
    crda8_supervisor: staff.supervisorId || null,
    crda8_workstreams: workstreamNames.join('; '),
    crda8_active: staff.isActive,
  }
}

function toDataverseWorkstreamFields(workstream: Workstream): Record<string, any> {
  const lead = getStaff().find((member) => member.id === workstream.lead)
  return {
    crda8_title: workstream.name,
    crda8_description: workstream.description,
    crda8_leader: lead?.email || lead?.name || workstream.lead || null,
    crda8_active: true,
  }
}

function toDataverseDeliverableFields(deliverable: Deliverable): Record<string, any> {
  const owner = getStaff().find((member) => member.id === deliverable.ownerId)
  const workstream = getWorkstreams().find((item) => item.id === deliverable.workstreamId)
  return {
    crda8_title: deliverable.title,
    crda8_deliverablename: deliverable.title,
    crda8_description: deliverable.description,
    crda8_workstream: workstream?.name || deliverable.workstreamId || null,
    crda8_owner: owner?.email || owner?.name || deliverable.ownerId || null,
    crda8_status: mapDeliverableStatusToDataverse(deliverable.status),
    crda8_risk: mapDeliverableRiskToDataverse(deliverable.risk),
    crda8_targetdate: formatDateOnly(deliverable.dueDate),
    crda8_partnerreviewdate: formatDateOnly(deliverable.partnerReviewDate),
    crda8_clientreviewdate: formatDateOnly(deliverable.clientReviewDate),
    crda8_testingdate: formatDateOnly(deliverable.testingDate),
    crda8_milestone: deliverable.milestone,
    crda8_completiondate: formatDateOnly(deliverable.completedDate),
    crda8_completion_x0020__x0025_: String(deliverable.progress),
    crda8_comment: deliverable.comment,
    crda8_dependencies: deliverable.dependencies.join('; '),
  }
}

function toDataversePtoFields(request: PTORequest): Record<string, any> {
  const staff = getStaff().find((member) => member.id === request.staffId)
  return {
    crda8_title: `PTO ${request.type}`,
    crda8_employeeemail: staff?.email || request.staffId,
    crda8_employeename: staff?.name || '',
    crda8_startdate: formatDateOnly(request.startDate),
    crda8_enddate: formatDateOnly(request.endDate),
    crda8_status: mapPtoStatusToDataverse(request.status),
    crda8_comments: request.notes,
    crda8_submittedon: request.createdAt,
    crda8_workstream: staff?.workstreamIds?.[0] || null,
  }
}

function toDataverseHoursFields(log: HoursLog): Record<string, any> {
  const staff = getStaff().find((member) => member.id === log.staffId)
  return {
    crda8_title: 'Weekly Hours',
    crda8_employeeemail: staff?.email || log.staffId,
    crda8_date: formatDateOnly(log.date),
    crda8_weekstart: formatDateOnly(log.date),
    crda8_hoursworked: String(log.hours),
    crda8_notes: log.description,
    crda8_submittedon: log.createdAt,
  }
}


export async function syncDataverseData(): Promise<void> {
  const client = await getDataverseClient()
  if (!client) return

  try {
    const staffResult = await client.retrieveMultipleRecordsAsync(DATAVERSE_TABLES.staff, { top: 5000 })
    const staffItems = normalizeDataverseRecords(staffResult).map((item: any) => mapStaffRecord(item))
    const staffByEmail = new Map(staffItems.filter((s) => s.email).map((s) => [s.email.toLowerCase(), s]))
    const staffByName = new Map(staffItems.map((s) => [normalizePersonKey(s.name), s]))
    const staffById = new Map(staffItems.map((s) => [s.id, s]))

    const workstreamResult = await client.retrieveMultipleRecordsAsync(DATAVERSE_TABLES.workstreams, { top: 5000 })
    // Sort by name alphabetically before assigning colors, so colors are consistent
    const sortedWorkstreamRecords = normalizeDataverseRecords(workstreamResult).sort((a: any, b: any) => {
      const nameA = (pickField<string>(a, ['crda8_title', 'crda8_workstreamname', 'WorkstreamName', 'Title', 'Name']) || '').toLowerCase()
      const nameB = (pickField<string>(b, ['crda8_title', 'crda8_workstreamname', 'WorkstreamName', 'Title', 'Name']) || '').toLowerCase()
      return nameA.localeCompare(nameB)
    })
    const workstreamItems = sortedWorkstreamRecords.map((item: any, index: number) =>
      mapWorkstreamRecord(item, staffByEmail, staffByName, staffById, index)
    )
    const workstreamByName = new Map(workstreamItems.map((w) => [normalizeKey(w.name), w.id]))
    const workstreamById = new Map(workstreamItems.map((w) => [w.id, w]))
    if (workstreamItems.length > 0) {
      setWorkstreams(workstreamItems)
    }

    const normalizedStaff = staffItems.map((staff) => {
      const workstreamIds = staff.workstreamIds
        .map((entry) => resolveWorkstreamId(entry, workstreamByName, workstreamById))
        .filter(Boolean)
      const supervisorId = resolveStaffId(staff.supervisorId, staffByEmail, staffByName, staffById)
      return {
        ...staff,
        workstreamIds,
        supervisorId: supervisorId || staff.supervisorId,
      }
    })
    if (normalizedStaff.length > 0) {
      setStaff(normalizedStaff)
    }

    const normalizedStaffByEmail = new Map(
      normalizedStaff.filter((s) => s.email).map((s) => [s.email.toLowerCase(), s])
    )
    const normalizedStaffByName = new Map(normalizedStaff.map((s) => [normalizePersonKey(s.name), s]))
    const normalizedStaffById = new Map(normalizedStaff.map((s) => [s.id, s]))

    const deliverableResult = await client.retrieveMultipleRecordsAsync(DATAVERSE_TABLES.deliverables, { top: 5000 })
    const deliverableItems = normalizeDataverseRecords(deliverableResult).map((item: any) =>
      mapDeliverableRecord(item, normalizedStaffByEmail, normalizedStaffByName, normalizedStaffById, workstreamByName, workstreamById)
    )
    if (deliverableItems.length > 0) {
      setDeliverables(deliverableItems)
    }

    const ptoResult = await client.retrieveMultipleRecordsAsync(DATAVERSE_TABLES.timeOffRequests, { top: 5000 })
    const ptoItems = normalizeDataverseRecords(ptoResult).map((item: any) => mapPtoRecord(item))
    if (ptoItems.length > 0) {
      setPTORequests(ptoItems)
    }

    const hoursResult = await client.retrieveMultipleRecordsAsync(DATAVERSE_TABLES.weeklyHours, { top: 5000 })
    const hoursItems = normalizeDataverseRecords(hoursResult).map((item: any) => mapHoursRecord(item))
    if (hoursItems.length > 0) {
      setHoursLogs(hoursItems)
    }

    const auditResult = await client.retrieveMultipleRecordsAsync(DATAVERSE_TABLES.auditTrail, { top: 5000 })
    const auditItems = normalizeDataverseRecords(auditResult).map((item: any) => mapAuditRecord(item))
    if (auditItems.length > 0) {
      setAuditLogs(auditItems as any)
    }

    dataverseStatus = {
      connected: true,
      lastSync: new Date().toISOString(),
      error: null,
    }
    emitDataverseStatus()
  } catch (error) {
    console.error('Dataverse sync failed:', error)
    dataverseStatus = {
      connected: false,
      lastSync: dataverseStatus.lastSync,
      error: error instanceof Error ? error.message : String(error),
    }
    emitDataverseStatus()
  }
}

// Staff CRUD
export function getStaff(): Staff[] {
  const data = localStorage.getItem(STAFF_KEY)
  if (!data) return []
  return JSON.parse(data)
}

export function setStaff(staff: Staff[]): void {
  localStorage.setItem(STAFF_KEY, JSON.stringify(staff))
  emitDataRefresh()
}

export function createStaff(staff: Staff): void {
  const allStaff = getStaff()
  allStaff.push(staff)
  setStaff(allStaff)
  if (DATAVERSE_WRITES) {
    void getDataverseClient()
      .then((client) => client?.createRecordAsync(DATAVERSE_TABLES.staff, toDataverseStaffFields(staff)))
      .catch((error) => console.error('Dataverse staff create failed:', error))
  }
}

export async function createStaffRemote(staff: Staff): Promise<void> {
  const client = await getDataverseClient()
  if (!client) {
    throw new Error('Dataverse connection not available.')
  }
  const result = await client.createRecordAsync(DATAVERSE_TABLES.staff, toDataverseStaffFields(staff))
  if (result && typeof result === 'object' && 'success' in result && result.success === false) {
    throw new Error(formatDataverseError(result.error))
  }
  await syncDataverseData()
}

export function updateStaff(id: string, updates: Partial<Staff>): void {
  const allStaff = getStaff()
  const index = allStaff.findIndex((s) => s.id === id)
  if (index !== -1) {
    allStaff[index] = { ...allStaff[index], ...updates }
    setStaff(allStaff)
    if (DATAVERSE_WRITES) {
      void getDataverseClient()
        .then((client) => client?.updateRecordAsync(DATAVERSE_TABLES.staff, id, toDataverseStaffFields(allStaff[index])))
        .catch((error) => console.error('Dataverse staff update failed:', error))
    }
  }
}

export async function updateStaffRemote(id: string, updates: Partial<Staff>): Promise<void> {
  const existing = getStaff().find((s) => s.id === id)
  if (!existing) {
    throw new Error('Staff record not found.')
  }
  const client = await getDataverseClient()
  if (!client) {
    throw new Error('Dataverse connection not available.')
  }
  const merged = { ...existing, ...updates }
  const result = await client.updateRecordAsync(DATAVERSE_TABLES.staff, id, toDataverseStaffFields(merged))
  if (result && typeof result === 'object' && 'success' in result && result.success === false) {
    throw new Error(formatDataverseError(result.error))
  }
  await syncDataverseData()
}

export function deleteStaff(id: string): void {
  const allStaff = getStaff()
  setStaff(allStaff.filter((s) => s.id !== id))
  if (DATAVERSE_WRITES) {
    void getDataverseClient()
      .then((client) => client?.deleteRecordAsync(DATAVERSE_TABLES.staff, id))
      .catch((error) => console.error('Dataverse staff delete failed:', error))
  }
}

export async function deleteStaffRemote(id: string): Promise<void> {
  const client = await getDataverseClient()
  if (!client) {
    throw new Error('Dataverse connection not available.')
  }
  const result = await client.deleteRecordAsync(DATAVERSE_TABLES.staff, id)
  if (result && typeof result === 'object' && 'success' in result && result.success === false) {
    throw new Error(formatDataverseError(result.error))
  }
  await syncDataverseData()
}

// Workstreams CRUD
export function getWorkstreams(): Workstream[] {
  const data = localStorage.getItem(WORKSTREAMS_KEY)
  if (!data) return []
  return JSON.parse(data)
}

export function setWorkstreams(workstreams: Workstream[]): void {
  localStorage.setItem(WORKSTREAMS_KEY, JSON.stringify(workstreams))
  emitDataRefresh()
}

export function createWorkstream(workstream: Workstream): void {
  const allWorkstreams = getWorkstreams()
  allWorkstreams.push(workstream)
  setWorkstreams(allWorkstreams)
  if (DATAVERSE_WRITES) {
    void getDataverseClient()
      .then((client) => client?.createRecordAsync(DATAVERSE_TABLES.workstreams, toDataverseWorkstreamFields(workstream)))
      .catch((error) => console.error('Dataverse workstream create failed:', error))
  }
}

export async function createWorkstreamRemote(workstream: Workstream): Promise<void> {
  const client = await getDataverseClient()
  if (!client) {
    throw new Error('Dataverse connection not available.')
  }
  const result = await client.createRecordAsync(DATAVERSE_TABLES.workstreams, toDataverseWorkstreamFields(workstream))
  if (result && typeof result === 'object' && 'success' in result && result.success === false) {
    throw new Error(formatDataverseError(result.error))
  }
  await syncDataverseData()
}

export function updateWorkstream(id: string, updates: Partial<Workstream>): void {
  const allWorkstreams = getWorkstreams()
  const index = allWorkstreams.findIndex((w) => w.id === id)
  if (index !== -1) {
    allWorkstreams[index] = { ...allWorkstreams[index], ...updates }
    setWorkstreams(allWorkstreams)
    if (DATAVERSE_WRITES) {
      void getDataverseClient()
        .then((client) => client?.updateRecordAsync(DATAVERSE_TABLES.workstreams, id, toDataverseWorkstreamFields(allWorkstreams[index])))
        .catch((error) => console.error('Dataverse workstream update failed:', error))
    }
  }
}

export async function updateWorkstreamRemote(id: string, updates: Partial<Workstream>): Promise<void> {
  const existing = getWorkstreams().find((w) => w.id === id)
  if (!existing) {
    throw new Error('Workstream not found.')
  }
  const client = await getDataverseClient()
  if (!client) {
    throw new Error('Dataverse connection not available.')
  }
  const merged = { ...existing, ...updates }
  const result = await client.updateRecordAsync(DATAVERSE_TABLES.workstreams, id, toDataverseWorkstreamFields(merged))
  if (result && typeof result === 'object' && 'success' in result && result.success === false) {
    throw new Error(formatDataverseError(result.error))
  }
  await syncDataverseData()
}

export function deleteWorkstream(id: string): void {
  const allWorkstreams = getWorkstreams()
  setWorkstreams(allWorkstreams.filter((w) => w.id !== id))
  if (DATAVERSE_WRITES) {
    void getDataverseClient()
      .then((client) => client?.deleteRecordAsync(DATAVERSE_TABLES.workstreams, id))
      .catch((error) => console.error('Dataverse workstream delete failed:', error))
  }
}

export async function deleteWorkstreamRemote(id: string): Promise<void> {
  const client = await getDataverseClient()
  if (!client) {
    throw new Error('Dataverse connection not available.')
  }
  const result = await client.deleteRecordAsync(DATAVERSE_TABLES.workstreams, id)
  if (result && typeof result === 'object' && 'success' in result && result.success === false) {
    throw new Error(formatDataverseError(result.error))
  }
  await syncDataverseData()
}

// Deliverables CRUD
export function getDeliverables(): Deliverable[] {
  const data = localStorage.getItem(DELIVERABLES_KEY)
  if (!data) return []
  return JSON.parse(data)
}

export function setDeliverables(deliverables: Deliverable[]): void {
  localStorage.setItem(DELIVERABLES_KEY, JSON.stringify(deliverables))
  emitDataRefresh()
}

export function createDeliverable(deliverable: Deliverable): void {
  const allDeliverables = getDeliverables()
  allDeliverables.push(deliverable)
  setDeliverables(allDeliverables)
  if (DATAVERSE_WRITES) {
    void getDataverseClient()
      .then((client) => client?.createRecordAsync(DATAVERSE_TABLES.deliverables, toDataverseDeliverableFields(deliverable)))
      .catch((error) => console.error('Dataverse deliverable create failed:', error))
  }
}

export function updateDeliverable(id: string, updates: Partial<Deliverable>): void {
  const allDeliverables = getDeliverables()
  const index = allDeliverables.findIndex((d) => d.id === id)
  if (index !== -1) {
    allDeliverables[index] = { ...allDeliverables[index], ...updates, updatedAt: new Date().toISOString() }
    setDeliverables(allDeliverables)
    if (DATAVERSE_WRITES) {
      void getDataverseClient()
        .then((client) => client?.updateRecordAsync(DATAVERSE_TABLES.deliverables, id, toDataverseDeliverableFields(allDeliverables[index])))
        .catch((error) => console.error('Dataverse deliverable update failed:', error))
    }
  }
}

export function deleteDeliverable(id: string): void {
  const allDeliverables = getDeliverables()
  setDeliverables(allDeliverables.filter((d) => d.id !== id))
  if (DATAVERSE_WRITES) {
    void getDataverseClient()
      .then((client) => client?.deleteRecordAsync(DATAVERSE_TABLES.deliverables, id))
      .catch((error) => console.error('Dataverse deliverable delete failed:', error))
  }
}

// PTO CRUD
export function getPTORequests(): PTORequest[] {
  const data = localStorage.getItem(PTO_KEY)
  if (!data) return []
  return JSON.parse(data)
}

export function setPTORequests(requests: PTORequest[]): void {
  localStorage.setItem(PTO_KEY, JSON.stringify(requests))
  emitDataRefresh()
}

export function createPTORequest(request: PTORequest): void {
  const allRequests = getPTORequests()
  allRequests.push(request)
  setPTORequests(allRequests)
  if (DATAVERSE_WRITES) {
    void getDataverseClient()
      .then((client) => client?.createRecordAsync(DATAVERSE_TABLES.timeOffRequests, toDataversePtoFields(request)))
      .catch((error) => console.error('Dataverse PTO create failed:', error))
  }
}

export function updatePTORequest(id: string, updates: Partial<PTORequest>): void {
  const allRequests = getPTORequests()
  const index = allRequests.findIndex((r) => r.id === id)
  if (index !== -1) {
    allRequests[index] = { ...allRequests[index], ...updates }
    setPTORequests(allRequests)
    if (DATAVERSE_WRITES) {
      void getDataverseClient()
        .then((client) => client?.updateRecordAsync(DATAVERSE_TABLES.timeOffRequests, id, toDataversePtoFields(allRequests[index])))
        .catch((error) => console.error('Dataverse PTO update failed:', error))
    }
  }
}

export function deletePTORequest(id: string): void {
  const allRequests = getPTORequests()
  setPTORequests(allRequests.filter((r) => r.id !== id))
  if (DATAVERSE_WRITES) {
    void getDataverseClient()
      .then((client) => client?.deleteRecordAsync(DATAVERSE_TABLES.timeOffRequests, id))
      .catch((error) => console.error('Dataverse PTO delete failed:', error))
  }
}

// Hours CRUD
export function getHoursLogs(): HoursLog[] {
  const data = localStorage.getItem(HOURS_KEY)
  if (!data) return []
  return JSON.parse(data)
}

export function setHoursLogs(logs: HoursLog[]): void {
  localStorage.setItem(HOURS_KEY, JSON.stringify(logs))
  emitDataRefresh()
}

export function createHoursLog(log: HoursLog): void {
  const allLogs = getHoursLogs()
  allLogs.push(log)
  setHoursLogs(allLogs)
  if (DATAVERSE_WRITES) {
    void getDataverseClient()
      .then((client) => client?.createRecordAsync(DATAVERSE_TABLES.weeklyHours, toDataverseHoursFields(log)))
      .catch((error) => console.error('Dataverse hours create failed:', error))
  }
}

export function updateHoursLog(id: string, updates: Partial<HoursLog>): void {
  const allLogs = getHoursLogs()
  const index = allLogs.findIndex((l) => l.id === id)
  if (index !== -1) {
    allLogs[index] = { ...allLogs[index], ...updates }
    setHoursLogs(allLogs)
    if (DATAVERSE_WRITES) {
      void getDataverseClient()
        .then((client) => client?.updateRecordAsync(DATAVERSE_TABLES.weeklyHours, id, toDataverseHoursFields(allLogs[index])))
        .catch((error) => console.error('Dataverse hours update failed:', error))
    }
  }
}

export function deleteHoursLog(id: string): void {
  const allLogs = getHoursLogs()
  setHoursLogs(allLogs.filter((l) => l.id !== id))
  if (DATAVERSE_WRITES) {
    void getDataverseClient()
      .then((client) => client?.deleteRecordAsync(DATAVERSE_TABLES.weeklyHours, id))
      .catch((error) => console.error('Dataverse hours delete failed:', error))
  }
}

// Seed data function
export function seedInitialData(): void {
  // No-op: Dataverse is the source of truth.
}
