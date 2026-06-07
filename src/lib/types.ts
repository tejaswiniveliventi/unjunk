// src/lib/types.ts

// ─── Geography ───────────────────────────────────────────────

export type RegionCode = 'IN' | 'US'

export type Region = {
  id: string
  code: RegionCode
  name: string
  isActive: boolean
}

export type City = {
  id: string
  regionCode: RegionCode
  name: string
  state: string
  slug: string          // 'bangalore', 'san-francisco'
  isActive: boolean
  platforms: PlatformKey[]   // which platforms are live in this city
}

// ─── Platforms ───────────────────────────────────────────────

// Every supported platform gets a key — adding a new one
// means adding it here first, then everywhere else breaks
// loudly until you handle it. That's intentional.

export type PlatformKey =
  | 'blinkit'
  | 'zepto'
  | 'bigbasket'
  | 'swiggy_instamart'
  | 'amazon_in'
  | 'amazon_us'
  | 'whole_foods'
  | 'instacart'

export type BuyLink = {
  platform: PlatformKey
  url: string
  label: string         // 'Buy on Blinkit'
}

// ─── Food & Products ─────────────────────────────────────────

export type NovaScore = 1 | 2 | 3 | 4

export type NutriScore = 'A' | 'B' | 'C' | 'D' | 'E'

export type AdditiveFlags = {
  artificialColors: string[]
  artificialSweeteners: string[]
  preservatives: string[]
  hydrogenatedOils: string[]
  msgGlutamates: string[]
  hfcs: string[]
  nitrates: string[]
  // India specific
  vanaspati: boolean
  maidaPrimary: boolean
  // US specific
  bhaBht: boolean
}

export type ProductSource =
  | 'open_food_facts'
  | 'web_search'
  | 'brand_submitted'

export type Product = {
  id: string
  name: string
  brand: string
  regionCode: RegionCode
  barcode?: string
  novaScore?: NovaScore
  nutriScore?: NutriScore
  ingredientList: string[]
  ingredientCount: number
  additiveFlags: AdditiveFlags
  cleanlinessScore: number    // 0-12, computed
  flavorProfile: string[]     // ['salty', 'cheesy', 'crunchy']
  source: ProductSource
  isVerified: boolean
  createdAt: string
}

// ─── Search & Alternatives ───────────────────────────────────

export type Search = {
  id: string
  sessionId: string
  email?: string
  citySlug: string
  regionCode: RegionCode
  inputText: string           // raw: "Kurkure Masala Munch"
  normalizedFood: string      // cleaned by AI
  createdAt: string
}

export type Alternative = {
  id: string
  searchId: string
  product: Product
  rank: 1 | 2 | 3
  tasteSimilarityAi: number   // AI estimate 0-5
  tasteSimilarityReal?: number // updated from surveys
  buyLinks: BuyLink[]
  explanation: string         // friendly 2-sentence reason
  createdAt: string
}

// ─── AI Pipeline ─────────────────────────────────────────────

// What Call 1 returns
export type NormalizedFood = {
  canonicalName: string
  brand: string
  category: string
  flavorProfile: string[]
  regionHint: RegionCode | 'unknown'
}

// What Call 2 returns (before DB save)
export type AlternativeCandidate = {
  name: string
  brand: string
  whySimilar: string
  keyCleanIngredients: string[]
  estimatedNova: NovaScore
  redFlagsRemoved: string[]
  searchQueryForBuy: string
}

// ─── Survey ──────────────────────────────────────────────────

export type SurveyResponse = {
  id: string
  searchId: string
  alternativeId: string
  didOrder: boolean
  tasteRating: number         // 1-5
  overallRating: number       // 1-5
  freeText?: string
  respondedAt: string
}

// ─── API Responses ───────────────────────────────────────────

// Standard wrapper for every API response in the app
export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; code: string }