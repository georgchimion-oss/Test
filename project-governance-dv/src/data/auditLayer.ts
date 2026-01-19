import type { AuditLog } from '../types'

const AUDIT_KEY = 'gov_audit_logs'

export function getAuditLogs(): AuditLog[] {
  const data = localStorage.getItem(AUDIT_KEY)
  if (!data) return []
  return JSON.parse(data)
}

export function setAuditLogs(logs: AuditLog[]): void {
  localStorage.setItem(AUDIT_KEY, JSON.stringify(logs))
}

export function logAudit(
  userId: string,
  userName: string,
  action: string,
  entityType: AuditLog['entityType'],
  entityId: string | undefined,
  details: string
): void {
  const logs = getAuditLogs()
  const newLog: AuditLog = {
    id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    userName,
    action,
    entityType,
    entityId,
    details,
    timestamp: new Date().toISOString(),
  }
  logs.push(newLog)
  setAuditLogs(logs)
}

export function getRecentAuditLogs(limit: number = 100): AuditLog[] {
  const logs = getAuditLogs()
  return logs.slice(-limit).reverse()
}

export function getAuditLogsByUser(userId: string): AuditLog[] {
  const logs = getAuditLogs()
  return logs.filter((log) => log.userId === userId).reverse()
}

export function getAuditLogsByEntity(entityType: AuditLog['entityType'], entityId: string): AuditLog[] {
  const logs = getAuditLogs()
  return logs.filter((log) => log.entityType === entityType && log.entityId === entityId).reverse()
}

export function getActivityStats() {
  const logs = getAuditLogs()
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const last7Days = logs.filter((log) => new Date(log.timestamp) >= sevenDaysAgo)
  const last30Days = logs.filter((log) => new Date(log.timestamp) >= thirtyDaysAgo)

  const uniqueUsersLast7Days = new Set(last7Days.map((log) => log.userId)).size
  const uniqueUsersLast30Days = new Set(last30Days.map((log) => log.userId)).size

  return {
    totalActions: logs.length,
    actionsLast7Days: last7Days.length,
    actionsLast30Days: last30Days.length,
    uniqueUsersLast7Days,
    uniqueUsersLast30Days,
  }
}
