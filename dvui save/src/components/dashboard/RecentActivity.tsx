import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Activity {
  id: string;
  type: 'comment' | 'completed' | 'risk' | 'update';
  user: string;
  action: string;
  target: string;
  time: string;
}

const activities: Activity[] = [
  {
    id: '1',
    type: 'comment',
    user: 'Amanda Foster',
    action: 'commented on',
    target: 'Regulatory Gap Analysis Report',
    time: '2 hours ago',
  },
  {
    id: '2',
    type: 'completed',
    user: 'Lisa Park',
    action: 'completed',
    target: 'Client Onboarding UX Research',
    time: '4 hours ago',
  },
  {
    id: '3',
    type: 'risk',
    user: 'Robert Taylor',
    action: 'flagged risk on',
    target: 'Credit Risk Model Validation',
    time: '5 hours ago',
  },
  {
    id: '4',
    type: 'update',
    user: 'Jennifer Lee',
    action: 'updated progress on',
    target: 'Data Migration Architecture Design',
    time: '6 hours ago',
  },
  {
    id: '5',
    type: 'comment',
    user: 'Sarah Mitchell',
    action: 'reviewed',
    target: 'Process Automation Roadmap',
    time: '1 day ago',
  },
];

const iconMap = {
  comment: MessageSquare,
  completed: CheckCircle2,
  risk: AlertTriangle,
  update: Clock,
};

const colorMap = {
  comment: 'bg-info/10 text-info',
  completed: 'bg-success/10 text-success',
  risk: 'bg-destructive/10 text-destructive',
  update: 'bg-warning/10 text-warning',
};

export function RecentActivity() {
  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => {
          const Icon = iconMap[activity.type];
          const initials = activity.user
            .split(' ')
            .map((n) => n[0])
            .join('');

          return (
            <div key={activity.id} className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-medium">{activity.user}</span>{' '}
                  <span className="text-muted-foreground">{activity.action}</span>{' '}
                  <span className="font-medium">{activity.target}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
              </div>
              <div className={cn('p-1.5 rounded-lg', colorMap[activity.type])}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
