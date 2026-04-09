"use client";

import { motion } from "framer-motion";
import { AssistantMode } from "@/types";
import { getTheme } from "@/lib/theme";

interface AIPulseProps {
  mode: AssistantMode;
  active?: boolean;
}

export function AIPulse({ mode, active = false }: AIPulseProps) {
  const theme = getTheme(mode);
  const color = theme.hudColor;

  return (
    <div className="relative flex items-center justify-center w-12 h-12">
      {/* Pulse rings */}
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border"
          style={{ borderColor: color }}
          initial={{ width: 8, height: 8, opacity: 0.8 }}
          animate={
            active
              ? {
                  width: [8, 48],
                  height: [8, 48],
                  opacity: [0.8, 0],
                }
              : {}
          }
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: (i - 1) * 0.5,
            ease: "easeOut",
          }}
        />
      ))}
      {/* Core dot */}
      <motion.div
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: color }}
        animate={active ? { scale: [1, 1.4, 1] } : { scale: 1 }}
        transition={{ duration: 0.8, repeat: Infinity }}
      />
    </div>
  );
}
