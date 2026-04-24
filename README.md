# AI Content Repurposing Agent

A production-grade, portfolio-quality AI agent web application. Paste any long-form content and the agent autonomously repurposes it into five platform-ready marketing assets — all in one click.

## What it does

One article becomes five outputs, generated sequentially by Claude AI:

| Output | Format |
|--------|--------|
| LinkedIn Post | ~200 words, professional tone, 3–5 hashtags |
| Twitter/X Thread | 5 tweets, hook-first, each under 280 chars |
| Email Newsletter | Subject + preview + 150-word body + CTA |
| Video Script | 60-second script with [HOOK] [MAIN] [CTA] |
| SEO Meta Copy | Title tag (60 chars) + meta description (155 chars) + 5 keywords |

## Tech stack

- **Framework** — Next.js 16, App Router, TypeScript (strict)
- **AI** — Anthropic Claude (`claude-sonnet-4-6`) via `@anthropic-ai/sdk`
- **Auth + DB** — Supabase (email/password, magic link, PostgreSQL with RLS)
- **Styling** — Tailwind CSS v4, Framer Motion
- **Fonts** — Syne (headings), JetBrains Mono (labels/code)
- **Hosting** — Vercel

## Local setup

### 1. Clone and install

```bash
git clone <your-repo-url>
cd content-agent
npm install
```

### 2. Create a Supabase project

Go to [supabase.com](https://supabase.com) and create a new project.

### 3. Run the database schema

In your Supabase dashboard go to **SQL Editor**, paste the contents of `supabase/schema.sql`, and run it.

### 4. Set environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

- Supabase keys: **Settings → API** in your Supabase dashboard
- Anthropic key: [console.anthropic.com](https://console.anthropic.com)

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment on Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repository
3. Under **Environment Variables**, add all three variables from `.env.local`
4. Click **Deploy**

Vercel auto-deploys on every push to `main`.

## Project structure

```
content-agent/
  app/
    (auth)/login/          — Sign in page
    (auth)/signup/         — Sign up page
    (dashboard)/dashboard/ — Main agent interface
    (dashboard)/history/   — Past jobs
    api/repurpose/         — Server-side Claude API calls (API key never exposed)
    layout.tsx             — Root layout (fonts, metadata)
    page.tsx               — Landing page
  components/
    ui/
      Button.tsx           — Shared button (3 variants, Framer Motion)
      Card.tsx             — Surface card
      LoadingPipeline.tsx  — Animated 5-node pipeline with glow states
      OutputCard.tsx       — Expandable result card with clipboard copy
    AgentInterface.tsx     — Full INPUT → RUNNING → RESULTS state machine
    AuthForm.tsx           — Login/signup with password + magic link toggle
    HistoryList.tsx        — Paginated job history with expand/collapse
    Navbar.tsx             — Fixed top nav with live Supabase auth state
  lib/
    supabase/client.ts     — Browser Supabase client
    supabase/server.ts     — Server Supabase client
    anthropic.ts           — Anthropic client + all 5 agent prompts
    types.ts               — TypeScript interfaces and platform config
  middleware.ts            — Session refresh + route protection
  supabase/schema.sql      — Run once in Supabase SQL Editor
```

## Security

- `ANTHROPIC_API_KEY` is only used in the API route (`app/api/repurpose/route.ts`) — never exposed to the browser
- All dashboard routes protected by `middleware.ts` via Supabase `getUser()` (server-validated, not JWT-trusted)
- Row Level Security enabled on both tables — users can only access their own data

## Screenshots

_Add screenshots after deployment._
