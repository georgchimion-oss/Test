export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical'
export type DeliverableStatus = 'Not Started' | 'In Progress' | 'At Risk' | 'Completed' | 'Blocked'
export type Priority = 'Low' | 'Medium' | 'High' | 'Critical'
export type StaffTitle = 'Partner' | 'Director' | 'Senior Manager' | 'Manager' | 'Senior Associate' | 'Associate'
export type UserRole = 'Admin' | 'Manager' | 'User'

export interface Staff {
  id: string
  name: string
  title: StaffTitle
  role: string
  email: string
  department: string
  supervisorId?: string
  workstreamIds: string[]
  userRole: UserRole
  isActive: boolean
  createdAt: string
}

export type TeamMember = Staff

export interface Workstream {
  id: string
  name: string
  description: string
  lead: string
  color: string
  createdAt: string
}

export interface Deliverable {
  id: string
  title: string
  description: string
  workstreamId: string
  ownerId: string
  status: DeliverableStatus
  priority: Priority
  risk: RiskLevel
  startDate: string
  dueDate: string
  partnerReviewDate?: string
  clientReviewDate?: string
  testingDate?: string
  milestone?: string
  completedDate?: string
  progress: number
  dependencies: string[]
  tags: string[]
  comment?: string
  partnerName?: string
  tdStakeholder?: string
  createdAt: string
  updatedAt: string
}

export interface PTORequest {
  id: string
  staffId: string
  startDate: string
  endDate: string
  type: 'Vacation' | 'Sick Leave' | 'Personal' | 'Other'
  status: 'Pending' | 'Approved' | 'Rejected'
  notes?: string
  approvedBy?: string
  approvedAt?: string
  createdAt: string
}

export interface HoursLog {
  id: string
  staffId: string
  deliverableId: string
  date: string
  hours: number
  description: string
  createdAt: string
}

export interface AuditLog {
  id: string
  userId: string
  userName: string
  action: string
  entityType: 'Deliverable' | 'Staff' | 'Workstream' | 'PTO' | 'Hours' | 'App'
  entityId?: string
  details: string
  timestamp: string
}

export interface UserSession {
  id: string
  name: string
  email: string
  title: StaffTitle
  userRole: UserRole
  supervisorId?: string
  workstreamIds: string[]
}

export interface DashboardStats {
  totalDeliverables: number
  completed: number
  inProgress: number
  atRisk: number
  blocked: number
  completionRate: number
  avgProgress: number
}
