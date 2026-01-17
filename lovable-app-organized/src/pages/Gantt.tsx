import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { deliverables, workstreams, currentUser, teamMembers } from '@/data/mockData';
import { format, addDays, startOfWeek, differenceInDays, isSameMonth } from 'date-fns';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const Gantt = () => {
  const [viewStart, setViewStart] = useState(new Date('2024-01-01'));
  const [zoom, setZoom] = useState<'day' | 'week' | 'month'>('week');
  const [workstreamFilter, setWorkstreamFilter] = useState<string>('all');

  const daysToShow = zoom === 'day' ? 30 : zoom === 'week' ? 90 : 180;
  const dayWidth = zoom === 'day' ? 40 : zoom === 'week' ? 14 : 5;

  const filteredDeliverables = deliverables.filter(
    (d) => workstreamFilter === 'all' || d.workstreamId === workstreamFilter
  );

  const navigateTime = (direction: 'prev' | 'next') => {
    const days = zoom === 'day' ? 7 : zoom === 'week' ? 30 : 90;
    setViewStart((prev) =>
      direction === 'next' ? addDays(prev, days) : addDays(prev, -days)
    );
  };

  const dates = Array.from({ length: daysToShow }, (_, i) => addDays(viewStart, i));

  // Group dates by month for header
  const monthGroups = dates.reduce((acc, date) => {
    const monthKey = format(date, 'MMM yyyy');
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(date);
    return acc;
  }, {} as Record<string, Date[]>);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Gantt Chart</h1>
            <p className="text-muted-foreground">Project timeline visualization</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 border rounded-lg p-1">
              <Button
                variant={zoom === 'day' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setZoom('day')}
              >
                Day
              </Button>
              <Button
                variant={zoom === 'week' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setZoom('week')}
              >
                Week
              </Button>
              <Button
                variant={zoom === 'month' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setZoom('month')}
              >
                Month
              </Button>
            </div>
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

        {/* Navigation */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigateTime('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium">
            {format(viewStart, 'MMM d, yyyy')} -{' '}
            {format(addDays(viewStart, daysToShow - 1), 'MMM d, yyyy')}
          </span>
          <Button variant="outline" size="icon" onClick={() => navigateTime('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setViewStart(new Date())}>
            Today
          </Button>
        </div>

        {/* Gantt Chart */}
        <Card className="shadow-card overflow-hidden">
          <CardContent className="p-0">
            <div className="flex">
              {/* Left Panel - Task Names */}
              <div className="w-64 border-r border-border shrink-0 bg-muted/30">
                {/* Header */}
                <div className="h-14 border-b border-border flex items-center px-4">
                  <span className="font-semibold text-sm">Deliverable</span>
                </div>
                {/* Tasks */}
                {filteredDeliverables.map((d) => {
                  const workstream = workstreams.find((w) => w.id === d.workstreamId)!;
                  return (
                    <div
                      key={d.id}
                      className="h-12 border-b border-border flex items-center px-4 gap-2"
                    >
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: workstream.color }}
                      />
                      <span className="text-sm truncate">{d.title}</span>
                    </div>
                  );
                })}
              </div>

              {/* Right Panel - Timeline */}
              <div className="flex-1 overflow-x-auto">
                {/* Month Header */}
                <div className="h-7 border-b border-border flex">
                  {Object.entries(monthGroups).map(([month, monthDates]) => (
                    <div
                      key={month}
                      className="border-r border-border flex items-center justify-center text-xs font-medium bg-muted/50"
                      style={{ width: monthDates.length * dayWidth }}
                    >
                      {month}
                    </div>
                  ))}
                </div>

                {/* Day/Date Header */}
                <div className="h-7 border-b border-border flex">
                  {dates.map((date, i) => (
                    <div
                      key={i}
                      className={cn(
                        'border-r border-border flex items-center justify-center text-xs shrink-0',
                        date.getDay() === 0 || date.getDay() === 6
                          ? 'bg-muted/50'
                          : ''
                      )}
                      style={{ width: dayWidth }}
                    >
                      {zoom === 'day' ? format(date, 'd') : ''}
                    </div>
                  ))}
                </div>

                {/* Task Bars */}
                {filteredDeliverables.map((d) => {
                  const workstream = workstreams.find((w) => w.id === d.workstreamId)!;
                  const startOffset = Math.max(
                    0,
                    differenceInDays(d.createdAt, viewStart)
                  );
                  const endOffset = differenceInDays(d.dueDate, viewStart);
                  const barWidth = Math.max(
                    dayWidth,
                    (endOffset - startOffset + 1) * dayWidth
                  );
                  const barLeft = startOffset * dayWidth;

                  return (
                    <div
                      key={d.id}
                      className="h-12 border-b border-border relative"
                      style={{ width: daysToShow * dayWidth }}
                    >
                      {/* Weekend highlights */}
                      {dates.map((date, i) =>
                        date.getDay() === 0 || date.getDay() === 6 ? (
                          <div
                            key={i}
                            className="absolute top-0 bottom-0 bg-muted/30"
                            style={{ left: i * dayWidth, width: dayWidth }}
                          />
                        ) : null
                      )}

                      {/* Task bar */}
                      {barLeft < daysToShow * dayWidth && (
                        <div
                          className="absolute top-2 h-8 rounded-md flex items-center px-2 cursor-pointer hover:opacity-90 transition-opacity"
                          style={{
                            left: Math.max(0, barLeft),
                            width: Math.min(
                              barWidth,
                              daysToShow * dayWidth - Math.max(0, barLeft)
                            ),
                            backgroundColor: workstream.color,
                          }}
                        >
                          <span className="text-xs text-white font-medium truncate">
                            {d.progress}%
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              {workstreams.map((ws) => (
                <div key={ws.id} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: ws.color }}
                  />
                  <span className="text-sm">{ws.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Gantt;
