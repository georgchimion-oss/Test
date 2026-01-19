import { format, differenceInDays } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { deliverables, teamMembers } from '@/data/mockData';
import { Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export function UpcomingDeadlines() {
  const today = new Date();
  const upcomingDeliverables = deliverables
    .filter((d) => d.status !== 'Completed' && d.dueDate >= today)
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, 5);

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Upcoming Deadlines
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcomingDeliverables.map((d) => {
          const daysUntil = differenceInDays(d.dueDate, today);
          const owner = teamMembers.find((m) => m.id === d.ownerId);
          const isUrgent = daysUntil <= 7;

          return (
            <div
              key={d.id}
              className={cn(
                'p-3 rounded-lg border transition-colors',
                isUrgent ? 'border-warning/30 bg-warning/5' : 'border-border'
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-sm">{d.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Owner: {owner?.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{format(d.dueDate, 'MMM d')}</p>
                  <p
                    className={cn(
                      'text-xs',
                      isUrgent ? 'text-warning font-medium' : 'text-muted-foreground'
                    )}
                  >
                    {daysUntil === 0 ? 'Today' : `${daysUntil} days`}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
