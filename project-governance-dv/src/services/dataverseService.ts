import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { IOperationResult } from '@microsoft/power-apps/data'
import {
  Crda8_deliverablesesService,
  Crda8_staff4sService,
  Crda8_workstreamsesService,
} from '../generated'
import type { Crda8_deliverableses, Crda8_deliverablesesBase } from '../generated/models/Crda8_deliverablesesModel'
import type { Crda8_staff4s } from '../generated/models/Crda8_staff4sModel'
import type { Crda8_workstreamses } from '../generated/models/Crda8_workstreamsesModel'

function unwrapResult<T>(result: IOperationResult<T>, label: string): T {
  if (!result.success) {
    throw result.error || new Error(`Failed to load ${label}.`)
  }
  return result.data as T
}

export function useGetDeliverables() {
  return useQuery({
    queryKey: ['deliverables'],
    queryFn: async () => {
      const result = await Crda8_deliverablesesService.getAll({ orderBy: ['crda8_title asc'] })
      return unwrapResult<Crda8_deliverableses[]>(result, 'deliverables') || []
    },
  })
}

export function useCreateDeliverable() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (record: Partial<Crda8_deliverableses>) => {
      const payload = record as Omit<Crda8_deliverablesesBase, 'crda8_deliverablesid'>
      const result = await Crda8_deliverablesesService.create(payload)
      return unwrapResult(result, 'deliverables')
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['deliverables'] }),
  })
}

export function useUpdateDeliverable() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Crda8_deliverableses> }) => {
      const result = await Crda8_deliverablesesService.update(id, updates)
      return unwrapResult(result, 'deliverables')
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['deliverables'] }),
  })
}

export function useDeleteDeliverable() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => Crda8_deliverablesesService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['deliverables'] }),
  })
}

export function useGetStaff() {
  return useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      const result = await Crda8_staff4sService.getAll({ orderBy: ['crda8_title asc'] })
      return unwrapResult<Crda8_staff4s[]>(result, 'staff') || []
    },
  })
}

export function useGetWorkstreams() {
  return useQuery({
    queryKey: ['workstreams'],
    queryFn: async () => {
      const result = await Crda8_workstreamsesService.getAll({ orderBy: ['crda8_title asc'] })
      return unwrapResult<Crda8_workstreamses[]>(result, 'workstreams') || []
    },
  })
}
