# Personal AI — Jarvis & Friday

A high-tech AI assistant inspired by **J.A.R.V.I.S.** and **F.R.I.D.A.Y.** (from the Marvel universe) with a futuristic HUD interface, voice control, multi-model AI routing, real-time web search, and system automation.

---

## ✨ Features

### 🎨 Dual Personality UI
- **J.A.R.V.I.S.** — Dark holographic blue theme, monospace fonts, scan-line effects, technical voice
- **F.R.I.D.A.Y.** — Warm amber minimal theme, clean sans-serif, friendly conversational voice
- Animated HUD rings, waveform bars, and AI pulse indicators
- Smooth Framer Motion transitions throughout

### 🎙️ Voice System
- Real-time voice recognition via the **Web Speech API**
- Wake word support — say **"Hey Jarvis"** or **"Hey Friday"** to activate
- Text-to-speech output with personality-matched voice tone
- Voice calibration workflow (runs once every 30 days, adapts to user accent/pitch)

### 🤖 Multi-Model AI
- Connect your own API keys for **Gemini**, **ChatGPT (OpenAI)**, and **Claude (Anthropic)**
- Choose a default provider or let the **AI Router** pick automatically:
  - Coding questions → OpenAI
  - Deep reasoning/analysis → Anthropic
  - Conversation → Gemini
- Short-term session memory + optional long-term memory storage

### 🌐 Online Search (RAG)
- Real-time web search via **SerpAPI**
- Results are injected as context into the LLM prompt (RAG approach)
- Responses include answer + cited sources

### 🖥️ App Control & Automation
- Launch desktop applications: browser, VS Code, terminal, file manager
- Open arbitrary URLs from the assistant
- Whitelist-based command execution (safe by design)
- Modular plugin architecture for future automation

### 🔐 Secure Authentication
- JWT-based authentication with bcrypt password hashing
- Fernet-encrypted API key storage (encryption key is separate from JWT secret)
- Per-user preferences, voice profile, and AI provider settings persisted

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER                              │
│                                                             │
│  ┌─────────────┐   ┌──────────────┐   ┌─────────────────┐  │
│  │  Selection  │──▶│  Dashboard   │──▶│  Chat + Voice   │  │
│  │   Screen    │   │  (Jarvis/    │   │  (WebSocket /   │  │
│  │             │   │   Friday)    │   │   REST)         │  │
│  └─────────────┘   └──────────────┘   └─────────────────┘  │
│         │                │                    │             │
│   Framer Motion    HUD Components        Web Speech API     │
│   Tailwind CSS     Floating Panels       Zustand Store      │
└─────────────────────────────────────────────────────────────┘
                            │  HTTP + WebSocket
┌─────────────────────────────────────────────────────────────┐
│                      FastAPI BACKEND                        │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
│  │   Auth   │  │ AI Router│  │  Search  │  │  Memory   │  │
│  │  Module  │  │ Module   │  │  Module  │  │  Module   │  │
│  └──────────┘  └──────────┘  └──────────┘  └───────────┘  │
│                      │              │                       │
│               ┌──────────────┐  ┌──────────┐               │
│               │  App Control │  │ System   │               │
│               │  Module      │  │ Status   │               │
│               └──────────────┘  └──────────┘               │
│                                                             │
│  SQLite (async)  ·  SQLAlchemy ORM  ·  JWT + Fernet         │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
  OpenAI API          Gemini API         Anthropic API
  (GPT-4o)         (gemini-pro)         (Claude 3)
                            │
                       SerpAPI (web search)
```

---

## 📁 Folder Structure

```
personal_ai/
├── docker-compose.yml          # One-command stack
├── README.md
│
├── frontend/                   # Next.js 15 app
│   ├── app/
│   │   ├── page.tsx            # Selection screen (Jarvis / Friday)
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── dashboard/page.tsx  # Main assistant interface
│   ├── components/
│   │   ├── hud/
│   │   │   ├── HUDRings.tsx    # Animated concentric ring display
│   │   │   ├── Waveform.tsx    # Voice waveform bars
│   │   │   └── AIPulse.tsx     # AI activity pulse indicator
│   │   ├── chat/
│   │   │   ├── ChatPanel.tsx   # Chat history + input
│   │   │   └── ChatMessage.tsx # Individual message bubble
│   │   ├── panels/
│   │   │   ├── SystemStatusPanel.tsx  # CPU / memory / disk
│   │   │   ├── AppControlPanel.tsx    # Launch apps / URLs
│   │   │   └── SettingsPanel.tsx      # API keys, preferences
│   │   ├── selection/
│   │   │   └── SelectionScreen.tsx
│   │   └── voice/
│   │       └── VoiceCalibration.tsx
│   ├── hooks/
│   │   ├── useVoice.ts         # Web Speech API wrapper
│   │   └── useWebSocket.ts     # WS connection manager
│   ├── lib/
│   │   ├── api.ts              # REST + WS client
│   │   └── theme.ts            # Per-personality theme tokens
│   ├── store/index.ts          # Zustand global store
│   └── types/index.ts
│
└── backend/                    # FastAPI app
    ├── app/
    │   ├── main.py             # App entry, CORS, route registration
    │   ├── core/
    │   │   ├── config.py       # Pydantic settings
    │   │   ├── database.py     # Async SQLAlchemy engine + session
    │   │   └── security.py     # JWT, bcrypt, Fernet encryption
    │   ├── models/
    │   │   ├── user.py         # User, APIKey, VoiceProfile ORM models
    │   │   └── memory.py       # ConversationMessage, LongTermMemory
    │   ├── api/
    │   │   ├── routes/
    │   │   │   ├── auth.py     # /api/auth/*
    │   │   │   ├── chat.py     # /api/chat/*
    │   │   │   ├── search.py   # /api/search
    │   │   │   ├── memory.py   # /api/memory/*
    │   │   │   └── system.py   # /api/status, /api/launch, /api/open-url
    │   │   └── websocket.py    # /ws endpoint
    │   └── modules/
    │       ├── ai_router.py    # Provider selection + LLM calls
    │       ├── search_module.py # SerpAPI + RAG
    │       ├── memory_module.py # Session & long-term memory
    │       └── app_control.py  # Whitelist-based app launcher
    ├── requirements.txt
    └── .env.example
```

---

## 🚀 Quick Start

### Option 1 — Docker Compose (recommended)

```bash
# 1. Clone the repo
git clone https://github.com/abhishekrjanagoudar/personal_ai.git
cd personal_ai

# 2. Copy and fill in your environment variables
cp backend/.env.example backend/.env
# Edit backend/.env and add your API keys

# 3. Start both services
docker compose up --build
```

Open **http://localhost:3000** in your browser.

---

### Option 2 — Manual Setup

#### Backend

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and fill in SECRET_KEY, ENCRYPTION_KEY, and any AI API keys

# Start the server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

API docs available at **http://localhost:8000/docs**

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment (optional — defaults work for local dev)
# NEXT_PUBLIC_API_URL=http://localhost:8000
# NEXT_PUBLIC_WS_URL=ws://localhost:8000

# Development server
npm run dev

# OR production build
npm run build && npm start
```

Open **http://localhost:3000** in your browser.

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `SECRET_KEY` | ✅ | JWT signing secret — use a long random string in production |
| `ENCRYPTION_KEY` | ✅ | Fernet key for encrypting stored API keys. Generate with: `python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"` |
| `DATABASE_URL` | — | Defaults to `sqlite+aiosqlite:///./personal_ai.db` |
| `OPENAI_API_KEY` | — | Optional server-side OpenAI key (users can supply their own via the UI) |
| `GEMINI_API_KEY` | — | Optional server-side Gemini key |
| `ANTHROPIC_API_KEY` | — | Optional server-side Anthropic key |
| `SERPAPI_KEY` | — | Required for the **Search** feature |
| `FRONTEND_URL` | — | CORS allowed origin. Defaults to `http://localhost:3000` |

### Frontend

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend base URL. Defaults to `http://localhost:8000` |
| `NEXT_PUBLIC_WS_URL` | WebSocket base URL. Defaults to `ws://localhost:8000` |

---

## 🌐 API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create a new account |
| `POST` | `/api/auth/login` | Obtain a JWT access token |
| `GET` | `/api/auth/me` | Get current user profile |
| `PUT` | `/api/auth/api-keys` | Save (encrypted) AI API keys |
| `PUT` | `/api/auth/preferences` | Update mode / default provider |
| `POST` | `/api/auth/voice-calibration` | Store voice calibration profile |
| `POST` | `/api/chat` | Send a message (REST) |
| `GET` | `/api/chat/sessions` | List conversation sessions |
| `GET` | `/api/chat/history/{session_id}` | Fetch session message history |
| `POST` | `/api/search` | Web search with RAG context |
| `GET` | `/api/memory/long-term` | Retrieve long-term memories |
| `POST` | `/api/memory/long-term` | Upsert a long-term memory entry |
| `DELETE` | `/api/memory/long-term/{key}` | Delete a memory entry |
| `GET` | `/api/status` | System metrics (CPU / RAM / disk) |
| `POST` | `/api/launch` | Launch a whitelisted desktop app |
| `POST` | `/api/open-url` | Open a URL in the default browser |
| `GET` | `/api/apps` | List launchable apps |
| `WS` | `/ws` | Real-time chat (WebSocket) |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS v4 |
| **Animations** | Framer Motion |
| **State** | Zustand with persistence |
| **Voice** | Web Speech API (SpeechRecognition + SpeechSynthesis) |
| **Backend** | FastAPI, Python 3.11+ |
| **ORM** | SQLAlchemy (async) + aiosqlite |
| **Auth** | OAuth2 / JWT (python-jose), bcrypt (passlib) |
| **Encryption** | cryptography (Fernet) |
| **AI Providers** | OpenAI, Google Gemini, Anthropic |
| **Search** | SerpAPI |
| **Infra** | Docker, Docker Compose |

---

## 📸 Screenshots

| Selection Screen | Jarvis Dashboard | Friday Dashboard |
|---|---|---|
| Choose your assistant on launch | Dark holographic HUD with blue accents | Clean warm minimal interface |

---

## 🗺️ Data Flow

```
User speaks / types
        │
        ▼
  useVoice hook (Web Speech API)
        │
        ▼
  ChatPanel sends message
   via WebSocket or REST
        │
        ▼
  FastAPI /api/chat or /ws
        │
        ├──▶ AI Router (detect task type)
        │           │
        │           ├──▶ OpenAI (coding / search tasks)
        │           ├──▶ Gemini (conversation)
        │           └──▶ Anthropic (reasoning)
        │
        ├──▶ Search Module (if web search triggered)
        │           │
        │           └──▶ SerpAPI → RAG context injected into prompt
        │
        ├──▶ Memory Module (prepend conversation history)
        │
        └──▶ Response streamed back → TTS (SpeechSynthesis)
```

---

## 🔮 Future Improvements

- [ ] Streaming token-by-token responses via WebSocket
- [ ] File/image upload and multimodal support (vision)
- [ ] Plugin marketplace for custom automation modules
- [ ] Mobile PWA with offline voice mode
- [ ] Per-user model fine-tuning / RAG knowledge base
- [ ] Multi-language voice support
- [ ] Agent-mode: multi-step task planning and execution

---

## 📄 License

MIT

