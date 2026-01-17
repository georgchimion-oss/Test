import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { workstreams, teamMembers, deliverables, pods } from '@/data/mockData';
import { Users, ListChecks, TrendingUp } from 'lucide-react';

const Workstreams = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Workstreams</h1>
          <p className="text-muted-foreground">
            View and manage project workstreams and pods
          </p>
        </div>

        {/* Workstreams Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {workstreams.map((workstream) => {
            const leader = teamMembers.find((m) => m.id === workstream.leaderId);
            const wsDeliverables = deliverables.filter((d) => d.workstreamId === workstream.id);
            const wsMembers = teamMembers.filter((m) => m.workstreamId === workstream.id);
            const wsPods = pods.filter((p) => p.workstreamId === workstream.id);
            const avgProgress =
              wsDeliverables.length > 0
                ? Math.round(
                    wsDeliverables.reduce((sum, d) => sum + d.progress, 0) /
                      wsDeliverables.length
                  )
                : 0;
            const completedCount = wsDeliverables.filter(
              (d) => d.status === 'Completed'
            ).length;

            const leaderInitials = leader?.name
              .split(' ')
              .map((n) => n[0])
              .join('');

            return (
              <Card key={workstream.id} className="shadow-card overflow-hidden">
                <div
                  className="h-2"
                  style={{ backgroundColor: workstream.color }}
                />
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{workstream.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {workstream.description}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      style={{
                        backgroundColor: `${workstream.color}20`,
                        color: workstream.color,
                      }}
                    >
                      {wsPods.length} Pods
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Leader */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {leaderInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{leader?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {leader?.jobTitle} • Lead
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg border text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-xl font-bold">{wsMembers.length}</p>
                      <p className="text-xs text-muted-foreground">Team</p>
                    </div>
                    <div className="p-3 rounded-lg border text-center">
                      <div className="flex items-center justify-center mb-1">
                        <ListChecks className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-xl font-bold">{wsDeliverables.length}</p>
                      <p className="text-xs text-muted-foreground">Deliverables</p>
                    </div>
                    <div className="p-3 rounded-lg border text-center">
                      <div className="flex items-center justify-center mb-1">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-xl font-bold">{completedCount}</p>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Overall Progress</span>
                      <span className="font-medium">{avgProgress}%</span>
                    </div>
                    <Progress
                      value={avgProgress}
                      className="h-2"
                      style={
                        {
                          '--progress-foreground': workstream.color,
                        } as React.CSSProperties
                      }
                    />
                  </div>

                  {/* Pods */}
                  {wsPods.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Pods</p>
                      <div className="flex flex-wrap gap-2">
                        {wsPods.map((pod) => {
                          const podLead = teamMembers.find((m) => m.id === pod.leaderId);
                          return (
                            <div
                              key={pod.id}
                              className="px-3 py-1.5 rounded-full bg-muted text-sm"
                            >
                              {pod.name}
                              <span className="text-muted-foreground ml-1">
                                ({podLead?.name.split(' ')[0]})
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
};

export default Workstreams;
