// src/services/dataverseService.ts
// CREATE THIS FILE - Replace SharePoint with Dataverse

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Get the Dataverse URL from power.config.json
const DATAVERSE_URL = 'https://pwc-us-adv-poc.crm.dynamics.com';
const API_VERSION = 'v9.0'; // From your power.config.json

// Generic fetch with proper headers
async function dataverseFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${DATAVERSE_URL}/api/data/${API_VERSION}/${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'OData-MaxVersion': '4.0',
      'OData-Version': '4.0',
      'Accept': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Dataverse API error: ${response.statusText}`);
  }

  return response.json();
}

// ==========================================
// DELIVERABLES
// ==========================================

export interface Deliverable {
  crda8_deliverablesid: string;
  crda8_name: string;
  crda8_status?: number;
  crda8_description?: string;
  crda8_targetdate?: string;
  crda8_completionpercentage?: number;
  crda8_owner?: string;
  crda8_workstream?: string;
  crda8_risk?: number;
  crda8_active?: boolean;
}

// GET all deliverables
export function useGetDeliverables() {
  return useQuery({
    queryKey: ['deliverables'],
    queryFn: async () => {
      const data = await dataverseFetch(
        'crda8_deliverabless?$filter=crda8_active eq true&$orderby=crda8_targetdate asc'
      );
      return data.value as Deliverable[];
    },
  });
}

// GET deliverables by status
export function useGetDeliverablesByStatus(status: number) {
  return useQuery({
    queryKey: ['deliverables', 'status', status],
    queryFn: async () => {
      const data = await dataverseFetch(
        `crda8_deliverabless?$filter=crda8_status eq ${status} and crda8_active eq true`
      );
      return data.value as Deliverable[];
    },
  });
}

// CREATE deliverable
export function useCreateDeliverable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (deliverable: Partial<Deliverable>) => {
      return dataverseFetch('crda8_deliverabless', {
        method: 'POST',
        body: JSON.stringify(deliverable),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliverables'] });
    },
  });
}

// UPDATE deliverable
export function useUpdateDeliverable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Deliverable> }) => {
      return dataverseFetch(`crda8_deliverabless(${id})`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliverables'] });
    },
  });
}

// DELETE deliverable (soft delete by setting active = false)
export function useDeleteDeliverable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return dataverseFetch(`crda8_deliverabless(${id})`, {
        method: 'PATCH',
        body: JSON.stringify({ crda8_active: false }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliverables'] });
    },
  });
}

// ==========================================
// STAFF
// ==========================================

export interface Staff {
  crda8_staff4id: string;
  crda8_name: string;
  crda8_email?: string;
  crda8_role?: string;
  crda8_department?: string;
  crda8_active?: boolean;
}

export function useGetStaff() {
  return useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      const data = await dataverseFetch(
        'crda8_staff4s?$filter=crda8_active eq true&$orderby=crda8_name asc'
      );
      return data.value as Staff[];
    },
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (staff: Partial<Staff>) => {
      return dataverseFetch('crda8_staff4s', {
        method: 'POST',
        body: JSON.stringify(staff),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });
}

// ==========================================
// WORKSTREAMS
// ==========================================

export interface Workstream {
  crda8_workstreamsid: string;
  crda8_name: string;
  crda8_description?: string;
  crda8_lead?: string;
  crda8_active?: boolean;
}

export function useGetWorkstreams() {
  return useQuery({
    queryKey: ['workstreams'],
    queryFn: async () => {
      const data = await dataverseFetch(
        'crda8_workstreamss?$filter=crda8_active eq true&$orderby=crda8_name asc'
      );
      return data.value as Workstream[];
    },
  });
}

// ==========================================
// TIME OFF REQUESTS
// ==========================================

export interface TimeOffRequest {
  crda8_timeoffrequestsid: string;
  crda8_name: string;
  crda8_startdate?: string;
  crda8_enddate?: string;
  crda8_status?: number;
  crda8_requestor?: string;
}

export function useGetTimeOffRequests() {
  return useQuery({
    queryKey: ['timeOffRequests'],
    queryFn: async () => {
      const data = await dataverseFetch(
        'crda8_timeoffrequestss?$orderby=crda8_startdate desc'
      );
      return data.value as TimeOffRequest[];
    },
  });
}

// ==========================================
// WEEKLY HOURS
// ==========================================

export interface WeeklyHours {
  crda8_weeklyhoursid: string;
  crda8_name: string;
  crda8_week?: string;
  crda8_hours?: number;
  crda8_staff?: string;
}

export function useGetWeeklyHours() {
  return useQuery({
    queryKey: ['weeklyHours'],
    queryFn: async () => {
      const data = await dataverseFetch(
        'crda8_weeklyhours?$orderby=crda8_week desc'
      );
      return data.value as WeeklyHours[];
    },
  });
}

// ==========================================
// HELPERS
// ==========================================

// Status mappings (adjust based on your choice columns)
export const DeliverableStatus = {
  NOT_STARTED: 0,
  IN_PROGRESS: 1,
  IN_REVIEW: 2,
  COMPLETED: 3,
} as const;

export const RiskLevel = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
} as const;
