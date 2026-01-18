/**
 * Kanban Board - Drag & Drop Deliverables by Status
 *
 * Features:
 * - Drag and drop between columns
 * - Smooth animations with framer-motion
 * - Auto-updates Dataverse when dropped
 * - Visual feedback during drag
 * - Column badges with counts
 */

import { useState, useMemo } from 'react';
import { motion, Reorder } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { GripVertical, Calendar, AlertTriangle, User } from 'lucide-react';
import { format } from 'date-fns';
import type { Deliverable, DeliverableStatus, TeamMember } from '@/types/lovable';

interface KanbanBoardProps {
  deliverables: Deliverable[];
  staff: TeamMember[];
  onStatusChange: (deliverableId: string, newStatus: DeliverableStatus) => Promise<void>;
}

const STATUSES: DeliverableStatus[] = [
  'Not Started',
  'In Progress',
  'Under Review',
  'Client Review',
  'Completed',
];

const STATUS_COLORS: Record<DeliverableStatus, string> = {
  'Not Started': 'bg-muted text-muted-foreground',
  'In Progress': 'bg-blue-100 text-blue-700 border-blue-200',
  'Under Review': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Client Review': 'bg-purple-100 text-purple-700 border-purple-200',
  'Completed': 'bg-green-100 text-green-700 border-green-200',
  'On Hold': 'bg-gray-100 text-gray-700 border-gray-200',
  'At Risk': 'bg-red-100 text-red-700 border-red-200',
};

const RISK_COLORS: Record<string, string> = {
  Low: 'text-green-600',
  Medium: 'text-yellow-600',
  High: 'text-orange-600',
  Critical: 'text-red-600',
};

// Deliverable Card Component
function DeliverableCard({
  deliverable,
  owner,
  isDragging,
}: {
  deliverable: Deliverable;
  owner?: TeamMember;
  isDragging?: boolean;
}) {
  const initials = owner?.name
    .split(' ')
    .map((n) => n[0])
    .join('') || '?';

  const isOverdue = new Date(deliverable.dueDate) < new Date() && deliverable.status !== 'Completed';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      className={`relative ${isDragging ? 'opacity-50' : ''}`}
    >
      <Card className="cursor-grab active:cursor-grabbing hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/50">
        <CardContent className="p-4">
          {/* Drag Handle */}
          <div className="flex items-start gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
            <div className="flex-1 space-y-3">
              {/* Title and Risk */}
              <div>
                <h4 className="font-semibold text-sm line-clamp-2">{deliverable.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="outline"
                    className={`text-xs ${RISK_COLORS[deliverable.risk]}`}
                  >
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {deliverable.risk}
                  </Badge>
                  {isOverdue && (
                    <Badge variant="destructive" className="text-xs">
                      Overdue
                    </Badge>
                  )}
                </div>
              </div>

              {/* Due Date */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{format(deliverable.dueDate, 'MMM d, yyyy')}</span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{deliverable.progress}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${deliverable.progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Owner */}
              {owner && (
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">{owner.name}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Kanban Column Component
function KanbanColumn({
  status,
  deliverables,
  staff,
  onStatusChange,
}: {
  status: DeliverableStatus;
  deliverables: Deliverable[];
  staff: TeamMember[];
  onStatusChange: (deliverableId: string, newStatus: DeliverableStatus) => Promise<void>;
}) {
  const [items, setItems] = useState(deliverables);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const staffMap = useMemo(() => new Map(staff.map(s => [s.id, s])), [staff]);

  const handleReorder = (newOrder: Deliverable[]) => {
    setItems(newOrder);
  };

  const handleDrop = async (deliverable: Deliverable) => {
    if (deliverable.status !== status) {
      try {
        await onStatusChange(deliverable.id, status);
      } catch (error) {
        console.error('Failed to update status:', error);
        // Revert on error
        setItems(deliverables);
      }
    }
    setIsDraggingOver(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex-shrink-0 w-80"
    >
      <Card
        className={`h-full transition-all duration-200 ${
          isDraggingOver ? 'border-primary border-2 shadow-lg' : 'border'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingOver(true);
        }}
        onDragLeave={() => setIsDraggingOver(false)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">{status}</CardTitle>
            <Badge variant="secondary" className={STATUS_COLORS[status]}>
              {deliverables.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
          <Reorder.Group
            axis="y"
            values={items}
            onReorder={handleReorder}
            className="space-y-3"
          >
            {items.map((deliverable) => (
              <Reorder.Item
                key={deliverable.id}
                value={deliverable}
                onDragEnd={() => handleDrop(deliverable)}
                className="list-none"
              >
                <DeliverableCard
                  deliverable={deliverable}
                  owner={staffMap.get(deliverable.ownerId)}
                />
              </Reorder.Item>
            ))}
          </Reorder.Group>

          {deliverables.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No deliverables
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Main Kanban Board Component
export function KanbanBoard({ deliverables, staff, onStatusChange }: KanbanBoardProps) {
  const deliverablesByStatus = useMemo(() => {
    return STATUSES.reduce((acc, status) => {
      acc[status] = deliverables.filter(d => d.status === status);
      return acc;
    }, {} as Record<DeliverableStatus, Deliverable[]>);
  }, [deliverables]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold">Kanban Board</h2>
        <p className="text-muted-foreground mt-1">
          Drag and drop deliverables to update their status
        </p>
      </div>

      {/* Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            deliverables={deliverablesByStatus[status]}
            staff={staff}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>
    </div>
  );
}
