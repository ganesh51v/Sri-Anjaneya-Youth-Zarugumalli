# AI Chatbot Security & Defense Mechanisms

## 1. Secret Protection
- **No Client Exposure**: `GEMINI_API_KEY` is strictly a backend environment variable. The browser never receives or handles the raw API key.
- All requests proxy through `/api/chat`.

## 2. Prompt Injection & Jailbreak Defenses
- Regex filters scan incoming user messages for known injection patterns:
  - `ignore previous instructions`
  - `show system prompt`
  - `reveal secret/password/key`
  - `drop table / SQL commands`
  - `<script> / eval()`
- Flagged inputs receive a safe default response refusing to leak internal prompts or credentials.

## 3. Rate Limiting & DoS Protection
- Token bucket rate limiter restricts IP addresses to max 15 requests per minute.
- Returns `429 Too Many Requests` when exceeded.

## 4. Output Sanitization & XSS
- User messages and AI responses undergo React HTML-escaping.
- Markdown link parsing is restricted to internal relative routes (`/events`, `/donate`, `/members`) or safe external HTTPS links.
