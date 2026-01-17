import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { deliverables } from '@/data/mockData';
import { AlertTriangle } from 'lucide-react';

export function RiskOverview() {
  const riskCounts = {
    Critical: deliverables.filter((d) => d.risk === 'Critical').length,
    High: deliverables.filter((d) => d.risk === 'High').length,
    Medium: deliverables.filter((d) => d.risk === 'Medium').length,
    Low: deliverables.filter((d) => d.risk === 'Low').length,
  };

  const atRiskDeliverables = deliverables.filter(
    (d) => d.risk === 'Critical' || d.risk === 'High'
  );

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          Risk Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 rounded-lg bg-destructive/10">
            <p className="text-2xl font-bold text-destructive">{riskCounts.Critical}</p>
            <p className="text-xs text-muted-foreground">Critical</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-orange-100">
            <p className="text-2xl font-bold text-orange-700">{riskCounts.High}</p>
            <p className="text-xs text-muted-foreground">High</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-warning/10">
            <p className="text-2xl font-bold text-warning">{riskCounts.Medium}</p>
            <p className="text-xs text-muted-foreground">Medium</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-success/10">
            <p className="text-2xl font-bold text-success">{riskCounts.Low}</p>
            <p className="text-xs text-muted-foreground">Low</p>
          </div>
        </div>

        {atRiskDeliverables.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">At Risk Items</p>
            {atRiskDeliverables.map((d) => (
              <div
                key={d.id}
                className="p-3 rounded-lg border border-destructive/20 bg-destructive/5"
              >
                <p className="font-medium text-sm">{d.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{d.riskDescription}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
