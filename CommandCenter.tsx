import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  AlertTriangle,
  Zap,
  Target,
  Rocket,
  Shield,
  Clock,
  BarChart3,
  Activity,
  Sparkles
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { workstreams, deliverables, teamMembers } from "@/data/mockData";

// Animated counter component
const AnimatedCounter = ({ value, duration = 2000, suffix = "" }: { value: number; duration?: number; suffix?: string }) => {
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

  return <span>{count}{suffix}</span>;
};

// Floating orb component
const FloatingOrb = ({ delay, size, color, position }: { delay: number; size: number; color: string; position: { x: string; y: string } }) => (
  <motion.div
    className={`absolute rounded-full blur-3xl opacity-30 ${color}`}
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

// Pulse ring component
const PulseRing = ({ delay }: { delay: number }) => (
  <motion.div
    className="absolute inset-0 rounded-full border-2 border-primary/30"
    initial={{ scale: 0.8, opacity: 1 }}
    animate={{ scale: 2, opacity: 0 }}
    transition={{
      duration: 2,
      delay,
      repeat: Infinity,
      ease: "easeOut",
    }}
  />
);

// Stat card with glow effect
const GlowCard = ({ 
  icon: Icon, 
  label, 
  value, 
  suffix = "",
  trend,
  color 
}: { 
  icon: any; 
  label: string; 
  value: number; 
  suffix?: string;
  trend?: { value: number; positive: boolean };
  color: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.02, y: -5 }}
    transition={{ duration: 0.3 }}
    className="group relative"
  >
    <div className={`absolute inset-0 ${color} rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`} />
    <Card className="relative overflow-hidden bg-card/50 backdrop-blur-xl border-white/10 p-6 rounded-2xl">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full" />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted-foreground text-sm font-medium mb-2">{label}</p>
          <p className="text-4xl font-bold text-foreground">
            <AnimatedCounter value={value} suffix={suffix} />
          </p>
          {trend && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className={`flex items-center gap-1 mt-2 text-sm ${trend.positive ? 'text-green-400' : 'text-red-400'}`}
            >
              <TrendingUp className={`w-4 h-4 ${!trend.positive && 'rotate-180'}`} />
              <span>{trend.value}% from last week</span>
            </motion.div>
          )}
        </div>
        <motion.div 
          className={`p-3 rounded-xl ${color}`}
          whileHover={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.5 }}
        >
          <Icon className="w-6 h-6 text-white" />
        </motion.div>
      </div>
    </Card>
  </motion.div>
);

// Circular progress with animation
const CircularProgress = ({ value, label, color, delay }: { value: number; label: string; color: string; delay: number }) => {
  const [progress, setProgress] = useState(0);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setProgress(value), delay * 1000);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <motion.div 
      className="flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: delay * 0.5, duration: 0.5 }}
    >
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="56"
            cy="56"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-muted/20"
          />
          <motion.circle
            cx="56"
            cy="56"
            r="45"
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut", delay: delay * 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold">{progress}%</span>
        </div>
      </div>
      <p className="mt-3 text-sm font-medium text-muted-foreground">{label}</p>
    </motion.div>
  );
};

// Live activity indicator
const LiveIndicator = () => (
  <div className="flex items-center gap-2">
    <span className="relative flex h-3 w-3">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
    </span>
    <span className="text-sm text-green-400 font-medium">Live</span>
  </div>
);

// Workstream progress bar with animation
const WorkstreamBar = ({ name, progress, delay, color }: { name: string; progress: number; delay: number; color: string }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="space-y-2"
  >
    <div className="flex justify-between items-center">
      <span className="text-sm font-medium">{name}</span>
      <span className="text-sm text-muted-foreground">{progress}%</span>
    </div>
    <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
      <motion.div
        className={`h-full ${color} rounded-full`}
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ delay: delay + 0.3, duration: 1, ease: "easeOut" }}
      />
    </div>
  </motion.div>
);

// Activity pulse line
const ActivityPulse = () => {
  const generatePoints = () => {
    const points = [];
    for (let i = 0; i < 50; i++) {
      const y = 50 + Math.sin(i * 0.3) * 30 + Math.random() * 20;
      points.push(`${i * 4},${y}`);
    }
    return points.join(' ');
  };

  return (
    <motion.svg 
      className="w-full h-24" 
      viewBox="0 0 200 100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="50%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="hsl(var(--chart-2))" />
        </linearGradient>
        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.polyline
        fill="none"
        stroke="url(#lineGradient)"
        strokeWidth="2"
        strokeLinecap="round"
        points={generatePoints()}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />
    </motion.svg>
  );
};

// Team avatar stack with animation
const TeamAvatarStack = () => {
  const displayMembers = teamMembers.slice(0, 5);
  
  return (
    <div className="flex items-center">
      <div className="flex -space-x-3">
        {displayMembers.map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, scale: 0, x: -20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
            whileHover={{ scale: 1.2, zIndex: 10 }}
            className="relative"
          >
            <img
              src={member.avatar}
              alt={member.name}
              className="w-10 h-10 rounded-full border-2 border-background object-cover"
            />
            <motion.div
              className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 + 0.3 }}
            />
          </motion.div>
        ))}
      </div>
      <motion.span 
        className="ml-4 text-sm text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        +{teamMembers.length - 5} more online
      </motion.span>
    </div>
  );
};

// Particle effect
const Particles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-primary/30 rounded-full"
        initial={{
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
        }}
        animate={{
          y: [null, -100],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: Math.random() * 3 + 2,
          repeat: Infinity,
          delay: Math.random() * 2,
        }}
      />
    ))}
  </div>
);

const CommandCenter = () => {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const completedDeliverables = deliverables.filter(d => d.status === "Completed").length;
  const atRiskDeliverables = deliverables.filter(d => d.risk === "High").length;
  const overallProgress = Math.round(deliverables.reduce((acc, d) => acc + d.progress, 0) / deliverables.length);

  const workstreamColors = [
    "bg-gradient-to-r from-primary to-orange-400",
    "bg-gradient-to-r from-blue-500 to-cyan-400",
    "bg-gradient-to-r from-purple-500 to-pink-400",
    "bg-gradient-to-r from-green-500 to-emerald-400",
    "bg-gradient-to-r from-yellow-500 to-orange-400",
  ];

  return (
    <MainLayout>
      <div className="relative min-h-screen overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        <FloatingOrb delay={0} size={400} color="bg-primary" position={{ x: "10%", y: "20%" }} />
        <FloatingOrb delay={2} size={300} color="bg-blue-500" position={{ x: "70%", y: "60%" }} />
        <FloatingOrb delay={4} size={250} color="bg-purple-500" position={{ x: "80%", y: "10%" }} />
        <Particles />
        
        <div className="relative z-10 p-8">
          {/* Header */}
          <motion.div 
            className="flex items-center justify-between mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-8 h-8 text-primary" />
                </motion.div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                  Command Center
                </h1>
              </div>
              <p className="text-muted-foreground">Real-time project intelligence & analytics</p>
            </div>
            <LiveIndicator />
          </motion.div>

          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <GlowCard 
              icon={Target} 
              label="Total Deliverables" 
              value={deliverables.length}
              trend={{ value: 12, positive: true }}
              color="bg-primary"
            />
            <GlowCard 
              icon={CheckCircle2} 
              label="Completed" 
              value={completedDeliverables}
              trend={{ value: 8, positive: true }}
              color="bg-green-500"
            />
            <GlowCard 
              icon={AlertTriangle} 
              label="At Risk" 
              value={atRiskDeliverables}
              trend={{ value: 2, positive: false }}
              color="bg-red-500"
            />
            <GlowCard 
              icon={Users} 
              label="Team Members" 
              value={teamMembers.length}
              suffix=""
              color="bg-blue-500"
            />
          </div>

          {/* Middle Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Circular Progress Section */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6 bg-card/50 backdrop-blur-xl border-white/10 rounded-2xl h-full">
                <div className="flex items-center gap-2 mb-6">
                  <Zap className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">Performance Metrics</h2>
                </div>
                <div className="flex justify-around items-center">
                  <CircularProgress value={overallProgress} label="Overall" color="hsl(var(--primary))" delay={0.5} />
                  <CircularProgress value={85} label="On Time" color="#22c55e" delay={0.7} />
                  <CircularProgress value={92} label="Quality" color="#3b82f6" delay={0.9} />
                </div>
              </Card>
            </motion.div>

            {/* Activity Chart */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2"
            >
              <Card className="p-6 bg-card/50 backdrop-blur-xl border-white/10 rounded-2xl h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold">Project Activity</h2>
                  </div>
                  <div className="flex gap-2">
                    {["1D", "1W", "1M", "ALL"].map((period) => (
                      <motion.button
                        key={period}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-3 py-1 text-xs rounded-full bg-muted/50 hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        {period}
                      </motion.button>
                    ))}
                  </div>
                </div>
                <ActivityPulse />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Workstream Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-6 bg-card/50 backdrop-blur-xl border-white/10 rounded-2xl">
                <div className="flex items-center gap-2 mb-6">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">Workstream Progress</h2>
                </div>
                <div className="space-y-5">
                  {workstreams.slice(0, 5).map((ws, index) => {
                    const wsDeliverables = deliverables.filter(d => d.workstreamId === ws.id);
                    const wsProgress = wsDeliverables.length > 0 
                      ? Math.round(wsDeliverables.reduce((acc, d) => acc + d.progress, 0) / wsDeliverables.length)
                      : 0;
                    return (
                      <WorkstreamBar
                        key={ws.id}
                        name={ws.name}
                        progress={wsProgress}
                        delay={index * 0.1}
                        color={workstreamColors[index % workstreamColors.length]}
                      />
                    );
                  })}
                </div>
              </Card>
            </motion.div>

            {/* Team Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="p-6 bg-card/50 backdrop-blur-xl border-white/10 rounded-2xl">
                <div className="flex items-center gap-2 mb-6">
                  <Users className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">Active Team</h2>
                </div>
                <TeamAvatarStack />
                
                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 mt-8">
                  {[
                    { icon: Rocket, label: "Velocity", value: "94%" },
                    { icon: Shield, label: "Compliance", value: "100%" },
                    { icon: Clock, label: "Avg Response", value: "2.4h" },
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      className="text-center p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <stat.icon className="w-5 h-5 mx-auto mb-2 text-primary" />
                      <p className="text-lg font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Hero Status Banner */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8"
          >
            <Card className="relative overflow-hidden p-8 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border-primary/20 rounded-2xl">
              <div className="absolute top-0 right-0 w-64 h-64">
                <div className="relative w-full h-full">
                  <PulseRing delay={0} />
                  <PulseRing delay={0.5} />
                  <PulseRing delay={1} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center"
                    >
                      <Sparkles className="w-8 h-8 text-primary" />
                    </motion.div>
                  </div>
                </div>
              </div>
              
              <div className="relative z-10 max-w-xl">
                <motion.h3 
                  className="text-2xl font-bold mb-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 }}
                >
                  Project Health: Excellent
                </motion.h3>
                <motion.p 
                  className="text-muted-foreground mb-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1 }}
                >
                  TD Bank project is on track with {overallProgress}% completion. All major milestones are progressing as planned.
                </motion.p>
                <motion.div 
                  className="flex gap-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
                  >
                    View Full Report
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-2 bg-white/10 backdrop-blur rounded-xl font-medium hover:bg-white/20 transition-colors"
                  >
                    Share Update
                  </motion.button>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CommandCenter;
