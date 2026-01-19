import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'primary' | 'success' | 'warning' | 'info' | 'destructive';
}

const colorClasses = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  info: 'bg-info/10 text-info',
  destructive: 'bg-destructive/10 text-destructive',
};

export function KPICard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  trend = 'neutral',
  color = 'primary',
}: KPICardProps) {
  return (
    <Card className="p-6 shadow-card hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1.5">
              {trend === 'up' && <TrendingUp className="h-4 w-4 text-success" />}
              {trend === 'down' && <TrendingDown className="h-4 w-4 text-destructive" />}
              <span
                className={cn(
                  'text-sm font-medium',
                  trend === 'up' && 'text-success',
                  trend === 'down' && 'text-destructive',
                  trend === 'neutral' && 'text-muted-foreground'
                )}
              >
                {change > 0 ? '+' : ''}
                {change}%
              </span>
              {changeLabel && (
                <span className="text-sm text-muted-foreground">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-xl', colorClasses[color])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}
