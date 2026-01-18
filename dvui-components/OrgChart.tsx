/**
 * Org Chart - Team Hierarchy Visualization
 *
 * Features:
 * - Interactive tree view
 * - Expandable/collapsible nodes
 * - Hover cards with details
 * - Color-coded by job title
 * - Workstream assignments
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Users, Briefcase } from 'lucide-react';
import type { TeamMember, Workstream } from '@/types/lovable';

interface OrgChartProps {
  staff: TeamMember[];
  workstreams: Workstream[];
}

const JOB_TITLE_COLORS: Record<string, string> = {
  'Partner': 'bg-purple-100 text-purple-700 border-purple-200',
  'Director': 'bg-blue-100 text-blue-700 border-blue-200',
  'Senior Manager': 'bg-cyan-100 text-cyan-700 border-cyan-200',
  'Manager': 'bg-green-100 text-green-700 border-green-200',
  'Senior Associate': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Associate': 'bg-orange-100 text-orange-700 border-orange-200',
  'Contractor': 'bg-gray-100 text-gray-700 border-gray-200',
};

// Staff Member Card
function StaffCard({
  member,
  workstream,
  reports,
  level = 0,
}: {
  member: TeamMember;
  workstream?: Workstream;
  reports: TeamMember[];
  level?: number;
}) {
  const [isExpanded, setIsExpanded] = useState(level < 2); // Auto-expand first 2 levels
  const [isHovered, setIsHovered] = useState(false);

  const initials = member.name
    .split(' ')
    .map((n) => n[0])
    .join('');

  const hasReports = reports.length > 0;

  return (
    <div className="relative">
      {/* Card */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: level * 0.1 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <Card
          className={`transition-all duration-200 ${
            isHovered ? 'shadow-lg border-primary/50' : ''
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {/* Expand/collapse button */}
              {hasReports && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              )}

              {/* Avatar */}
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{member.name}</div>
                <div className="text-xs text-muted-foreground truncate">{member.email}</div>
              </div>

              {/* Badges */}
              <div className="flex flex-col gap-1 items-end">
                <Badge
                  variant="outline"
                  className={`text-xs ${JOB_TITLE_COLORS[member.jobTitle]}`}
                >
                  {member.jobTitle}
                </Badge>
                {workstream && (
                  <Badge variant="secondary" className="text-xs">
                    {workstream.name}
                  </Badge>
                )}
                {hasReports && (
                  <Badge variant="outline" className="text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    {reports.length}
                  </Badge>
                )}
              </div>
            </div>

            {/* Skills (if hovered) */}
            <AnimatePresence>
              {isHovered && member.skills.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 pt-3 border-t"
                >
                  <div className="flex flex-wrap gap-1">
                    {member.skills.slice(0, 5).map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* Direct reports */}
      <AnimatePresence>
        {isExpanded && hasReports && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="ml-8 mt-3 space-y-3 border-l-2 border-muted pl-4"
          >
            {reports.map((report) => (
              <StaffNode
                key={report.id}
                member={report}
                staff={[]} // Will be filled by parent
                workstreams={[]}
                level={level + 1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Staff Node (recursively builds hierarchy)
function StaffNode({
  member,
  staff,
  workstreams,
  level = 0,
}: {
  member: TeamMember;
  staff: TeamMember[];
  workstreams: Workstream[];
  level?: number;
}) {
  const reports = useMemo(
    () => staff.filter(s => s.supervisorId === member.id),
    [staff, member.id]
  );

  const workstream = useMemo(
    () => workstreams.find(ws => ws.id === member.workstreamId),
    [workstreams, member.workstreamId]
  );

  return (
    <StaffCard
      member={member}
      workstream={workstream}
      reports={reports}
      level={level}
    />
  );
}

// Main Org Chart Component
export function OrgChart({ staff, workstreams }: OrgChartProps) {
  // Find top-level staff (no supervisor)
  const topLevel = useMemo(
    () => staff.filter(s => !s.supervisorId),
    [staff]
  );

  // Group by workstream
  const [groupBy, setGroupBy] = useState<'hierarchy' | 'workstream'>('hierarchy');

  const staffByWorkstream = useMemo(() => {
    const grouped: Record<string, TeamMember[]> = {};
    staff.forEach(s => {
      const wsName = workstreams.find(ws => ws.id === s.workstreamId)?.name || 'Unassigned';
      if (!grouped[wsName]) grouped[wsName] = [];
      grouped[wsName].push(s);
    });
    return grouped;
  }, [staff, workstreams]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Organization Chart</h2>
          <p className="text-muted-foreground mt-1">
            Team structure and reporting lines
          </p>
        </div>

        <div className="flex gap-2">
          <Badge
            variant={groupBy === 'hierarchy' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setGroupBy('hierarchy')}
          >
            <Briefcase className="h-3 w-3 mr-1" />
            Hierarchy
          </Badge>
          <Badge
            variant={groupBy === 'workstream' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setGroupBy('workstream')}
          >
            <Users className="h-3 w-3 mr-1" />
            Workstream
          </Badge>
        </div>
      </div>

      {/* Chart */}
      {groupBy === 'hierarchy' ? (
        <div className="space-y-4">
          {topLevel.map((member) => (
            <StaffNode
              key={member.id}
              member={member}
              staff={staff}
              workstreams={workstreams}
              level={0}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(staffByWorkstream).map(([wsName, wsStaff]) => (
            <div key={wsName}>
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: workstreams.find(ws => ws.name === wsName)?.color || '#gray',
                  }}
                />
                {wsName}
                <Badge variant="secondary">{wsStaff.length}</Badge>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {wsStaff.map((member) => (
                  <StaffCard
                    key={member.id}
                    member={member}
                    workstream={workstreams.find(ws => ws.id === member.workstreamId)}
                    reports={staff.filter(s => s.supervisorId === member.id)}
                    level={0}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{staff.length}</div>
              <div className="text-sm text-muted-foreground">Total Staff</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{workstreams.length}</div>
              <div className="text-sm text-muted-foreground">Workstreams</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">
                {staff.filter(s => s.isContractor).length}
              </div>
              <div className="text-sm text-muted-foreground">Contractors</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{topLevel.length}</div>
              <div className="text-sm text-muted-foreground">Leadership</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
