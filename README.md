# Relationship OS — Do Something

**A little internet that belongs to two people.**

One big button. AI-generated activities. Synced across both your phones.

Feisty games, bonding questions, chaos, sweet moments — generated live for the two of you.

## What it is

- **Not** a multi-page relationship dashboard
- **Yes**: a focused, premium dark experience centered on **DO SOMETHING**
- Two accounts linked via invite code → shared history on both devices
- AI generates fresh activities (or smart fallbacks if no key)

## Design

Apple restraint + Spotify dark atmosphere + green accent (`#1ED760`).

Almost everything is black / white / gray. Green only for the important stuff.

## Stack

- React + Vite + Tailwind v4 + Framer Motion
- Supabase (auth, pairing, shared activity history)
- OpenAI-compatible API (OpenAI or **Groq free tier**)

## Setup (tonight)

### 1. Install

```bash
unzip relationship-os.zip
cd relationship-os
npm install
```

### 2. Env

```bash
cp .env.example .env
```

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...

VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...

# AI key optional — works fully offline for free
```

No AI key needed. Activities come from a built-in free pool.


### 3. Supabase

1. Create project
2. Run **entire** `supabase-schema.sql` in SQL Editor (includes `activities` table)
3. Auth → Email enabled
4. Auth → URL config: Site URL `http://localhost:5173`
5. Storage buckets (optional for avatars): `avatars`

### 4. Run

```bash
npm run dev
```

### Flow

1. Both of you register
2. One creates the space → gets invite code (`LOVE-XXXX`)
3. Other joins with the code
4. Both land on the same **DO SOMETHING** home
5. Press the button → thinking sequence → activity reveal
6. Save / Reroll — history is shared

## AI — fully free by default

Activities work **with $0 spent**.

A large offline pool of feisty / bonding / competitive activities is built in.
Mood filters still work. History still syncs across both devices via Supabase.

### Optional free live generation
If you later want AI-generated variety (still free):

1. Groq free tier → [console.groq.com](https://console.groq.com)
2. Add to `.env`:
```
VITE_AI_API_KEY=gsk_...
VITE_AI_BASE_URL=https://api.groq.com/openai/v1
VITE_AI_MODEL=llama-3.3-70b-versatile
```

No key required. No Grok/OpenAI billing.


## Production

```bash
npm run build
```

Deploy frontend to Vercel/Netlify. Point Supabase auth redirect URLs to your domain.

## License

Private — just for the two of you.
