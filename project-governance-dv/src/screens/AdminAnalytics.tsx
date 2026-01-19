import { useMemo, useState } from 'react'
import { getDeliverables, getStaff, setDeliverables, setStaff, setWorkstreams, setPTORequests } from '../data/dataLayer'
import { getAuditLogs, getActivityStats, setAuditLogs } from '../data/auditLayer'
import { Activity, AlertTriangle, TrendingUp, Calendar } from 'lucide-react'
import { parseCsv, type CsvRecord } from '../utils/csv'
import type { AuditLog, Deliverable, DeliverableStatus, PTORequest, RiskLevel, Staff, UserRole, Workstream } from '../types'
import {
  Crda8_deliverablesesService,
  Crda8_staff4sService,
  Crda8_workstreamsesService,
} from '../generated'
import type { IOperationResult } from '@microsoft/power-apps/data'
import type { Crda8_deliverablesesBase } from '../generated/models/Crda8_deliverablesesModel'
import type { Crda8_staff4sBase } from '../generated/models/Crda8_staff4sModel'
import type { Crda8_workstreamsesBase } from '../generated/models/Crda8_workstreamsesModel'

const STATUS_VALUES: DeliverableStatus[] = ['Not Started', 'In Progress', 'At Risk', 'Completed', 'Blocked']
const RISK_VALUES: RiskLevel[] = ['Low', 'Medium', 'High', 'Critical']

const normalizeKey = (value: string) => value.toLowerCase().replace(/,/g, '').trim()

const parseBoolean = (value: string) => ['true', 'yes', '1', 'active'].includes(value.toLowerCase())

const splitList = (value: string) =>
  value
    .split(/[;,]/)
    .map((item) => item.trim())
    .filter(Boolean)

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

const normalizeStatus = (value: string): DeliverableStatus =>
  STATUS_VALUES.find((status) => status.toLowerCase() === value.toLowerCase()) || 'Not Started'

const normalizeRisk = (value: string): RiskLevel =>
  RISK_VALUES.find((risk) => risk.toLowerCase() === value.toLowerCase()) || 'Low'

const parseProgress = (value: string) => {
  const cleaned = value.replace('%', '').trim()
  const parsed = Number(cleaned)
  return Number.isNaN(parsed) ? 0 : parsed
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
  if (!value) return value
  if (value.includes('T')) return value.split('T')[0]
  if (value.includes(' ')) return value.split(' ')[0]
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
    throw result.error || new Error(`Failed to ${label}.`)
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
      .map((name) => workstreamByName.get(normalizeKey(name)))
      .filter((value): value is string => Boolean(value))

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
      supervisorRef: record.Supervisor || '',
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
    staff.supervisorId = staffByEmail.get(normalized) || staffByName.get(normalized)
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
    const leader = records[index]?.Leader || ''
    const normalizedLeader = normalizeKey(leader)
    const leadId = staffByEmail.get(normalizedLeader) || staffByName.get(normalizedLeader) || ''
    return { ...workstream, lead: leadId }
  })
}

const mapDeliverables = (
  records: CsvRecord[],
  staffByKey: Map<string, string>,
  workstreamByName: Map<string, string>
): Deliverable[] =>
  records.map((record, index) => {
    const ownerKey = normalizeKey(record.Owner || '')
    const ownerId = staffByKey.get(ownerKey) || ''
    const workstreamId = workstreamByName.get(normalizeKey(record.Workstream || '')) || ''

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

  const deliverables = getDeliverables()
  const staff = getStaff()
  const auditLogs = getAuditLogs()
  const activityStats = getActivityStats()

  const handleImport = async () => {
    if (!staffFile && !workstreamsFile && !deliverablesFile && !ptoFile && !auditFile) {
      setImportMessage('Select at least one CSV to import.')
      return
    }

    setIsImporting(true)
    setImportMessage('Importing CSV data...')

    try {
      const [staffText, workstreamsText, deliverablesText, ptoText, auditText] = await Promise.all([
        staffFile ? readFileText(staffFile) : Promise.resolve(''),
        workstreamsFile ? readFileText(workstreamsFile) : Promise.resolve(''),
        deliverablesFile ? readFileText(deliverablesFile) : Promise.resolve(''),
        ptoFile ? readFileText(ptoFile) : Promise.resolve(''),
        auditFile ? readFileText(auditFile) : Promise.resolve(''),
      ])

      const workstreamRecords = workstreamsText ? parseCsv(workstreamsText) : []
      const workstreams = mapWorkstreams(workstreamRecords)
      const workstreamByName = new Map(
        workstreams.map((item) => [normalizeKey(item.name), item.id])
      )

      const staffRecords = staffText ? parseCsv(staffText) : []
      const staffItems = mapStaff(staffRecords, workstreamByName)
      const staffByKey = new Map<string, string>()
      staffItems.forEach((member) => {
        if (member.email) staffByKey.set(member.email.toLowerCase(), member.id)
        staffByKey.set(normalizeKey(member.name), member.id)
      })

      const workstreamsWithLeads = mapWorkstreamLeads(workstreams, staffItems, workstreamRecords)

      const deliverableRecords = deliverablesText ? parseCsv(deliverablesText) : []
      const deliverableItems = mapDeliverables(deliverableRecords, staffByKey, workstreamByName)

      const ptoRecords = ptoText ? parseCsv(ptoText) : []
      const ptoItems = mapPTORequests(ptoRecords, staffByKey)

      const auditRecords = auditText ? parseCsv(auditText) : []
      const auditItems = mapAuditLogs(auditRecords, staffByKey)

      if (staffItems.length > 0) setStaff(staffItems)
      if (workstreamsWithLeads.length > 0) setWorkstreams(workstreamsWithLeads)
      if (deliverableItems.length > 0) setDeliverables(deliverableItems)
      if (ptoItems.length > 0) setPTORequests(ptoItems)
      if (auditItems.length > 0) setAuditLogs(auditItems)

      setImportMessage(
        `Imported ${staffItems.length} staff, ${workstreamsWithLeads.length} workstreams, ${deliverableItems.length} deliverables.`
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Import failed.'
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
          <h3 className="card-title">Import SharePoint CSVs</h3>
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
          Import Staff, Workstreams, and Deliverables first for best matching. CSV columns are matched by header names.
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
