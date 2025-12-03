"use client"

import { motion } from "framer-motion"
import { type Clock, ArrowRight, Sparkles, Zap, BarChart3, Timer } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LandingScreenProps {
  userName: string
  onEnter: () => void
}

function FloatingOrb({
  delay,
  duration,
  size,
  color,
  startX,
  startY,
}: {
  delay: number
  duration: number
  size: number
  color: string
  startX: string
  startY: string
}) {
  return (
    <motion.div
      className="absolute rounded-full blur-3xl opacity-30"
      style={{
        width: size,
        height: size,
        background: color,
        left: startX,
        top: startY,
      }}
      animate={{
        x: [0, 100, -50, 80, 0],
        y: [0, -80, 60, -40, 0],
        scale: [1, 1.2, 0.9, 1.1, 1],
      }}
      transition={{
        duration,
        delay,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      }}
    />
  )
}

function FloatingParticle({ delay, x, y }: { delay: number; x: string; y: string }) {
  return (
    <motion.div
      className="absolute w-1 h-1 bg-primary/60 rounded-full"
      style={{ left: x, top: y }}
      animate={{
        y: [0, -30, 0],
        opacity: [0.3, 1, 0.3],
        scale: [1, 1.5, 1],
      }}
      transition={{
        duration: 3,
        delay,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      }}
    />
  )
}

function AnimatedClock() {
  return (
    <div className="relative w-24 h-24">
      <motion.div
        className="absolute inset-0 rounded-2xl bg-primary/20 border border-primary/30"
        animate={{
          boxShadow: [
            "0 0 20px rgba(45, 212, 191, 0.2)",
            "0 0 40px rgba(45, 212, 191, 0.4)",
            "0 0 20px rgba(45, 212, 191, 0.2)",
          ],
        }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-12 h-12">
          {/* Clock face */}
          <div className="absolute inset-0 rounded-full border-2 border-primary/50" />
          {/* Hour hand */}
          <motion.div
            className="absolute left-1/2 bottom-1/2 w-0.5 h-3 bg-primary origin-bottom rounded-full"
            style={{ marginLeft: -1 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          />
          {/* Minute hand */}
          <motion.div
            className="absolute left-1/2 bottom-1/2 w-0.5 h-4 bg-primary origin-bottom rounded-full"
            style={{ marginLeft: -1 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          />
          {/* Center dot */}
          <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary" />
        </div>
      </div>
    </div>
  )
}

function FeatureCard({
  icon: Icon,
  label,
  delay,
  x,
  y,
}: {
  icon: typeof Clock
  label: string
  delay: number
  x: number
  y: number
}) {
  return (
    <motion.div
      className="absolute px-4 py-2 rounded-xl bg-card/80 backdrop-blur-sm border border-border shadow-lg"
      style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)` }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: [0, -10, 0],
      }}
      transition={{
        opacity: { delay: delay + 1.5, duration: 0.5 },
        scale: { delay: delay + 1.5, duration: 0.5, type: "spring" },
        y: { delay: delay + 2, duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
      }}
    >
      <div className="flex items-center gap-2 text-sm">
        <Icon className="w-4 h-4 text-primary" />
        <span className="text-foreground font-medium">{label}</span>
      </div>
    </motion.div>
  )
}

export function LandingScreen({ userName, onEnter }: LandingScreenProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden">
        <FloatingOrb delay={0} duration={20} size={600} color="var(--primary)" startX="-10%" startY="-20%" />
        <FloatingOrb delay={2} duration={25} size={500} color="#8b5cf6" startX="60%" startY="50%" />
        <FloatingOrb delay={4} duration={18} size={400} color="#f59e0b" startX="30%" startY="70%" />
        <FloatingOrb delay={1} duration={22} size={300} color="#ec4899" startX="80%" startY="-10%" />
      </div>

      {[...Array(20)].map((_, i) => (
        <FloatingParticle key={i} delay={i * 0.3} x={`${10 + ((i * 4.5) % 80)}%`} y={`${15 + ((i * 7) % 70)}%`} />
      ))}

      {/* Animated grid pattern */}
      <motion.div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(var(--primary) 1px, transparent 1px),
                           linear-gradient(90deg, var(--primary) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
        animate={{
          backgroundPosition: ["0px 0px", "60px 60px"],
        }}
        transition={{
          duration: 20,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />

      <FeatureCard icon={Timer} label="Log Time Blocks" delay={0} x={-320} y={-80} />
      <FeatureCard icon={BarChart3} label="View Analytics" delay={0.2} x={280} y={-60} />
      <FeatureCard icon={Zap} label="Track Productivity" delay={0.4} x={-280} y={100} />
      <FeatureCard icon={Sparkles} label="Set Goals" delay={0.6} x={300} y={120} />

      <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
        {/* Logo with animated clock */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
          className="mb-8 flex justify-center"
        >
          <AnimatedClock />
        </motion.div>

        {/* Greeting with wave animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-4"
        >
          <motion.span
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 text-primary text-base font-medium"
            animate={{
              boxShadow: [
                "0 0 0px rgba(45, 212, 191, 0)",
                "0 0 20px rgba(45, 212, 191, 0.3)",
                "0 0 0px rgba(45, 212, 191, 0)",
              ],
            }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            <motion.span
              animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
              transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY, repeatDelay: 1 }}
              style={{ display: "inline-block", transformOrigin: "70% 70%" }}
            >
              👋
            </motion.span>
            Hello! {userName}
          </motion.span>
        </motion.div>

        {/* Title with gradient text */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-5xl md:text-7xl font-bold mb-4 tracking-tight"
        >
          <span className="text-foreground">Time </span>
          <motion.span
            className="bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent bg-[length:200%_auto]"
            animate={{
              backgroundPosition: ["0% center", "200% center"],
            }}
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          >
            Slicer
          </motion.span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="text-xl md:text-2xl text-muted-foreground mb-12 text-pretty"
        >
          Track where your day actually goes.
        </motion.p>

        {/* CTA Button with enhanced animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
            <Button
              size="lg"
              onClick={onEnter}
              className="group text-lg px-8 py-6 rounded-xl bg-gradient-to-r from-primary to-cyan-500 text-primary-foreground hover:opacity-90 transition-all duration-300 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
            >
              <span>Enter Dashboard</span>
              <motion.span
                className="ml-2 inline-block"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.span>
            </Button>
          </motion.div>
        </motion.div>

        {/* Animated stats preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="mt-16 grid grid-cols-3 gap-4 max-w-md mx-auto"
        >
          {[
            { value: "24h", label: "Daily Tracking" },
            { value: "7d", label: "Weekly Insights" },
            { value: "30d", label: "Monthly Reports" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 + index * 0.1 }}
              className="text-center"
            >
              <motion.div
                className="text-2xl font-bold text-primary"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, delay: index * 0.3, repeat: Number.POSITIVE_INFINITY }}
              >
                {stat.value}
              </motion.div>
              <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{
            opacity: { delay: 2 },
            y: { duration: 1.5, repeat: Number.POSITIVE_INFINITY, delay: 2 },
          }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2">
            <motion.div
              className="w-1 h-2 rounded-full bg-muted-foreground/50"
              animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  )
}
