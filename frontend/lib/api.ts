const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...getAuthHeaders(), ...(options.headers || {}) },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

// Auth
export async function register(username: string, email: string, password: string) {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  });
}

export async function login(username: string, password: string): Promise<{ access_token: string; username: string; assistant_mode: string }> {
  const form = new URLSearchParams({ username, password });
  const res = await fetch(`${BASE_URL}/api/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Login failed");
  }
  return res.json();
}

export async function getProfile() {
  return request("/api/auth/me");
}

export async function updateProfile(data: Record<string, unknown>) {
  return request("/api/auth/me", { method: "PUT", body: JSON.stringify(data) });
}

export async function updateVoiceCalibration(voiceProfile: string) {
  return request("/api/auth/voice-calibration", { method: "POST", body: JSON.stringify({ voice_profile: voiceProfile }) });
}

// Chat
export async function sendChat(message: string, sessionId: string | null, useSearch: boolean) {
  return request("/api/chat", {
    method: "POST",
    body: JSON.stringify({ message, session_id: sessionId, use_search: useSearch }),
  });
}

export async function getChatHistory(sessionId: string) {
  return request(`/api/chat/history/${sessionId}`);
}

export async function getSessions() {
  return request("/api/chat/sessions");
}

// Search
export async function webSearch(query: string, numResults = 5) {
  return request("/api/search", {
    method: "POST",
    body: JSON.stringify({ query, num_results: numResults }),
  });
}

// System
export async function getSystemStatus() {
  return request("/api/system/status");
}

export async function launchApp(appName: string) {
  return request("/api/system/launch", { method: "POST", body: JSON.stringify({ app_name: appName }) });
}

export async function openUrl(url: string) {
  return request("/api/system/open-url", { method: "POST", body: JSON.stringify({ url }) });
}

export async function listApps() {
  return request("/api/system/apps");
}

// Memory
export async function getMemory() {
  return request("/api/memory");
}

export async function upsertMemory(key: string, value: string) {
  return request("/api/memory", { method: "POST", body: JSON.stringify({ key, value }) });
}

// WebSocket
export function createWebSocket(token: string): WebSocket {
  const wsUrl = (process.env.NEXT_PUBLIC_WS_URL || "ws://127.0.0.1:8000") + "/ws";
  const ws = new WebSocket(wsUrl);
  ws.onopen = () => {
    ws.send(JSON.stringify({ type: "auth", token }));
  };
  return ws;
}
