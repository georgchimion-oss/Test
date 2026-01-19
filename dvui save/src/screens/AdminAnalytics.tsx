import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getDeliverables, getStaff, getWorkstreams, syncDataverseData } from '../data/dataLayer'
import { getAuditLogs, getActivityStats, setAuditLogs } from '../data/auditLayer'
import { Activity, AlertTriangle, TrendingUp, Calendar } from 'lucide-react'
import { parseCsv, type CsvRecord } from '../utils/csv'
import type { AuditLog, Deliverable, DeliverableStatus, PTORequest, RiskLevel, Staff, UserRole, Workstream } from '../types'
import {
  Crda8_deliverablesesService,
  Crda8_staff4sService,
  Crda8_timeoffrequestsesService,
  Crda8_workstreamsesService,
} from '../generated'
import type { IOperationResult } from '@microsoft/power-apps/data'
import type { Crda8_deliverablesesBase } from '../generated/models/Crda8_deliverablesesModel'
import type { Crda8_staff4sBase } from '../generated/models/Crda8_staff4sModel'
import type { Crda8_timeoffrequestsesBase } from '../generated/models/Crda8_timeoffrequestsesModel'
import type { Crda8_workstreamsesBase } from '../generated/models/Crda8_workstreamsesModel'

const STATUS_VALUES: DeliverableStatus[] = ['Not Started', 'In Progress', 'At Risk', 'Completed', 'Blocked']
const RISK_VALUES: RiskLevel[] = ['Low', 'Medium', 'High', 'Critical']

const normalizeKey = (value: string) =>
  value
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const resolveWorkstreamId = (value: string, workstreamByName: Map<string, string>) => {
  const normalized = normalizeKey(value)
  if (!normalized) return undefined
  const direct = workstreamByName.get(normalized)
  if (direct) return direct
  for (const [key, id] of workstreamByName.entries()) {
    if (normalized.includes(key) || key.includes(normalized)) return id
  }
  return undefined
}

const parseBoolean = (value: string) => ['true', 'yes', '1', 'active'].includes(value.toLowerCase())

const splitList = (value: string) =>
  value
    .split(/[;,]/)
    .map((item) => item.trim())
    .filter(Boolean)

const normalizeCsvText = (value: string) => value.replace(/\s+/g, ' ').trim()

const pickField = (source: Record<string, any>, keys: string[]) => {
  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null && source[key] !== '') {
      return source[key]
    }
  }
  return undefined
}

const getRecordId = (record: Record<string, any>, keys: string[]) => {
  const found = pickField(record, keys)
  if (found) return String(found)
  return record.id || record.Id || record.ID ? String(record.id || record.Id || record.ID) : ''
}

const mapUserRoleToDataverseValue = (role: UserRole): number => {
  if (role === 'Admin') return 0
  if (role === 'Manager') return 1
  return 2
}

const mapStaffTitleToDataverseValue = (title: Staff['title']): number => {
  if (title === 'Partner') return 0
  if (title === 'Director') return 1
  if (title === 'Senior Manager') return 2
  if (title === 'Manager') return 3
  if (title === 'Senior Associate') return 4
  if (title === 'Associate') return 5
  return 6
}

const mapDeliverableStatusToDataverse = (status: DeliverableStatus): number => {
  if (status === 'Not Started') return 0
  if (status === 'In Progress') return 1
  if (status === 'Completed') return 2
  if (status === 'At Risk') return 1
  return 3
}

const mapDeliverableRiskToDataverse = (risk: RiskLevel): number => {
  if (risk === 'High' || risk === 'Critical') return 2
  if (risk === 'Medium') return 1
  return 0
}

const mapPtoStatusToDataverse = (status: PTORequest['status']): number => {
  if (status === 'Approved') return 1
  if (status === 'Rejected') return 2
  return 0
}

const normalizeUserRole = (value: string): UserRole => {
  if (value === 'Admin' || value === 'Manager' || value === 'User') return value
  return 'User'
}

const normalizeStaffTitle = (value: string): Staff['title'] => {
  const lowered = value.toLowerCase()
  if (lowered.includes('partner')) return 'Partner'
  if (lowered.includes('director')) return 'Director'
  if (lowered.includes('senior manager')) return 'Senior Manager'
  if (lowered.includes('manager')) return 'Manager'
  if (lowered.includes('senior associate')) return 'Senior Associate'
  return 'Associate'
}

const normalizeStatus = (value: string): DeliverableStatus => {
  const cleaned = value.toLowerCase().trim()
  if (cleaned === 'descoped' || cleaned === 'de-scoped') return 'Blocked'
  return STATUS_VALUES.find((status) => status.toLowerCase() === cleaned) || 'Not Started'
}

const normalizeRisk = (value: string): RiskLevel => {
  const cleaned = value.toLowerCase().trim()
  if (cleaned === 'green') return 'Low'
  if (cleaned === 'yellow' || cleaned === 'amber') return 'Medium'
  if (cleaned === 'red') return 'High'
  return RISK_VALUES.find((risk) => risk.toLowerCase() === cleaned) || 'Low'
}

const parseProgress = (value: string) => {
  const cleaned = value.replace('%', '').trim()
  const parsed = Number(cleaned)
  if (Number.isNaN(parsed)) return 0
  if (parsed > 1) return Math.min(parsed / 100, 1)
  if (parsed < 0) return 0
  return parsed
}

const formatImportError = (error: unknown) => {
  if (error instanceof Error) return error.message
  try {
    return JSON.stringify(error)
  } catch {
    return String(error)
  }
}

const readFileText = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(reader.error || new Error('Failed to read file'))
    reader.readAsText(file)
  })

const DATAVERSE_BOOL_FIELDS = new Set(['crda8_active'])
const DATAVERSE_NUMBER_FIELDS = new Set([
  'crda8_completion_x0020__x0025_',
  'crda8_risk',
  'crda8_status',
  'crda8_jobtitle',
  'crda8_role',
])

const formatDateOnly = (value: string) => {
  if (!value) return undefined
  if (value.includes('T')) return value.split('T')[0]
  if (value.includes(' ')) return value.split(' ')[0]
  const slashMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (slashMatch) {
    const [, mm, dd, yyyy] = slashMatch
    return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`
  }
  if (value.startsWith('0001')) return undefined
  return value
}

const parseCsvValue = (key: string, raw: string) => {
  if (!raw) return undefined
  if (DATAVERSE_BOOL_FIELDS.has(key)) return raw.toLowerCase() === 'true' || raw === '1'
  if (DATAVERSE_NUMBER_FIELDS.has(key)) {
    const parsed = Number(raw)
    return Number.isNaN(parsed) ? undefined : parsed
  }
  if (key.toLowerCase().includes('date')) return formatDateOnly(raw)
  return raw
}

const mapCsvToDataverse = (record: CsvRecord) => {
  const payload: Record<string, any> = {}
  Object.entries(record).forEach(([key, value]) => {
    if (!key.startsWith('crda8_')) return
    if (key.endsWith('id')) return
    const parsed = parseCsvValue(key, value)
    if (parsed !== undefined && parsed !== '') {
      payload[key] = parsed
    }
  })
  return payload
}

const ensureSuccess = <T,>(result: IOperationResult<T>, label: string) => {
  if (!result.success) {
    const details = result.error ? formatImportError(result.error) : ''
    throw new Error(details || `Failed to ${label}.`)
  }
  return result.data as T
}

const mapWorkstreams = (records: CsvRecord[]): Workstream[] =>
  records.map((record, index) => {
    const id = record.WorkstreamID || `ws-${index + 1}`
    return {
      id,
      name: record.WorkstreamName || record.Title || `Workstream ${index + 1}`,
      description: record.Description || '',
      lead: '',
      color: '#D04A02',
      createdAt: new Date().toISOString(),
    }
  })

const mapStaff = (records: CsvRecord[], workstreamByName: Map<string, string>) => {
  const staffWithSupervisor = records.map((record, index) => {
    const id = record.Email || `staff-${index + 1}`
    const workstreams = splitList(record.Workstreams || '')
      .map((name) => resolveWorkstreamId(name, workstreamByName))
      .filter((value): value is string => Boolean(value))

    const supervisorRef = normalizeCsvText(record.Supervisor || '')

    const staff: Staff = {
      id,
      name: record.FullName || record.Title || `Staff ${index + 1}`,
      title: normalizeStaffTitle(record.JobTitle || ''),
      role: record.JobTitle || record.Role || 'Staff',
      email: record.Email || '',
      department: record.Notes || 'General',
      supervisorId: undefined,
      workstreamIds: workstreams,
      userRole: normalizeUserRole(record.Role || ''),
      isActive: parseBoolean(record.Active || ''),
      createdAt: new Date().toISOString(),
    }

    return {
      staff,
      supervisorRef,
    }
  })

  const staffByEmail = new Map(
    staffWithSupervisor
      .map(({ staff }) => staff.email && [staff.email.toLowerCase(), staff.id])
      .filter((entry): entry is [string, string] => Boolean(entry))
  )
  const staffByName = new Map(
    staffWithSupervisor.map(({ staff }) => [normalizeKey(staff.name), staff.id])
  )

  staffWithSupervisor.forEach(({ staff, supervisorRef }) => {
    if (!supervisorRef) return
    const normalized = normalizeKey(supervisorRef)
    staff.supervisorId = staffByEmail.get(normalized) || staffByName.get(normalized) || supervisorRef
  })

  return staffWithSupervisor.map(({ staff }) => staff)
}

const mapWorkstreamLeads = (workstreams: Workstream[], staff: Staff[], records: CsvRecord[]) => {
  const staffByEmail = new Map(
    staff
      .map((member) => member.email && [member.email.toLowerCase(), member.id])
      .filter((entry): entry is [string, string] => Boolean(entry))
  )
  const staffByName = new Map(
    staff.map((member) => [normalizeKey(member.name), member.id])
  )

  return workstreams.map((workstream, index) => {
    const leader = normalizeCsvText(records[index]?.Leader || '')
    const normalizedLeader = normalizeKey(leader)
    const leadId = staffByEmail.get(normalizedLeader) || staffByName.get(normalizedLeader) || leader
    return { ...workstream, lead: leadId }
  })
}

const toDataverseStaffPayload = (
  staff: Staff,
  workstreamsById: Map<string, Workstream>,
  staffById: Map<string, Staff>,
  staffByEmail: Map<string, Staff>,
  staffByName: Map<string, Staff>
) => {
  const workstreamNames = staff.workstreamIds
    .map((id) => workstreamsById.get(id)?.name || id)
    .filter(Boolean)
  const supervisorRaw = staff.supervisorId ? String(staff.supervisorId) : ''
  const supervisorEmail = supervisorRaw.toLowerCase()
  const supervisor =
    staffByEmail.get(supervisorEmail) ||
    staffById.get(supervisorRaw) ||
    staffByName.get(normalizeKey(supervisorRaw))
  const supervisorValue = supervisor ? supervisor.email || supervisor.name || supervisorRaw : supervisorRaw || null
  return {
    crda8_title: staff.name,
    crda8_email: staff.email,
    crda8_jobtitle: mapStaffTitleToDataverseValue(staff.title),
    crda8_role: mapUserRoleToDataverseValue(staff.userRole),
    crda8_supervisor: supervisorValue,
    crda8_workstreams: workstreamNames.join('; '),
    crda8_active: staff.isActive,
  }
}

const toDataverseWorkstreamPayload = (workstream: Workstream, staffById: Map<string, Staff>) => {
  const lead = staffById.get(workstream.lead)
  return {
    crda8_title: workstream.name,
    crda8_description: workstream.description,
    crda8_leader: lead?.email || lead?.name || workstream.lead || null,
    crda8_active: true,
  }
}

const toDataverseDeliverablePayload = (
  deliverable: Deliverable,
  staffById: Map<string, Staff>,
  workstreamsById: Map<string, Workstream>
) => {
  const owner = staffById.get(deliverable.ownerId)
  const workstream = workstreamsById.get(deliverable.workstreamId)
  return {
    crda8_title: deliverable.title,
    crda8_deliverablename: deliverable.title,
    crda8_description: deliverable.description,
    crda8_workstream: workstream?.name || deliverable.workstreamId || null,
    crda8_owner: owner?.email || owner?.name || deliverable.ownerId || null,
    crda8_status: mapDeliverableStatusToDataverse(deliverable.status),
    crda8_risk: mapDeliverableRiskToDataverse(deliverable.risk),
    crda8_targetdate: formatDateOnly(deliverable.dueDate),
    crda8_partnerreviewdate: formatDateOnly(deliverable.partnerReviewDate || ''),
    crda8_clientreviewdate: formatDateOnly(deliverable.clientReviewDate || ''),
    crda8_testingdate: formatDateOnly(deliverable.testingDate || ''),
    crda8_milestone: deliverable.milestone,
    crda8_completiondate: formatDateOnly(deliverable.completedDate || ''),
    crda8_completion_x0020__x0025_: deliverable.progress,
    crda8_comment: deliverable.comment,
    crda8_dependencies: deliverable.dependencies.join('; '),
  }
}

const toDataversePtoPayload = (request: PTORequest, staffById: Map<string, Staff>) => {
  const staff = staffById.get(request.staffId)
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

const mapDeliverables = (
  records: CsvRecord[],
  staffByKey: Map<string, string>,
  workstreamByName: Map<string, string>
): Deliverable[] =>
  records.map((record, index) => {
    const ownerRaw = normalizeCsvText(record.Owner || '')
    const ownerKey = normalizeKey(ownerRaw)
    const ownerId = staffByKey.get(ownerKey) || ownerRaw || ''
    const workstreamRaw = normalizeCsvText(record.Workstream || '')
    const workstreamId = resolveWorkstreamId(workstreamRaw, workstreamByName) || workstreamRaw || ''

    return {
      id: `del-${index + 1}`,
      title: record.DeliverableName || record.Title || `Deliverable ${index + 1}`,
      description: record.Description || record.Notes || record.Comment || '',
      workstreamId,
      ownerId,
      status: normalizeStatus(record.Status || ''),
      priority: 'Medium',
      risk: normalizeRisk(record.Risk || ''),
      startDate: record.ClientReviewDate || record.TargetDate || new Date().toISOString(),
      dueDate: record.TargetDate || new Date().toISOString(),
      partnerReviewDate: record.PartnerReviewDate || '',
      clientReviewDate: record.ClientReviewDate || '',
      testingDate: record.TestingDate || '',
      milestone: record.Milestone || '',
      completedDate: record.CompletionDate || undefined,
      progress: parseProgress(record['Completion%'] || ''),
      dependencies: splitList(record.Dependencies || ''),
      tags: splitList(record.Milestone || ''),
      comment: record.Comment || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  })

const mapPTORequests = (records: CsvRecord[], staffByKey: Map<string, string>): PTORequest[] =>
  records.map((record, index) => {
    const employeeKey = normalizeKey(record.EmployeeEmail || record.EmployeeName || record.Requester || '')
    const staffId = staffByKey.get(employeeKey) || ''
    const approvedKey = normalizeKey(record.ApprovedBy || '')
    const approvedBy = staffByKey.get(approvedKey)
    const rawStatus = record.Status || ''
    const status = rawStatus.toLowerCase().includes('approved')
      ? 'Approved'
      : rawStatus.toLowerCase().includes('rejected')
      ? 'Rejected'
      : 'Pending'

    return {
      id: `pto-${index + 1}`,
      staffId,
      startDate: record.StartDate || new Date().toISOString(),
      endDate: record.EndDate || new Date().toISOString(),
      type: 'Vacation',
      status,
      notes: record.Comments || '',
      approvedBy: approvedBy || undefined,
      approvedAt: record.ApprovedOn || undefined,
      createdAt: record.SubmittedOn || new Date().toISOString(),
    }
  })

const mapAuditLogs = (records: CsvRecord[], staffByKey: Map<string, string>): AuditLog[] =>
  records.map((record, index) => {
    const userKey = normalizeKey(record.UserEmail || record.UserName || '')
    const userId = staffByKey.get(userKey) || `user-${index + 1}`
    const userName = record.UserName || record.UserEmail || 'Unknown'

    return {
      id: `audit-${index + 1}`,
      userId,
      userName,
      action: record.ActionType || record.Title || 'Activity',
      entityType: record.DeliverableID ? 'Deliverable' : 'App',
      entityId: record.DeliverableID || undefined,
      details: record.Title || record.ActionType || '',
      timestamp: record.LogDate || new Date().toISOString(),
    }
  })

export default function AdminAnalytics() {
  const queryClient = useQueryClient()
  const [staffFile, setStaffFile] = useState<File | null>(null)
  const [workstreamsFile, setWorkstreamsFile] = useState<File | null>(null)
  const [deliverablesFile, setDeliverablesFile] = useState<File | null>(null)
  const [ptoFile, setPtoFile] = useState<File | null>(null)
  const [auditFile, setAuditFile] = useState<File | null>(null)
  const [importMessage, setImportMessage] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const [dvStaffFile, setDvStaffFile] = useState<File | null>(null)
  const [dvWorkstreamsFile, setDvWorkstreamsFile] = useState<File | null>(null)
  const [dvDeliverablesFile, setDvDeliverablesFile] = useState<File | null>(null)
  const [dvMessage, setDvMessage] = useState('')
  const [isDvImporting, setIsDvImporting] = useState(false)
  const [isDvDeleting, setIsDvDeleting] = useState(false)
  const [deleteStaffConfirm, setDeleteStaffConfirm] = useState('')
  const [deleteWorkstreamsConfirm, setDeleteWorkstreamsConfirm] = useState('')
  const [deleteDeliverablesConfirm, setDeleteDeliverablesConfirm] = useState('')
  const [bulkOwnerFilter, setBulkOwnerFilter] = useState('')
  const [bulkTitleFilter, setBulkTitleFilter] = useState('')
  const [bulkStatusFilter, setBulkStatusFilter] = useState('')
  const [bulkWorkstreamFilter, setBulkWorkstreamFilter] = useState('')
  const [selectedDeliverableIds, setSelectedDeliverableIds] = useState<string[]>([])
  const [bulkOwner, setBulkOwner] = useState('')
  const [bulkWorkstream, setBulkWorkstream] = useState('')
  const [bulkStatus, setBulkStatus] = useState('')
  const [bulkRisk, setBulkRisk] = useState('')
  const [bulkProgress, setBulkProgress] = useState('')
  const [bulkComment, setBulkComment] = useState('')
  const [bulkMessage, setBulkMessage] = useState('')
  const [isBulkUpdating, setIsBulkUpdating] = useState(false)

  const deliverables = getDeliverables()
  const staff = getStaff()
  const workstreams = getWorkstreams()
  const auditLogs = getAuditLogs()
  const activityStats = getActivityStats()

  const handleImport = async () => {
    if (!staffFile && !workstreamsFile && !deliverablesFile && !ptoFile && !auditFile) {
      setImportMessage('Select at least one CSV to import.')
      return
    }

    setIsImporting(true)
    setImportMessage('Importing SharePoint CSVs into Dataverse...')

    try {
      if (!staffFile || !workstreamsFile) {
        await syncDataverseData()
      }
      const [staffText, workstreamsText, deliverablesText, ptoText, auditText] = await Promise.all([
        staffFile ? readFileText(staffFile) : Promise.resolve(''),
        workstreamsFile ? readFileText(workstreamsFile) : Promise.resolve(''),
        deliverablesFile ? readFileText(deliverablesFile) : Promise.resolve(''),
        ptoFile ? readFileText(ptoFile) : Promise.resolve(''),
        auditFile ? readFileText(auditFile) : Promise.resolve(''),
      ])

      const workstreamRecords = workstreamsText ? parseCsv(workstreamsText) : []
      const hasWorkstreamsCsv = workstreamRecords.length > 0
      const workstreams = hasWorkstreamsCsv ? mapWorkstreams(workstreamRecords) : getWorkstreams()
      const workstreamByName = new Map(
        workstreams.map((item) => [normalizeKey(item.name), item.id])
      )
      const workstreamsById = new Map(workstreams.map((item) => [item.id, item]))

      const staffRecords = staffText ? parseCsv(staffText) : []
      const hasStaffCsv = staffRecords.length > 0
      const staffItems = hasStaffCsv ? mapStaff(staffRecords, workstreamByName) : getStaff()
      const staffByKey = new Map<string, string>()
      staffItems.forEach((member) => {
        if (member.email) staffByKey.set(member.email.toLowerCase(), member.id)
        staffByKey.set(normalizeKey(member.name), member.id)
      })
      const staffById = new Map(staffItems.map((member) => [member.id, member]))
      const staffByEmail = new Map(
        staffItems
          .filter((member) => member.email)
          .map((member) => [member.email.toLowerCase(), member])
      )
      const staffByName = new Map(staffItems.map((member) => [normalizeKey(member.name), member]))

      const workstreamsWithLeads = hasWorkstreamsCsv
        ? mapWorkstreamLeads(workstreams, staffItems, workstreamRecords)
        : workstreams

      const deliverableRecords = deliverablesText ? parseCsv(deliverablesText) : []
      const hasDeliverablesCsv = deliverableRecords.length > 0
      const deliverableItems = mapDeliverables(deliverableRecords, staffByKey, workstreamByName)

      const ptoRecords = ptoText ? parseCsv(ptoText) : []
      const ptoItems = mapPTORequests(ptoRecords, staffByKey)

      const auditRecords = auditText ? parseCsv(auditText) : []
      const auditItems = mapAuditLogs(auditRecords, staffByKey)

      let staffCount = 0
      let workstreamCount = 0
      let deliverableCount = 0
      let ptoCount = 0
      let missingOwners = 0
      let missingWorkstreams = 0

      const existingWorkstreamsByName = new Map<string, string>()
      const existingStaffByEmail = new Map<string, string>()
      const existingStaffByName = new Map<string, string>()
      const existingDeliverablesByName = new Map<string, string>()

      if (hasWorkstreamsCsv) {
        const existingResult = await Crda8_workstreamsesService.getAll()
        const existingRecords = ensureSuccess(existingResult, 'load workstreams') || []
        existingRecords.forEach((record: Record<string, any>) => {
          const name = pickField(record, ['crda8_title', 'crda8_workstreamname', 'Title', 'Name'])
          const key = normalizeKey(String(name || ''))
          const id = getRecordId(record, ['crda8_workstreamsid', 'crda8_workstreamid'])
          if (key && id) existingWorkstreamsByName.set(key, id)
        })
      }

      if (hasStaffCsv) {
        const existingResult = await Crda8_staff4sService.getAll()
        const existingRecords = ensureSuccess(existingResult, 'load staff') || []
        existingRecords.forEach((record: Record<string, any>) => {
          const email = pickField(record, ['crda8_email', 'Email'])
          const name = pickField(record, ['crda8_title', 'crda8_name', 'FullName', 'Title', 'Name'])
          const id = getRecordId(record, ['crda8_staff4id'])
          if (email && id) existingStaffByEmail.set(String(email).toLowerCase(), id)
          if (name && id) existingStaffByName.set(normalizeKey(String(name)), id)
        })
      }

      if (hasDeliverablesCsv) {
        const existingResult = await Crda8_deliverablesesService.getAll()
        const existingRecords = ensureSuccess(existingResult, 'load deliverables') || []
        existingRecords.forEach((record: Record<string, any>) => {
          const name = pickField(record, ['crda8_deliverablename', 'crda8_title', 'DeliverableName', 'Title'])
          const key = normalizeKey(String(name || ''))
          const id = getRecordId(record, ['crda8_deliverablesid'])
          if (key && id) existingDeliverablesByName.set(key, id)
        })
      }

      if (hasWorkstreamsCsv) {
        for (const workstream of workstreamsWithLeads) {
          const payload = toDataverseWorkstreamPayload(workstream, staffById) as unknown as Omit<
            Crda8_workstreamsesBase,
            'crda8_workstreamsid'
          >
          const existingId = existingWorkstreamsByName.get(normalizeKey(workstream.name))
          const result = existingId
            ? await Crda8_workstreamsesService.update(existingId, payload)
            : await Crda8_workstreamsesService.create(payload)
          ensureSuccess(result, 'import workstreams')
          workstreamCount += 1
        }
      }

      if (hasStaffCsv) {
        for (const member of staffItems) {
          const payload = toDataverseStaffPayload(
            member,
            workstreamsById,
            staffById,
            staffByEmail,
            staffByName
          ) as unknown as Omit<Crda8_staff4sBase, 'crda8_staff4id'>
          const existingId =
            (member.email && existingStaffByEmail.get(member.email.toLowerCase())) ||
            existingStaffByName.get(normalizeKey(member.name))
          const result = existingId
            ? await Crda8_staff4sService.update(existingId, payload)
            : await Crda8_staff4sService.create(payload)
          ensureSuccess(result, 'import staff')
          staffCount += 1
        }
      }

      if (hasDeliverablesCsv) {
        for (const deliverable of deliverableItems) {
          if (!deliverable.ownerId) missingOwners += 1
          if (!deliverable.workstreamId) missingWorkstreams += 1
          const payload = toDataverseDeliverablePayload(deliverable, staffById, workstreamsById) as unknown as Omit<
            Crda8_deliverablesesBase,
            'crda8_deliverablesid'
          >
          const existingId = existingDeliverablesByName.get(normalizeKey(deliverable.title))
          const result = existingId
            ? await Crda8_deliverablesesService.update(existingId, payload)
            : await Crda8_deliverablesesService.create(payload)
          ensureSuccess(result, `import deliverable \"${deliverable.title}\"`)
          deliverableCount += 1
        }
      }

      for (const request of ptoItems) {
        const payload = toDataversePtoPayload(request, staffById) as unknown as Omit<
          Crda8_timeoffrequestsesBase,
          'crda8_timeoffrequestsid'
        >
        const result = await Crda8_timeoffrequestsesService.create(payload)
        ensureSuccess(result, 'import PTO requests')
        ptoCount += 1
      }

      if (auditItems.length > 0) setAuditLogs(auditItems)
      await syncDataverseData()
      void queryClient.invalidateQueries({ queryKey: ['deliverables'] })
      void queryClient.invalidateQueries({ queryKey: ['staff'] })
      void queryClient.invalidateQueries({ queryKey: ['workstreams'] })
      void queryClient.invalidateQueries({ queryKey: ['deliverables'] })
      void queryClient.invalidateQueries({ queryKey: ['staff'] })
      void queryClient.invalidateQueries({ queryKey: ['workstreams'] })

      const warnings = [
        missingOwners > 0 ? `${missingOwners} deliverables missing owner match` : '',
        missingWorkstreams > 0 ? `${missingWorkstreams} deliverables missing workstream match` : '',
      ].filter(Boolean)

      setImportMessage(
        `Imported ${staffCount} staff, ${workstreamCount} workstreams, ${deliverableCount} deliverables, ${ptoCount} PTO requests into Dataverse.${warnings.length ? ` (${warnings.join(', ')})` : ''}`
      )
    } catch (error) {
      const message = formatImportError(error) || 'Import failed.'
      setImportMessage(message)
    } finally {
      setIsImporting(false)
    }
  }

  const handleDataverseImport = async () => {
    if (!dvStaffFile && !dvWorkstreamsFile && !dvDeliverablesFile) {
      setDvMessage('Select at least one Dataverse CSV to import.')
      return
    }

    setIsDvImporting(true)
    setDvMessage('Importing Dataverse CSV data...')

    try {
      const [staffText, workstreamsText, deliverablesText] = await Promise.all([
        dvStaffFile ? readFileText(dvStaffFile) : Promise.resolve(''),
        dvWorkstreamsFile ? readFileText(dvWorkstreamsFile) : Promise.resolve(''),
        dvDeliverablesFile ? readFileText(dvDeliverablesFile) : Promise.resolve(''),
      ])

      const staffRecords = staffText ? parseCsv(staffText) : []
      const workstreamRecords = workstreamsText ? parseCsv(workstreamsText) : []
      const deliverableRecords = deliverablesText ? parseCsv(deliverablesText) : []

      let staffCount = 0
      let workstreamCount = 0
      let deliverableCount = 0

      for (const record of staffRecords) {
        const payload = mapCsvToDataverse(record) as Omit<Crda8_staff4sBase, 'crda8_staff4id'>
        const result = await Crda8_staff4sService.create(payload)
        ensureSuccess(result, 'import staff')
        staffCount += 1
      }

      for (const record of workstreamRecords) {
        const payload = mapCsvToDataverse(record) as Omit<Crda8_workstreamsesBase, 'crda8_workstreamsid'>
        const result = await Crda8_workstreamsesService.create(payload)
        ensureSuccess(result, 'import workstreams')
        workstreamCount += 1
      }

      for (const record of deliverableRecords) {
        const payload = mapCsvToDataverse(record) as Omit<Crda8_deliverablesesBase, 'crda8_deliverablesid'>
        const result = await Crda8_deliverablesesService.create(payload)
        ensureSuccess(result, 'import deliverables')
        deliverableCount += 1
      }

      setDvMessage(
        `Imported ${staffCount} staff, ${workstreamCount} workstreams, ${deliverableCount} deliverables into Dataverse.`
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Dataverse import failed.'
      setDvMessage(message)
    } finally {
      setIsDvImporting(false)
    }
  }

  const deleteAllStaff = async () => {
    if (deleteStaffConfirm !== 'DELETE') {
      setDvMessage('Type DELETE to confirm staff deletion.')
      return
    }
    setIsDvDeleting(true)
    setDvMessage('Deleting all staff records...')
    try {
      const result = await Crda8_staff4sService.getAll()
      const records = ensureSuccess(result, 'load staff') || []
      for (const record of records) {
        const id = (record as any).crda8_staff4id || (record as any).id
        if (id) {
          await Crda8_staff4sService.delete(id)
        }
      }
      setDvMessage(`Deleted ${records.length} staff records.`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Delete staff failed.'
      setDvMessage(message)
    } finally {
      setIsDvDeleting(false)
    }
  }

  const deleteAllWorkstreams = async () => {
    if (deleteWorkstreamsConfirm !== 'DELETE') {
      setDvMessage('Type DELETE to confirm workstream deletion.')
      return
    }
    setIsDvDeleting(true)
    setDvMessage('Deleting all workstreams...')
    try {
      const result = await Crda8_workstreamsesService.getAll()
      const records = ensureSuccess(result, 'load workstreams') || []
      for (const record of records) {
        const id = (record as any).crda8_workstreamsid || (record as any).id
        if (id) {
          await Crda8_workstreamsesService.delete(id)
        }
      }
      setDvMessage(`Deleted ${records.length} workstreams.`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Delete workstreams failed.'
      setDvMessage(message)
    } finally {
      setIsDvDeleting(false)
    }
  }

  const deleteAllDeliverables = async () => {
    if (deleteDeliverablesConfirm !== 'DELETE') {
      setDvMessage('Type DELETE to confirm deliverable deletion.')
      return
    }
    setIsDvDeleting(true)
    setDvMessage('Deleting all deliverables...')
    try {
      const result = await Crda8_deliverablesesService.getAll()
      const records = ensureSuccess(result, 'load deliverables') || []
      for (const record of records) {
        const id = (record as any).crda8_deliverablesid || (record as any).id
        if (id) {
          await Crda8_deliverablesesService.delete(id)
        }
      }
      setDvMessage(`Deleted ${records.length} deliverables.`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Delete deliverables failed.'
      setDvMessage(message)
    } finally {
      setIsDvDeleting(false)
    }
  }

  const staleDeliverables = useMemo(() => {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    return deliverables.filter((d) => {
      if (d.status === 'Completed') return false
      const lastUpdated = new Date(d.updatedAt)
      return lastUpdated < sevenDaysAgo
    })
  }, [deliverables])

  const userActivity = useMemo(() => {
    const userMap = new Map<string, { name: string; actions: number; lastActive: string }>()

    staff.forEach((s) => {
      userMap.set(s.id, {
        name: s.name,
        actions: 0,
        lastActive: 'Never',
      })
    })

    auditLogs.forEach((log) => {
      const user = userMap.get(log.userId)
      if (user) {
        user.actions += 1
        user.lastActive = log.timestamp
      }
    })

    return Array.from(userMap.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.actions - a.actions)
  }, [staff, auditLogs])

  const recentActivity = useMemo(() => {
    return auditLogs.slice(-20).reverse()
  }, [auditLogs])

  const staffById = useMemo(() => new Map(staff.map((member) => [member.id, member])), [staff])
  const workstreamsById = useMemo(() => new Map(workstreams.map((item) => [item.id, item])), [workstreams])

  const filteredDeliverables = useMemo(() => {
    const ownerFilter = bulkOwnerFilter.toLowerCase().trim()
    const titleFilter = bulkTitleFilter.toLowerCase().trim()
    const statusFilter = bulkStatusFilter.toLowerCase().trim()
    const workstreamFilter = bulkWorkstreamFilter.toLowerCase().trim()

    return deliverables.filter((deliverable) => {
      const owner = staffById.get(deliverable.ownerId)
      const ownerKey = `${owner?.name || ''} ${owner?.email || ''} ${deliverable.ownerId || ''}`.toLowerCase()
      const titleKey = deliverable.title.toLowerCase()
      const statusKey = deliverable.status.toLowerCase()
      const workstream = workstreamsById.get(deliverable.workstreamId)
      const workstreamKey = `${workstream?.name || ''} ${deliverable.workstreamId || ''}`.toLowerCase()

      if (ownerFilter && !ownerKey.includes(ownerFilter)) return false
      if (titleFilter && !titleKey.includes(titleFilter)) return false
      if (statusFilter && statusKey !== statusFilter) return false
      if (workstreamFilter && !workstreamKey.includes(workstreamFilter)) return false
      return true
    })
  }, [deliverables, staffById, workstreamsById, bulkOwnerFilter, bulkTitleFilter, bulkStatusFilter, bulkWorkstreamFilter])

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

    if (bulkOwner) updates.crda8_owner = bulkOwner
    if (bulkWorkstream) updates.crda8_workstream = bulkWorkstream
    if (bulkStatus) updates.crda8_status = mapDeliverableStatusToDataverse(bulkStatus as DeliverableStatus)
    if (bulkRisk) updates.crda8_risk = mapDeliverableRiskToDataverse(bulkRisk as RiskLevel)
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
        const result = await Crda8_deliverablesesService.update(id, updates)
        ensureSuccess(result, 'bulk update deliverables')
        updatedCount += 1
      }
      await syncDataverseData()
      setBulkMessage(`Updated ${updatedCount} deliverables.`)
      clearBulkSelection()
    } catch (error) {
      setBulkMessage(formatImportError(error) || 'Bulk update failed.')
    } finally {
      setIsBulkUpdating(false)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          Admin Analytics
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          System usage, audit trail, and performance metrics
        </p>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h3 className="card-title">Import SharePoint CSVs to Dataverse</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div>
            <label className="form-label">Staff CSV</label>
            <input type="file" accept=".csv" onChange={(e) => setStaffFile(e.target.files?.[0] || null)} />
          </div>
          <div>
            <label className="form-label">Workstreams CSV</label>
            <input type="file" accept=".csv" onChange={(e) => setWorkstreamsFile(e.target.files?.[0] || null)} />
          </div>
          <div>
            <label className="form-label">Deliverables CSV</label>
            <input type="file" accept=".csv" onChange={(e) => setDeliverablesFile(e.target.files?.[0] || null)} />
          </div>
          <div>
            <label className="form-label">Time Off CSV</label>
            <input type="file" accept=".csv" onChange={(e) => setPtoFile(e.target.files?.[0] || null)} />
          </div>
          <div>
            <label className="form-label">App Usage CSV</label>
            <input type="file" accept=".csv" onChange={(e) => setAuditFile(e.target.files?.[0] || null)} />
          </div>
        </div>
        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn btn-primary" onClick={handleImport} disabled={isImporting}>
            {isImporting ? 'Importing...' : 'Import CSVs'}
          </button>
          {importMessage && (
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{importMessage}</span>
          )}
        </div>
        <p style={{ marginTop: '0.75rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          Import Workstreams first, then Staff, then Deliverables for best matching. CSV columns are matched by header names.
        </p>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h3 className="card-title">Dataverse Bulk Upload & Delete</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div>
            <label className="form-label">Staff CSV (Dataverse Export)</label>
            <input type="file" accept=".csv" onChange={(e) => setDvStaffFile(e.target.files?.[0] || null)} />
          </div>
          <div>
            <label className="form-label">Workstreams CSV (Dataverse Export)</label>
            <input type="file" accept=".csv" onChange={(e) => setDvWorkstreamsFile(e.target.files?.[0] || null)} />
          </div>
          <div>
            <label className="form-label">Deliverables CSV (Dataverse Export)</label>
            <input type="file" accept=".csv" onChange={(e) => setDvDeliverablesFile(e.target.files?.[0] || null)} />
          </div>
        </div>
        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn btn-primary" onClick={handleDataverseImport} disabled={isDvImporting || isDvDeleting}>
            {isDvImporting ? 'Importing...' : 'Import to Dataverse'}
          </button>
          {dvMessage && (
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{dvMessage}</span>
          )}
        </div>
        <div style={{ marginTop: '1.5rem', display: 'grid', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Type DELETE to confirm staff deletion"
              value={deleteStaffConfirm}
              onChange={(e) => setDeleteStaffConfirm(e.target.value)}
              style={{ minWidth: '260px' }}
            />
            <button className="btn btn-danger" onClick={deleteAllStaff} disabled={isDvDeleting}>
              Delete All Staff
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Type DELETE to confirm workstream deletion"
              value={deleteWorkstreamsConfirm}
              onChange={(e) => setDeleteWorkstreamsConfirm(e.target.value)}
              style={{ minWidth: '260px' }}
            />
            <button className="btn btn-danger" onClick={deleteAllWorkstreams} disabled={isDvDeleting}>
              Delete All Workstreams
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Type DELETE to confirm deliverable deletion"
              value={deleteDeliverablesConfirm}
              onChange={(e) => setDeleteDeliverablesConfirm(e.target.value)}
              style={{ minWidth: '260px' }}
            />
            <button className="btn btn-danger" onClick={deleteAllDeliverables} disabled={isDvDeleting}>
              Delete All Deliverables
            </button>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h3 className="card-title">Bulk Update Deliverables</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div>
            <label className="form-label">Filter by Owner</label>
            <input
              type="text"
              placeholder="Name or email"
              value={bulkOwnerFilter}
              onChange={(e) => setBulkOwnerFilter(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label">Filter by Title</label>
            <input
              type="text"
              placeholder="Deliverable title"
              value={bulkTitleFilter}
              onChange={(e) => setBulkTitleFilter(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label">Filter by Status</label>
            <select value={bulkStatusFilter} onChange={(e) => setBulkStatusFilter(e.target.value)}>
              <option value="">All statuses</option>
              {STATUS_VALUES.map((status) => (
                <option key={status} value={status.toLowerCase()}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Filter by Workstream</label>
            <input
              type="text"
              placeholder="Workstream"
              value={bulkWorkstreamFilter}
              onChange={(e) => setBulkWorkstreamFilter(e.target.value)}
            />
          </div>
        </div>

        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" checked={allFilteredSelected} onChange={toggleSelectAllFiltered} />
            Select all filtered ({filteredDeliverables.length})
          </label>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Selected: {selectedDeliverableIds.length}
          </span>
          <button className="btn btn-secondary" onClick={clearBulkSelection}>
            Clear selection
          </button>
        </div>

        <div style={{ marginTop: '1rem', maxHeight: '260px', overflow: 'auto', border: '1px solid var(--border)', borderRadius: '10px' }}>
          <table className="table-view" style={{ marginTop: 0 }}>
            <thead>
              <tr>
                <th style={{ width: '40px' }}></th>
                <th>Deliverable</th>
                <th>Owner</th>
                <th>Workstream</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeliverables.map((deliverable) => {
                const owner = staffById.get(deliverable.ownerId)
                const workstream = workstreamsById.get(deliverable.workstreamId)
                return (
                  <tr key={deliverable.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedDeliverableIds.includes(deliverable.id)}
                        onChange={() => toggleDeliverableSelection(deliverable.id)}
                      />
                    </td>
                    <td>{deliverable.title}</td>
                    <td>{owner?.name || owner?.email || deliverable.ownerId || 'Unassigned'}</td>
                    <td>{workstream?.name || deliverable.workstreamId || 'Unassigned'}</td>
                    <td>{deliverable.status}</td>
                  </tr>
                )
              })}
              {filteredDeliverables.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No deliverables match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div>
            <label className="form-label">Set Owner (email)</label>
            <select value={bulkOwner} onChange={(e) => setBulkOwner(e.target.value)}>
              <option value="">Leave unchanged</option>
              {staff.map((member) => (
                <option key={member.id} value={member.email || member.id}>
                  {member.name} ({member.email || member.id})
                </option>
              ))}
            </select>
          </div>
          <div>
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
          <div>
            <label className="form-label">Set Status</label>
            <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)}>
              <option value="">Leave unchanged</option>
              {STATUS_VALUES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Set Risk</label>
            <select value={bulkRisk} onChange={(e) => setBulkRisk(e.target.value)}>
              <option value="">Leave unchanged</option>
              {RISK_VALUES.map((risk) => (
                <option key={risk} value={risk}>
                  {risk}
                </option>
              ))}
            </select>
          </div>
          <div>
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
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Set Comment</label>
            <textarea
              value={bulkComment}
              onChange={(e) => setBulkComment(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn btn-primary" onClick={handleBulkUpdate} disabled={isBulkUpdating}>
            {isBulkUpdating ? 'Updating...' : 'Apply Bulk Update'}
          </button>
          {bulkMessage && (
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{bulkMessage}</span>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-label">Total Actions</div>
          <div className="stat-value">{activityStats.totalActions}</div>
          <div className="stat-change">{activityStats.actionsLast7Days} in last 7 days</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Users (7d)</div>
          <div className="stat-value">{activityStats.uniqueUsersLast7Days}</div>
          <div className="stat-change">of {staff.filter((s) => s.isActive).length} total</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Stale Deliverables</div>
          <div className="stat-value" style={{ color: staleDeliverables.length > 0 ? 'var(--danger)' : 'var(--secondary)' }}>
            {staleDeliverables.length}
          </div>
          <div className={`stat-change ${staleDeliverables.length > 0 ? 'negative' : ''}`}>
            Not updated in 7+ days
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Projects</div>
          <div className="stat-value">{deliverables.filter((d) => d.status !== 'Completed').length}</div>
          <div className="stat-change">
            {deliverables.filter((d) => d.status === 'In Progress').length} in progress
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">User Activity</h3>
            <Activity size={20} style={{ color: 'var(--text-secondary)' }} />
          </div>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Actions</th>
                  <th>Last Active</th>
                </tr>
              </thead>
              <tbody>
                {userActivity.map((user) => (
                  <tr key={user.id}>
                    <td style={{ fontWeight: '500' }}>{user.name}</td>
                    <td>
                      <span
                        style={{
                          background: user.actions > 10 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(148, 163, 184, 0.2)',
                          color: user.actions > 10 ? '#10b981' : '#94a3b8',
                          padding: '0.25rem 0.625rem',
                          borderRadius: '9999px',
                          fontSize: '0.8125rem',
                          fontWeight: '500',
                        }}
                      >
                        {user.actions}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {user.lastActive === 'Never'
                        ? 'Never'
                        : new Date(user.lastActive).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Stale Deliverables</h3>
            <AlertTriangle size={20} style={{ color: 'var(--danger)' }} />
          </div>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {staleDeliverables.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                <TrendingUp size={32} style={{ margin: '0 auto 0.5rem', color: 'var(--secondary)' }} />
                <p>All deliverables are up to date!</p>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {staleDeliverables.map((d) => {
                    const owner = staff.find((s) => s.id === d.ownerId)
                    const daysStale = Math.floor(
                      (new Date().getTime() - new Date(d.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
                    )
                    return (
                      <tr key={d.id}>
                        <td>
                          <div style={{ fontWeight: '500', marginBottom: '0.125rem' }}>{d.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            Owner: {owner?.name}
                          </div>
                        </td>
                        <td>
                          <span className={`badge badge-${d.status.toLowerCase().replace(' ', '-')}`}>
                            {d.status}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.875rem', color: 'var(--danger)' }}>
                          {daysStale} days ago
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Activity</h3>
          <Calendar size={20} style={{ color: 'var(--text-secondary)' }} />
        </div>
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Details</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontWeight: '500' }}>{log.userName}</td>
                  <td>
                    <span
                      style={{
                        background: 'var(--bg-hover)',
                        padding: '0.25rem 0.625rem',
                        borderRadius: '4px',
                        fontSize: '0.8125rem',
                      }}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-low">{log.entityType}</span>
                  </td>
                  <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.875rem' }}>
                    {log.details}
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
