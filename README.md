# 🍿 Popcorn Magic

A full-stack movie & TV show discovery app with AI-powered recommendations, built with Next.js 16, Convex, Clerk, Claude AI, and the TMDb API. Built for the NYU LeetCode Bootcamp.

**Live:** https://popcornmagic.vercel.app

---

## What's Built

### Browsing & Discovery
- **Home page** — auto-advancing hero banner (top 5 trending) + 4 horizontal rails: Trending Today, Popular Movies, Popular TV, Upcoming Movies
- **Movie detail pages** (`/movie/[id]`) — backdrop hero, poster, genres, runtime, rating, tagline, overview, trailer modal (YouTube embed), top 10 cast strip, Similar & Recommended rails
- **TV show detail pages** (`/tv/[id]`) — same as movie but shows seasons/episodes count
- **Genre pages** (`/genres/[id]`) — paginated discover grid, toggle between Movies and TV

### Search
- **`/search`** — debounced real-time search across all movies & TV shows, results update as you type

### Auth
- **Sign in / Sign up** via Clerk (Google, email/password) — modal-based, no page redirect
- Protected routes: `/profile` and `/favorites` require sign-in

### User Features (requires sign-in)
- **Favorites** (`/favorites`) — save any movie or TV show, remove from favorites grid
- **Reviews** — write a 1–10 star review + text on any detail page, delete your own reviews
- **Profile** (`/profile`) — shows your avatar, favorite/review counts, your reviews tab

### AI Recommendations
- **AI Picks tab** on the profile page — Claude AI (Haiku) analyzes your favorites and reviews and suggests 6 personalized movies/TV shows with genre tags and reasons
- Refresh button to get new suggestions
- Each recommendation links directly to search

### Infrastructure
- **Convex** real-time database for users, reviews, favorites
- **Clerk webhook** syncs new users into Convex; `UserSync` component as client-side fallback
- **TMDb health check** — `GET /api/health/tmdb` verifies the token is working

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Server Components) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | Convex (real-time, user data only) |
| Auth | Clerk v7 |
| AI | Anthropic Claude Haiku (recommendations) |
| Data | TMDb API v3 (Bearer token, server-side only) |
| Deployment | Vercel |

---

## Local Setup

### 1. Clone and install
```bash
git clone https://github.com/shwetashekhar98/Popcorn-Magic.git
cd Popcorn-Magic
npm install
```

### 2. Get your API keys

| Service | Signup | What you need |
|---|---|---|
| TMDb | https://developer.themoviedb.org | v4 Read Access Token (long JWT) |
| Convex | https://dashboard.convex.dev | Auto-configured via `npx convex dev` |
| Clerk | https://dashboard.clerk.com | Publishable key + Secret key |
| Anthropic | https://console.anthropic.com | API key (for AI recommendations) |

### 3. Configure environment variables
```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:
```env
TMDB_READ_ACCESS_TOKEN=eyJhbGci...

NEXT_PUBLIC_CONVEX_URL=https://xxx.convex.cloud
CONVEX_DEPLOYMENT=prod:xxx

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...   # optional for local dev

ANTHROPIC_API_KEY=sk-ant-...
```

### 4. Start Convex + Next.js (two terminals)

**Terminal 1:**
```bash
npx convex dev
```

**Terminal 2:**
```bash
npm run dev
```

Open http://localhost:3000

### 5. Verify setup
```
GET http://localhost:3000/api/health/tmdb
→ { "ok": true, "count": 20 }
```

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                     # Home — hero + 4 rails
│   ├── search/page.tsx              # Search results
│   ├── movie/[id]/page.tsx          # Movie detail
│   ├── tv/[id]/page.tsx             # TV show detail
│   ├── profile/page.tsx             # Profile — AI Picks + Reviews
│   ├── favorites/page.tsx           # Favorites grid
│   ├── genres/[id]/page.tsx         # Genre discovery
│   └── api/
│       ├── health/tmdb/             # TMDb token health check
│       ├── recommendations/         # Claude AI recommendations
│       └── webhooks/clerk/          # Clerk → Convex user sync
├── components/
│   ├── ui/                          # shadcn/ui primitives
│   ├── hero-rotator.tsx             # Auto-advancing hero banner
│   ├── media-card.tsx               # Poster card with rating
│   ├── media-rail.tsx               # Horizontal scroll rail
│   ├── search-bar.tsx               # Debounced search input
│   ├── favorite-button.tsx          # Optimistic ♥ toggle
│   ├── favorites-list.tsx           # Favorites page grid
│   ├── review-form.tsx              # 1–10 star rating + textarea
│   ├── review-list.tsx              # Real-time review feed
│   ├── review-section.tsx           # Favorite + review composition
│   ├── trailer-modal.tsx            # YouTube embed dialog
│   ├── cast-row.tsx                 # Horizontal cast strip
│   ├── ai-picks.tsx                 # Claude AI recommendations UI
│   ├── profile-content.tsx          # Profile page with tabs
│   ├── user-sync.tsx                # Client-side Convex user creation
│   ├── auth-buttons.tsx             # Sign in/out buttons
│   ├── header.tsx / footer.tsx      # Layout
│   └── theme-toggle.tsx             # Dark/light mode
└── lib/
    └── tmdb/
        ├── client.ts                # tmdbFetch — Bearer auth, typed
        ├── endpoints.ts             # All endpoint wrappers
        ├── images.ts                # tmdbImage / tmdbBackdrop helpers
        └── types.ts                 # Movie, TVShow, MediaItem types

convex/
├── schema.ts                        # users, reviews, favorites tables
├── users.ts                         # getOrCreate, current
├── reviews.ts                       # listByMedia, upsert, remove
└── favorites.ts                     # listMine, toggle, isFavorited
```

---

## Deploying to Vercel

### Required environment variables on Vercel

| Variable | Description |
|---|---|
| `TMDB_READ_ACCESS_TOKEN` | TMDb v4 read access token |
| `NEXT_PUBLIC_CONVEX_URL` | Production Convex URL from `npx convex deploy` |
| `CONVEX_DEPLOYMENT` | Production deployment name |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `CLERK_WEBHOOK_SECRET` | Clerk webhook signing secret |
| `ANTHROPIC_API_KEY` | Anthropic API key for AI recommendations |

### Clerk webhook (for user sync)
1. Clerk Dashboard → **Webhooks → Add Endpoint**
2. URL: `https://<your-domain>/api/webhooks/clerk`
3. Events: `user.created`, `user.updated`
4. Copy Signing Secret → `CLERK_WEBHOOK_SECRET`

### Deploy Convex to production
```bash
npx convex deploy
```
Copy the output URLs into Vercel env vars.

---

## Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build (TypeScript check included)
npm run lint         # ESLint
npx convex dev       # Start local Convex backend
npx convex deploy    # Deploy Convex to production
```
