export type AssistantMode = "jarvis" | "friday";

export type AIProvider = "openai" | "gemini" | "anthropic" | "auto";

export interface User {
  username: string;
  email: string;
  assistant_mode: AssistantMode;
  default_ai_provider: AIProvider;
  voice_calibrated_at: string | null;
  has_openai: boolean;
  has_gemini: boolean;
  has_anthropic: boolean;
  has_serpapi: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  provider?: string;
  sources?: SearchResult[];
  created_at?: string;
  error?: boolean;
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface SystemStatus {
  cpu_percent: number;
  memory_percent: number;
  memory_used_gb: number;
  memory_total_gb: number;
  disk_percent: number;
  platform: string;
}

export interface MemoryItem {
  key: string;
  value: string;
  updated_at: string;
}
