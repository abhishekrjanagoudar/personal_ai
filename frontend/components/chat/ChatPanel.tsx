"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store";
import { getTheme } from "@/lib/theme";
import { ChatMessage } from "./ChatMessage";
import { Waveform } from "@/components/hud/Waveform";
import { AIPulse } from "@/components/hud/AIPulse";
import { useVoice } from "@/hooks/useVoice";
import { useWebSocket } from "@/hooks/useWebSocket";
import { sendChat } from "@/lib/api";
import { v4 as uuidv4 } from "uuid";

export function ChatPanel() {
  const {
    mode, messages, isLoading, sessionId, useSearch,
    addMessage, setIsLoading, setSessionId, clearMessages,
    token,
  } = useStore();

  const theme = getTheme(mode);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const { sendMessage: wsSend, ws } = useWebSocket();

  const { isListening, isSupported, startListening, stopListening, speak } = useVoice({
    onResult: (transcript) => {
      setInput(transcript);
    },
    wakeWord: mode === "jarvis" ? "hey jarvis" : "hey friday",
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");

    const sid = sessionId || uuidv4();
    setSessionId(sid);

    addMessage({ id: uuidv4(), role: "user", content: text });
    setIsLoading(true);

    // Try WebSocket first, fall back to REST
    const sent = wsSend(text, sid, useSearch);
    if (!sent) {
      try {
        const res = await sendChat(text, sid, useSearch) as {
          reply: string; provider?: string; session_id: string; sources?: Array<{title:string;url:string;snippet:string}>; error?: boolean
        };
        setSessionId(res.session_id);
        addMessage({
          id: uuidv4(),
          role: "assistant",
          content: res.reply,
          provider: res.provider,
          sources: res.sources || [],
          error: res.error,
        });
        if (res.reply) speak(res.reply, mode);
      } catch (err: unknown) {
        addMessage({
          id: uuidv4(),
          role: "assistant",
          content: `Error: ${err instanceof Error ? err.message : "Something went wrong"}`,
          error: true,
        });
      } finally {
        setIsLoading(false);
      }
    }
  }, [input, isLoading, sessionId, useSearch, addMessage, setIsLoading, setSessionId, wsSend, speak, mode]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const greetingMsg = theme.greeting;

  return (
    <div className={`flex flex-col h-full ${theme.font}`}>
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 scrollbar-thin">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-full gap-4"
          >
            <AIPulse mode={mode} />
            <p className={`text-sm ${theme.textSecondary} text-center max-w-xs font-mono`}>
              {greetingMsg}
            </p>
          </motion.div>
        )}

        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} mode={mode} />
        ))}

        {/* Typing indicator */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 pl-4"
            >
              <AIPulse mode={mode} active />
              <span className={`text-xs ${theme.textSecondary} font-mono`}>
                {mode === "jarvis" ? "Processing..." : "Thinking..."}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Voice waveform */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 56, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`px-4 overflow-hidden border-t ${theme.border}`}
          >
            <Waveform mode={mode} active height={48} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div className={`p-4 border-t ${theme.border}`}>
        <div className="flex gap-2 items-end">
          {/* Voice button */}
          {isSupported && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={isListening ? stopListening : startListening}
              className={`p-2.5 rounded-xl border transition-colors ${
                isListening
                  ? `border-red-500 bg-red-500/20 text-red-400`
                  : `${theme.border} ${theme.accentBg} ${theme.accentText}`
              }`}
              title={isListening ? "Stop listening" : "Start voice input"}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V23h2v-2.06A9 9 0 0 0 21 12v-2h-2z" />
              </svg>
            </motion.button>
          )}

          {/* Text input */}
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={mode === "jarvis" ? "ENTER COMMAND..." : "Ask me anything..."}
            className={`flex-1 resize-none rounded-xl px-4 py-3 text-sm border outline-none focus:ring-2 focus:ring-offset-0 transition-all ${theme.inputBg} ${
              mode === "jarvis" ? "font-mono tracking-wide" : ""
            }`}
            style={{ minHeight: 44, maxHeight: 120 }}
          />

          {/* Search toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => useStore.getState().setUseSearch(!useSearch)}
            className={`p-2.5 rounded-xl border transition-colors ${
              useSearch
                ? `${theme.buttonPrimary} border-transparent`
                : `${theme.border} ${theme.accentBg} ${theme.accentText}`
            }`}
            title={useSearch ? "Web search ON" : "Web search OFF"}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </motion.button>

          {/* Send button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`p-2.5 rounded-xl transition-all ${theme.buttonPrimary} disabled:opacity-30`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </motion.button>
        </div>

        {/* Clear session */}
        {messages.length > 0 && (
          <button
            onClick={clearMessages}
            className={`mt-2 text-xs ${theme.textSecondary} hover:opacity-100 opacity-40 font-mono transition-opacity`}
          >
            {mode === "jarvis" ? "CLEAR SESSION" : "Clear chat"}
          </button>
        )}
      </div>
    </div>
  );
}
