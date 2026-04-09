"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/store";
import { getTheme } from "@/lib/theme";
import { updateProfile } from "@/lib/api";

export function SettingsPanel({ onClose }: { onClose: () => void }) {
  const { mode, user, setUser, setMode } = useStore();
  const theme = getTheme(mode);
  const [openaiKey, setOpenaiKey] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [anthropicKey, setAnthropicKey] = useState("");
  const [serpapiKey, setSerpapiKey] = useState("");
  const [defaultProvider, setDefaultProvider] = useState<"auto" | "openai" | "gemini" | "anthropic">(
    (user?.default_ai_provider as "auto" | "openai" | "gemini" | "anthropic") || "auto"
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: Record<string, string> = { default_ai_provider: defaultProvider };
      if (openaiKey) payload.openai_api_key = openaiKey;
      if (geminiKey) payload.gemini_api_key = geminiKey;
      if (anthropicKey) payload.anthropic_api_key = anthropicKey;
      if (serpapiKey) payload.serpapi_key = serpapiKey;
      await updateProfile(payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* no-op */ }
    setSaving(false);
  };

  const inputClass = `w-full text-sm px-3 py-2 rounded-lg border outline-none transition-colors ${theme.inputBg}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4`}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-md rounded-2xl border ${theme.border} ${theme.surface} p-6 shadow-2xl`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-lg font-mono font-bold ${theme.accentText} tracking-wider`}>
            {mode === "jarvis" ? "⚙ SYSTEM CONFIG" : "⚙ Settings"}
          </h2>
          <button onClick={onClose} className={`${theme.textSecondary} hover:opacity-100 opacity-50`}>✕</button>
        </div>

        <div className="space-y-4">
          {/* Mode toggle */}
          <div>
            <label className={`block text-xs font-mono ${theme.textSecondary} mb-2 uppercase tracking-wider`}>
              Assistant Mode
            </label>
            <div className="flex gap-2">
              {(["jarvis", "friday"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-2 rounded-lg border text-sm font-mono transition-colors ${
                    mode === m
                      ? `${theme.buttonPrimary} border-transparent`
                      : `${theme.border} ${theme.textSecondary}`
                  }`}
                >
                  {m.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Default AI provider */}
          <div>
            <label className={`block text-xs font-mono ${theme.textSecondary} mb-2 uppercase tracking-wider`}>
              Default AI Provider
            </label>
            <select
              value={defaultProvider}
              onChange={(e) => setDefaultProvider(e.target.value as "auto" | "openai" | "gemini" | "anthropic")}
              className={inputClass}
            >
              {["auto", "openai", "gemini", "anthropic"].map((p) => (
                <option key={p} value={p}>{p.toUpperCase()}</option>
              ))}
            </select>
          </div>

          {/* API Keys */}
          <div className="space-y-3">
            <label className={`block text-xs font-mono ${theme.textSecondary} uppercase tracking-wider`}>
              API Keys (encrypted at rest)
            </label>
            {[
              { label: `OpenAI ${user?.has_openai ? "✓" : ""}`, val: openaiKey, set: setOpenaiKey, ph: "sk-..." },
              { label: `Gemini ${user?.has_gemini ? "✓" : ""}`, val: geminiKey, set: setGeminiKey, ph: "AIza..." },
              { label: `Anthropic ${user?.has_anthropic ? "✓" : ""}`, val: anthropicKey, set: setAnthropicKey, ph: "sk-ant-..." },
              { label: `SerpAPI ${user?.has_serpapi ? "✓" : ""}`, val: serpapiKey, set: setSerpapiKey, ph: "Search API key" },
            ].map(({ label, val, set, ph }) => (
              <div key={label}>
                <label className={`text-xs font-mono ${theme.textSecondary} opacity-70`}>{label}</label>
                <input
                  type="password"
                  value={val}
                  onChange={(e) => set(e.target.value)}
                  placeholder={ph}
                  className={inputClass}
                />
              </div>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={saving}
            className={`w-full py-3 rounded-xl font-mono text-sm font-bold transition-all ${theme.buttonPrimary} disabled:opacity-50`}
          >
            {saved ? "✓ SAVED" : saving ? "SAVING..." : "SAVE CONFIGURATION"}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
