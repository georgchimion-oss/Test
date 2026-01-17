import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { teamMembers, workstreams, skills } from '@/data/mockData';
import { Search, Mail, User2, Filter } from 'lucide-react';

const jobTitleColors: Record<string, string> = {
  Partner: 'bg-primary text-primary-foreground',
  Director: 'bg-info text-info-foreground',
  'Senior Manager': 'bg-success text-success-foreground',
  Manager: 'bg-warning text-warning-foreground',
  'Senior Associate': 'bg-purple-500 text-white',
  Associate: 'bg-muted text-muted-foreground',
  Contractor: 'bg-orange-500 text-white',
};

const Team = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [workstreamFilter, setWorkstreamFilter] = useState<string>('all');
  const [titleFilter, setTitleFilter] = useState<string>('all');

  const filteredMembers = teamMembers.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesWorkstream =
      workstreamFilter === 'all' || m.workstreamId === workstreamFilter;
    const matchesTitle = titleFilter === 'all' || m.jobTitle === titleFilter;
    return matchesSearch && matchesWorkstream && matchesTitle;
  });

  const uniqueTitles = [...new Set(teamMembers.map((m) => m.jobTitle))];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Team Directory</h1>
            <p className="text-muted-foreground">
              View and manage team members ({teamMembers.length} people)
            </p>
          </div>
          <Button className="gradient-primary text-primary-foreground">
            <User2 className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </div>

        {/* Filters */}
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
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
              <Select value={titleFilter} onValueChange={setTitleFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Job Title" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Titles</SelectItem>
                  {uniqueTitles.map((title) => (
                    <SelectItem key={title} value={title}>
                      {title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMembers.map((member) => {
            const supervisor = teamMembers.find((m) => m.id === member.supervisorId);
            const workstream = workstreams.find((w) => w.id === member.workstreamId);
            const memberSkills = skills.filter((s) =>
              member.skills.includes(s.id)
            );
            const initials = member.name
              .split(' ')
              .map((n) => n[0])
              .join('');

            return (
              <Card key={member.id} className="shadow-card hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{member.name}</h3>
                      <Badge
                        variant="secondary"
                        className={`mt-1 text-xs ${jobTitleColors[member.jobTitle]}`}
                      >
                        {member.jobTitle}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      <span className="truncate">{member.email}</span>
                    </div>

                    {workstream && (
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: workstream.color }}
                        />
                        <span className="text-muted-foreground">{workstream.name}</span>
                      </div>
                    )}

                    {supervisor && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User2 className="h-3.5 w-3.5" />
                        <span>Reports to {supervisor.name}</span>
                      </div>
                    )}
                  </div>

                  {memberSkills.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1">
                      {memberSkills.slice(0, 3).map((skill) => (
                        <Badge key={skill.id} variant="outline" className="text-xs">
                          {skill.name}
                        </Badge>
                      ))}
                      {memberSkills.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{memberSkills.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {member.isContractor && (
                    <Badge variant="secondary" className="mt-3 bg-orange-100 text-orange-700">
                      Contractor
                    </Badge>
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

export default Team;
