/**
 * Example: Command Center Page with Dataverse Integration
 *
 * This shows how to integrate your CommandCenter.tsx component with Dataverse data.
 *
 * IMPORTANT: You need to have CommandCenter.tsx in your components folder first!
 * Copy commandcenter.tsx from Lovable to: project-governance-dvui/src/components/CommandCenter.tsx
 *
 * Then copy this file to: project-governance-dvui/src/pages/CommandCenterPage.tsx
 */

import { useDeliverables } from '@/generated/hooks/useDeliverables';
import { useStaff } from '@/generated/hooks/useStaff';
import { useWorkstreams } from '@/generated/hooks/useWorkstreams';
import { useWeeklyHours } from '@/generated/hooks/useWeeklyHours';
import { mapDeliverablesArrayToLovable, mapStaffArrayToLovable, mapWorkstreamsArrayToLovable } from '@/mappers/dataverseToLovable';
import { CommandCenter } from '@/components/CommandCenter'; // Your framer-motion animated component
import { Loader2 } from 'lucide-react';
import { useMemo } from 'react';
import type { KPI } from '@/types';

export function CommandCenterPage() {
  // Fetch all data from Dataverse
  const { data: dataverseDeliverables, isLoading: deliverablesLoading } = useDeliverables();
  const { data: dataverseStaff, isLoading: staffLoading } = useStaff();
  const { data: dataverseWorkstreams, isLoading: workstreamsLoading } = useWorkstreams();
  const { data: dataverseWeeklyHours, isLoading: hoursLoading } = useWeeklyHours();

  // Loading state
  const isLoading = deliverablesLoading || staffLoading || workstreamsLoading || hoursLoading;

  // Convert Dataverse data to Lovable format
  const deliverables = useMemo(
    () => mapDeliverablesArrayToLovable(dataverseDeliverables || []),
    [dataverseDeliverables]
  );

  const staff = useMemo(
    () => mapStaffArrayToLovable(dataverseStaff || []),
    [dataverseStaff]
  );

  const workstreams = useMemo(
    () => mapWorkstreamsArrayToLovable(dataverseWorkstreams || []),
    [dataverseWorkstreams]
  );

  // Calculate KPIs from real data
  const kpis = useMemo((): KPI[] => {
    if (!deliverables.length) return [];

    const now = new Date();
    const thisWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);

    return [
      {
        id: '1',
        label: 'Total Deliverables',
        value: deliverables.length,
        icon: 'FileText',
      },
      {
        id: '2',
        label: 'In Progress',
        value: deliverables.filter(d => d.status === 'In Progress').length,
        icon: 'Activity',
      },
      {
        id: '3',
        label: 'Due This Week',
        value: deliverables.filter(d => {
          const dueDate = new Date(d.dueDate);
          return dueDate >= now && dueDate <= new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);
        }).length,
        icon: 'Calendar',
        change: 12,
        changeType: 'increase' as const,
      },
      {
        id: '4',
        label: 'At Risk',
        value: deliverables.filter(d => d.risk === 'High' || d.risk === 'Critical').length,
        icon: 'AlertTriangle',
      },
      {
        id: '5',
        label: 'Completed',
        value: deliverables.filter(d => d.status === 'Completed').length,
        icon: 'CheckCircle',
      },
      {
        id: '6',
        label: 'Team Members',
        value: staff.length,
        icon: 'Users',
      },
      {
        id: '7',
        label: 'Workstreams',
        value: workstreams.length,
        icon: 'Layers',
      },
      {
        id: '8',
        label: 'Avg Progress',
        value: `${Math.round(deliverables.reduce((sum, d) => sum + d.progress, 0) / deliverables.length)}%`,
        icon: 'TrendingUp',
      },
    ];
  }, [deliverables, staff, workstreams]);

  // Calculate recent activity from deliverables
  const recentActivity = useMemo(() => {
    return deliverables
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)
      .map(d => ({
        id: d.id,
        type: 'deliverable_update' as const,
        title: d.title,
        description: `Status: ${d.status} - ${d.progress}% complete`,
        timestamp: d.updatedAt,
        user: staff.find(s => s.id === d.ownerId)?.name || 'Unknown',
      }));
  }, [deliverables, staff]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <CommandCenter
      kpis={kpis}
      deliverables={deliverables}
      workstreams={workstreams}
      recentActivity={recentActivity}
    />
  );
}

/**
 * IMPORTANT NOTES:
 *
 * 1. The CommandCenter component needs to be adapted to accept these props:
 *    - kpis: KPI[]
 *    - deliverables: Deliverable[]
 *    - workstreams: Workstream[]
 *    - recentActivity: any[] (or define a proper Activity type)
 *
 * 2. If your CommandCenter.tsx has hardcoded data, you need to:
 *    a) Add props to the component
 *    b) Replace hardcoded data with the props
 *    c) Keep all the framer-motion animations!
 *
 * 3. The component will automatically update when Dataverse data changes
 *    because we're using React Query hooks (useDeliverables, etc.)
 *
 * 4. You can add more KPIs based on your business logic - just calculate
 *    them from the deliverables/staff/workstreams data
 */
