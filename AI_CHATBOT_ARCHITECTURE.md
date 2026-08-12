# AI Chatbot Architecture Specification

## Data Flow Diagram
```text
User Input (Browser)
   │
   ▼
[ChatbotWidget / ChatWindow]
   │
   ▼ POST /api/chat (Serverless API)
[Rate Limiter & Input Validator]
   │
   ├── Prompt Injection Check
   │
   ▼ RAG Retrieval Engine
[knowledgeBase.js + Live DB Queries]
   │
   ▼ Context Injection
[Google Gemini 1.5 Flash REST API]
   │
   ▼ Response Formatter (Markdown Links & Suggestions)
Chatbot UI
```

## System Components

1. **Frontend Layer (`src/components/chatbot/`)**:
   - `ChatbotWidget`: Floating button trigger, keyboard listeners, popover management.
   - `ChatWindow`: Glassmorphic header, scroll container, clear history, error recovery.
   - `ChatMessage`: Markdown parsing for internal links (`[Events](/events)`), copy button.
   - `ChatInput`: Textarea with length limits, keyboard submission.
   - `SuggestedQuestions`: One-click prompt suggestions.

2. **Backend API Layer (`api/chat.js`)**:
   - Handles POST `/api/chat`.
   - Protects AI keys server-side (never exposed to client).
   - In-memory rate limiting (15 requests/min/IP).

3. **RAG & Knowledge Base (`src/ai/knowledgeBase.js`)**:
   - Keyword relevance scoring over static documents.
   - Dynamic event and announcement dataset lookups.
   - Offline fallback RAG generator when API key is missing/unreachable.
