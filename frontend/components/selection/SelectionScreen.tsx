"use client";

import { motion } from "framer-motion";
import { AssistantMode } from "@/types";
import { HUDRings } from "@/components/hud/HUDRings";

interface SelectionScreenProps {
  onSelect: (mode: AssistantMode) => void;
}

export function SelectionScreen({ onSelect }: SelectionScreenProps) {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center overflow-hidden relative">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16 z-10"
      >
        <h1 className="text-4xl md:text-6xl font-mono font-bold text-white tracking-widest uppercase">
          Personal AI
        </h1>
        <p className="text-blue-400/70 font-mono mt-2 tracking-widest text-sm">
          SELECT YOUR ASSISTANT
        </p>
      </motion.div>

      {/* Cards */}
      <div className="flex flex-col md:flex-row gap-8 z-10 px-6">
        {/* JARVIS card */}
        <motion.button
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          whileHover={{ scale: 1.04, y: -4 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelect("jarvis")}
          className="group relative w-72 h-96 rounded-2xl border border-blue-500/30 bg-gray-900/80 backdrop-blur-sm overflow-hidden cursor-pointer"
        >
          {/* Glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-cyan-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-500" />

          <div className="flex flex-col items-center justify-center h-full gap-6 p-6">
            <HUDRings mode="jarvis" size={120} />
            <div className="text-center">
              <h2 className="text-2xl font-mono font-bold text-white tracking-widest">J.A.R.V.I.S.</h2>
              <p className="text-xs font-mono text-blue-400/60 mt-1 tracking-wider">
                Just A Rather Very Intelligent System
              </p>
            </div>
            <div className="space-y-1 text-center">
              {["Dark holographic theme", "Technical & precise", "Deep voice output"].map((f) => (
                <p key={f} className="text-xs text-blue-300/50 font-mono">
                  ◆ {f}
                </p>
              ))}
            </div>
            <motion.div
              className="px-6 py-2 rounded-full border border-blue-500/50 font-mono text-sm text-blue-400 group-hover:bg-blue-500/20 transition-colors"
              whileHover={{ borderColor: "#3b82f6" }}
            >
              INITIALIZE
            </motion.div>
          </div>

          {/* Scan line effect */}
          <motion.div
            className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent"
            animate={{ top: ["0%", "100%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        </motion.button>

        {/* FRIDAY card */}
        <motion.button
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          whileHover={{ scale: 1.04, y: -4 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelect("friday")}
          className="group relative w-72 h-96 rounded-2xl border border-amber-400/30 bg-white/5 backdrop-blur-sm overflow-hidden cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 to-orange-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-amber-400/10 rounded-full blur-3xl group-hover:bg-amber-400/20 transition-all duration-500" />

          <div className="flex flex-col items-center justify-center h-full gap-6 p-6">
            <HUDRings mode="friday" size={120} />
            <div className="text-center">
              <h2 className="text-2xl font-mono font-bold text-white tracking-widest">F.R.I.D.A.Y.</h2>
              <p className="text-xs font-mono text-amber-400/60 mt-1 tracking-wider">
                Female Replacement Intelligent Digital Assistant Youth
              </p>
            </div>
            <div className="space-y-1 text-center">
              {["Warm minimal theme", "Friendly & efficient", "Natural voice output"].map((f) => (
                <p key={f} className="text-xs text-amber-300/50 font-mono">
                  ◇ {f}
                </p>
              ))}
            </div>
            <motion.div
              className="px-6 py-2 rounded-full border border-amber-400/50 font-mono text-sm text-amber-400 group-hover:bg-amber-400/20 transition-colors"
              whileHover={{ borderColor: "#f59e0b" }}
            >
              ACTIVATE
            </motion.div>
          </div>

          <motion.div
            className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent"
            animate={{ top: ["0%", "100%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
        </motion.button>
      </div>

      {/* Bottom tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 1.2 }}
        className="mt-12 text-xs font-mono text-gray-500 tracking-widest z-10"
      >
        PERSONAL AI ASSISTANT v1.0
      </motion.p>
    </div>
  );
}
