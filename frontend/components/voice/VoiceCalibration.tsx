"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store";
import { getTheme } from "@/lib/theme";
import { updateVoiceCalibration } from "@/lib/api";
import { Waveform } from "@/components/hud/Waveform";
import { useVoice } from "@/hooks/useVoice";

const CALIBRATION_PHRASES = [
  "Hello, my name is and I am testing my voice.",
  "Open the browser and search for the latest news.",
  "Set a reminder for tomorrow morning at nine AM.",
];

interface VoiceCalibrationProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function VoiceCalibration({ onComplete, onSkip }: VoiceCalibrationProps) {
  const { mode, setIsCalibrating } = useStore();
  const theme = getTheme(mode);
  const [step, setStep] = useState(0);
  const [recordings, setRecordings] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "recording" | "done">("idle");

  const { isListening, isSupported, startListening, stopListening } = useVoice({
    onResult: (transcript) => {
      setRecordings((prev) => [...prev, transcript]);
      setStatus("idle");
      if (step < CALIBRATION_PHRASES.length - 1) {
        setStep((s) => s + 1);
      } else {
        handleComplete(recordings);
      }
    },
  });

  const handleRecord = () => {
    setStatus("recording");
    startListening();
  };

  const handleComplete = async (recs: string[]) => {
    const profile = JSON.stringify({ phrases: CALIBRATION_PHRASES, transcripts: recs, mode });
    try {
      await updateVoiceCalibration(profile);
    } catch { /* no-op */ }
    setIsCalibrating(false);
    onComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
    >
      <div className={`w-full max-w-lg rounded-2xl border ${theme.border} ${theme.surface} p-8 text-center`}>
        <h2 className={`text-xl font-mono font-bold ${theme.accentText} tracking-widest mb-2`}>
          VOICE CALIBRATION
        </h2>
        <p className={`text-xs font-mono ${theme.textSecondary} mb-8 opacity-70`}>
          Step {step + 1} of {CALIBRATION_PHRASES.length}
        </p>

        <div className={`p-4 rounded-xl ${theme.accentBg} border ${theme.border} mb-6`}>
          <p className={`text-sm font-mono ${theme.textPrimary} leading-relaxed`}>
            "{CALIBRATION_PHRASES[step]}"
          </p>
        </div>

        <div className="h-12 mb-6">
          <Waveform mode={mode} active={isListening} height={48} />
        </div>

        {!isSupported && (
          <p className="text-red-400 text-xs font-mono mb-4">
            Voice recognition not supported in this browser.
          </p>
        )}

        <div className="flex gap-3 justify-center">
          {status !== "recording" ? (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleRecord}
              disabled={!isSupported}
              className={`px-8 py-3 rounded-xl font-mono text-sm font-bold ${theme.buttonPrimary} disabled:opacity-40`}
            >
              🎙 RECORD
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { stopListening(); setStatus("idle"); }}
              className="px-8 py-3 rounded-xl font-mono text-sm font-bold bg-red-600 hover:bg-red-500 text-white"
            >
              ⏹ STOP
            </motion.button>
          )}
          <button
            onClick={onSkip}
            className={`px-6 py-3 rounded-xl font-mono text-sm ${theme.textSecondary} border ${theme.border} hover:opacity-80`}
          >
            SKIP
          </button>
        </div>

        {recordings.length > 0 && (
          <div className="mt-4 space-y-1">
            {recordings.map((r, i) => (
              <p key={i} className={`text-xs font-mono ${theme.textSecondary} opacity-50`}>
                ✓ Phrase {i + 1} recorded
              </p>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
