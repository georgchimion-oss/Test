import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { teamMembers, workstreams, pods, skills, ptoRequests, deliverables } from '@/data/mockData';
import { Users, AlertTriangle, Calendar, TrendingUp, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format, isWithinInterval, addDays } from 'date-fns';
import { cn } from '@/lib/utils';

const Resources = () => {
  const [skillFilter, setSkillFilter] = useState<string>('all');
  const [workstreamFilter, setWorkstreamFilter] = useState<string>('all');

  // Calculate resource availability
  const today = new Date();
  const nextTwoWeeks = addDays(today, 14);

  const getUpcomingPTO = (userId: string) => {
    return ptoRequests.filter(
      (pto) =>
        pto.userId === userId &&
        pto.status === 'Approved' &&
        isWithinInterval(today, { start: pto.startDate, end: pto.endDate })
    );
  };

  const getWorkload = (userId: string) => {
    const assignedDeliverables = deliverables.filter(
      (d) => d.ownerId === userId && d.status !== 'Completed'
    );
    const subtasks = deliverables.flatMap((d) =>
      d.subtasks.filter((s) => s.assigneeId === userId && !s.completed)
    );
    return assignedDeliverables.length + subtasks.length;
  };

  const getAvailabilityLevel = (userId: string) => {
    const workload = getWorkload(userId);
    const onPTO = getUpcomingPTO(userId).length > 0;
    if (onPTO) return 'unavailable';
    if (workload > 4) return 'high';
    if (workload > 2) return 'medium';
    return 'low';
  };

  const availabilityColors = {
    low: 'bg-success/10 text-success border-success/20',
    medium: 'bg-warning/10 text-warning border-warning/20',
    high: 'bg-orange-100 text-orange-700 border-orange-200',
    unavailable: 'bg-muted text-muted-foreground',
  };

  const availabilityLabels = {
    low: 'Available',
    medium: 'Moderate',
    high: 'Busy',
    unavailable: 'On PTO',
  };

  // Filter team members
  const filteredMembers = teamMembers.filter((m) => {
    const matchesWorkstream =
      workstreamFilter === 'all' || m.workstreamId === workstreamFilter;
    const matchesSkill =
      skillFilter === 'all' || m.skills.includes(skillFilter);
    return matchesWorkstream && matchesSkill;
  });

  // Group by workstream
  const workstreamGroups = workstreams.map((ws) => ({
    ...ws,
    members: filteredMembers.filter((m) => m.workstreamId === ws.id),
  }));

  // Pod capacity analysis
  const podAnalysis = pods.map((pod) => {
    const podMembers = teamMembers.filter((m) => m.podId === pod.id);
    const availableCount = podMembers.filter(
      (m) => getAvailabilityLevel(m.id) === 'low'
    ).length;
    const onPTOCount = podMembers.filter((m) => getUpcomingPTO(m.id).length > 0).length;

    return {
      ...pod,
      totalMembers: podMembers.length,
      availableCount,
      onPTOCount,
      capacityPercent:
        podMembers.length > 0
          ? Math.round((availableCount / podMembers.length) * 100)
          : 0,
    };
  });

  // Light pods (less than 50% capacity)
  const lightPods = podAnalysis.filter((p) => p.capacityPercent < 50 && p.totalMembers > 0);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Resource Planning</h1>
            <p className="text-muted-foreground">
              View team availability and staffing
            </p>
          </div>
        </div>

        {/* Alerts */}
        {lightPods.length > 0 && (
          <Card className="shadow-card border-warning/30 bg-warning/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Capacity Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lightPods.map((pod) => {
                  const workstream = workstreams.find(
                    (ws) => ws.id === pod.workstreamId
                  )!;
                  const podMembers = teamMembers.filter((m) => m.podId === pod.id);
                  const onPTO = podMembers.filter(
                    (m) => getUpcomingPTO(m.id).length > 0
                  );

                  return (
                    <div key={pod.id} className="p-3 rounded-lg bg-card border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: workstream.color }}
                          />
                          <span className="font-medium">{pod.name}</span>
                          <span className="text-sm text-muted-foreground">
                            ({workstream.name})
                          </span>
                        </div>
                        <Badge variant="outline" className="bg-warning/10 text-warning">
                          {pod.capacityPercent}% capacity
                        </Badge>
                      </div>
                      {onPTO.length > 0 && (
                        <p className="text-sm text-muted-foreground mt-2">
                          On PTO: {onPTO.map((m) => m.name).join(', ')}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search by name..." className="pl-10" />
                </div>
              </div>
              <Select value={workstreamFilter} onValueChange={setWorkstreamFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Workstream" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Workstreams</SelectItem>
                  {workstreams.map((ws) => (
                    <SelectItem key={ws.id} value={ws.id}>
                      {ws.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={skillFilter} onValueChange={setSkillFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Skill" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Skills</SelectItem>
                  {skills.map((skill) => (
                    <SelectItem key={skill.id} value={skill.id}>
                      {skill.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Pod Capacity Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {podAnalysis
            .filter((p) => p.totalMembers > 0)
            .map((pod) => {
              const workstream = workstreams.find((ws) => ws.id === pod.workstreamId)!;

              return (
                <Card key={pod.id} className="shadow-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: workstream.color }}
                      />
                      <span className="font-medium text-sm truncate">{pod.name}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Capacity</span>
                        <span className="font-medium">{pod.capacityPercent}%</span>
                      </div>
                      <Progress value={pod.capacityPercent} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{pod.availableCount} available</span>
                        <span>{pod.totalMembers} total</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>

        {/* Team Members by Workstream */}
        <div className="space-y-6">
          {workstreamGroups
            .filter((ws) => ws.members.length > 0)
            .map((ws) => (
              <Card key={ws.id} className="shadow-card overflow-hidden">
                <div className="h-1" style={{ backgroundColor: ws.color }} />
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      {ws.name}
                    </CardTitle>
                    <Badge variant="secondary">{ws.members.length} members</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {ws.members.map((member) => {
                      const availability = getAvailabilityLevel(member.id);
                      const workload = getWorkload(member.id);
                      const memberSkills = skills.filter((s) =>
                        member.skills.includes(s.id)
                      );
                      const initials = member.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('');

                      return (
                        <div
                          key={member.id}
                          className="p-4 rounded-xl border hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{member.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {member.jobTitle}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className={cn('text-xs', availabilityColors[availability])}
                            >
                              {availabilityLabels[availability]}
                            </Badge>
                          </div>

                          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                            <TrendingUp className="h-3 w-3" />
                            <span>{workload} active items</span>
                          </div>

                          {memberSkills.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1">
                              {memberSkills.slice(0, 2).map((skill) => (
                                <Badge
                                  key={skill.id}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {skill.name}
                                </Badge>
                              ))}
                              {memberSkills.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{memberSkills.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Resources;
