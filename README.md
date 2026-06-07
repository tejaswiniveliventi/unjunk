# 🌿 Unjunk

**Find cleaner, better-ingredient alternatives to your favourite packaged foods — available near you.**

Unjunk takes any packaged food you crave, analyzes its ingredients, and finds a real alternative with fewer additives, lower processing, and a similar taste profile. Available for Indian cities with US expansion coming.

---

## What It Does

1. You type a food — "Kurkure Masala Munch", "Maggi", "Oreo"
2. Unjunk finds 3 cleaner alternatives available in your city
3. Each alternative is scored on a cleanliness rubric (NOVA score, additive flags, ingredient count)
4. Direct buy links to Blinkit, Zepto, BigBasket, Swiggy Instamart, Amazon India
5. Optional: drop your email and get a follow-up survey in 48 hours to rate if it actually tasted similar

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router, TypeScript) |
| Styling | Tailwind CSS + CSS Variables |
| Backend | Next.js Serverless API Routes |
| Database | Supabase (PostgreSQL + pgvector) |
| Cache | Upstash Redis |
| AI — Normalize | Groq (Llama 3.1 8B) |
| AI — Find Alternatives | Gemini 2.0 Flash + Google Search Grounding |
| AI — Explanations | Groq (Llama 3.1 8B) |
| Food Data | Open Food Facts API |
| Email | Resend |
| Hosting | Vercel |

**Cost at zero scale: $0/month.** Only Groq and Gemini API calls cost money — fractions of a cent per search.

---

## Architecture

```
User (PWA)
    │
    ▼
Next.js API Route (/api/search)
    │
    ├── Upstash Redis          ← check cache first
    ├── Open Food Facts API    ← fetch ingredient data
    ├── Groq (Call 1)          ← normalize user input → structured JSON
    ├── Gemini (Call 2)        ← find alternatives + Google Search grounding
    ├── Groq (Call 3)          ← generate friendly explanation
    │
    ▼
Supabase PostgreSQL
    ├── searches               ← every user search logged
    ├── products               ← clean alternative product catalog
    ├── alternatives           ← which products were recommended for which search
    ├── pipeline_logs          ← exact prompts + responses for every AI call
    ├── survey_responses       ← user feedback on taste similarity
    └── email_queue            ← 48hr delayed survey emails
```

### The Three AI Calls

**Call 1 — Groq (fast, cheap, structured)**
Normalizes raw user input into a canonical food name, brand, category, and flavor profile. Uses Llama 3.1 8B at temperature 0.1 for consistent JSON output.

**Call 2 — Gemini 2.0 Flash (search-grounded)**
The core intelligence. Finds 3 real Indian alternatives using Google Search grounding — meaning it searches the live web as part of its reasoning. Returns structured JSON with product names, clean ingredients, and NOVA estimates.

**Call 3 — Groq (fast, friendly)**
Generates a 2-sentence human explanation of why the alternative was chosen. Warm, conversational tone — like a friend texting you a recommendation.

### Cleanliness Scoring Rubric

Every alternative is scored 0–12:

```
Base score: 10

Penalties:
  NOVA score penalty    → (NOVA - 1) × 2         max -6
  Ingredient count      → -1 per 3 over threshold
  Artificial colors     → -3
  Artificial sweeteners → -3
  Preservatives         → -2
  Hydrogenated oils     → -3
  MSG/Glutamates        → -1
  HFCS                  → -2
  Nitrates              → -2
  Vanaspati             → -3  (India)
  Maida as primary      → -2  (India)

Bonuses:
  Organic certified     → +1
  Non-GMO               → +1
  FSSAI Organic         → +1
  Ancient grains        → +1
  No added sugar        → +1
  Cold pressed oil      → +1

Threshold to recommend: ≥ 6
```

Rubric config is stored per-region in the database as JSONB — adding US-specific rules requires no code changes.

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── search/route.ts      # Core search endpoint
│   │   ├── survey/route.ts      # Tally webhook handler
│   │   └── email/route.ts       # Email capture
│   ├── layout.tsx
│   └── page.tsx                 # Single page app
│
├── modules/                     # Business logic — never import across modules directly
│   ├── ai/
│   │   ├── providers/           # Groq + Gemini adapters
│   │   ├── prompts/             # All prompts in one place
│   │   └── pipeline.ts          # Orchestrates 3 AI calls
│   ├── food/
│   │   ├── sources/             # Open Food Facts adapter
│   │   └── scoring/             # Cleanliness rubric engine
│   ├── regions/
│   │   ├── cities.ts            # Supported cities registry
│   │   └── platforms.ts         # Buy link URL construction
│   ├── cache/                   # Upstash Redis logic
│   ├── db/                      # All Supabase queries
│   └── survey/                  # Survey scheduling
│
├── components/                  # UI only, no business logic
│   ├── SearchForm.tsx
│   ├── ResultsList.tsx
│   ├── AlternativeCard.tsx
│   └── EmailCapture.tsx
│
└── lib/
    ├── types.ts                 # All TypeScript types
    ├── parseJson.ts             # AI response JSON parser
    └── supabase/
        ├── client.ts            # Browser client (anon key)
        └── server.ts            # Server client (service role key)
```

---

## Supported Cities

| City | Platforms |
|---|---|
| Bangalore | Blinkit, Zepto, BigBasket, Swiggy Instamart, Amazon India |
| Mumbai | Blinkit, Zepto, BigBasket, Swiggy Instamart, Amazon India |
| Delhi | Blinkit, Zepto, BigBasket, Swiggy Instamart, Amazon India |
| Hyderabad | BigBasket, Blinkit, Swiggy Instamart, Amazon India |
| Pune | Zepto, Blinkit, BigBasket, Amazon India |
| Chennai | BigBasket, Swiggy Instamart, Amazon India |

US cities coming soon.

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project (free tier)
- An Upstash Redis database (free tier)
- Gemini API key (Google AI Studio — free)
- Groq API key (Groq Console — free)
- Resend account (free tier — 3,000 emails/month)

### Installation

```bash
git clone https://github.com/yourusername/unjunk.git
cd unjunk
npm install
```

### Environment Variables

Create `.env.local` in the project root:

```env
# AI
GEMINI_API_KEY=
GROQ_API_KEY=

# Database
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Cache
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Email
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DEFAULT_REGION=IN
```

### Database Setup

Run the SQL migrations in order in your Supabase SQL editor:

1. `supabase/migrations/01_extensions_geography.sql`
2. `supabase/migrations/02_products_searches.sql`
3. `supabase/migrations/03_alternatives_survey_email.sql`
4. `supabase/migrations/04_seed.sql`
5. `supabase/migrations/05_indexes.sql`
6. `supabase/migrations/06_pipeline_logs.sql`

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Test the API

```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "inputText": "Kurkure Masala Munch",
    "citySlug": "bangalore",
    "sessionId": "test-session-abc123"
  }'
```

---

## Deployment

Unjunk is designed to deploy on Vercel with zero configuration.

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repository to Vercel and it deploys automatically on every push to `main`.

**Add all environment variables** in your Vercel project settings under Settings → Environment Variables before deploying.

---

## Caching Strategy

```
Request comes in
    │
    ├── Redis cache hit?  → return immediately (< 10ms)
    │
    └── Cache miss
            │
            ├── Open Food Facts lookup
            ├── AI pipeline (3 calls, ~4-8 seconds)
            ├── Save to Supabase
            ├── Cache in Redis (TTL: 7 days)
            └── Return result
```

Cache key format: `search:{regionCode}:{citySlug}:{normalizedFoodSlug}`

Same search by any user in the same city hits the cache — AI is only called once per unique food+city pair.

---

## Feedback Loop

The long-term value of Unjunk comes from survey data:

1. User searches → gets alternatives
2. User provides email → survey scheduled for 48 hours later
3. Resend delivers survey link (Tally form)
4. User answers: Did you order it? Did it taste similar? (1–5) Overall rating (1–5)
5. Responses stored in `survey_responses` table
6. `taste_similarity_real` on alternatives updated from real feedback
7. Future: highly-rated pairs surface higher in results

---

## Roadmap

- [x] India launch — 6 cities
- [x] Open Food Facts integration
- [x] AI pipeline (Groq + Gemini)
- [x] Redis caching
- [x] Pipeline logging
- [x] Survey feedback loop
- [ ] Ingredient paste — let users paste ingredients from packet
- [ ] pgvector semantic cache — similar searches resolve to same result
- [ ] US expansion — flip the region switch
- [ ] WhatsApp survey delivery (Indians prefer it)
- [ ] Brand submission portal — brands apply to be listed
- [ ] Admin dashboard — curate and override cached results
- [ ] Mobile app (React Native)

---

## Contributing

This is an early-stage project. If you find a product recommendation that's wrong, inaccurate, or unavailable in your city — open an issue with the food name, city, and what was recommended.

---

## License

MIT