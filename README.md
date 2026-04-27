# 🍿 Popcorn Magic

A full-stack movie & TV show discovery app built with Next.js 16, Convex, Clerk, and the TMDb API. Built for the NYU LeetCode Bootcamp.

## Features

- Browse trending, popular, and upcoming movies & TV shows
- Search across all media with debounced real-time results
- Full detail pages with backdrop hero, cast, trailers (YouTube embed), similar/recommended rails
- Favorite any movie or TV show (persisted per user)
- Write and delete reviews with a 1–10 star rating
- Dark mode toggle
- Auth via Clerk (sign-in, sign-up, user profile)
- Real-time data via Convex

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Server Components) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | Convex (user data only) |
| Auth | Clerk v7 |
| Data | TMDb API v3 (Bearer token) |
| Deployment | Vercel |

## Local Setup

### 1. Clone and install

```bash
git clone <your-repo-url>
cd Popcorn-Magic
npm install
```

### 2. Create accounts and get your keys

| Service | Signup URL | What you need |
|---|---|---|
| TMDb | https://developer.themoviedb.org | v4 Read Access Token (long JWT under API → API Read Access Token) |
| Convex | https://dashboard.convex.dev | Deployment URL + deployment name |
| Clerk | https://dashboard.clerk.com | Publishable key, Secret key, Webhook secret |

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Then fill in `.env.local`:

```env
# TMDb — v4 Read Access Token (NOT the v3 API key)
TMDB_READ_ACCESS_TOKEN=eyJhbGci...

# Convex — from your dashboard or after running `npx convex dev`
NEXT_PUBLIC_CONVEX_URL=https://xxx.convex.cloud
CONVEX_DEPLOYMENT=prod:xxx

# Clerk — from https://dashboard.clerk.com → your app → API Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk webhook secret — created when you add the webhook endpoint (see below)
CLERK_WEBHOOK_SECRET=whsec_...
```

### 4. Push Convex schema

```bash
npx convex dev
```

This starts a local Convex backend and pushes the schema. Leave it running while you develop, or run `npx convex dev --once` to push once and exit.

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 6. Verify the TMDb connection

```
GET http://localhost:3000/api/health/tmdb
→ { "ok": true, "count": 20 }
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Home — hero + rails
│   ├── search/page.tsx           # Search results
│   ├── movie/[id]/page.tsx       # Movie detail
│   ├── tv/[id]/page.tsx          # TV show detail
│   ├── profile/page.tsx          # My reviews + favorites
│   ├── genres/[id]/page.tsx      # Genre discovery
│   └── api/
│       ├── health/tmdb/          # Token health check
│       └── webhooks/clerk/       # Clerk → Convex user sync
├── components/
│   ├── ui/                       # shadcn/ui primitives
│   ├── hero-rotator.tsx          # Auto-advancing hero banner
│   ├── media-card.tsx            # Poster card
│   ├── media-rail.tsx            # Horizontal scroll rail
│   ├── search-bar.tsx            # Debounced search input
│   ├── favorite-button.tsx       # Optimistic toggle
│   ├── review-form.tsx           # 1–10 rating + text
│   ├── review-list.tsx           # Real-time review feed
│   ├── review-section.tsx        # Composes form + list + favorite
│   ├── trailer-modal.tsx         # YouTube embed dialog
│   └── cast-row.tsx              # Horizontal cast strip
└── lib/
    └── tmdb/
        ├── client.ts             # tmdbFetch — Bearer auth, typed
        ├── endpoints.ts          # All TMDb endpoint wrappers
        ├── images.ts             # tmdbImage / tmdbBackdrop helpers
        └── types.ts              # Movie, TVShow, MediaItem, etc.

convex/
├── schema.ts                     # users, reviews, favorites tables
├── users.ts                      # getOrCreate, current
├── reviews.ts                    # listByMedia, upsert, remove
└── favorites.ts                  # listMine, toggle, isFavorited
```

## Architectural Notes

- **TMDb token never reaches the client.** All TMDb fetches happen in Server Components or Route Handlers. The token is a server-only env var.
- **Convex stores only user data** (reviews, favorites, user profiles). The TMDb catalog is never mirrored into Convex.
- **Revalidation strategy:** trending/popular = 1 hour, detail pages = 24 hours, search = no-store.
- **Auth flow:** Clerk issues a JWT → `ConvexProviderWithClerk` threads it into every Convex query/mutation → Clerk webhook syncs new/updated users into the `users` table via `users.getOrCreate`.

## Setting up the Clerk Webhook (required for user sync)

1. Go to [Clerk Dashboard](https://dashboard.clerk.com) → your app → **Webhooks** → **Add Endpoint**
2. URL: `https://<your-vercel-domain>/api/webhooks/clerk`
3. Events to subscribe: `user.created`, `user.updated`
4. Copy the **Signing Secret** → paste as `CLERK_WEBHOOK_SECRET` in your env vars

## Scripts

```bash
npm run dev        # Start dev server
npm run build      # Production build (TS check included)
npm run lint       # ESLint
npx convex dev     # Start local Convex backend
```
