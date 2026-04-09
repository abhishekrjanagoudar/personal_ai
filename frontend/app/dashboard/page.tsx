"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store";
import { getTheme } from "@/lib/theme";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { SystemStatusPanel } from "@/components/panels/SystemStatusPanel";
import { AppControlPanel } from "@/components/panels/AppControlPanel";
import { SettingsPanel } from "@/components/panels/SettingsPanel";
import { HUDRings } from "@/components/hud/HUDRings";
import { VoiceCalibration } from "@/components/voice/VoiceCalibration";
import { getProfile } from "@/lib/api";
import { User } from "@/types";

export default function DashboardPage() {
  const { mode, user, token, setUser, setMode, logout, isListening, isCalibrating, setIsCalibrating } = useStore();
  const theme = getTheme(mode);
  const [showSettings, setShowSettings] = useState(false);
  const [showCalibration, setShowCalibration] = useState(false);

  useEffect(() => {
    if (token) {
      getProfile().then((u) => {
        const profile = u as User;
        setUser(profile);
        setMode(profile.assistant_mode);

        // Check if voice calibration is needed (every 30 days)
        if (!profile.voice_calibrated_at) {
          setShowCalibration(true);
        } else {
          const last = new Date(profile.voice_calibrated_at);
          const diffDays = (Date.now() - last.getTime()) / (1000 * 60 * 60 * 24);
          if (diffDays > 30) setShowCalibration(true);
        }
      }).catch(() => {
        // Token expired
        logout();
      });
    }
  }, [token, setUser, setMode, logout]);

  const displayName = mode === "jarvis" ? "J.A.R.V.I.S." : "F.R.I.D.A.Y.";

  return (
    <div className={`min-h-screen ${theme.bg} bg-gradient-to-br ${theme.gradient} ${theme.textPrimary} overflow-hidden`}>
      {/* Scanline overlay for Jarvis */}
      {theme.scanline && (
        <div
          className="pointer-events-none fixed inset-0 z-50 opacity-[0.03]"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 4px)",
          }}
        />
      )}

      {/* Header */}
      <header className={`flex items-center justify-between px-6 py-4 border-b ${theme.border} ${theme.surface} backdrop-blur-md`}>
        <div className="flex items-center gap-3">
          <HUDRings mode={mode} size={36} active={isListening} />
          <div>
            <h1 className={`text-sm font-mono font-bold ${theme.accentText} tracking-widest`}>
              {displayName}
            </h1>
            <p className={`text-xs font-mono ${theme.textSecondary} opacity-50`}>
              {user?.username || "Guest"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(true)}
            className={`p-2 rounded-lg border ${theme.border} ${theme.accentBg} ${theme.accentText} hover:opacity-80 transition-opacity`}
            title="Settings"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <button
            onClick={logout}
            className={`p-2 rounded-lg border ${theme.border} text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors`}
            title="Logout"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex h-[calc(100vh-65px)]">
        {/* Left sidebar */}
        <aside className="hidden lg:flex flex-col w-64 p-4 gap-4 border-r border-opacity-20" style={{ borderColor: theme.accentHex + "30" }}>
          <SystemStatusPanel />
          <AppControlPanel />
        </aside>

        {/* Chat area */}
        <main className="flex-1 overflow-hidden">
          <ChatPanel />
        </main>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
        {showCalibration && (
          <VoiceCalibration
            onComplete={() => setShowCalibration(false)}
            onSkip={() => setShowCalibration(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
