"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/store";
import { getTheme } from "@/lib/theme";
import { getSystemStatus } from "@/lib/api";
import { SystemStatus as SystemStatusType } from "@/types";

function StatusBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-mono">
        <span className="opacity-60">{label}</span>
        <span>{value.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export function SystemStatusPanel() {
  const { mode, systemStatus, setSystemStatus, wsConnected } = useStore();
  const theme = getTheme(mode);

  useEffect(() => {
    const fetch = async () => {
      try {
        const status = await getSystemStatus() as SystemStatusType;
        setSystemStatus(status);
      } catch { /* no-op */ }
    };
    fetch();
    const id = setInterval(fetch, 5000);
    return () => clearInterval(id);
  }, [setSystemStatus]);

  return (
    <div className={`rounded-xl border ${theme.border} ${theme.surface} p-4 backdrop-blur-md`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className={`text-xs font-mono font-bold ${theme.accentText} tracking-widest uppercase`}>
          System Status
        </h3>
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${wsConnected ? "bg-green-400" : "bg-red-500"}`} />
          <span className={`text-xs font-mono ${theme.textSecondary}`}>
            {wsConnected ? "CONNECTED" : "OFFLINE"}
          </span>
        </div>
      </div>

      {systemStatus ? (
        <div className={`space-y-3 ${theme.textPrimary}`}>
          <StatusBar label="CPU" value={systemStatus.cpu_percent} color={theme.accentHex} />
          <StatusBar label="MEMORY" value={systemStatus.memory_percent} color={theme.accentHex} />
          <StatusBar label="DISK" value={systemStatus.disk_percent} color={theme.accentHex} />
          <div className={`text-xs font-mono ${theme.textSecondary} pt-1 opacity-60`}>
            {systemStatus.platform} — RAM {systemStatus.memory_used_gb}GB / {systemStatus.memory_total_gb}GB
          </div>
        </div>
      ) : (
        <p className={`text-xs font-mono ${theme.textSecondary} opacity-50`}>Loading...</p>
      )}
    </div>
  );
}
