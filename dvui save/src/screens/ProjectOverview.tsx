import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Target,
  BarChart3,
  ArrowLeft,
  CalendarDays,
  CalendarClock,
  AlertCircle,
  MessageSquare,
  History,
  X,
  ChevronRight,
} from "lucide-react";
import Layout from '../components/Layout';
import { useGetDeliverables, useGetWorkstreams, useGetStaff } from "@/services/dataverseService";
import { getAuditLogs } from '../data/auditLayer';
import { format, isBefore, addDays, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

// Status mapping
const STATUS_LABELS: Record<number, string> = {
  0: 'Not Started',
  1: 'In Progress',
  2: 'Completed',
  3: 'On Hold',
  4: 'Deferred',
  5: 'Descoped',
};

const STATUS_COLORS: Record<number, string> = {
  0: '#94a3b8',
  1: '#3b82f6',
  2: '#10b981',
  3: '#f59e0b',
  4: '#6b7280',
  5: '#ef4444',
};

const RISK_LABELS: Record<number, string> = {
  0: 'Green',
  1: 'Amber',
  2: 'Red',
};

const RISK_COLORS: Record<number, string> = {
  0: '#10b981',
  1: '#f59e0b',
  2: '#ef4444',
};

// Animated counter component
const AnimatedCounter = ({ value, duration = 2000 }: { value: number; duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * value));
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <span>{count}</span>;
};

// KPI Card Component - INLINE STYLES ONLY
interface KPICardProps {
  icon: any;
  label: string;
  value: number;
  color: string;
  bgColor: string;
  onClick: () => void;
  isActive: boolean;
}

const KPICard = ({ icon: Icon, label, value, color, bgColor, onClick, isActive }: KPICardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.02, y: -5 }}
    whileTap={{ scale: 0.98 }}
    transition={{ duration: 0.3 }}
    onClick={onClick}
    style={{ cursor: 'pointer' }}
  >
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '16px',
        padding: '24px',
        border: `3px solid ${isActive ? color : 'transparent'}`,
        backgroundColor: bgColor,
        boxShadow: isActive ? `0 0 30px ${color}50` : '0 4px 20px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Decorative corner */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '100px',
        height: '100px',
        background: 'linear-gradient(225deg, rgba(255,255,255,0.15) 0%, transparent 50%)',
        borderBottomLeftRadius: '100%',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '14px', fontWeight: 500, marginBottom: '8px', opacity: 0.8, color: '#1a1a2e' }}>
            {label}
          </p>
          <p style={{ fontSize: '48px', fontWeight: 700, color: '#1a1a2e', lineHeight: 1 }}>
            <AnimatedCounter value={value} />
          </p>
        </div>
        <motion.div
          style={{
            padding: '14px',
            borderRadius: '14px',
            backgroundColor: color,
            boxShadow: `0 4px 15px ${color}50`,
          }}
          whileHover={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.5 }}
        >
          <Icon style={{ width: '28px', height: '28px', color: 'white' }} />
        </motion.div>
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        marginTop: '16px',
        fontSize: '13px',
        opacity: 0.7,
        color: '#1a1a2e',
      }}>
        <ChevronRight style={{ width: '16px', height: '16px' }} />
        <span>Click to view details</span>
      </div>
    </div>
  </motion.div>
);

// Deliverable List Item - INLINE STYLES
interface DeliverableListItemProps {
  deliverable: any;
  workstreams: any[];
  staff: any[];
  onClick: () => void;
}

const DeliverableListItem = ({ deliverable, workstreams, staff, onClick }: DeliverableListItemProps) => {
  // Match by workstream NAME (crda8_workstream contains name string, not ID)
  const deliverableWs = deliverable.crda8_workstream || '';
  const workstream = workstreams.find((w: any) => {
    const wsName = w.crda8_title || '';
    return deliverableWs.toLowerCase().includes(wsName.toLowerCase()) ||
           wsName.toLowerCase().includes(deliverableWs.toLowerCase());
  });
  const owner = staff.find((s: any) => s.crda8_staff4id === deliverable.crda8_owner);
  // If status is Completed (2), show 100%. Otherwise calculate from completion field.
  const isCompleted = deliverable.crda8_status === 2;
  const rawProgress = parseFloat(deliverable.crda8_completion_x0020__x0025_ || '0') || 0;
  const progress = isCompleted ? 100 : (rawProgress <= 1 ? Math.round(rawProgress * 100) : Math.round(rawProgress));
  // Due date field is crda8_targetdate in Dataverse, NOT crda8_duedate
  const dueDate = deliverable.crda8_targetdate ? new Date(deliverable.crda8_targetdate) : null;
  const isOverdue = dueDate && isBefore(dueDate, new Date()) && deliverable.crda8_status !== 2;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      whileHover={{ scale: 1.01, x: 5 }}
      onClick={onClick}
      style={{
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        backgroundColor: '#ffffff',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        marginBottom: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h4 style={{ fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {deliverable.crda8_title || 'Untitled'}
            </h4>
            {isOverdue && (
              <span style={{
                padding: '2px 8px',
                fontSize: '11px',
                fontWeight: 500,
                borderRadius: '20px',
                backgroundColor: '#fee2e2',
                color: '#dc2626',
              }}>
                Overdue
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', opacity: 0.7 }}>
            {workstream && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6' }} />
                {workstream.crda8_title}
              </span>
            )}
            {owner && <span>{owner.crda8_title}</span>}
            {dueDate && (
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: isOverdue ? '#dc2626' : 'inherit',
                fontWeight: isOverdue ? 500 : 400,
              }}>
                <CalendarDays style={{ width: '12px', height: '12px' }} />
                {format(dueDate, 'MMM d, yyyy')}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '13px', fontWeight: 500 }}>{progress}%</div>
            <div style={{
              width: '80px',
              height: '8px',
              borderRadius: '4px',
              backgroundColor: '#e5e7eb',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                borderRadius: '4px',
                width: `${progress}%`,
                backgroundColor: STATUS_COLORS[deliverable.crda8_status] || '#3b82f6',
                transition: 'width 0.5s ease',
              }} />
            </div>
          </div>
          <span style={{
            padding: '4px 10px',
            fontSize: '12px',
            fontWeight: 500,
            borderRadius: '20px',
            backgroundColor: `${STATUS_COLORS[deliverable.crda8_status]}20`,
            color: STATUS_COLORS[deliverable.crda8_status],
          }}>
            {STATUS_LABELS[deliverable.crda8_status] || 'Unknown'}
          </span>
          <ChevronRight style={{ width: '20px', height: '20px', opacity: 0.5 }} />
        </div>
      </div>
    </motion.div>
  );
};

// Deliverable Detail Modal - INLINE STYLES
interface DeliverableDetailProps {
  deliverable: any;
  workstreams: any[];
  staff: any[];
  onClose: () => void;
}

const DeliverableDetail = ({ deliverable, workstreams, staff, onClose }: DeliverableDetailProps) => {
  // Match by workstream NAME (crda8_workstream contains name string, not ID)
  const deliverableWs = deliverable.crda8_workstream || '';
  const workstream = workstreams.find((w: any) => {
    const wsName = w.crda8_title || '';
    return deliverableWs.toLowerCase().includes(wsName.toLowerCase()) ||
           wsName.toLowerCase().includes(deliverableWs.toLowerCase());
  });
  const owner = staff.find((s: any) => s.crda8_staff4id === deliverable.crda8_owner);
  // If status is Completed (2), show 100%. Otherwise calculate from completion field.
  const isCompleted = deliverable.crda8_status === 2;
  const rawProgress = parseFloat(deliverable.crda8_completion_x0020__x0025_ || '0') || 0;
  const progress = isCompleted ? 100 : (rawProgress <= 1 ? Math.round(rawProgress * 100) : Math.round(rawProgress));
  // Due date field is crda8_targetdate in Dataverse, NOT crda8_duedate
  const dueDate = deliverable.crda8_targetdate ? new Date(deliverable.crda8_targetdate) : null;

  const auditLogs = useMemo(() => {
    const allLogs = getAuditLogs() as any[];
    return allLogs
      .filter((log: any) => log.entityId === deliverable.crda8_deliverablesid)
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20);
  }, [deliverable.crda8_deliverablesid]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(0,0,0,0.5)',
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '640px',
          maxHeight: '90vh',
          overflow: 'hidden',
          borderRadius: '16px',
          backgroundColor: '#ffffff',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        }}
      >
        {/* Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
                {deliverable.crda8_title || 'Untitled'}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{
                  padding: '4px 12px',
                  fontSize: '13px',
                  fontWeight: 500,
                  borderRadius: '20px',
                  backgroundColor: `${STATUS_COLORS[deliverable.crda8_status]}20`,
                  color: STATUS_COLORS[deliverable.crda8_status],
                }}>
                  {STATUS_LABELS[deliverable.crda8_status] || 'Unknown'}
                </span>
                <span style={{
                  padding: '4px 12px',
                  fontSize: '13px',
                  fontWeight: 500,
                  borderRadius: '20px',
                  backgroundColor: `${RISK_COLORS[deliverable.crda8_risk]}20`,
                  color: RISK_COLORS[deliverable.crda8_risk],
                }}>
                  Risk: {RISK_LABELS[deliverable.crda8_risk] || 'Unknown'}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                padding: '8px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
              }}
            >
              <X style={{ width: '20px', height: '20px' }} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', overflowY: 'auto', maxHeight: 'calc(90vh - 200px)' }}>
          {/* Info Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#f3f4f6' }}>
              <div style={{ fontSize: '13px', opacity: 0.7, marginBottom: '4px' }}>Workstream</div>
              <div style={{ fontWeight: 500 }}>{workstream?.crda8_title || 'Unassigned'}</div>
            </div>
            <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#f3f4f6' }}>
              <div style={{ fontSize: '13px', opacity: 0.7, marginBottom: '4px' }}>Owner</div>
              <div style={{ fontWeight: 500 }}>{owner?.crda8_title || 'Unassigned'}</div>
            </div>
            <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#f3f4f6' }}>
              <div style={{ fontSize: '13px', opacity: 0.7, marginBottom: '4px' }}>Due Date</div>
              <div style={{ fontWeight: 500 }}>{dueDate ? format(dueDate, 'MMM d, yyyy') : 'No due date'}</div>
            </div>
            <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#f3f4f6' }}>
              <div style={{ fontSize: '13px', opacity: 0.7, marginBottom: '4px' }}>Progress</div>
              <div style={{ fontWeight: 500 }}>{progress}%</div>
              <div style={{
                width: '100%',
                height: '8px',
                borderRadius: '4px',
                backgroundColor: '#e5e7eb',
                marginTop: '4px',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  borderRadius: '4px',
                  width: `${progress}%`,
                  backgroundColor: STATUS_COLORS[deliverable.crda8_status] || '#3b82f6',
                }} />
              </div>
            </div>
          </div>

          {/* Comment */}
          {deliverable.crda8_comment && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <MessageSquare style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
                <h3 style={{ fontWeight: 600, margin: 0 }}>Latest Comment</h3>
              </div>
              <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#f3f4f6' }}>
                {deliverable.crda8_comment}
              </div>
            </div>
          )}

          {/* History */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <History style={{ width: '20px', height: '20px', color: '#8b5cf6' }} />
              <h3 style={{ fontWeight: 600, margin: 0 }}>Activity History</h3>
            </div>
            {auditLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', opacity: 0.5 }}>
                No activity recorded yet
              </div>
            ) : (
              <div>
                {auditLogs.map((log: any, index: number) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '12px',
                      borderRadius: '8px',
                      backgroundColor: '#f3f4f6',
                      marginBottom: '8px',
                    }}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: 'white',
                      backgroundColor: '#3b82f6',
                      flexShrink: 0,
                    }}>
                      {(log.userName || 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 500, fontSize: '13px' }}>{log.userName || 'Unknown'}</span>
                        <span style={{ fontSize: '12px', opacity: 0.5 }}>
                          {format(new Date(log.timestamp), 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', opacity: 0.7 }}>
                        {log.action}
                        {log.details && <span style={{ display: 'block', fontSize: '12px', marginTop: '4px' }}>{log.details}</span>}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Workstream Progress Bar - INLINE STYLES
interface WorkstreamBarProps {
  name: string;
  progress: number;
  delay: number;
  color: string;
}

const WorkstreamBar = ({ name, progress, delay, color }: WorkstreamBarProps) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.5 }}
    style={{ marginBottom: '16px' }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
      <span style={{ fontSize: '14px', fontWeight: 500 }}>{name}</span>
      <span style={{ fontSize: '14px', opacity: 0.7 }}>{progress}%</span>
    </div>
    <div style={{ height: '10px', borderRadius: '5px', backgroundColor: '#e5e7eb', overflow: 'hidden' }}>
      <motion.div
        style={{ height: '100%', borderRadius: '5px', backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ delay: delay + 0.3, duration: 1, ease: "easeOut" }}
      />
    </div>
  </motion.div>
);

// Stat Card - INLINE STYLES
interface StatCardProps {
  icon: any;
  label: string;
  value: number | string;
  color: string;
  delay: number;
}

const StatCard = ({ icon: Icon, label, value, color, delay }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    style={{
      padding: '24px',
      borderRadius: '16px',
      backgroundColor: '#ffffff',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
      <Icon style={{ width: '20px', height: '20px', color }} />
      <span style={{ fontSize: '14px', opacity: 0.7 }}>{label}</span>
    </div>
    <div style={{ fontSize: '32px', fontWeight: 700 }}>
      {typeof value === 'number' ? <AnimatedCounter value={value} /> : value}
    </div>
  </motion.div>
);

// Main Component
const ProjectOverview = () => {
  const { data: deliverables = [], isLoading: isLoadingDeliverables } = useGetDeliverables();
  const { data: workstreams = [], isLoading: isLoadingWorkstreams } = useGetWorkstreams();
  const { data: staff = [], isLoading: isLoadingStaff } = useGetStaff();

  const isLoading = isLoadingDeliverables || isLoadingWorkstreams || isLoadingStaff;

  const [activeKPI, setActiveKPI] = useState<'month' | 'twoWeeks' | 'late' | null>(null);
  const [selectedDeliverable, setSelectedDeliverable] = useState<any | null>(null);

  const today = new Date();
  const twoWeeksFromNow = addDays(today, 14);
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);

  const kpiData = useMemo(() => {
    // Due date field is crda8_targetdate in Dataverse, NOT crda8_duedate
    const dueThisMonth = (deliverables as any[]).filter((d: any) => {
      if (d.crda8_status === 2) return false; // Exclude completed
      if (!d.crda8_targetdate) return false;
      const dueDate = new Date(d.crda8_targetdate);
      return isWithinInterval(dueDate, { start: monthStart, end: monthEnd });
    });

    const dueNextTwoWeeks = (deliverables as any[]).filter((d: any) => {
      if (d.crda8_status === 2) return false; // Exclude completed
      if (!d.crda8_targetdate) return false;
      const dueDate = new Date(d.crda8_targetdate);
      return isWithinInterval(dueDate, { start: today, end: twoWeeksFromNow });
    });

    const lateDeliverables = (deliverables as any[]).filter((d: any) => {
      if (d.crda8_status === 2) return false; // Exclude completed
      if (!d.crda8_targetdate) return false;
      const dueDate = new Date(d.crda8_targetdate);
      return isBefore(dueDate, today);
    });

    return {
      month: dueThisMonth,
      twoWeeks: dueNextTwoWeeks,
      late: lateDeliverables,
    };
  }, [deliverables, today, twoWeeksFromNow, monthStart, monthEnd]);

  const currentList = activeKPI ? kpiData[activeKPI] : [];
  const currentTitle = activeKPI === 'month'
    ? 'Due This Month'
    : activeKPI === 'twoWeeks'
    ? 'Due Next 2 Weeks'
    : activeKPI === 'late'
    ? 'Overdue Deliverables'
    : '';

  const totalDeliverables = deliverables.length;
  const completedDeliverables = (deliverables as any[]).filter((d: any) => d.crda8_status === 2).length;
  const atRiskCount = (deliverables as any[]).filter((d: any) => d.crda8_risk === 2).length;
  const overallProgress = totalDeliverables > 0
    ? Math.round((deliverables as any[]).reduce((acc: number, d: any) => {
        // If completed, count as 100%
        if (d.crda8_status === 2) return acc + 100;
        const raw = parseFloat(d.crda8_completion_x0020__x0025_ || '0') || 0;
        return acc + (raw <= 1 ? raw * 100 : raw);
      }, 0) / totalDeliverables)
    : 0;

  // Same 20 colors as dataLayer.ts for consistency
  const workstreamColors = [
    '#D04A02', '#2563eb', '#059669', '#7c3aed', '#dc2626',
    '#0891b2', '#ca8a04', '#be185d', '#4f46e5', '#65a30d',
    '#0d9488', '#9333ea', '#ea580c', '#2dd4bf', '#c026d3',
    '#16a34a', '#0284c7', '#d97706', '#7c3aed', '#64748b'
  ];

  // Sort workstreams alphabetically to match dataLayer color assignment
  const sortedWorkstreams = [...(workstreams as any[])].sort((a, b) =>
    (a.crda8_title || '').localeCompare(b.crda8_title || '')
  );

  return (
    <Layout title="Project Overview">
      <div style={{
        minHeight: '100vh',
        padding: '24px',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      }}>
        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '24px' }}
        >
          <p style={{ fontSize: '15px', opacity: 0.7, color: '#1a1a2e', margin: 0 }}>
            Track deliverables and project health at a glance
          </p>
        </motion.div>

        {/* KPI Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          <KPICard
            icon={CalendarDays}
            label="Due This Month"
            value={kpiData.month.length}
            color="#3b82f6"
            bgColor="rgba(59, 130, 246, 0.15)"
            onClick={() => setActiveKPI(activeKPI === 'month' ? null : 'month')}
            isActive={activeKPI === 'month'}
          />
          <KPICard
            icon={CalendarClock}
            label="Due Next 2 Weeks"
            value={kpiData.twoWeeks.length}
            color="#f59e0b"
            bgColor="rgba(245, 158, 11, 0.15)"
            onClick={() => setActiveKPI(activeKPI === 'twoWeeks' ? null : 'twoWeeks')}
            isActive={activeKPI === 'twoWeeks'}
          />
          <KPICard
            icon={AlertCircle}
            label="Overdue"
            value={kpiData.late.length}
            color="#ef4444"
            bgColor="rgba(239, 68, 68, 0.15)"
            onClick={() => setActiveKPI(activeKPI === 'late' ? null : 'late')}
            isActive={activeKPI === 'late'}
          />
        </div>

        {/* Drill-down List */}
        <AnimatePresence>
          {activeKPI && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ marginBottom: '32px', overflow: 'hidden' }}
            >
              <div style={{
                borderRadius: '16px',
                padding: '24px',
                backgroundColor: '#ffffff',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                      onClick={() => setActiveKPI(null)}
                      style={{
                        padding: '8px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: '#f3f4f6',
                        cursor: 'pointer',
                      }}
                    >
                      <ArrowLeft style={{ width: '20px', height: '20px' }} />
                    </button>
                    <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>{currentTitle}</h2>
                    <span style={{
                      padding: '4px 12px',
                      fontSize: '13px',
                      fontWeight: 500,
                      borderRadius: '20px',
                      backgroundColor: '#f3f4f6',
                    }}>
                      {currentList.length} items
                    </span>
                  </div>
                </div>

                {currentList.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '48px', opacity: 0.5 }}>
                    <CheckCircle2 style={{ width: '48px', height: '48px', margin: '0 auto 12px' }} />
                    <p>No deliverables in this category</p>
                  </div>
                ) : (
                  <div>
                    {currentList.map((deliverable: any) => (
                      <DeliverableListItem
                        key={deliverable.crda8_deliverablesid}
                        deliverable={deliverable}
                        workstreams={workstreams as any[]}
                        staff={staff as any[]}
                        onClick={() => setSelectedDeliverable(deliverable)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          <StatCard icon={Target} label="Total Deliverables" value={totalDeliverables} color="#D04A02" delay={0.1} />
          <StatCard icon={CheckCircle2} label="Completed" value={completedDeliverables} color="#10b981" delay={0.2} />
          <StatCard icon={AlertTriangle} label="At Risk" value={atRiskCount} color="#ef4444" delay={0.3} />
          <StatCard icon={TrendingUp} label="Overall Progress" value={`${overallProgress}%`} color="#3b82f6" delay={0.4} />
        </div>

        {/* Workstream Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            padding: '24px',
            borderRadius: '16px',
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <BarChart3 style={{ width: '20px', height: '20px', color: '#D04A02' }} />
            <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Workstream Progress</h2>
          </div>
          <div>
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '16px', opacity: 0.5 }}>Loading...</div>
            ) : (
              sortedWorkstreams.map((ws: any, index: number) => {
                // Match by workstream NAME (crda8_workstream contains name string, not ID)
                const wsName = ws.crda8_title || '';
                const wsDeliverables = (deliverables as any[]).filter((d: any) => {
                  const deliverableWs = d.crda8_workstream || '';
                  // Case-insensitive partial match (handles slight naming differences)
                  return deliverableWs.toLowerCase().includes(wsName.toLowerCase()) ||
                         wsName.toLowerCase().includes(deliverableWs.toLowerCase());
                });
                const wsProgress = wsDeliverables.length > 0
                  ? Math.round(wsDeliverables.reduce((acc: number, d: any) => {
                      // If completed, count as 100%
                      if (d.crda8_status === 2) return acc + 100;
                      const raw = parseFloat(d.crda8_completion_x0020__x0025_ || '0') || 0;
                      return acc + (raw <= 1 ? raw * 100 : raw);
                    }, 0) / wsDeliverables.length)
                  : 0;

                return (
                  <WorkstreamBar
                    key={ws.crda8_workstreamsid}
                    name={ws.crda8_title || 'Untitled'}
                    progress={wsProgress}
                    delay={index * 0.1}
                    color={workstreamColors[index % workstreamColors.length]}
                  />
                );
              })
            )}
          </div>
        </motion.div>

        {/* Detail Modal */}
        <AnimatePresence>
          {selectedDeliverable && (
            <DeliverableDetail
              deliverable={selectedDeliverable}
              workstreams={workstreams as any[]}
              staff={staff as any[]}
              onClose={() => setSelectedDeliverable(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default ProjectOverview;
