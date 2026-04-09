"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/store";
import { getTheme } from "@/lib/theme";
import { launchApp, openUrl } from "@/lib/api";

const APPS = [
  { name: "open_browser", label: "Browser", icon: "🌐" },
  { name: "open_vscode", label: "VS Code", icon: "💻" },
  { name: "open_terminal", label: "Terminal", icon: "⬛" },
  { name: "open_file_manager", label: "Files", icon: "📁" },
];

export function AppControlPanel() {
  const { mode } = useStore();
  const theme = getTheme(mode);
  const [url, setUrl] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleLaunch = async (appName: string) => {
    try {
      const res = await launchApp(appName) as { success: boolean; message: string };
      setFeedback(res.message);
    } catch (e: unknown) {
      setFeedback(`Error: ${e instanceof Error ? e.message : String(e)}`);
    }
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleOpenUrl = async () => {
    if (!url.trim()) return;
    try {
      const res = await openUrl(url.trim()) as { success: boolean; message: string };
      setFeedback(res.message);
      setUrl("");
    } catch (e: unknown) {
      setFeedback(`Error: ${e instanceof Error ? e.message : String(e)}`);
    }
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className={`rounded-xl border ${theme.border} ${theme.surface} p-4 backdrop-blur-md`}>
      <h3 className={`text-xs font-mono font-bold ${theme.accentText} tracking-widest uppercase mb-3`}>
        App Control
      </h3>

      <div className="grid grid-cols-2 gap-2 mb-3">
        {APPS.map((app) => (
          <motion.button
            key={app.name}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleLaunch(app.name)}
            className={`flex items-center gap-2 p-2 rounded-lg border ${theme.border} ${theme.accentBg} ${theme.accentText} text-xs font-mono transition-colors hover:border-opacity-80`}
          >
            <span>{app.icon}</span>
            <span>{app.label}</span>
          </motion.button>
        ))}
      </div>

      {/* URL input */}
      <div className="flex gap-1">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleOpenUrl()}
          placeholder="https://..."
          className={`flex-1 text-xs px-3 py-2 rounded-lg border outline-none ${theme.inputBg}`}
        />
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleOpenUrl}
          className={`px-3 py-2 rounded-lg text-xs font-mono ${theme.buttonPrimary}`}
        >
          GO
        </motion.button>
      </div>

      {feedback && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`mt-2 text-xs font-mono ${theme.textSecondary} opacity-70`}
        >
          {feedback}
        </motion.p>
      )}
    </div>
  );
}
