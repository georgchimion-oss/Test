import { format, differenceInDays } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetDeliverables, useGetStaff } from '@/services/dataverseService';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export function UpcomingDeadlines() {
  const { data: deliverables = [], isLoading: isLoadingDeliverables } = useGetDeliverables();
  const { data: teamMembers = [], isLoading: isLoadingStaff } = useGetStaff();

  const isLoading = isLoadingDeliverables || isLoadingStaff;

  const today = new Date();
  const upcomingDeliverables = deliverables
    .filter((d) => {
      // Status: 0=NotStarted, 1=InProgress, 2=Completed
      const isNotCompleted = d.crda8_status !== 2;
      const targetDate = d.crda8_targetdate ? new Date(d.crda8_targetdate) : null;
      const isFuture = targetDate && targetDate >= today;
      return isNotCompleted && isFuture;
    })
    .sort((a, b) => {
      const dateA = new Date(a.crda8_targetdate || 0);
      const dateB = new Date(b.crda8_targetdate || 0);
      return dateA.getTime() - dateB.getTime();
    })
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
        {isLoading ? (
          <div className="text-center text-muted-foreground py-4">Loading...</div>
        ) : upcomingDeliverables.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">No upcoming deadlines</div>
        ) : (
          upcomingDeliverables.map((d) => {
            const dueDate = d.crda8_targetdate ? new Date(d.crda8_targetdate) : null;
            const daysUntil = dueDate ? differenceInDays(dueDate, today) : 0;
            const owner = teamMembers.find((m) => m.crda8_staff4id === d.crda8_owner);
            const isUrgent = daysUntil <= 7;

            return (
              <div
                key={d.crda8_deliverablesid}
                className={cn(
                  'p-3 rounded-lg border transition-colors',
                  isUrgent ? 'border-warning/30 bg-warning/5' : 'border-border'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{d.crda8_title || 'Untitled Deliverable'}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Owner: {owner?.crda8_title || 'Unassigned'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {dueDate ? format(dueDate, 'MMM d') : 'No date'}
                    </p>
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
          })
        )}
      </CardContent>
    </Card>
  );
}
