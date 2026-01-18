/**
 * Command Center - Animated Dashboard with Real-time Metrics
 *
 * Features:
 * - Animated counters with requestAnimationFrame
 * - SVG stroke animations for circular progress
 * - Floating orbs with infinite loops
 * - Pulse rings and particle effects
 * - Glassmorphism with backdrop-blur
 * - Staggered entrance animations
 */

import { motion, useAnimationFrame } from 'framer-motion';
import { useState, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  AlertTriangle,
  Calendar,
  CheckCircle,
  FileText,
  Layers,
  TrendingUp,
  Users
} from 'lucide-react';
import type { KPI, Deliverable, Workstream } from '@/types/lovable';

interface CommandCenterProps {
  kpis: KPI[];
  deliverables: Deliverable[];
  workstreams: Workstream[];
  recentActivity?: any[];
}

// Animated Counter Component
function AnimatedCounter({ value, duration = 2000 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const startTimeRef = useRef<number | null>(null);

  useAnimationFrame((time) => {
    if (!startTimeRef.current) {
      startTimeRef.current = time;
    }

    const elapsed = time - startTimeRef.current;
    const progress = Math.min(elapsed / duration, 1);

    // Easing function for smooth animation
    const easeOut = 1 - Math.pow(1 - progress, 3);
    setCount(Math.floor(value * easeOut));

    if (progress === 1) {
      startTimeRef.current = null;
    }
  });

  return <span>{count}</span>;
}

// Circular Progress with SVG Animation
function CircularProgress({ value, size = 120 }: { value: number; size?: number }) {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="10"
          fill="none"
          className="text-muted"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          className="text-primary"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 2, ease: 'easeOut' }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold">{value}%</span>
      </div>
    </div>
  );
}

// Floating Orb Background
function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-primary/10 blur-3xl"
          style={{
            width: 200 + i * 50,
            height: 200 + i * 50,
            left: `${20 * i}%`,
            top: `${10 * i}%`,
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 10 + i * 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// KPI Card with Animation
function KPICard({ kpi, index }: { kpi: KPI; index: number }) {
  const icons = {
    FileText,
    Activity,
    Calendar,
    AlertTriangle,
    CheckCircle,
    Users,
    Layers,
    TrendingUp,
  };

  const Icon = icons[kpi.icon as keyof typeof icons] || Activity;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Card className="relative overflow-hidden backdrop-blur-xl bg-card/50 border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
        {/* Pulse ring on hover */}
        <motion.div
          className="absolute inset-0 border-2 border-primary rounded-lg"
          initial={{ scale: 1, opacity: 0 }}
          whileHover={{ scale: 1.05, opacity: [0, 0.5, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        />

        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {kpi.label}
          </CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {typeof kpi.value === 'number' ? (
              <AnimatedCounter value={kpi.value} />
            ) : (
              kpi.value
            )}
          </div>
          {kpi.change && (
            <Badge
              variant={kpi.changeType === 'increase' ? 'default' : 'secondary'}
              className="mt-2"
            >
              {kpi.changeType === 'increase' ? '+' : '-'}{kpi.change}%
            </Badge>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Risk Alert with Animation
function RiskAlert({ deliverables }: { deliverables: Deliverable[] }) {
  const highRisk = deliverables.filter(d =>
    d.risk === 'High' || d.risk === 'Critical'
  );

  if (highRisk.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            High Risk Deliverables
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {highRisk.slice(0, 3).map((d, i) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="flex items-center justify-between p-2 rounded-lg bg-background/50"
              >
                <span className="text-sm font-medium">{d.title}</span>
                <Badge variant="destructive">{d.risk}</Badge>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Workstream Progress
function WorkstreamProgress({ workstreams, deliverables }: { workstreams: Workstream[]; deliverables: Deliverable[] }) {
  const workstreamStats = useMemo(() => {
    return workstreams.map(ws => {
      const wsDeliverables = deliverables.filter(d => d.workstreamId === ws.id);
      const avgProgress = wsDeliverables.length > 0
        ? Math.round(wsDeliverables.reduce((sum, d) => sum + d.progress, 0) / wsDeliverables.length)
        : 0;

      return {
        ...ws,
        progress: avgProgress,
        count: wsDeliverables.length,
      };
    });
  }, [workstreams, deliverables]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
    >
      <Card className="backdrop-blur-xl bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Workstream Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workstreamStats.map((ws, i) => (
              <motion.div
                key={ws.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + i * 0.1 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: ws.color }}
                    />
                    <span className="text-sm font-medium">{ws.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {ws.count} deliverables
                  </span>
                </div>
                <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ backgroundColor: ws.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${ws.progress}%` }}
                    transition={{ duration: 1.5, delay: 1 + i * 0.1 }}
                  />
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  {ws.progress}%
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Main Command Center Component
export function CommandCenter({ kpis, deliverables, workstreams, recentActivity = [] }: CommandCenterProps) {
  // Calculate overall progress
  const overallProgress = useMemo(() => {
    if (deliverables.length === 0) return 0;
    return Math.round(
      deliverables.reduce((sum, d) => sum + d.progress, 0) / deliverables.length
    );
  }, [deliverables]);

  return (
    <div className="relative min-h-screen p-6 overflow-hidden">
      {/* Floating background orbs */}
      <FloatingOrbs />

      {/* Main content */}
      <div className="relative z-10 space-y-6">
        {/* Header with overall progress */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
              Command Center
            </h1>
            <p className="text-muted-foreground mt-2">
              Real-time project overview and metrics
            </p>
          </div>
          <CircularProgress value={overallProgress} />
        </motion.div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => (
            <KPICard key={kpi.id} kpi={kpi} index={i} />
          ))}
        </div>

        {/* Risk Alerts and Workstream Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RiskAlert deliverables={deliverables} />
          <WorkstreamProgress workstreams={workstreams} deliverables={deliverables} />
        </div>
      </div>
    </div>
  );
}
