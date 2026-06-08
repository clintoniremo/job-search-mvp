# Job Search MVP

A Next.js prototype for an AI job search assistant.

## Features

- Aggregates jobs via Remotive (live job feed) and Adzuna when configured
- Demonstrates LinkedIn OAuth profile sync stub
- AI-powered job match scoring and tailoring
- Simple UI for job search, profile loading, and job analysis

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env.local` with the values below if you want real integrations:
   ```env
   ADZUNA_APP_ID=your_adzuna_app_id
   ADZUNA_APP_KEY=your_adzuna_app_key
   LINKEDIN_CLIENT_ID=...
   LINKEDIN_CLIENT_SECRET=...
   LINKEDIN_REDIRECT_URI=http://localhost:3000/linkedin-callback
   AI_API_URL=https://api.openai.com/v1/chat/completions
   AI_API_KEY=...
   ```
3. Run the app:
   ```bash
   npm run dev
   ```

## Notes

- The app falls back to demo LinkedIn profile data and a local AI simulation when keys are not configured.
- For production, use proper OAuth state handling and secure server-side storage.
