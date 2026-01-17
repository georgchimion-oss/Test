import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ptoRequests, teamMembers, currentUser } from '@/data/mockData';
import { format, differenceInDays } from 'date-fns';
import { Plus, Calendar, User, Check, X, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PTOStatus } from '@/types';

const statusColors: Record<PTOStatus, string> = {
  Pending: 'bg-warning/10 text-warning border-warning/20',
  Approved: 'bg-success/10 text-success border-success/20',
  Rejected: 'bg-destructive/10 text-destructive border-destructive/20',
};

const PTO = () => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const isAdmin =
    currentUser.jobTitle === 'Partner' ||
    currentUser.jobTitle === 'Director' ||
    currentUser.jobTitle === 'Senior Manager';

  const filteredRequests = ptoRequests.filter((req) => {
    if (filter === 'all') return true;
    return req.status.toLowerCase() === filter;
  });

  // Get requests that need approval (for managers)
  const pendingApprovals = ptoRequests.filter((req) => {
    const requestor = teamMembers.find((m) => m.id === req.userId);
    return req.status === 'Pending' && requestor?.supervisorId === currentUser.id;
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">PTO Requests</h1>
            <p className="text-muted-foreground">
              Manage time off requests and approvals
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground">
                <Plus className="h-4 w-4 mr-2" />
                Request PTO
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request Time Off</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Start Date</label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">End Date</label>
                    <Input type="date" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Reason</label>
                  <Textarea placeholder="Reason for time off..." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Backup Person</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select backup..." />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers
                        .filter((m) => m.id !== currentUser.id)
                        .map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full gradient-primary text-primary-foreground">
                  Submit Request
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Pending Approvals (for managers) */}
        {isAdmin && pendingApprovals.length > 0 && (
          <Card className="shadow-card border-warning/30 bg-warning/5">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5 text-warning" />
                Pending Approvals ({pendingApprovals.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingApprovals.map((req) => {
                const requestor = teamMembers.find((m) => m.id === req.userId)!;
                const backup = teamMembers.find((m) => m.id === req.backupPersonId);
                const days = differenceInDays(req.endDate, req.startDate) + 1;
                const initials = requestor.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('');

                return (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl bg-card border flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{requestor.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(req.startDate, 'MMM d')} -{' '}
                          {format(req.endDate, 'MMM d, yyyy')} ({days} days)
                        </p>
                        {backup && (
                          <p className="text-xs text-muted-foreground">
                            Backup: {backup.name}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="text-destructive">
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                      <Button size="sm" className="bg-success text-success-foreground">
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Filter */}
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('pending')}
          >
            Pending
          </Button>
          <Button
            variant={filter === 'approved' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('approved')}
          >
            Approved
          </Button>
          <Button
            variant={filter === 'rejected' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('rejected')}
          >
            Rejected
          </Button>
        </div>

        {/* All Requests */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">All Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredRequests.map((req) => {
                const requestor = teamMembers.find((m) => m.id === req.userId)!;
                const backup = teamMembers.find((m) => m.id === req.backupPersonId);
                const approver = teamMembers.find((m) => m.id === req.approvedById);
                const days = differenceInDays(req.endDate, req.startDate) + 1;
                const initials = requestor.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('');

                return (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl border flex items-center justify-between hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{requestor.name}</p>
                          <Badge
                            variant="outline"
                            className={cn('text-xs', statusColors[req.status])}
                          >
                            {req.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {format(req.startDate, 'MMM d')} -{' '}
                            {format(req.endDate, 'MMM d, yyyy')}
                          </span>
                          <span>{days} days</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {req.reason}
                        </p>
                        {backup && (
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Backup: {backup.name}
                          </p>
                        )}
                      </div>
                    </div>
                    {approver && (
                      <div className="text-right text-sm text-muted-foreground">
                        <p>Approved by</p>
                        <p className="font-medium text-foreground">{approver.name}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default PTO;
