import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
import { useGetDeliverables, useGetWorkstreams, useGetStaff } from "@/services/dataverseService";

// PWC Colors - hardcoded for reliability
const COLORS = {
  primary: "#D04A02",      // PWC Orange
  primaryLight: "#E85A12",
  background: "#0a0a0a",   // Dark background
  cardBg: "rgba(30, 30, 30, 0.8)",
  text: "#ffffff",
  textMuted: "#a0a0a0",
  green: "#22c55e",
  red: "#ef4444",
  blue: "#3b82f6",
  purple: "#a855f7",
  cyan: "#06b6d4",
};

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
    style={{
      position: "absolute",
      width: size,
      height: size,
      left: position.x,
      top: position.y,
      borderRadius: "50%",
      filter: "blur(60px)",
      opacity: 0.3,
      background: color,
    }}
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
    style={{
      position: "absolute",
      inset: 0,
      borderRadius: "50%",
      border: `2px solid ${COLORS.primary}40`,
    }}
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
    style={{ position: "relative" }}
  >
    <motion.div
      style={{
        position: "absolute",
        inset: 0,
        background: color,
        borderRadius: "16px",
        filter: "blur(20px)",
        opacity: 0,
      }}
      whileHover={{ opacity: 0.4 }}
      transition={{ duration: 0.5 }}
    />
    <div style={{
      position: "relative",
      overflow: "hidden",
      background: COLORS.cardBg,
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(255,255,255,0.1)",
      padding: "24px",
      borderRadius: "16px",
    }}>
      <div style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: "128px",
        height: "128px",
        background: "linear-gradient(to bottom left, rgba(255,255,255,0.05), transparent)",
        borderBottomLeftRadius: "100%",
      }} />
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <p style={{ color: COLORS.textMuted, fontSize: "14px", fontWeight: 500, marginBottom: "8px" }}>{label}</p>
          <p style={{ fontSize: "36px", fontWeight: 700, color: COLORS.text }}>
            <AnimatedCounter value={value} suffix={suffix} />
          </p>
          {trend && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                marginTop: "8px",
                fontSize: "14px",
                color: trend.positive ? COLORS.green : COLORS.red,
              }}
            >
              <TrendingUp style={{ width: 16, height: 16, transform: !trend.positive ? "rotate(180deg)" : "none" }} />
              <span>{trend.value}% from last week</span>
            </motion.div>
          )}
        </div>
        <motion.div
          style={{
            padding: "12px",
            borderRadius: "12px",
            background: color,
          }}
          whileHover={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.5 }}
        >
          <Icon style={{ width: 24, height: 24, color: "white" }} />
        </motion.div>
      </div>
    </div>
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
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: delay * 0.5, duration: 0.5 }}
    >
      <div style={{ position: "relative", width: 112, height: 112 }}>
        <svg style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
          <circle
            cx="56"
            cy="56"
            r="45"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
            fill="none"
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
        <div style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <span style={{ fontSize: "24px", fontWeight: 700, color: COLORS.text }}>{progress}%</span>
        </div>
      </div>
      <p style={{ marginTop: "12px", fontSize: "14px", fontWeight: 500, color: COLORS.textMuted }}>{label}</p>
    </motion.div>
  );
};

// Live activity indicator
const LiveIndicator = () => (
  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
    <span style={{ position: "relative", display: "flex", height: 12, width: 12 }}>
      <span style={{
        animation: "ping 1s cubic-bezier(0, 0, 0.2, 1) infinite",
        position: "absolute",
        display: "inline-flex",
        height: "100%",
        width: "100%",
        borderRadius: "50%",
        background: COLORS.green,
        opacity: 0.75,
      }} />
      <span style={{
        position: "relative",
        display: "inline-flex",
        borderRadius: "50%",
        height: 12,
        width: 12,
        background: COLORS.green,
      }} />
    </span>
    <span style={{ fontSize: "14px", color: COLORS.green, fontWeight: 500 }}>Live</span>
  </div>
);

// Workstream progress bar with animation
const WorkstreamBar = ({ name, progress, delay, color }: { name: string; progress: number; delay: number; color: string }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.5 }}
    style={{ marginBottom: "16px" }}
  >
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
      <span style={{ fontSize: "14px", fontWeight: 500, color: COLORS.text }}>{name}</span>
      <span style={{ fontSize: "14px", color: COLORS.textMuted }}>{progress}%</span>
    </div>
    <div style={{ height: 8, background: "rgba(255,255,255,0.1)", borderRadius: "9999px", overflow: "hidden" }}>
      <motion.div
        style={{ height: "100%", background: color, borderRadius: "9999px" }}
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ delay: delay + 0.3, duration: 1, ease: "easeOut" }}
      />
    </div>
  </motion.div>
);

// Team avatar stack with animation
const TeamAvatarStack = ({ teamMembers }: { teamMembers: any[] }) => {
  const displayMembers = teamMembers.slice(0, 5);

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <div style={{ display: "flex" }}>
        {displayMembers.map((member, index) => {
          const initials = (member.crda8_title || 'U')
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

          return (
            <motion.div
              key={member.crda8_staff4id}
              initial={{ opacity: 0, scale: 0, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.2, zIndex: 10 }}
              style={{ position: "relative", marginLeft: index > 0 ? "-12px" : 0 }}
            >
              <div style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: `2px solid ${COLORS.background}`,
                background: `${COLORS.primary}20`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <span style={{ fontSize: "12px", fontWeight: 500, color: COLORS.primary }}>{initials}</span>
              </div>
              <motion.div
                style={{
                  position: "absolute",
                  bottom: -4,
                  right: -4,
                  width: 16,
                  height: 16,
                  background: COLORS.green,
                  borderRadius: "50%",
                  border: `2px solid ${COLORS.background}`,
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.3 }}
              />
            </motion.div>
          );
        })}
      </div>
      <motion.span
        style={{ marginLeft: "16px", fontSize: "14px", color: COLORS.textMuted }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        +{Math.max(0, teamMembers.length - 5)} more online
      </motion.span>
    </div>
  );
};

// Particle effect
const Particles = () => (
  <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        style={{
          position: "absolute",
          width: 4,
          height: 4,
          background: `${COLORS.primary}50`,
          borderRadius: "50%",
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{
          y: [0, -100],
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

// Card wrapper component
const Card = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{
    background: COLORS.cardBg,
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "16px",
    ...style,
  }}>
    {children}
  </div>
);

const CommandCenter = () => {
  const { data: deliverables = [], isLoading: isLoadingDeliverables } = useGetDeliverables();
  const { data: workstreams = [], isLoading: isLoadingWorkstreams } = useGetWorkstreams();
  const { data: teamMembers = [], isLoading: isLoadingStaff } = useGetStaff();

  const isLoading = isLoadingDeliverables || isLoadingWorkstreams || isLoadingStaff;

  const completedDeliverables = deliverables.filter((d: any) => d.crda8_status === 2).length;
  const atRiskDeliverables = deliverables.filter((d: any) => d.crda8_risk === 2).length;
  const overallProgress = deliverables.length > 0
    ? Math.round(deliverables.reduce((acc: number, d: any) => acc + (parseInt(d.crda8_completion_x0020__x0025_ || '0') || 0), 0) / deliverables.length)
    : 0;

  const workstreamColors = [
    `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.primaryLight})`,
    `linear-gradient(90deg, ${COLORS.blue}, ${COLORS.cyan})`,
    `linear-gradient(90deg, ${COLORS.purple}, #ec4899)`,
    `linear-gradient(90deg, ${COLORS.green}, #10b981)`,
    `linear-gradient(90deg, #eab308, ${COLORS.primary})`,
  ];

  return (
    <div style={{
      position: "relative",
      minHeight: "100vh",
      overflow: "hidden",
      background: COLORS.background,
      color: COLORS.text,
    }}>
      {/* Background effects */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: `linear-gradient(to bottom right, ${COLORS.background}, ${COLORS.background}, ${COLORS.primary}10)`,
      }} />
      <FloatingOrb delay={0} size={400} color={COLORS.primary} position={{ x: "10%", y: "20%" }} />
      <FloatingOrb delay={2} size={300} color={COLORS.blue} position={{ x: "70%", y: "60%" }} />
      <FloatingOrb delay={4} size={250} color={COLORS.purple} position={{ x: "80%", y: "10%" }} />
      <Particles />

      {/* Add CSS for ping animation */}
      <style>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>

      <div style={{ position: "relative", zIndex: 10, padding: "32px" }}>
        {/* Header */}
        <motion.div
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles style={{ width: 32, height: 32, color: COLORS.primary }} />
              </motion.div>
              <h1 style={{
                fontSize: "36px",
                fontWeight: 700,
                background: `linear-gradient(90deg, ${COLORS.text}, ${COLORS.primary}, ${COLORS.text})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                Command Center
              </h1>
            </div>
            <p style={{ color: COLORS.textMuted }}>Real-time project intelligence & analytics</p>
          </div>
          <LiveIndicator />
        </motion.div>

        {/* Main Stats Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "24px",
          marginBottom: "32px",
        }}>
          <GlowCard
            icon={Target}
            label="Total Deliverables"
            value={deliverables.length}
            trend={{ value: 12, positive: true }}
            color={COLORS.primary}
          />
          <GlowCard
            icon={CheckCircle2}
            label="Completed"
            value={completedDeliverables}
            trend={{ value: 8, positive: true }}
            color={COLORS.green}
          />
          <GlowCard
            icon={AlertTriangle}
            label="At Risk"
            value={atRiskDeliverables}
            trend={{ value: 2, positive: false }}
            color={COLORS.red}
          />
          <GlowCard
            icon={Users}
            label="Team Members"
            value={teamMembers.length}
            color={COLORS.blue}
          />
        </div>

        {/* Middle Section */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          gap: "24px",
          marginBottom: "32px",
        }}>
          {/* Circular Progress Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card style={{ padding: "24px", height: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}>
                <Zap style={{ width: 20, height: 20, color: COLORS.primary }} />
                <h2 style={{ fontSize: "18px", fontWeight: 600 }}>Performance Metrics</h2>
              </div>
              <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center" }}>
                <CircularProgress value={overallProgress} label="Overall" color={COLORS.primary} delay={0.5} />
                <CircularProgress value={85} label="On Time" color={COLORS.green} delay={0.7} />
                <CircularProgress value={92} label="Quality" color={COLORS.blue} delay={0.9} />
              </div>
            </Card>
          </motion.div>

          {/* Activity Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card style={{ padding: "24px", height: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Activity style={{ width: 20, height: 20, color: COLORS.primary }} />
                  <h2 style={{ fontSize: "18px", fontWeight: 600 }}>Project Activity</h2>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  {["1D", "1W", "1M", "ALL"].map((period) => (
                    <motion.button
                      key={period}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        padding: "4px 12px",
                        fontSize: "12px",
                        borderRadius: "9999px",
                        background: "rgba(255,255,255,0.1)",
                        border: "none",
                        color: COLORS.text,
                        cursor: "pointer",
                      }}
                    >
                      {period}
                    </motion.button>
                  ))}
                </div>
              </div>
              {/* Simple activity visualization */}
              <div style={{ height: 100, display: "flex", alignItems: "end", gap: "4px", padding: "20px 0" }}>
                {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95].map((h, i) => (
                  <motion.div
                    key={i}
                    style={{
                      flex: 1,
                      background: `linear-gradient(to top, ${COLORS.primary}, ${COLORS.primaryLight})`,
                      borderRadius: "4px 4px 0 0",
                    }}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: 0.5 + i * 0.05, duration: 0.5 }}
                  />
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: COLORS.textMuted }}>
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
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          {/* Workstream Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card style={{ padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}>
                <BarChart3 style={{ width: 20, height: 20, color: COLORS.primary }} />
                <h2 style={{ fontSize: "18px", fontWeight: 600 }}>Workstream Progress</h2>
              </div>
              {isLoading ? (
                <div style={{ textAlign: "center", color: COLORS.textMuted, padding: "16px" }}>Loading...</div>
              ) : (
                workstreams.slice(0, 5).map((ws: any, index: number) => {
                  const wsDeliverables = deliverables.filter((d: any) => d.crda8_workstream === ws.crda8_workstreamsid);
                  const wsProgress = wsDeliverables.length > 0
                    ? Math.round(wsDeliverables.reduce((acc: number, d: any) => acc + (parseInt(d.crda8_completion_x0020__x0025_ || '0') || 0), 0) / wsDeliverables.length)
                    : 0;
                  return (
                    <WorkstreamBar
                      key={ws.crda8_workstreamsid}
                      name={String(ws.crda8_title || 'Untitled')}
                      progress={wsProgress}
                      delay={index * 0.1}
                      color={workstreamColors[index % workstreamColors.length]}
                    />
                  );
                })
              )}
            </Card>
          </motion.div>

          {/* Team Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card style={{ padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}>
                <Users style={{ width: 20, height: 20, color: COLORS.primary }} />
                <h2 style={{ fontSize: "18px", fontWeight: 600 }}>Active Team</h2>
              </div>
              {isLoading ? (
                <div style={{ textAlign: "center", color: COLORS.textMuted, padding: "16px" }}>Loading...</div>
              ) : (
                <TeamAvatarStack teamMembers={teamMembers} />
              )}

              {/* Quick Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginTop: "32px" }}>
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
                    style={{
                      textAlign: "center",
                      padding: "16px",
                      borderRadius: "12px",
                      background: "rgba(255,255,255,0.05)",
                      cursor: "pointer",
                    }}
                  >
                    <stat.icon style={{ width: 20, height: 20, margin: "0 auto 8px", color: COLORS.primary }} />
                    <p style={{ fontSize: "18px", fontWeight: 700 }}>{stat.value}</p>
                    <p style={{ fontSize: "12px", color: COLORS.textMuted }}>{stat.label}</p>
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
          style={{ marginTop: "32px" }}
        >
          <Card style={{
            position: "relative",
            overflow: "hidden",
            padding: "32px",
            background: `linear-gradient(90deg, ${COLORS.primary}30, ${COLORS.primary}15, transparent)`,
            border: `1px solid ${COLORS.primary}30`,
          }}>
            <div style={{ position: "absolute", top: 0, right: 0, width: 256, height: 256 }}>
              <div style={{ position: "relative", width: "100%", height: "100%" }}>
                <PulseRing delay={0} />
                <PulseRing delay={0.5} />
                <PulseRing delay={1} />
                <div style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: "50%",
                      background: `${COLORS.primary}30`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Sparkles style={{ width: 32, height: 32, color: COLORS.primary }} />
                  </motion.div>
                </div>
              </div>
            </div>

            <div style={{ position: "relative", zIndex: 10, maxWidth: 600 }}>
              <motion.h3
                style={{ fontSize: "24px", fontWeight: 700, marginBottom: "8px" }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 }}
              >
                Project Health: Excellent
              </motion.h3>
              <motion.p
                style={{ color: COLORS.textMuted, marginBottom: "16px" }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1 }}
              >
                TD Bank project is on track with {overallProgress}% completion. All major milestones are progressing as planned.
              </motion.p>
              <motion.div
                style={{ display: "flex", gap: "16px" }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: "8px 24px",
                    background: COLORS.primary,
                    color: "white",
                    borderRadius: "12px",
                    fontWeight: 500,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  View Full Report
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: "8px 24px",
                    background: "rgba(255,255,255,0.1)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "12px",
                    fontWeight: 500,
                    border: "none",
                    color: COLORS.text,
                    cursor: "pointer",
                  }}
                >
                  Share Update
                </motion.button>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default CommandCenter;
