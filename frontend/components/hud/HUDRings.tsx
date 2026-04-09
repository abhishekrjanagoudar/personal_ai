"use client";

import { motion } from "framer-motion";
import { AssistantMode } from "@/types";
import { getTheme } from "@/lib/theme";

interface HUDRingsProps {
  mode: AssistantMode;
  active?: boolean;
  size?: number;
}

export function HUDRings({ mode, active = false, size = 200 }: HUDRingsProps) {
  const theme = getTheme(mode);
  const color = theme.hudColor;
  const rings = [1, 0.7, 0.5, 0.3];

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {rings.map((scale, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full border"
          style={{
            borderColor: color,
            opacity: 0.15 + i * 0.08,
            scale,
            transformOrigin: "center",
          }}
          animate={
            active
              ? {
                  scale: [scale, scale * 1.08, scale],
                  opacity: [0.15 + i * 0.08, 0.4, 0.15 + i * 0.08],
                }
              : {}
          }
          transition={{
            duration: 2 + i * 0.4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3,
          }}
        />
      ))}

      {/* Rotating arc */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          border: `2px solid transparent`,
          borderTopColor: color,
          borderRightColor: color,
          opacity: 0.7,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />

      {/* Counter-rotating arc */}
      <motion.div
        className="absolute rounded-full"
        style={{
          inset: size * 0.12,
          border: `1px solid transparent`,
          borderBottomColor: color,
          borderLeftColor: color,
          opacity: 0.5,
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />

      {/* Center pulse */}
      <motion.div
        className="absolute rounded-full"
        style={{
          inset: size * 0.38,
          backgroundColor: color,
          opacity: active ? 0.9 : 0.4,
        }}
        animate={active ? { scale: [1, 1.3, 1], opacity: [0.9, 0.5, 0.9] } : { scale: [1, 1.1, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    </div>
  );
}
