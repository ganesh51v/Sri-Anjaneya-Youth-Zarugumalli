# AI Chatbot Knowledge Base & Data Sync

## Overview
The chatbot retrieves information from two distinct layers:

### 1. Static Knowledge Layer (`src/ai/knowledgeBase.js`)
Contains curated information regarding:
- **Organization**: History, mission, values, location (Zarugumalli, Prakasam, AP).
- **Activities**: Hanuman Jayanthi, Annadanam, blood donation, temple maintenance.
- **Website Navigation**: Route mappings (`/`, `/events`, `/members`, `/gallery`, `/announcements`, `/donate`, `/expenditure`, `/profile`).
- **FAQs**: Donation transparency, membership registration, committee approval.

### 2. Dynamic Layer (Live Database Integration)
For dynamic questions regarding upcoming events, recent announcements, or member counts, `/api/chat` attaches live data context prior to sending the query to Gemini API.

### Updating Knowledge Base
To update static answers, add or edit items in `STATIC_KNOWLEDGE` inside `src/ai/knowledgeBase.js`.
