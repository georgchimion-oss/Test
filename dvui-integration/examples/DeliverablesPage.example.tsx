/**
 * Example: Deliverables Page with Lovable UI + Dataverse Data
 *
 * This shows how to use your Dataverse hooks with Lovable components.
 *
 * Copy this to: project-governance-dvui/src/pages/DeliverablesPage.tsx
 * (or wherever you want your deliverables page)
 */

import { useDeliverables } from '@/generated/hooks/useDeliverables';
import { useStaff } from '@/generated/hooks/useStaff';
import { mapDeliverablesArrayToLovable, mapStaffArrayToLovable } from '@/mappers/dataverseToLovable';
import { DeliverableRow } from '@/components/dashboard/DeliverableRow';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export function DeliverablesPage() {
  // Fetch data from Dataverse using generated hooks
  const { data: dataverseDeliverables, isLoading: deliverablesLoading } = useDeliverables();
  const { data: dataverseStaff, isLoading: staffLoading } = useStaff();

  // Loading state
  if (deliverablesLoading || staffLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Convert Dataverse data to Lovable format
  const deliverables = mapDeliverablesArrayToLovable(dataverseDeliverables || []);
  const staff = mapStaffArrayToLovable(dataverseStaff || []);

  // Create lookup map for staff
  const staffMap = new Map(staff.map(s => [s.id, s]));

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Deliverables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr className="text-left text-sm text-muted-foreground">
                  <th className="py-3 px-4 font-medium">Deliverable</th>
                  <th className="py-3 px-4 font-medium">Owner</th>
                  <th className="py-3 px-4 font-medium">Due Date</th>
                  <th className="py-3 px-4 font-medium">Progress</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium">Risk</th>
                  <th className="py-3 px-4 font-medium">Partner</th>
                  <th className="py-3 px-4 font-medium">TD Stakeholder</th>
                </tr>
              </thead>
              <tbody>
                {deliverables.map((deliverable) => {
                  const owner = staffMap.get(deliverable.ownerId);

                  // Skip if no owner found (or show placeholder)
                  if (!owner) return null;

                  return (
                    <DeliverableRow
                      key={deliverable.id}
                      deliverable={deliverable}
                      owner={owner}
                      onClick={() => {
                        console.log('Clicked deliverable:', deliverable.id);
                        // TODO: Navigate to deliverable detail page
                      }}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
