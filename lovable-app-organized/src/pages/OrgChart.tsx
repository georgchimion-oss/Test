import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { teamMembers } from '@/data/mockData';
import { TeamMember } from '@/types';

const OrgChart = () => {
  // Find the partner (top of hierarchy)
  const partner = teamMembers.find((m) => m.jobTitle === 'Partner');

  // Get direct reports
  const getDirectReports = (supervisorId: string): TeamMember[] => {
    return teamMembers.filter((m) => m.supervisorId === supervisorId);
  };

  const jobTitleColors: Record<string, string> = {
    Partner: 'bg-primary text-primary-foreground',
    Director: 'bg-info text-info-foreground',
    'Senior Manager': 'bg-success text-success-foreground',
    Manager: 'bg-warning text-warning-foreground',
    'Senior Associate': 'bg-purple-500 text-white',
    Associate: 'bg-muted text-muted-foreground',
    Contractor: 'bg-orange-500 text-white',
  };

  interface PersonCardProps {
    person: TeamMember;
    showReports?: boolean;
  }

  const PersonCard = ({ person, showReports = true }: PersonCardProps) => {
    const initials = person.name
      .split(' ')
      .map((n) => n[0])
      .join('');
    const reports = getDirectReports(person.id);

    return (
      <div className="flex flex-col items-center">
        <Card className="shadow-card w-48 hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <Avatar className="h-12 w-12 mx-auto mb-2">
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <p className="font-medium text-sm">{person.name}</p>
            <Badge
              variant="secondary"
              className={`mt-2 text-xs ${jobTitleColors[person.jobTitle]}`}
            >
              {person.jobTitle}
            </Badge>
            {person.isContractor && (
              <Badge variant="outline" className="mt-1 text-xs">
                Contractor
              </Badge>
            )}
          </CardContent>
        </Card>

        {showReports && reports.length > 0 && (
          <>
            {/* Connector line */}
            <div className="w-px h-6 bg-border" />
            <div className="relative">
              {/* Horizontal line */}
              {reports.length > 1 && (
                <div
                  className="absolute top-0 left-1/2 h-px bg-border"
                  style={{
                    width: `calc(${(reports.length - 1) * 208}px)`,
                    transform: 'translateX(-50%)',
                  }}
                />
              )}
              <div className="flex gap-4 pt-6">
                {reports.map((report) => (
                  <div key={report.id} className="relative">
                    {/* Vertical connector from horizontal line */}
                    <div className="absolute left-1/2 -top-6 w-px h-6 bg-border" />
                    <PersonCard
                      person={report}
                      showReports={
                        report.jobTitle !== 'Associate' &&
                        report.jobTitle !== 'Senior Associate' &&
                        report.jobTitle !== 'Contractor'
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Organization Chart</h1>
          <p className="text-muted-foreground">
            Project team hierarchy and reporting structure
          </p>
        </div>

        {/* Legend */}
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3">
              {Object.entries(jobTitleColors).map(([title, color]) => (
                <Badge key={title} className={color}>
                  {title}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Org Chart */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>TD Bank Project Team</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto pb-8">
            <div className="min-w-max flex justify-center py-6">
              {partner && <PersonCard person={partner} />}
            </div>
          </CardContent>
        </Card>

        {/* Team Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(
            teamMembers.reduce((acc, m) => {
              acc[m.jobTitle] = (acc[m.jobTitle] || 0) + 1;
              return acc;
            }, {} as Record<string, number>)
          ).map(([title, count]) => (
            <Card key={title} className="shadow-card">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-sm text-muted-foreground">{title}s</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default OrgChart;
