import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { deliverables, teamMembers, workstreams } from '@/data/mockData';
import { format } from 'date-fns';
import { Plus, Search, Filter, MessageSquare, ListTodo, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Deliverable } from '@/types';

const statusColors: Record<string, string> = {
  'Not Started': 'bg-muted text-muted-foreground',
  'In Progress': 'bg-info/10 text-info border-info/20',
  'Under Review': 'bg-warning/10 text-warning border-warning/20',
  'Client Review': 'bg-purple-100 text-purple-700 border-purple-200',
  'Completed': 'bg-success/10 text-success border-success/20',
  'On Hold': 'bg-muted text-muted-foreground',
  'At Risk': 'bg-destructive/10 text-destructive border-destructive/20',
};

const riskColors: Record<string, string> = {
  Low: 'bg-success/10 text-success',
  Medium: 'bg-warning/10 text-warning',
  High: 'bg-orange-100 text-orange-700',
  Critical: 'bg-destructive/10 text-destructive',
};

const Deliverables = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [workstreamFilter, setWorkstreamFilter] = useState<string>('all');
  const [selectedDeliverable, setSelectedDeliverable] = useState<Deliverable | null>(null);

  const filteredDeliverables = deliverables.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    const matchesWorkstream =
      workstreamFilter === 'all' || d.workstreamId === workstreamFilter;
    return matchesSearch && matchesStatus && matchesWorkstream;
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Deliverables</h1>
            <p className="text-muted-foreground">
              Manage and track all project deliverables
            </p>
          </div>
          <Button className="gradient-primary text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" />
            New Deliverable
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
                    placeholder="Search deliverables..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Not Started">Not Started</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Under Review">Under Review</SelectItem>
                  <SelectItem value="Client Review">Client Review</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                  <SelectItem value="At Risk">At Risk</SelectItem>
                </SelectContent>
              </Select>
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
            </div>
          </CardContent>
        </Card>

        {/* Deliverables Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredDeliverables.map((deliverable) => {
            const owner = teamMembers.find((m) => m.id === deliverable.ownerId)!;
            const workstream = workstreams.find((w) => w.id === deliverable.workstreamId)!;
            const initials = owner.name
              .split(' ')
              .map((n) => n[0])
              .join('');

            return (
              <Card
                key={deliverable.id}
                className="shadow-card hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedDeliverable(deliverable)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{ backgroundColor: `${workstream.color}20`, color: workstream.color }}
                    >
                      {workstream.name}
                    </div>
                    <Badge
                      variant="secondary"
                      className={cn('font-medium', riskColors[deliverable.risk])}
                    >
                      {deliverable.risk}
                    </Badge>
                  </div>

                  <h3 className="font-semibold mb-2 line-clamp-2">{deliverable.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {deliverable.description}
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{deliverable.progress}%</span>
                    </div>
                    <Progress value={deliverable.progress} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{owner.name}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn('text-xs', statusColors[deliverable.status])}
                    >
                      {deliverable.status}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(deliverable.dueDate, 'MMM d, yyyy')}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <ListTodo className="h-3 w-3" />
                        {deliverable.subtasks.length}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {deliverable.comments.length}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Deliverable Detail Dialog */}
        <Dialog
          open={selectedDeliverable !== null}
          onOpenChange={(open) => !open && setSelectedDeliverable(null)}
        >
          {selectedDeliverable && (
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{selectedDeliverable.title}</DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Status and Risk */}
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className={cn('font-medium', statusColors[selectedDeliverable.status])}
                  >
                    {selectedDeliverable.status}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className={cn('font-medium', riskColors[selectedDeliverable.risk])}
                  >
                    {selectedDeliverable.risk} Risk
                  </Badge>
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-muted-foreground">{selectedDeliverable.description}</p>
                </div>

                {/* Key Dates */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Due Date</p>
                    <p className="font-medium">
                      {format(selectedDeliverable.dueDate, 'MMM d, yyyy')}
                    </p>
                  </div>
                  {selectedDeliverable.partnerReviewDate && (
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">Partner Review</p>
                      <p className="font-medium">
                        {format(selectedDeliverable.partnerReviewDate, 'MMM d, yyyy')}
                      </p>
                    </div>
                  )}
                  {selectedDeliverable.clientReviewDate && (
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">Client Review</p>
                      <p className="font-medium">
                        {format(selectedDeliverable.clientReviewDate, 'MMM d, yyyy')}
                      </p>
                    </div>
                  )}
                </div>

                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Progress</h4>
                    <span className="font-medium">{selectedDeliverable.progress}%</span>
                  </div>
                  <Progress value={selectedDeliverable.progress} className="h-3" />
                </div>

                {/* Subtasks */}
                <div>
                  <h4 className="font-medium mb-3">
                    Subtasks ({selectedDeliverable.subtasks.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedDeliverable.subtasks.map((subtask) => {
                      const assignee = teamMembers.find((m) => m.id === subtask.assigneeId);
                      return (
                        <div
                          key={subtask.id}
                          className="flex items-center justify-between p-3 rounded-lg border"
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={subtask.completed}
                              readOnly
                              className="h-4 w-4 rounded border-muted-foreground"
                            />
                            <span
                              className={cn(
                                subtask.completed && 'line-through text-muted-foreground'
                              )}
                            >
                              {subtask.title}
                            </span>
                          </div>
                          {assignee && (
                            <span className="text-sm text-muted-foreground">
                              {assignee.name}
                            </span>
                          )}
                        </div>
                      );
                    })}
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Subtask
                    </Button>
                  </div>
                </div>

                {/* Comments */}
                <div>
                  <h4 className="font-medium mb-3">
                    Comments ({selectedDeliverable.comments.length})
                  </h4>
                  <div className="space-y-3">
                    {selectedDeliverable.comments.map((comment) => {
                      const author = teamMembers.find((m) => m.id === comment.authorId);
                      const initials = author?.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('');
                      return (
                        <div key={comment.id} className="flex gap-3 p-3 rounded-lg bg-muted/30">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{author?.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {format(comment.createdAt, 'MMM d, yyyy')}
                              </span>
                            </div>
                            <p className="text-sm">{comment.content}</p>
                          </div>
                        </div>
                      );
                    })}
                    <div className="flex gap-3 mt-4">
                      <Textarea placeholder="Add a comment..." className="min-h-[80px]" />
                    </div>
                    <Button size="sm">Post Comment</Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          )}
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default Deliverables;
