"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Idle breathing frames — subtle blink cycle
const idleFrames = [
  `
        (__)
        (oo)
  /------\\/
 / |    ||
*  /\\---/\\
   ~~   ~~`,
  `
        (__)
        (oo)
  /------\\/
 / |    ||
*  /\\---/\\
   ~~   ~~`,
  `
        (__)
        (--)
  /------\\/
 / |    ||
*  /\\---/\\
   ~~   ~~`,
  `
        (__)
        (oo)
  /------\\/
 / |    ||
*  /\\---/\\
   ~~   ~~`,
];

// Charge wind-up: pawing the ground
const chargeWindup = [
  `
        (__)
        (••)
  /------\\/
 / |    ||
*  /\\---/\\
   ~~   ~~`,
  `
        (__)
        (@@)
  /------\\/
 / |    ||
*  /\\---/\\
   ~~>  ~~`,
  `
        (__)
        (@@)
  /------\\/
 / |    ||
*  /\\---/\\
   ~~>> ~~`,
];

// Charge rush frames
const chargeRush = [
  `
       \\(__)
        (@@)>
  /------\\/
 / |    ||
*  /\\---/\\
  ~~   ~~`,
  `
      \\\\(__)
        (XX)>>
 /------\\/
/ |    ||
  /\\---/\\
 ~~   ~~`,
  `
    \\\\\\(__)
        (XX)>>>
/------\\/
|    ||
 /\\---/\\
~~   ~~`,
];

type Phase = "idle" | "windup" | "rush" | "recover";

export function AsciiBull() {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [breathScale, setBreathScale] = useState(1);

  const frames =
    phase === "rush" ? chargeRush : phase === "windup" ? chargeWindup : idleFrames;

  const isCharging = phase === "windup" || phase === "rush";

  // Breathing pulse in idle
  useEffect(() => {
    if (isCharging) {
      setBreathScale(1);
      return;
    }
    let raf: number;
    let start: number | null = null;
    const breathe = (ts: number) => {
      if (!start) start = ts;
      const t = ((ts - start) % 3000) / 3000;
      setBreathScale(1 + Math.sin(t * Math.PI * 2) * 0.008);
      raf = requestAnimationFrame(breathe);
    };
    raf = requestAnimationFrame(breathe);
    return () => cancelAnimationFrame(raf);
  }, [isCharging]);

  // Frame cycling
  useEffect(() => {
    const speed = phase === "rush" ? 120 : phase === "windup" ? 200 : 900;
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % frames.length);
    }, speed);
    return () => clearInterval(interval);
  }, [frames.length, phase]);

  const triggerCharge = useCallback(() => {
    if (isCharging) return;
    setCurrentFrame(0);
    setPhase("windup");
    setTimeout(() => {
      setCurrentFrame(0);
      setPhase("rush");
      setTimeout(() => {
        setPhase("recover");
        setCurrentFrame(0);
        setTimeout(() => setPhase("idle"), 600);
      }, 600);
    }, 700);
  }, [isCharging]);

  // Random charge
  useEffect(() => {
    const id = setInterval(() => {
      if (Math.random() > 0.7) triggerCharge();
    }, 6000);
    return () => clearInterval(id);
  }, [triggerCharge]);

  return (
    <motion.div
      onClick={triggerCharge}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`cursor-pointer select-none transition-shadow duration-300 ${isCharging ? "pulse-glow" : ""}`}
    >
      <motion.pre
        animate={{
          scale: isCharging ? 1 : breathScale,
          x: phase === "rush" ? [0, -3, 3, -2, 0] : 0,
          opacity: phase === "recover" ? [0.5, 1] : 1,
        }}
        transition={{
          x: { duration: 0.15, repeat: phase === "rush" ? Infinity : 0 },
          opacity: { duration: 0.6 },
        }}
        className={`font-mono text-sm sm:text-base md:text-lg leading-tight whitespace-pre transition-colors duration-100 ${
          phase === "rush"
            ? "text-accent"
            : phase === "windup"
              ? "text-accent/70"
              : "text-bull"
        }`}
      >
        {frames[currentFrame]}
      </motion.pre>
      <div className="flex items-center justify-between mt-3 font-mono text-xs">
        <AnimatePresence mode="wait">
          <motion.p
            key={phase}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="text-muted"
          >
            {phase === "rush"
              ? "[ !!! CHARGING !!! ]"
              : phase === "windup"
                ? "[ winding up... ]"
                : phase === "recover"
                  ? "[ ... ]"
                  : "[ click to charge ]"}
          </motion.p>
        </AnimatePresence>
        <div className="flex items-center gap-2 text-muted">
          <motion.span
            animate={{
              scale: isCharging ? [1, 1.5, 1] : 1,
              opacity: isCharging ? [1, 0.5, 1] : 1,
            }}
            transition={{ duration: 0.4, repeat: isCharging ? Infinity : 0 }}
            className={`inline-block w-2 h-2 rounded-full ${isCharging ? "bg-accent pulse-glow" : "bg-green-600"}`}
          />
          <span>{isCharging ? "ACTIVE" : "IDLE"}</span>
        </div>
      </div>
    </motion.div>
  );
}
