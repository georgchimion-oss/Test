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

// Floating orb component
const FloatingOrb = ({ delay, size, color, position }: { delay: number; size: number; color: string; position: { x: string; y: string } }) => (
  <motion.div
    className={`absolute rounded-full blur-3xl opacity-20 ${color}`}
    style={{ width: size, height: size, left: position.x, top: position.y }}
    animate={{
      y: [0, -30, 0],
      x: [0, 20, 0],
      scale: [1, 1.1, 1],
    }}
    transition={{
      duration: 8,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

// KPI Card Component
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
    className="group relative cursor-pointer"
  >
    <div
      className={`absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`}
      style={{ backgroundColor: color }}
    />
    <div
      className={`relative overflow-hidden rounded-2xl p-6 border-2 transition-all duration-300`}
      style={{
        backgroundColor: bgColor,
        borderColor: isActive ? color : 'transparent',
        boxShadow: isActive ? `0 0 20px ${color}40` : 'none',
      }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/10 to-transparent rounded-bl-full" />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium mb-2 opacity-80">{label}</p>
          <p className="text-4xl font-bold">
            <AnimatedCounter value={value} />
          </p>
        </div>
        <motion.div
          className="p-3 rounded-xl"
          style={{ backgroundColor: color }}
          whileHover={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.5 }}
        >
          <Icon className="w-6 h-6 text-white" />
        </motion.div>
      </div>
      <div className="flex items-center gap-1 mt-3 text-sm opacity-70">
        <ChevronRight className="w-4 h-4" />
        <span>Click to view details</span>
      </div>
    </div>
  </motion.div>
);

// Deliverable List Item
interface DeliverableListItemProps {
  deliverable: any;
  workstreams: any[];
  staff: any[];
  onClick: () => void;
}

const DeliverableListItem = ({ deliverable, workstreams, staff, onClick }: DeliverableListItemProps) => {
  const workstream = workstreams.find((w: any) => w.crda8_workstreamsid === deliverable.crda8_workstream);
  const owner = staff.find((s: any) => s.crda8_staff4id === deliverable.crda8_owner);
  const progress = parseInt(deliverable.crda8_completion_x0020__x0025_ || '0') || 0;
  const dueDate = deliverable.crda8_duedate ? new Date(deliverable.crda8_duedate) : null;
  const isOverdue = dueDate && isBefore(dueDate, new Date()) && deliverable.crda8_status !== 2;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      whileHover={{ scale: 1.01, x: 5 }}
      onClick={onClick}
      className="p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-lg"
      style={{
        backgroundColor: 'var(--card-bg, #ffffff)',
        borderColor: 'var(--border, #e5e7eb)',
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold truncate">{deliverable.crda8_title || 'Untitled'}</h4>
            {isOverdue && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700">
                Overdue
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm opacity-70">
            {workstream && (
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#3b82f6' }} />
                {workstream.crda8_title}
              </span>
            )}
            {owner && (
              <span>{owner.crda8_title}</span>
            )}
            {dueDate && (
              <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
                <CalendarDays className="w-3 h-3" />
                {format(dueDate, 'MMM d, yyyy')}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-medium">{progress}%</div>
            <div className="w-20 h-2 rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progress}%`,
                  backgroundColor: STATUS_COLORS[deliverable.crda8_status] || '#3b82f6',
                }}
              />
            </div>
          </div>
          <span
            className="px-2 py-1 text-xs font-medium rounded-full"
            style={{
              backgroundColor: `${STATUS_COLORS[deliverable.crda8_status]}20`,
              color: STATUS_COLORS[deliverable.crda8_status],
            }}
          >
            {STATUS_LABELS[deliverable.crda8_status] || 'Unknown'}
          </span>
          <ChevronRight className="w-5 h-5 opacity-50" />
        </div>
      </div>
    </motion.div>
  );
};

// Deliverable Detail Modal
interface DeliverableDetailProps {
  deliverable: any;
  workstreams: any[];
  staff: any[];
  onClose: () => void;
}

const DeliverableDetail = ({ deliverable, workstreams, staff, onClose }: DeliverableDetailProps) => {
  const workstream = workstreams.find((w: any) => w.crda8_workstreamsid === deliverable.crda8_workstream);
  const owner = staff.find((s: any) => s.crda8_staff4id === deliverable.crda8_owner);
  const progress = parseInt(deliverable.crda8_completion_x0020__x0025_ || '0') || 0;
  const dueDate = deliverable.crda8_duedate ? new Date(deliverable.crda8_duedate) : null;

  // Get audit logs for this deliverable
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl"
        style={{ backgroundColor: 'var(--card-bg, #ffffff)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b" style={{ borderColor: 'var(--border, #e5e7eb)' }}>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">{deliverable.crda8_title || 'Untitled'}</h2>
              <div className="flex items-center gap-3">
                <span
                  className="px-3 py-1 text-sm font-medium rounded-full"
                  style={{
                    backgroundColor: `${STATUS_COLORS[deliverable.crda8_status]}20`,
                    color: STATUS_COLORS[deliverable.crda8_status],
                  }}
                >
                  {STATUS_LABELS[deliverable.crda8_status] || 'Unknown'}
                </span>
                <span
                  className="px-3 py-1 text-sm font-medium rounded-full"
                  style={{
                    backgroundColor: `${RISK_COLORS[deliverable.crda8_risk]}20`,
                    color: RISK_COLORS[deliverable.crda8_risk],
                  }}
                >
                  Risk: {RISK_LABELS[deliverable.crda8_risk] || 'Unknown'}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary, #f3f4f6)' }}>
              <div className="text-sm opacity-70 mb-1">Workstream</div>
              <div className="font-medium">{workstream?.crda8_title || 'Unassigned'}</div>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary, #f3f4f6)' }}>
              <div className="text-sm opacity-70 mb-1">Owner</div>
              <div className="font-medium">{owner?.crda8_title || 'Unassigned'}</div>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary, #f3f4f6)' }}>
              <div className="text-sm opacity-70 mb-1">Due Date</div>
              <div className="font-medium">
                {dueDate ? format(dueDate, 'MMM d, yyyy') : 'No due date'}
              </div>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary, #f3f4f6)' }}>
              <div className="text-sm opacity-70 mb-1">Progress</div>
              <div className="font-medium">{progress}%</div>
              <div className="w-full h-2 rounded-full bg-gray-200 mt-1 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: STATUS_COLORS[deliverable.crda8_status] || '#3b82f6',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Comment */}
          {deliverable.crda8_comment && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-5 h-5" style={{ color: '#3b82f6' }} />
                <h3 className="font-semibold">Latest Comment</h3>
              </div>
              <div
                className="p-4 rounded-xl"
                style={{ backgroundColor: 'var(--bg-secondary, #f3f4f6)' }}
              >
                {deliverable.crda8_comment}
              </div>
            </div>
          )}

          {/* History */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <History className="w-5 h-5" style={{ color: '#8b5cf6' }} />
              <h3 className="font-semibold">Activity History</h3>
            </div>
            {auditLogs.length === 0 ? (
              <div className="text-center py-8 opacity-50">
                No activity recorded yet
              </div>
            ) : (
              <div className="space-y-3">
                {auditLogs.map((log: any, index: number) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3 p-3 rounded-lg"
                    style={{ backgroundColor: 'var(--bg-secondary, #f3f4f6)' }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white flex-shrink-0"
                      style={{ backgroundColor: '#3b82f6' }}
                    >
                      {(log.userName || 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{log.userName || 'Unknown'}</span>
                        <span className="text-xs opacity-50">
                          {format(new Date(log.timestamp), 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>
                      <div className="text-sm opacity-70">
                        {log.action}
                        {log.details && <span className="block text-xs mt-1">{log.details}</span>}
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

// Workstream Progress Bar
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
    className="space-y-2"
  >
    <div className="flex justify-between items-center">
      <span className="text-sm font-medium">{name}</span>
      <span className="text-sm opacity-70">{progress}%</span>
    </div>
    <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary, #e5e7eb)' }}>
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ delay: delay + 0.3, duration: 1, ease: "easeOut" }}
      />
    </div>
  </motion.div>
);

// Main Component
const ProjectOverview = () => {
  const { data: deliverables = [], isLoading: isLoadingDeliverables } = useGetDeliverables();
  const { data: workstreams = [], isLoading: isLoadingWorkstreams } = useGetWorkstreams();
  const { data: staff = [], isLoading: isLoadingStaff } = useGetStaff();

  const isLoading = isLoadingDeliverables || isLoadingWorkstreams || isLoadingStaff;

  // View state
  const [activeKPI, setActiveKPI] = useState<'month' | 'twoWeeks' | 'late' | null>(null);
  const [selectedDeliverable, setSelectedDeliverable] = useState<any | null>(null);

  // Calculate KPI data
  const today = new Date();
  const twoWeeksFromNow = addDays(today, 14);
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);

  const kpiData = useMemo(() => {
    const dueThisMonth = (deliverables as any[]).filter((d: any) => {
      if (d.crda8_status === 2) return false; // Exclude completed
      if (!d.crda8_duedate) return false;
      const dueDate = new Date(d.crda8_duedate);
      return isWithinInterval(dueDate, { start: monthStart, end: monthEnd });
    });

    const dueNextTwoWeeks = (deliverables as any[]).filter((d: any) => {
      if (d.crda8_status === 2) return false; // Exclude completed
      if (!d.crda8_duedate) return false;
      const dueDate = new Date(d.crda8_duedate);
      return isWithinInterval(dueDate, { start: today, end: twoWeeksFromNow });
    });

    const lateDeliverables = (deliverables as any[]).filter((d: any) => {
      if (d.crda8_status === 2) return false; // Exclude completed
      if (!d.crda8_duedate) return false;
      const dueDate = new Date(d.crda8_duedate);
      return isBefore(dueDate, today);
    });

    return {
      month: dueThisMonth,
      twoWeeks: dueNextTwoWeeks,
      late: lateDeliverables,
    };
  }, [deliverables, today, twoWeeksFromNow, monthStart, monthEnd]);

  // Get current list based on active KPI
  const currentList = activeKPI ? kpiData[activeKPI] : [];
  const currentTitle = activeKPI === 'month'
    ? 'Due This Month'
    : activeKPI === 'twoWeeks'
    ? 'Due Next 2 Weeks'
    : activeKPI === 'late'
    ? 'Overdue Deliverables'
    : '';

  // Overall stats
  const totalDeliverables = deliverables.length;
  const completedDeliverables = (deliverables as any[]).filter((d: any) => d.crda8_status === 2).length;
  const overallProgress = totalDeliverables > 0
    ? Math.round((deliverables as any[]).reduce((acc: number, d: any) => acc + (parseInt(d.crda8_completion_x0020__x0025_ || '0') || 0), 0) / totalDeliverables)
    : 0;

  const workstreamColors = [
    "#D04A02",
    "#3b82f6",
    "#8b5cf6",
    "#10b981",
    "#f59e0b",
  ];

  return (
    <Layout title="Project Overview">
      <div className="relative min-h-screen overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, var(--bg-main) 0%, var(--bg-secondary) 100%)' }} />
        <FloatingOrb delay={0} size={400} color="bg-orange-500" position={{ x: "10%", y: "20%" }} />
        <FloatingOrb delay={2} size={300} color="bg-blue-500" position={{ x: "70%", y: "60%" }} />
        <FloatingOrb delay={4} size={250} color="bg-purple-500" position={{ x: "80%", y: "10%" }} />

        <div className="relative z-10 p-6">
          {/* Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold mb-2">Project Overview</h1>
            <p className="opacity-70">Track deliverables and project health at a glance</p>
          </motion.div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <KPICard
              icon={CalendarDays}
              label="Due This Month"
              value={kpiData.month.length}
              color="#3b82f6"
              bgColor="rgba(59, 130, 246, 0.1)"
              onClick={() => setActiveKPI(activeKPI === 'month' ? null : 'month')}
              isActive={activeKPI === 'month'}
            />
            <KPICard
              icon={CalendarClock}
              label="Due Next 2 Weeks"
              value={kpiData.twoWeeks.length}
              color="#f59e0b"
              bgColor="rgba(245, 158, 11, 0.1)"
              onClick={() => setActiveKPI(activeKPI === 'twoWeeks' ? null : 'twoWeeks')}
              isActive={activeKPI === 'twoWeeks'}
            />
            <KPICard
              icon={AlertCircle}
              label="Overdue"
              value={kpiData.late.length}
              color="#ef4444"
              bgColor="rgba(239, 68, 68, 0.1)"
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
                className="mb-8 overflow-hidden"
              >
                <div
                  className="rounded-2xl p-6"
                  style={{ backgroundColor: 'var(--card-bg, #ffffff)' }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setActiveKPI(null)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <h2 className="text-xl font-semibold">{currentTitle}</h2>
                      <span
                        className="px-3 py-1 text-sm font-medium rounded-full"
                        style={{ backgroundColor: 'var(--bg-secondary, #f3f4f6)' }}
                      >
                        {currentList.length} items
                      </span>
                    </div>
                  </div>

                  {currentList.length === 0 ? (
                    <div className="text-center py-12 opacity-50">
                      <CheckCircle2 className="w-12 h-12 mx-auto mb-3" />
                      <p>No deliverables in this category</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-2xl"
              style={{ backgroundColor: 'var(--card-bg, #ffffff)' }}
            >
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-5 h-5" style={{ color: '#D04A02' }} />
                <span className="text-sm opacity-70">Total Deliverables</span>
              </div>
              <div className="text-3xl font-bold">
                <AnimatedCounter value={totalDeliverables} />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-2xl"
              style={{ backgroundColor: 'var(--card-bg, #ffffff)' }}
            >
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle2 className="w-5 h-5" style={{ color: '#10b981' }} />
                <span className="text-sm opacity-70">Completed</span>
              </div>
              <div className="text-3xl font-bold">
                <AnimatedCounter value={completedDeliverables} />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 rounded-2xl"
              style={{ backgroundColor: 'var(--card-bg, #ffffff)' }}
            >
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="w-5 h-5" style={{ color: '#ef4444' }} />
                <span className="text-sm opacity-70">At Risk</span>
              </div>
              <div className="text-3xl font-bold">
                <AnimatedCounter value={(deliverables as any[]).filter((d: any) => d.crda8_risk === 2).length} />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-6 rounded-2xl"
              style={{ backgroundColor: 'var(--card-bg, #ffffff)' }}
            >
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5" style={{ color: '#3b82f6' }} />
                <span className="text-sm opacity-70">Overall Progress</span>
              </div>
              <div className="text-3xl font-bold">{overallProgress}%</div>
            </motion.div>
          </div>

          {/* Workstream Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-6 rounded-2xl"
            style={{ backgroundColor: 'var(--card-bg, #ffffff)' }}
          >
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5" style={{ color: '#D04A02' }} />
              <h2 className="text-lg font-semibold">Workstream Progress</h2>
            </div>
            <div className="space-y-5">
              {isLoading ? (
                <div className="text-center py-4 opacity-50">Loading...</div>
              ) : (
                (workstreams as any[]).slice(0, 5).map((ws: any, index: number) => {
                  const wsDeliverables = (deliverables as any[]).filter((d: any) => d.crda8_workstream === ws.crda8_workstreamsid);
                  const wsProgress = wsDeliverables.length > 0
                    ? Math.round(wsDeliverables.reduce((acc: number, d: any) => acc + (parseInt(d.crda8_completion_x0020__x0025_ || '0') || 0), 0) / wsDeliverables.length)
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
        </div>

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
