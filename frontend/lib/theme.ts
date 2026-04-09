import { AssistantMode } from "@/types";

export const themes = {
  jarvis: {
    name: "J.A.R.V.I.S.",
    bg: "bg-gray-950",
    surface: "bg-gray-900/80",
    border: "border-blue-500/30",
    accent: "blue",
    accentHex: "#3b82f6",
    accentGlow: "shadow-blue-500/50",
    accentBg: "bg-blue-500/10",
    accentText: "text-blue-400",
    accentBorder: "border-blue-400",
    gradient: "from-blue-900/20 via-gray-950 to-cyan-900/10",
    hudColor: "#00d4ff",
    waveColor: "#3b82f6",
    pulseColor: "rgba(59,130,246,0.4)",
    textPrimary: "text-white",
    textSecondary: "text-blue-200/70",
    buttonPrimary: "bg-blue-600 hover:bg-blue-500 text-white",
    inputBg: "bg-gray-900 border-blue-500/40 text-white placeholder-blue-300/30 focus:border-blue-400",
    greeting: "SYSTEM ONLINE. HOW CAN I ASSIST YOU, SIR?",
    font: "font-mono",
    scanline: true,
  },
  friday: {
    name: "F.R.I.D.A.Y.",
    bg: "bg-slate-50",
    surface: "bg-white/90",
    border: "border-amber-300/50",
    accent: "amber",
    accentHex: "#f59e0b",
    accentGlow: "shadow-amber-400/40",
    accentBg: "bg-amber-50",
    accentText: "text-amber-600",
    accentBorder: "border-amber-400",
    gradient: "from-amber-50 via-slate-50 to-orange-50",
    hudColor: "#f59e0b",
    waveColor: "#f59e0b",
    pulseColor: "rgba(245,158,11,0.3)",
    textPrimary: "text-slate-900",
    textSecondary: "text-slate-500",
    buttonPrimary: "bg-amber-500 hover:bg-amber-400 text-white",
    inputBg: "bg-white border-amber-300 text-slate-900 placeholder-slate-400 focus:border-amber-500",
    greeting: "Hello! I'm Friday. What can I help you with today?",
    font: "font-sans",
    scanline: false,
  },
} as const;

export function getTheme(mode: AssistantMode) {
  return themes[mode];
}
