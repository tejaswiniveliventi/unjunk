import { AdditiveFlags, NovaScore, NutriScore } from '@/lib/types'

const OFF_BASE_URL = 'https://world.openfoodfacts.org'
const OFF_INDIA_URL = 'https://in.openfoodfacts.org'

type OFFProduct = {
  id: string
  product_name: string
  brands: string
  nova_group: number
  nutriscore_grade: string
  ingredients_text: string
  ingredients: { text: string }[]
  additives_tags: string[]
  labels_tags: string[]
  countries_tags: string[]
}

type OFFSearchResult = {
  products: OFFProduct[]
  count: number
}

export type FoodFactsProduct = {
  offId: string
  name: string
  brand: string
  novaScore?: NovaScore
  nutriScore?: NutriScore
  ingredientList: string[]
  ingredientCount: number
  additiveFlags: AdditiveFlags
  rawAdditives: string[]
  isOrganic: boolean
  isNonGmo: boolean
}

// ─── Additive parsing ────────────────────────────────────────

const ARTIFICIAL_COLORS = [
  'en:e102', 'en:e104', 'en:e110', 'en:e122',
  'en:e124', 'en:e129', 'en:e131', 'en:e133'
]

const ARTIFICIAL_SWEETENERS = [
  'en:e951', 'en:e950', 'en:e952', 'en:e954',
  'en:e955', 'en:e960', 'en:e961'
]

const PRESERVATIVES = [
  'en:e211', 'en:e212', 'en:e213', 'en:e320',
  'en:e321', 'en:e250', 'en:e251'
]

const HYDROGENATED_OILS = [
  'en:e471', 'en:e472'
]

const MSG_GLUTAMATES = [
  'en:e621', 'en:e627', 'en:e631', 'en:e635'
]

const HFCS_TAGS = [
  'en:high-fructose-corn-syrup'
]

const NITRATES = [
  'en:e249', 'en:e250', 'en:e251', 'en:e252'
]

function parseAdditiveFlags(additiveTags: string[], ingredientText: string): AdditiveFlags {
  const lower = ingredientText.toLowerCase()

  return {
    artificialColors:     additiveTags.filter(t => ARTIFICIAL_COLORS.includes(t)),
    artificialSweeteners: additiveTags.filter(t => ARTIFICIAL_SWEETENERS.includes(t)),
    preservatives:        additiveTags.filter(t => PRESERVATIVES.includes(t)),
    hydrogenatedOils:     additiveTags.filter(t => HYDROGENATED_OILS.includes(t)),
    msgGlutamates:        additiveTags.filter(t => MSG_GLUTAMATES.includes(t)),
    hfcs:                 additiveTags.filter(t => HFCS_TAGS.includes(t)),
    nitrates:             additiveTags.filter(t => NITRATES.includes(t)),
    vanaspati:            lower.includes('vanaspati'),
    maidaPrimary:         lower.startsWith('maida') || lower.startsWith('refined wheat flour'),
    bhaBht:               lower.includes('bha') || lower.includes('bht')
  }
}

function parseIngredients(product: OFFProduct): string[] {
  if (product.ingredients?.length > 0) {
    return product.ingredients.map(i => i.text).filter(Boolean)
  }
  if (product.ingredients_text) {
    return product.ingredients_text
      .split(',')
      .map(i => i.trim())
      .filter(Boolean)
  }
  return []
}

function normalizeNovaScore(nova: number): NovaScore | undefined {
  if ([1, 2, 3, 4].includes(nova)) return nova as NovaScore
  return undefined
}

function normalizeNutriScore(grade: string): NutriScore | undefined {
  const upper = grade?.toUpperCase()
  if (['A', 'B', 'C', 'D', 'E'].includes(upper)) return upper as NutriScore
  return undefined
}

function mapOFFProduct(product: OFFProduct): FoodFactsProduct {
  const ingredientList = parseIngredients(product)
  const ingredientText = product.ingredients_text ?? ''
  const additiveTags = product.additives_tags ?? []
  const labelTags = product.labels_tags ?? []

  return {
    offId:           product.id,
    name:            product.product_name ?? 'Unknown',
    brand:           product.brands ?? 'Unknown',
    novaScore:       normalizeNovaScore(product.nova_group),
    nutriScore:      normalizeNutriScore(product.nutriscore_grade),
    ingredientList,
    ingredientCount: ingredientList.length,
    additiveFlags:   parseAdditiveFlags(additiveTags, ingredientText),
    rawAdditives:    additiveTags,
    isOrganic:       labelTags.some(t =>
                       t.includes('organic') || t.includes('fssai-organic')
                     ),
    isNonGmo:        labelTags.some(t => t.includes('non-gmo'))
  }
}

// ─── Public API ──────────────────────────────────────────────

export async function searchProductByName(
  query: string,
  regionCode: 'IN' | 'US' = 'IN'
): Promise<FoodFactsProduct | null> {
  try {
    const baseUrl = regionCode === 'IN' ? OFF_INDIA_URL : OFF_BASE_URL
    const encoded = encodeURIComponent(query)
    const url = `${baseUrl}/cgi/search.pl?search_terms=${encoded}&search_simple=1&action=process&json=1&page_size=5`

    const res = await fetch(url, {
      headers: { 'User-Agent': 'Unjunk/1.0 (unjunk.app)' },
      next: { revalidate: 86400 }    // cache for 24hrs in Next.js
    })

    if (!res.ok) return null

    const data: OFFSearchResult = await res.json()

    if (!data.products?.length) return null

    // Return the first product with a name
    const match = data.products.find(p => p.product_name)
    return match ? mapOFFProduct(match) : null

  } catch {
    return null
  }
}

export async function getProductByBarcode(
  barcode: string
): Promise<FoodFactsProduct | null> {
  try {
    const url = `${OFF_BASE_URL}/api/v0/product/${barcode}.json`

    const res = await fetch(url, {
      headers: { 'User-Agent': 'Unjunk/1.0 (unjunk.app)' },
      next: { revalidate: 86400 }
    })

    if (!res.ok) return null

    const data = await res.json()
    if (data.status !== 1) return null

    return mapOFFProduct(data.product)

  } catch {
    return null
  }
}