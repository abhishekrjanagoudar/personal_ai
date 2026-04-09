"use client";

import { motion } from "framer-motion";
import { ChatMessage as ChatMessageType } from "@/types";
import { AssistantMode } from "@/types";
import { getTheme } from "@/lib/theme";

interface ChatMessageProps {
  message: ChatMessageType;
  mode: AssistantMode;
}

export function ChatMessage({ message, mode }: ChatMessageProps) {
  const theme = getTheme(mode);
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
    >
      {/* Avatar for assistant */}
      {!isUser && (
        <div
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 mt-1 text-xs font-mono font-bold"
          style={{ backgroundColor: theme.accentHex + "20", color: theme.accentHex, border: `1px solid ${theme.accentHex}40` }}
        >
          {mode === "jarvis" ? "J" : "F"}
        </div>
      )}

      <div className={`max-w-[75%] ${isUser ? "order-2" : ""}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? `${theme.accentBg} border ${theme.accentBorder} ${theme.accentText}`
              : `${theme.surface} border ${theme.border} ${theme.textPrimary}`
          } ${message.error ? "border-red-500/50" : ""}`}
        >
          <p className={`whitespace-pre-wrap ${mode === "jarvis" ? "font-mono" : "font-sans"}`}>
            {message.content}
          </p>
        </div>

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <div className="mt-2 space-y-1">
            <p className={`text-xs ${theme.textSecondary} font-mono`}>Sources:</p>
            {message.sources.slice(0, 3).map((src, i) => (
              <a
                key={i}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`block text-xs ${theme.accentText} hover:underline truncate`}
              >
                [{i + 1}] {src.title}
              </a>
            ))}
          </div>
        )}

        {/* Provider badge */}
        {message.provider && !isUser && (
          <p className={`text-xs ${theme.textSecondary} mt-1 font-mono opacity-50`}>
            via {message.provider}
          </p>
        )}
      </div>
    </motion.div>
  );
}
