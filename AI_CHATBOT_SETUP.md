# AI Chatbot Setup Guide

## Overview
The Sri Anjaneya Youth Zarugumalli AI Chatbot provides natural-language assistance to visitors and members, leveraging Retrieval-Augmented Generation (RAG) and Google Gemini API integration.

## Configuration & Environment Variables
Add the following keys to your `.env` file (server-side only, never prefix with `VITE_`):

```env
# AI Chatbot Configuration
GEMINI_API_KEY=your_google_gemini_api_key_here
AI_PROVIDER=gemini
AI_MODEL=gemini-1.5-flash
CHAT_MAX_TOKENS=800
CHAT_RATE_LIMIT=15
```

## Local Development
1. Start the Vite development server:
   ```bash
   npm run dev
   ```
2. Open `http://localhost:5173`.
3. Click the floating robot icon in the bottom right corner to open the AI Chat Assistant.

## Deployment (Vercel / Netlify / Firebase)
Ensure `GEMINI_API_KEY`, `AI_PROVIDER`, and `AI_MODEL` are set in your environment variables settings on your serverless hosting provider (Vercel Environment Variables).
