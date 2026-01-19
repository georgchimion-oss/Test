import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { deliverables, workstreams } from '@/data/mockData';

export function ProjectProgress() {
  const workstreamProgress = workstreams.map((ws) => {
    const wsDeliverables = deliverables.filter((d) => d.workstreamId === ws.id);
    const avgProgress =
      wsDeliverables.length > 0
        ? Math.round(
            wsDeliverables.reduce((sum, d) => sum + d.progress, 0) / wsDeliverables.length
          )
        : 0;
    return {
      ...ws,
      progress: avgProgress,
      deliverableCount: wsDeliverables.length,
    };
  });

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Workstream Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {workstreamProgress.map((ws) => (
          <div key={ws.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: ws.color }}
                />
                <span className="text-sm font-medium">{ws.name}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {ws.deliverableCount} deliverables
              </span>
            </div>
            <div className="relative h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                style={{
                  width: `${ws.progress}%`,
                  backgroundColor: ws.color,
                }}
              />
            </div>
            <div className="flex justify-end">
              <span className="text-xs text-muted-foreground">{ws.progress}%</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
