/**
 * Data Mappers: Dataverse → Lovable UI Types
 *
 * These functions convert your Dataverse entities (crda8_*) to the format
 * that Lovable components expect.
 *
 * Usage:
 * 1. Copy this file to: project-governance-dvui/src/mappers/dataverseToLovable.ts
 * 2. Import in your components: import { mapDeliverableToLovable } from '@/mappers/dataverseToLovable'
 * 3. Use: const lovableData = dataverseDeliverables.map(mapDeliverableToLovable)
 */

import type {
  Deliverable,
  TeamMember,
  Workstream,
  TimeEntry,
  PTORequest,
  DeliverableStatus,
  RiskLevel,
  JobTitle,
  PTOStatus
} from '@/types';

// ============================================================================
// DELIVERABLE MAPPER
// ============================================================================

/**
 * Maps Dataverse crda8_deliverables to Lovable Deliverable type
 */
export function mapDeliverableToLovable(dataverseDeliverable: any): Deliverable {
  return {
    id: dataverseDeliverable.crda8_deliverableid || dataverseDeliverable.id,
    title: dataverseDeliverable.crda8_name || 'Untitled',
    description: dataverseDeliverable.crda8_description || '',
    workstreamId: dataverseDeliverable._crda8_workstream_value || '',
    ownerId: dataverseDeliverable._crda8_owner_value || '',
    partnerName: dataverseDeliverable.crda8_partnername || 'N/A',
    tdStakeholder: dataverseDeliverable.crda8_tdstakeholder || 'N/A',
    dueDate: dataverseDeliverable.crda8_duedate
      ? new Date(dataverseDeliverable.crda8_duedate)
      : new Date(),
    partnerReviewDate: dataverseDeliverable.crda8_partnerreviewdate
      ? new Date(dataverseDeliverable.crda8_partnerreviewdate)
      : undefined,
    clientReviewDate: dataverseDeliverable.crda8_clientreviewdate
      ? new Date(dataverseDeliverable.crda8_clientreviewdate)
      : undefined,
    progress: dataverseDeliverable.crda8_progress || 0,
    status: mapDeliverableStatus(dataverseDeliverable.crda8_status),
    risk: mapRiskLevel(dataverseDeliverable.crda8_risk),
    riskDescription: dataverseDeliverable.crda8_riskdescription,
    subtasks: [], // TODO: Map subtasks if you have them
    comments: [], // TODO: Map comments if you have them
    createdAt: dataverseDeliverable.createdon
      ? new Date(dataverseDeliverable.createdon)
      : new Date(),
    updatedAt: dataverseDeliverable.modifiedon
      ? new Date(dataverseDeliverable.modifiedon)
      : new Date(),
  };
}

/**
 * Maps Dataverse status codes to Lovable DeliverableStatus
 *
 * IMPORTANT: Update these based on your actual Dataverse option set values!
 * Check your crda8_deliverables table for the actual status values.
 */
function mapDeliverableStatus(dataverseStatus: number | string | undefined): DeliverableStatus {
  // Default mapping - UPDATE THESE BASED ON YOUR ACTUAL VALUES
  const statusMap: Record<string | number, DeliverableStatus> = {
    0: 'Not Started',
    1: 'In Progress',
    2: 'Under Review',
    3: 'Client Review',
    4: 'Completed',
    5: 'On Hold',
    6: 'At Risk',
    // String alternatives (if your Dataverse uses strings)
    'not_started': 'Not Started',
    'in_progress': 'In Progress',
    'under_review': 'Under Review',
    'client_review': 'Client Review',
    'completed': 'Completed',
    'on_hold': 'On Hold',
    'at_risk': 'At Risk',
  };

  return statusMap[dataverseStatus as any] || 'Not Started';
}

/**
 * Maps Dataverse risk values to Lovable RiskLevel
 *
 * IMPORTANT: Update these based on your actual Dataverse option set values!
 */
function mapRiskLevel(dataverseRisk: number | string | undefined): RiskLevel {
  const riskMap: Record<string | number, RiskLevel> = {
    0: 'Low',
    1: 'Medium',
    2: 'High',
    3: 'Critical',
    // String alternatives
    'low': 'Low',
    'medium': 'Medium',
    'high': 'High',
    'critical': 'Critical',
  };

  return riskMap[dataverseRisk as any] || 'Low';
}

// ============================================================================
// TEAM MEMBER MAPPER (crda8_staff4)
// ============================================================================

/**
 * Maps Dataverse crda8_staff4 to Lovable TeamMember type
 */
export function mapStaffToLovable(dataverseStaff: any): TeamMember {
  return {
    id: dataverseStaff.crda8_staff4id || dataverseStaff.id,
    name: dataverseStaff.crda8_name || 'Unknown',
    email: dataverseStaff.crda8_email || '',
    avatar: dataverseStaff.crda8_avatar, // If you have avatar URLs
    jobTitle: mapJobTitle(dataverseStaff.crda8_jobtitle),
    supervisorId: dataverseStaff._crda8_supervisor_value,
    workstreamId: dataverseStaff._crda8_workstream_value,
    podId: dataverseStaff._crda8_pod_value,
    skills: parseSkills(dataverseStaff.crda8_skills), // If skills is a comma-separated string
    isContractor: dataverseStaff.crda8_iscontractor || false,
  };
}

/**
 * Maps Dataverse job title to Lovable JobTitle
 */
function mapJobTitle(dataverseTitle: number | string | undefined): JobTitle {
  const titleMap: Record<string | number, JobTitle> = {
    0: 'Partner',
    1: 'Director',
    2: 'Senior Manager',
    3: 'Manager',
    4: 'Senior Associate',
    5: 'Associate',
    6: 'Contractor',
    // String alternatives
    'partner': 'Partner',
    'director': 'Director',
    'senior_manager': 'Senior Manager',
    'manager': 'Manager',
    'senior_associate': 'Senior Associate',
    'associate': 'Associate',
    'contractor': 'Contractor',
  };

  return titleMap[dataverseTitle as any] || 'Associate';
}

/**
 * Parses skills from comma-separated string or array
 */
function parseSkills(skills: string | string[] | undefined): string[] {
  if (!skills) return [];
  if (Array.isArray(skills)) return skills;
  return skills.split(',').map(s => s.trim()).filter(Boolean);
}

// ============================================================================
// WORKSTREAM MAPPER (crda8_workstreams)
// ============================================================================

/**
 * Maps Dataverse crda8_workstreams to Lovable Workstream type
 */
export function mapWorkstreamToLovable(dataverseWorkstream: any): Workstream {
  return {
    id: dataverseWorkstream.crda8_workstreamid || dataverseWorkstream.id,
    name: dataverseWorkstream.crda8_name || 'Unnamed Workstream',
    description: dataverseWorkstream.crda8_description || '',
    leaderId: dataverseWorkstream._crda8_leader_value || '',
    color: dataverseWorkstream.crda8_color || '#3b82f6', // Default blue
  };
}

// ============================================================================
// TIME ENTRY MAPPER (crda8_weeklyhours)
// ============================================================================

/**
 * Maps Dataverse crda8_weeklyhours to Lovable TimeEntry type
 */
export function mapWeeklyHoursToLovable(dataverseHours: any): TimeEntry {
  return {
    id: dataverseHours.crda8_weeklyhourid || dataverseHours.id,
    userId: dataverseHours._crda8_staff_value || '',
    date: dataverseHours.crda8_date
      ? new Date(dataverseHours.crda8_date)
      : new Date(),
    hours: dataverseHours.crda8_hours || 0,
    deliverableId: dataverseHours._crda8_deliverable_value,
    description: dataverseHours.crda8_description,
  };
}

// ============================================================================
// PTO REQUEST MAPPER (crda8_timeoffrequests)
// ============================================================================

/**
 * Maps Dataverse crda8_timeoffrequests to Lovable PTORequest type
 */
export function mapTimeOffToLovable(dataverseTimeOff: any): PTORequest {
  return {
    id: dataverseTimeOff.crda8_timeoffrequestid || dataverseTimeOff.id,
    userId: dataverseTimeOff._crda8_staff_value || '',
    startDate: dataverseTimeOff.crda8_startdate
      ? new Date(dataverseTimeOff.crda8_startdate)
      : new Date(),
    endDate: dataverseTimeOff.crda8_enddate
      ? new Date(dataverseTimeOff.crda8_enddate)
      : new Date(),
    reason: dataverseTimeOff.crda8_reason || '',
    backupPersonId: dataverseTimeOff._crda8_backup_value,
    status: mapPTOStatus(dataverseTimeOff.crda8_status),
    approvedById: dataverseTimeOff._crda8_approver_value,
    createdAt: dataverseTimeOff.createdon
      ? new Date(dataverseTimeOff.createdon)
      : new Date(),
  };
}

/**
 * Maps Dataverse PTO status to Lovable PTOStatus
 */
function mapPTOStatus(dataverseStatus: number | string | undefined): PTOStatus {
  const statusMap: Record<string | number, PTOStatus> = {
    0: 'Pending',
    1: 'Approved',
    2: 'Rejected',
    // String alternatives
    'pending': 'Pending',
    'approved': 'Approved',
    'rejected': 'Rejected',
  };

  return statusMap[dataverseStatus as any] || 'Pending';
}

// ============================================================================
// BATCH MAPPERS
// ============================================================================

/**
 * Maps array of Dataverse deliverables to Lovable format
 */
export function mapDeliverablesArrayToLovable(dataverseDeliverables: any[]): Deliverable[] {
  return dataverseDeliverables.map(mapDeliverableToLovable);
}

/**
 * Maps array of Dataverse staff to Lovable format
 */
export function mapStaffArrayToLovable(dataverseStaff: any[]): TeamMember[] {
  return dataverseStaff.map(mapStaffToLovable);
}

/**
 * Maps array of Dataverse workstreams to Lovable format
 */
export function mapWorkstreamsArrayToLovable(dataverseWorkstreams: any[]): Workstream[] {
  return dataverseWorkstreams.map(mapWorkstreamToLovable);
}

/**
 * Maps array of Dataverse weekly hours to Lovable format
 */
export function mapWeeklyHoursArrayToLovable(dataverseHours: any[]): TimeEntry[] {
  return dataverseHours.map(mapWeeklyHoursToLovable);
}

/**
 * Maps array of Dataverse time off requests to Lovable format
 */
export function mapTimeOffArrayToLovable(dataverseTimeOff: any[]): PTORequest[] {
  return dataverseTimeOff.map(mapTimeOffToLovable);
}
