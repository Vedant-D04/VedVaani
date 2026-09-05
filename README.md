# VedVaani

A mobile Expo MVP for sharing live, human voice readings from books.

## Setup

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and add your Supabase URL and anon key.
3. In Supabase, run `supabase/schema.sql`.
4. Create a public storage bucket named `post-audio`.
5. Start the app: `npm run start`

The app uses email magic-link auth, live-only microphone recording, inline playback, comments, likes, reports, explore filters, and light/dark theme tokens.
