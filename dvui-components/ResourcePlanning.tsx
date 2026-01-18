/**
 * Resource Planning - Capacity Management and Allocation
 *
 * Features:
 * - Weekly capacity view per team member
 * - Utilization percentages
 * - PTO tracking
 * - Overallocation warnings
 * - Deliverable assignments
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Calendar, Briefcase, Clock } from 'lucide-react';
import { format, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import type { TeamMember, Deliverable, TimeEntry, PTORequest } from '@/types/lovable';

interface ResourcePlanningProps {
  staff: TeamMember[];
  deliverables: Deliverable[];
  timeEntries: TimeEntry[];
  ptoRequests: PTORequest[];
}

const STANDARD_HOURS_PER_WEEK = 40;

// Calculate utilization for a staff member
function calculateUtilization(
  staffId: string,
  timeEntries: TimeEntry[],
  weekStart: Date,
  weekEnd: Date
): number {
  const weekInterval = { start: weekStart, end: weekEnd };

  const hoursThisWeek = timeEntries
    .filter(entry =>
      entry.userId === staffId &&
      isWithinInterval(new Date(entry.date), weekInterval)
    )
    .reduce((sum, entry) => sum + entry.hours, 0);

  return Math.round((hoursThisWeek / STANDARD_HOURS_PER_WEEK) * 100);
}

// Check if staff member has PTO this week
function hasPTO(
  staffId: string,
  ptoRequests: PTORequest[],
  weekStart: Date,
  weekEnd: Date
): PTORequest | undefined {
  return ptoRequests.find(pto =>
    pto.userId === staffId &&
    pto.status === 'Approved' &&
    (
      isWithinInterval(new Date(pto.startDate), { start: weekStart, end: weekEnd }) ||
      isWithinInterval(new Date(pto.endDate), { start: weekStart, end: weekEnd })
    )
  );
}

// Staff Resource Row
function StaffResourceRow({
  member,
  utilization,
  assignedDeliverables,
  pto,
  index,
}: {
  member: TeamMember;
  utilization: number;
  assignedDeliverables: Deliverable[];
  pto?: PTORequest;
  index: number;
}) {
  const initials = member.name
    .split(' ')
    .map((n) => n[0])
    .join('');

  const isOverallocated = utilization > 100;
  const isUnderutilized = utilization < 60 && !pto;

  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="border-b border-border hover:bg-muted/50"
    >
      {/* Staff Member */}
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-sm">{member.name}</div>
            <div className="text-xs text-muted-foreground">{member.jobTitle}</div>
          </div>
        </div>
      </td>

      {/* Utilization */}
      <td className="py-4 px-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Progress
              value={Math.min(utilization, 100)}
              className={`h-2 flex-1 ${
                isOverallocated ? '[&>div]:bg-destructive' :
                isUnderutilized ? '[&>div]:bg-yellow-500' :
                '[&>div]:bg-primary'
              }`}
            />
            <span className={`text-sm font-medium ${
              isOverallocated ? 'text-destructive' :
              isUnderutilized ? 'text-yellow-600' :
              'text-foreground'
            }`}>
              {utilization}%
            </span>
          </div>
          {isOverallocated && (
            <Badge variant="destructive" className="text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Overallocated
            </Badge>
          )}
          {pto && (
            <Badge variant="secondary" className="text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              PTO
            </Badge>
          )}
        </div>
      </td>

      {/* Assigned Deliverables */}
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{assignedDeliverables.length}</span>
        </div>
      </td>

      {/* Active Deliverables (in progress) */}
      <td className="py-4 px-4">
        <div className="space-y-1">
          {assignedDeliverables
            .filter(d => d.status === 'In Progress')
            .slice(0, 2)
            .map(d => (
              <div key={d.id} className="text-xs truncate max-w-xs">
                {d.title}
              </div>
            ))}
          {assignedDeliverables.filter(d => d.status === 'In Progress').length > 2 && (
            <div className="text-xs text-muted-foreground">
              +{assignedDeliverables.filter(d => d.status === 'In Progress').length - 2} more
            </div>
          )}
        </div>
      </td>

      {/* Hours */}
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {Math.round((utilization / 100) * STANDARD_HOURS_PER_WEEK)}h / {STANDARD_HOURS_PER_WEEK}h
          </span>
        </div>
      </td>
    </motion.tr>
  );
}

// Summary Cards
function SummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'primary',
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: any;
  color?: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground mb-1">{title}</div>
            <div className="text-3xl font-bold">{value}</div>
            <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>
          </div>
          <div className={`p-3 rounded-lg bg-${color}/10`}>
            <Icon className={`h-6 w-6 text-${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Main Resource Planning Component
export function ResourcePlanning({
  staff,
  deliverables,
  timeEntries,
  ptoRequests,
}: ResourcePlanningProps) {
  const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const currentWeekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

  // Calculate utilization for each staff member
  const staffUtilization = useMemo(() => {
    return staff.map(member => {
      const utilization = calculateUtilization(
        member.id,
        timeEntries,
        currentWeekStart,
        currentWeekEnd
      );

      const assignedDeliverables = deliverables.filter(d =>
        d.ownerId === member.id && d.status !== 'Completed'
      );

      const pto = hasPTO(
        member.id,
        ptoRequests,
        currentWeekStart,
        currentWeekEnd
      );

      return {
        member,
        utilization,
        assignedDeliverables,
        pto,
      };
    });
  }, [staff, deliverables, timeEntries, ptoRequests, currentWeekStart, currentWeekEnd]);

  // Calculate summary stats
  const avgUtilization = Math.round(
    staffUtilization.reduce((sum, su) => sum + su.utilization, 0) / staff.length
  );

  const overallocated = staffUtilization.filter(su => su.utilization > 100).length;
  const onPTO = staffUtilization.filter(su => su.pto).length;
  const totalCapacity = staff.length * STANDARD_HOURS_PER_WEEK;
  const usedCapacity = Math.round((avgUtilization / 100) * totalCapacity);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold">Resource Planning</h2>
        <p className="text-muted-foreground mt-1">
          Week of {format(currentWeekStart, 'MMM d')} - {format(currentWeekEnd, 'MMM d, yyyy')}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Avg Utilization"
          value={`${avgUtilization}%`}
          subtitle="Across all team members"
          icon={TrendingUp}
          color="primary"
        />
        <SummaryCard
          title="Overallocated"
          value={overallocated}
          subtitle="Team members over 100%"
          icon={AlertTriangle}
          color="destructive"
        />
        <SummaryCard
          title="On PTO"
          value={onPTO}
          subtitle="This week"
          icon={Calendar}
          color="blue"
        />
        <SummaryCard
          title="Capacity"
          value={`${usedCapacity}h`}
          subtitle={`of ${totalCapacity}h available`}
          icon={Clock}
          color="green"
        />
      </div>

      {/* Resource Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Utilization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr className="text-left text-sm text-muted-foreground">
                  <th className="py-3 px-4 font-medium">Team Member</th>
                  <th className="py-3 px-4 font-medium">Utilization</th>
                  <th className="py-3 px-4 font-medium">Total Assigned</th>
                  <th className="py-3 px-4 font-medium">Active Work</th>
                  <th className="py-3 px-4 font-medium">Hours</th>
                </tr>
              </thead>
              <tbody>
                {staffUtilization
                  .sort((a, b) => b.utilization - a.utilization)
                  .map((su, index) => (
                    <StaffResourceRow
                      key={su.member.id}
                      member={su.member}
                      utilization={su.utilization}
                      assignedDeliverables={su.assignedDeliverables}
                      pto={su.pto}
                      index={index}
                    />
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
