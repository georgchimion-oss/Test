import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { deliverables, teamMembers, workstreams } from '@/data/mockData';
import { DeliverableStatus } from '@/types';
import { GripVertical, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const columns: { id: DeliverableStatus; label: string; color: string }[] = [
  { id: 'Not Started', label: 'Not Started', color: 'bg-muted' },
  { id: 'In Progress', label: 'In Progress', color: 'bg-info' },
  { id: 'Under Review', label: 'Under Review', color: 'bg-warning' },
  { id: 'Client Review', label: 'Client Review', color: 'bg-purple-500' },
  { id: 'Completed', label: 'Completed', color: 'bg-success' },
];

const riskColors: Record<string, string> = {
  Low: 'bg-success/10 text-success',
  Medium: 'bg-warning/10 text-warning',
  High: 'bg-orange-100 text-orange-700',
  Critical: 'bg-destructive/10 text-destructive',
};

const Kanban = () => {
  const [groupBy, setGroupBy] = useState<'status' | 'workstream' | 'owner'>('status');
  const [workstreamFilter, setWorkstreamFilter] = useState<string>('all');

  const filteredDeliverables = deliverables.filter(
    (d) => workstreamFilter === 'all' || d.workstreamId === workstreamFilter
  );

  const getDeliverablesByStatus = (status: DeliverableStatus) => {
    return filteredDeliverables.filter((d) => d.status === status);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Kanban Board</h1>
            <p className="text-muted-foreground">
              Drag and drop to update deliverable status
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={groupBy} onValueChange={(v: any) => setGroupBy(v)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Group by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="status">Group by Status</SelectItem>
                <SelectItem value="workstream">Group by Workstream</SelectItem>
                <SelectItem value="owner">Group by Owner</SelectItem>
              </SelectContent>
            </Select>
            <Select value={workstreamFilter} onValueChange={setWorkstreamFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Workstream" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Workstreams</SelectItem>
                {workstreams.map((ws) => (
                  <SelectItem key={ws.id} value={ws.id}>
                    {ws.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((column) => {
            const columnDeliverables = getDeliverablesByStatus(column.id);

            return (
              <div
                key={column.id}
                className="flex-shrink-0 w-80 bg-muted/30 rounded-xl"
              >
                {/* Column Header */}
                <div className="p-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-3 h-3 rounded-full', column.color)} />
                      <h3 className="font-semibold">{column.label}</h3>
                      <Badge variant="secondary" className="ml-2">
                        {columnDeliverables.length}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Column Cards */}
                <div className="p-3 space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-thin">
                  {columnDeliverables.map((deliverable) => {
                    const owner = teamMembers.find((m) => m.id === deliverable.ownerId)!;
                    const workstream = workstreams.find(
                      (w) => w.id === deliverable.workstreamId
                    )!;
                    const initials = owner.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('');

                    return (
                      <Card
                        key={deliverable.id}
                        className="shadow-card cursor-grab hover:shadow-md transition-shadow"
                        draggable
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-2">
                            <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0 cursor-grab" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <div
                                  className="px-2 py-0.5 rounded text-xs font-medium"
                                  style={{
                                    backgroundColor: `${workstream.color}20`,
                                    color: workstream.color,
                                  }}
                                >
                                  {workstream.name}
                                </div>
                                <Badge
                                  variant="secondary"
                                  className={cn(
                                    'text-xs ml-auto',
                                    riskColors[deliverable.risk]
                                  )}
                                >
                                  {deliverable.risk}
                                </Badge>
                              </div>
                              <h4 className="font-medium text-sm mb-2 line-clamp-2">
                                {deliverable.title}
                              </h4>

                              {/* Progress bar */}
                              <div className="mb-3">
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span className="text-muted-foreground">Progress</span>
                                  <span className="font-medium">{deliverable.progress}%</span>
                                </div>
                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-primary rounded-full transition-all"
                                    style={{ width: `${deliverable.progress}%` }}
                                  />
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                    {initials}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  {deliverable.subtasks.length > 0 && (
                                    <span>
                                      {
                                        deliverable.subtasks.filter((s) => s.completed)
                                          .length
                                      }
                                      /{deliverable.subtasks.length}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}

                  {columnDeliverables.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No deliverables
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
};

export default Kanban;
