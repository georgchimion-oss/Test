import {
  ListChecks,
  CheckCircle2,
  Users,
  TrendingUp,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { KPICard } from '@/components/dashboard/KPICard';
import { DeliverableRow } from '@/components/dashboard/DeliverableRow';
import { ProjectProgress } from '@/components/dashboard/ProjectProgress';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { RiskOverview } from '@/components/dashboard/RiskOverview';
import { UpcomingDeadlines } from '@/components/dashboard/UpcomingDeadlines';
import { deliverables, teamMembers, currentUser } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  // Filter deliverables assigned to current user or their direct reports
  const myDeliverables = deliverables.filter(
    (d) =>
      d.ownerId === currentUser.id ||
      teamMembers.find((m) => m.supervisorId === currentUser.id && m.id === d.ownerId)
  );

  const completedCount = deliverables.filter((d) => d.status === 'Completed').length;
  const inProgressCount = deliverables.filter((d) => d.status === 'In Progress').length;
  const atRiskCount = deliverables.filter(
    (d) => d.risk === 'High' || d.risk === 'Critical'
  ).length;
  const teamSize = teamMembers.length;

  const avgProgress = Math.round(
    deliverables.reduce((sum, d) => sum + d.progress, 0) / deliverables.length
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Project Dashboard</h1>
            <p className="text-muted-foreground">
              TD Bank Digital Transformation Program
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">Export Report</Button>
            <Button className="gradient-primary text-primary-foreground">
              Add Deliverable
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          <KPICard
            title="Total Deliverables"
            value={deliverables.length}
            icon={ListChecks}
            color="primary"
          />
          <KPICard
            title="Completed"
            value={completedCount}
            change={12}
            changeLabel="vs last week"
            trend="up"
            icon={CheckCircle2}
            color="success"
          />
          <KPICard
            title="In Progress"
            value={inProgressCount}
            icon={Clock}
            color="info"
          />
          <KPICard
            title="At Risk"
            value={atRiskCount}
            change={-2}
            changeLabel="vs last week"
            trend="down"
            icon={AlertTriangle}
            color="warning"
          />
          <KPICard
            title="Team Size"
            value={teamSize}
            icon={Users}
            color="primary"
          />
          <KPICard
            title="Overall Progress"
            value={`${avgProgress}%`}
            change={5}
            changeLabel="vs last week"
            trend="up"
            icon={TrendingUp}
            color="success"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            {/* My Deliverables Table */}
            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  My Deliverables & Team
                </CardTitle>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Deliverable
                        </th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Owner
                        </th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Due Date
                        </th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Progress
                        </th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Status
                        </th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Risk
                        </th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Partner
                        </th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          TD Stakeholder
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {myDeliverables.map((deliverable) => {
                        const owner = teamMembers.find((m) => m.id === deliverable.ownerId)!;
                        return (
                          <DeliverableRow
                            key={deliverable.id}
                            deliverable={deliverable}
                            owner={owner}
                          />
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Workstream Progress */}
            <ProjectProgress />
          </div>

          {/* Right Column - 1/3 */}
          <div className="space-y-6">
            <UpcomingDeadlines />
            <RiskOverview />
            <RecentActivity />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
