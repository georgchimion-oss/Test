import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetDeliverables } from '@/services/dataverseService';
import { AlertTriangle } from 'lucide-react';

export function RiskOverview() {
  const { data: deliverables = [], isLoading } = useGetDeliverables();

  // Map Dataverse risk values: 0=Green, 1=Amber, 2=Red
  const riskCounts = {
    Critical: deliverables.filter((d) => d.crda8_risk === 2).length,
    High: deliverables.filter((d) => d.crda8_risk === 2).length,
    Medium: deliverables.filter((d) => d.crda8_risk === 1).length,
    Low: deliverables.filter((d) => d.crda8_risk === 0).length,
  };

  const atRiskDeliverables = deliverables.filter(
    (d) => d.crda8_risk === 2
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
        {isLoading ? (
          <div className="text-center text-muted-foreground py-4">Loading...</div>
        ) : (
          <>
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
                    key={d.crda8_deliverablesid}
                    className="p-3 rounded-lg border border-destructive/20 bg-destructive/5"
                  >
                    <p className="font-medium text-sm">{d.crda8_title || 'Untitled Deliverable'}</p>
                    <p className="text-xs text-muted-foreground mt-1">{d.crda8_riskdescription || 'No description'}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
