"use client";

import { useRef, useCallback, useEffect } from "react";
import { useStore } from "@/store";

interface VoiceHookOptions {
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
  wakeWord?: string;
  continuous?: boolean;
}

export function useVoice(options: VoiceHookOptions = {}) {
  const { isListening, setIsListening } = useStore();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const wakeWordActive = useRef(false);

  const isSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const startListening = useCallback(() => {
    if (!isSupported || isListening) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) return;

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = options.continuous ?? false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((r: any) => r[0].transcript)
        .join(" ")
        .trim();

      // Wake word handling
      if (options.wakeWord) {
        const wakeWordLower = options.wakeWord.toLowerCase();
        const transcriptLower = transcript.toLowerCase();
        if (transcriptLower.includes(wakeWordLower)) {
          const afterWake = transcript.substring(
            transcriptLower.indexOf(wakeWordLower) + wakeWordLower.length
          ).trim();
          if (afterWake) options.onResult?.(afterWake);
          return;
        }
      }
      options.onResult?.(transcript);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      options.onError?.(event.error);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isSupported, isListening, options, setIsListening]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, [setIsListening]);

  const speak = useCallback((text: string, mode: "jarvis" | "friday" = "jarvis") => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    // Find appropriate voice
    const voices = window.speechSynthesis.getVoices();
    if (mode === "jarvis") {
      // Prefer deep male voice
      const voice =
        voices.find((v) => v.name.toLowerCase().includes("david")) ||
        voices.find((v) => v.lang.startsWith("en-US")) ||
        voices.find((v) => v.lang.startsWith("en"));
      if (voice) utterance.voice = voice;
      utterance.pitch = 0.8;
      utterance.rate = 0.95;
    } else {
      // Prefer warm female voice
      const voice =
        voices.find((v) => v.name.toLowerCase().includes("samantha")) ||
        voices.find((v) => v.name.toLowerCase().includes("zira")) ||
        voices.find((v) => v.lang.startsWith("en-US")) ||
        voices.find((v) => v.lang.startsWith("en"));
      if (voice) utterance.voice = voice;
      utterance.pitch = 1.1;
      utterance.rate = 1.0;
    }

    window.speechSynthesis.speak(utterance);
  }, []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  return { isListening, isSupported, startListening, stopListening, speak };
}
