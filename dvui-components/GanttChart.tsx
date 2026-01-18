/**
 * Gantt Chart - Timeline View of Deliverables
 *
 * Features:
 * - Interactive timeline with zoom
 * - Color-coded by workstream
 * - Progress bars within timeline bars
 * - Hover tooltips with details
 * - Dependency lines (if you add dependencies later)
 */

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, differenceInDays, addMonths, subMonths } from 'date-fns';
import type { Deliverable, Workstream, TeamMember } from '@/types/lovable';

interface GanttChartProps {
  deliverables: Deliverable[];
  workstreams: Workstream[];
  staff: TeamMember[];
}

// Calculate timeline position and width
function getTimelinePosition(
  startDate: Date,
  endDate: Date,
  viewStart: Date,
  viewEnd: Date
): { left: number; width: number } {
  const totalDays = differenceInDays(viewEnd, viewStart);
  const startOffset = Math.max(0, differenceInDays(startDate, viewStart));
  const duration = differenceInDays(endDate, startDate);

  return {
    left: (startOffset / totalDays) * 100,
    width: (duration / totalDays) * 100,
  };
}

// Gantt Bar Component
function GanttBar({
  deliverable,
  workstream,
  owner,
  viewStart,
  viewEnd,
}: {
  deliverable: Deliverable;
  workstream?: Workstream;
  owner?: TeamMember;
  viewStart: Date;
  viewEnd: Date;
}) {
  const [isHovered, setIsHovered] = useState(false);

  // Calculate start date (created date or now if in future)
  const startDate = new Date(deliverable.createdAt);
  const endDate = new Date(deliverable.dueDate);

  const position = getTimelinePosition(startDate, endDate, viewStart, viewEnd);

  const isOverdue = endDate < new Date() && deliverable.status !== 'Completed';

  return (
    <div className="relative h-12 flex items-center">
      {/* Deliverable name */}
      <div className="absolute left-0 w-60 pr-4 truncate text-sm font-medium">
        {deliverable.title}
      </div>

      {/* Timeline bar */}
      <motion.div
        className="absolute left-64 right-0"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.5 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <div
          className={`relative h-8 rounded-lg transition-all duration-200 ${
            isHovered ? 'h-10 -mt-1' : ''
          }`}
          style={{
            marginLeft: `${position.left}%`,
            width: `${Math.max(2, position.width)}%`,
            backgroundColor: workstream?.color || '#3b82f6',
            opacity: deliverable.status === 'Completed' ? 0.7 : 1,
          }}
        >
          {/* Progress overlay */}
          <div
            className="absolute inset-0 bg-white/30 rounded-lg"
            style={{ width: `${deliverable.progress}%` }}
          />

          {/* Overdue indicator */}
          {isOverdue && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          )}

          {/* Hover tooltip */}
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full left-0 mt-2 p-3 bg-popover text-popover-foreground border rounded-lg shadow-lg z-10 w-64"
            >
              <div className="space-y-2 text-xs">
                <div className="font-semibold">{deliverable.title}</div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Owner:</span>
                  <span>{owner?.name || 'Unassigned'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Progress:</span>
                  <span>{deliverable.progress}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant="outline" className="text-xs">
                    {deliverable.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Due:</span>
                  <span>{format(endDate, 'MMM d, yyyy')}</span>
                </div>
                {isOverdue && (
                  <div className="text-red-500 font-semibold">
                    ⚠️ Overdue
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// Timeline Header with Dates
function TimelineHeader({ viewStart, viewEnd }: { viewStart: Date; viewEnd: Date }) {
  const days = eachDayOfInterval({ start: viewStart, end: viewEnd });
  const showEveryNDays = Math.ceil(days.length / 30); // Show ~30 date markers

  return (
    <div className="sticky top-0 bg-background z-10 border-b">
      <div className="flex items-center h-12">
        {/* Deliverable name column */}
        <div className="w-60 pr-4 font-semibold text-sm">
          Deliverable
        </div>

        {/* Timeline dates */}
        <div className="flex-1 relative">
          {days.map((day, index) => {
            if (index % showEveryNDays !== 0) return null;

            const position = (index / days.length) * 100;

            return (
              <div
                key={day.toISOString()}
                className="absolute text-xs text-muted-foreground"
                style={{ left: `${position}%` }}
              >
                {format(day, 'MMM d')}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Main Gantt Chart Component
export function GanttChart({ deliverables, workstreams, staff }: GanttChartProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const viewStart = startOfMonth(currentMonth);
  const viewEnd = endOfMonth(addMonths(currentMonth, 2)); // Show 3 months

  const workstreamMap = useMemo(
    () => new Map(workstreams.map(ws => [ws.id, ws])),
    [workstreams]
  );

  const staffMap = useMemo(
    () => new Map(staff.map(s => [s.id, s])),
    [staff]
  );

  // Group deliverables by workstream
  const deliverablesByWorkstream = useMemo(() => {
    const grouped: Record<string, Deliverable[]> = {};
    deliverables.forEach(d => {
      const wsName = workstreamMap.get(d.workstreamId)?.name || 'Unassigned';
      if (!grouped[wsName]) grouped[wsName] = [];
      grouped[wsName].push(d);
    });
    return grouped;
  }, [deliverables, workstreamMap]);

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Gantt Chart</h2>
          <p className="text-muted-foreground mt-1">
            Timeline view of deliverables
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium px-4">
            {format(viewStart, 'MMM yyyy')} - {format(viewEnd, 'MMM yyyy')}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(new Date())}
          >
            Today
          </Button>
        </div>
      </div>

      {/* Chart */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              <TimelineHeader viewStart={viewStart} viewEnd={viewEnd} />

              {/* Deliverables grouped by workstream */}
              <div className="divide-y">
                {Object.entries(deliverablesByWorkstream).map(([wsName, wsDeliverables]) => (
                  <div key={wsName} className="py-2">
                    {/* Workstream header */}
                    <div className="px-4 py-2 bg-muted/30">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: workstreams.find(ws => ws.name === wsName)?.color || '#gray',
                          }}
                        />
                        <span className="font-semibold text-sm">{wsName}</span>
                        <Badge variant="secondary" className="text-xs">
                          {wsDeliverables.length}
                        </Badge>
                      </div>
                    </div>

                    {/* Workstream deliverables */}
                    <div className="divide-y">
                      {wsDeliverables.map((deliverable) => (
                        <div key={deliverable.id} className="px-4">
                          <GanttBar
                            deliverable={deliverable}
                            workstream={workstreamMap.get(deliverable.workstreamId)}
                            owner={staffMap.get(deliverable.ownerId)}
                            viewStart={viewStart}
                            viewEnd={viewEnd}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 text-sm">
            {workstreams.map(ws => (
              <div key={ws.id} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: ws.color }}
                />
                <span>{ws.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
