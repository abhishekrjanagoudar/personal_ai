"use client";

import { useEffect, useRef, useCallback } from "react";
import { useStore } from "@/store";
import { createWebSocket } from "@/lib/api";

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const { token, setWsConnected, addMessage, setIsLoading, setSessionId } = useStore();

  const connect = useCallback(() => {
    if (!token || wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = createWebSocket(token);
    wsRef.current = ws;

    ws.onopen = () => setWsConnected(true);

    ws.onclose = () => {
      setWsConnected(false);
      // Reconnect after 3s
      setTimeout(() => connect(), 3000);
    };

    ws.onerror = () => setWsConnected(false);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "chat_response") {
        setIsLoading(false);
        if (data.session_id) setSessionId(data.session_id);
        addMessage({
          id: Date.now().toString(),
          role: "assistant",
          content: data.reply,
          provider: data.provider,
          sources: data.sources || [],
          error: data.error,
        });
      }
    };
  }, [token, setWsConnected, addMessage, setIsLoading, setSessionId]);

  const sendMessage = useCallback(
    (message: string, sessionId: string | null, useSearch: boolean) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({ type: "chat", message, session_id: sessionId, use_search: useSearch })
        );
        return true;
      }
      return false;
    },
    []
  );

  useEffect(() => {
    if (token) connect();
    return () => wsRef.current?.close();
  }, [token, connect]);

  return { sendMessage, ws: wsRef.current };
}
