import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AssistantMode, AIProvider, User, ChatMessage, SystemStatus } from "@/types";

interface AppState {
  // Auth
  token: string | null;
  user: User | null;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  logout: () => void;

  // Assistant
  mode: AssistantMode;
  setMode: (mode: AssistantMode) => void;

  // Chat
  sessionId: string | null;
  messages: ChatMessage[];
  isLoading: boolean;
  setSessionId: (id: string | null) => void;
  addMessage: (msg: ChatMessage) => void;
  setMessages: (msgs: ChatMessage[]) => void;
  setIsLoading: (v: boolean) => void;
  clearMessages: () => void;

  // System
  systemStatus: SystemStatus | null;
  setSystemStatus: (s: SystemStatus | null) => void;

  // Voice
  isListening: boolean;
  isCalibrating: boolean;
  setIsListening: (v: boolean) => void;
  setIsCalibrating: (v: boolean) => void;

  // Search
  useSearch: boolean;
  setUseSearch: (v: boolean) => void;

  // WebSocket
  wsConnected: boolean;
  setWsConnected: (v: boolean) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setToken: (token) => {
        set({ token });
        if (typeof window !== "undefined") {
          if (token) localStorage.setItem("token", token);
          else localStorage.removeItem("token");
        }
      },
      setUser: (user) => set({ user }),
      logout: () => set({ token: null, user: null, messages: [], sessionId: null }),

      mode: "jarvis",
      setMode: (mode) => set({ mode }),

      sessionId: null,
      messages: [],
      isLoading: false,
      setSessionId: (id) => set({ sessionId: id }),
      addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
      setMessages: (msgs) => set({ messages: msgs }),
      setIsLoading: (v) => set({ isLoading: v }),
      clearMessages: () => set({ messages: [] }),

      systemStatus: null,
      setSystemStatus: (s) => set({ systemStatus: s }),

      isListening: false,
      isCalibrating: false,
      setIsListening: (v) => set({ isListening: v }),
      setIsCalibrating: (v) => set({ isCalibrating: v }),

      useSearch: false,
      setUseSearch: (v) => set({ useSearch: v }),

      wsConnected: false,
      setWsConnected: (v) => set({ wsConnected: v }),
    }),
    {
      name: "personal-ai-store",
      partialize: (state) => ({
        token: state.token,
        mode: state.mode,
        sessionId: state.sessionId,
      }),
    }
  )
);
