/**
 * Lovable UI Type Definitions
 *
 * These are the types that Lovable components expect.
 * Copy this file to: project-governance-dvui/src/types/lovable.ts
 * OR project-governance-dvui/src/types/index.ts
 */

export type JobTitle =
  | 'Partner'
  | 'Director'
  | 'Senior Manager'
  | 'Manager'
  | 'Senior Associate'
  | 'Associate'
  | 'Contractor';

export type DeliverableStatus =
  | 'Not Started'
  | 'In Progress'
  | 'Under Review'
  | 'Client Review'
  | 'Completed'
  | 'On Hold'
  | 'At Risk';

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type PTOStatus = 'Pending' | 'Approved' | 'Rejected';

export interface Skill {
  id: string;
  name: string;
  category: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  jobTitle: JobTitle;
  supervisorId?: string;
  workstreamId?: string;
  podId?: string;
  skills: string[];
  isContractor: boolean;
}

export interface Workstream {
  id: string;
  name: string;
  description: string;
  leaderId: string;
  color: string;
}

export interface Pod {
  id: string;
  name: string;
  workstreamId: string;
  leaderId: string;
}

export interface Comment {
  id: string;
  deliverableId: string;
  authorId: string;
  content: string;
  createdAt: Date;
}

export interface Subtask {
  id: string;
  deliverableId: string;
  title: string;
  assigneeId?: string;
  completed: boolean;
  dueDate?: Date;
}

export interface Deliverable {
  id: string;
  title: string;
  description: string;
  workstreamId: string;
  ownerId: string;
  partnerName: string;
  tdStakeholder: string;
  dueDate: Date;
  partnerReviewDate?: Date;
  clientReviewDate?: Date;
  progress: number;
  status: DeliverableStatus;
  risk: RiskLevel;
  riskDescription?: string;
  subtasks: Subtask[];
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeEntry {
  id: string;
  userId: string;
  date: Date;
  hours: number;
  deliverableId?: string;
  description?: string;
}

export interface PTORequest {
  id: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  backupPersonId?: string;
  status: PTOStatus;
  approvedById?: string;
  createdAt: Date;
}

export interface KPI {
  id: string;
  label: string;
  value: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon?: string;
}
