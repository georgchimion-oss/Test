import { format } from 'date-fns';
import { Deliverable, TeamMember } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface DeliverableRowProps {
  deliverable: Deliverable;
  owner: TeamMember;
  onClick?: () => void;
}

const statusColors: Record<string, string> = {
  'Not Started': 'bg-muted text-muted-foreground',
  'In Progress': 'bg-info/10 text-info border-info/20',
  'Under Review': 'bg-warning/10 text-warning border-warning/20',
  'Client Review': 'bg-purple-100 text-purple-700 border-purple-200',
  'Completed': 'bg-success/10 text-success border-success/20',
  'On Hold': 'bg-muted text-muted-foreground',
  'At Risk': 'bg-destructive/10 text-destructive border-destructive/20',
};

const riskColors: Record<string, string> = {
  Low: 'bg-success/10 text-success',
  Medium: 'bg-warning/10 text-warning',
  High: 'bg-orange-100 text-orange-700',
  Critical: 'bg-destructive/10 text-destructive',
};

export function DeliverableRow({ deliverable, owner, onClick }: DeliverableRowProps) {
  const initials = owner.name
    .split(' ')
    .map((n: string) => n[0])
    .join('');

  return (
    <tr
      onClick={onClick}
      className="border-b border-border hover:bg-muted/50 cursor-pointer transition-colors"
    >
      <td className="py-4 px-4">
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{deliverable.title}</span>
          <span className="text-sm text-muted-foreground line-clamp-1">
            {deliverable.description}
          </span>
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm">{owner.name}</span>
        </div>
      </td>
      <td className="py-4 px-4">
        <span className="text-sm">{format(deliverable.dueDate, 'MMM d, yyyy')}</span>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <Progress value={deliverable.progress} className="h-2 w-16" />
          <span className="text-sm text-muted-foreground">{deliverable.progress}%</span>
        </div>
      </td>
      <td className="py-4 px-4">
        {/* @ts-ignore */}
        <Badge variant="outline" className={cn('font-medium', statusColors[deliverable.status])}>
          {deliverable.status}
        </Badge>
      </td>
      <td className="py-4 px-4">
        {/* @ts-ignore */}
        <Badge variant="secondary" className={cn('font-medium', riskColors[deliverable.risk])}>
          {deliverable.risk}
        </Badge>
      </td>
      <td className="py-4 px-4">
        <span className="text-sm">{deliverable.partnerName}</span>
      </td>
      <td className="py-4 px-4">
        <span className="text-sm">{deliverable.tdStakeholder}</span>
      </td>
    </tr>
  );
}
