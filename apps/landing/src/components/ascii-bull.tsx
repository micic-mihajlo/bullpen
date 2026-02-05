"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

// ASCII art frames for the bull animation
const bullFrames = [
  `
        (__)
        (oo)
  /------\\/
 / |    ||
*  /\\---/\\
   ~~   ~~
`,
  `
        (__)
        (oo)
  /------\\/
 / |    ||
*  /\\---/\\
   ~    ~~
`,
  `
        (__)
        (oo)
  /------\\/
 / |    ||
*  /\\---/\\
  ~~    ~
`,
  `
        (__)
        (oo)
  /------\\/
 / |    ||
*  /\\---/\\
   ~~   ~~
`,
];

// Idle breathing frames
const idleFrames = [
  `
        (__)
        (oo)
  /------\\/
 / |    ||
*  /\\---/\\
   ~~   ~~
`,
  `
        (__)
        (••)
  /------\\/
 / |    ||
*  /\\---/\\
   ~~   ~~
`,
];

// Charging bull frames
const chargeFrames = [
  `
        (__)
        (@@)
  /------\\/
 / |    ||
*  /\\---/\\
   ~~   ~~
`,
  `
       (__)
       (@@)
 /------\\/
/ |    ||
  /\\---/\\
  ~~   ~~
`,
  `
      (__)
      (@@)
/------\\/
|    ||
 /\\---/\\
 ~~   ~~
`,
];

export function AsciiBull() {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isCharging, setIsCharging] = useState(false);
  const [frames, setFrames] = useState(idleFrames);

  // Idle animation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % frames.length);
    }, isCharging ? 150 : 800);

    return () => clearInterval(interval);
  }, [frames.length, isCharging]);

  // Randomly trigger charge animation
  useEffect(() => {
    const chargeInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        setIsCharging(true);
        setFrames(chargeFrames);
        setTimeout(() => {
          setIsCharging(false);
          setFrames(idleFrames);
        }, 1500);
      }
    }, 5000);

    return () => clearInterval(chargeInterval);
  }, []);

  const handleClick = () => {
    setIsCharging(true);
    setFrames(chargeFrames);
    setTimeout(() => {
      setIsCharging(false);
      setFrames(idleFrames);
    }, 1500);
  };

  return (
    <motion.div
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`cursor-pointer select-none transition-shadow duration-300 ${isCharging ? "pulse-glow" : ""}`}
    >
      <pre className={`font-mono text-sm sm:text-base md:text-lg leading-tight whitespace-pre transition-all duration-100 ${isCharging ? "text-accent" : "text-bull"}`}>
        {frames[currentFrame]}
      </pre>
      <div className="flex items-center justify-between mt-3 font-mono text-xs">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-muted"
        >
          {isCharging ? "[ CHARGING... ]" : "[ click to charge ]"}
        </motion.p>
        <div className="flex items-center gap-2 text-muted">
          <span className={`inline-block w-2 h-2 rounded-full ${isCharging ? "bg-accent pulse-glow" : "bg-green-600"}`} />
          <span>{isCharging ? "ACTIVE" : "IDLE"}</span>
        </div>
      </div>
    </motion.div>
  );
}
