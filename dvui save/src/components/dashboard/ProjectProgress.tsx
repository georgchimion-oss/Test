import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetDeliverables, useGetWorkstreams } from '@/services/dataverseService';

export function ProjectProgress() {
  const { data: deliverables = [], isLoading: isLoadingDeliverables } = useGetDeliverables();
  const { data: workstreams = [], isLoading: isLoadingWorkstreams } = useGetWorkstreams();

  const isLoading = isLoadingDeliverables || isLoadingWorkstreams;

  const workstreamColors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  const workstreamProgress = workstreams.map((ws, index) => {
    const wsDeliverables = deliverables.filter((d) => d.crda8_workstream === ws.crda8_workstreamsid);
    const avgProgress =
      wsDeliverables.length > 0
        ? Math.round(
            wsDeliverables.reduce((sum, d) => sum + (parseInt(d.crda8_completion_x0020__x0025_ || '0') || 0), 0) / wsDeliverables.length
          )
        : 0;
    return {
      id: ws.crda8_workstreamsid,
      name: ws.crda8_title || 'Untitled Workstream',
      color: workstreamColors[index % workstreamColors.length],
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
        {isLoading ? (
          <div className="text-center text-muted-foreground py-4">Loading...</div>
        ) : workstreamProgress.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">No workstreams found</div>
        ) : (
          workstreamProgress.map((ws) => (
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
          ))
        )}
      </CardContent>
    </Card>
  );
}
