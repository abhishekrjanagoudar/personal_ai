"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { AssistantMode } from "@/types";
import { getTheme } from "@/lib/theme";

interface WaveformProps {
  mode: AssistantMode;
  active?: boolean;
  height?: number;
  bars?: number;
}

export function Waveform({ mode, active = false, height = 48, bars = 32 }: WaveformProps) {
  const theme = getTheme(mode);
  const animValues = Array.from({ length: bars }, (_, i) => {
    const base = Math.sin((i / bars) * Math.PI) * 0.8 + 0.2;
    return base;
  });

  return (
    <div className="flex items-center justify-center gap-0.5" style={{ height }}>
      {animValues.map((base, i) => (
        <motion.div
          key={i}
          className="rounded-full"
          style={{
            width: 3,
            backgroundColor: theme.waveColor,
            minHeight: 4,
          }}
          animate={
            active
              ? {
                  height: [
                    height * 0.1,
                    height * (base * 0.9 + Math.random() * 0.4),
                    height * 0.1,
                  ],
                  opacity: [0.4, 1, 0.4],
                }
              : {
                  height: height * 0.15 + Math.sin(i * 0.5) * height * 0.05,
                  opacity: 0.3,
                }
          }
          transition={{
            duration: active ? 0.4 + Math.random() * 0.3 : 0,
            repeat: active ? Infinity : 0,
            delay: i * 0.03,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
