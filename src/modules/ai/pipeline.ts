import { NormalizedFood, AlternativeCandidate } from '@/lib/types'
import { callGroq } from './providers/groq'
import { callGemini } from './providers/gemini'
import { buildNormalizePrompt } from './prompts/normalize'
import { buildAlternativesPrompt } from './prompts/alternatives'
import { buildExplanationPrompt } from './prompts/explanation'
import { FoodFactsProduct } from '@/modules/food/sources'
import { parseAiJson } from '@/lib/parseJson'
import { logPipelineCall } from '@/modules/db'

// ─── Call 1: Normalize user input ────────────────────────────

export async function normalizeFood(
  inputText: string,
  searchId: string | null = null
): Promise<NormalizedFood> {
  const prompt = buildNormalizePrompt(inputText)
  const start = Date.now()
  let raw = ''
  let provider: 'groq' | 'gemini' = 'groq'

  try {
    raw = await callGroq([{ role: 'user', content: prompt }])
  } catch (err) {
    console.error('[pipeline] Groq Call 1 failed:', err)
    provider = 'gemini'
    raw = await callGemini(prompt, false)
  }

  const durationMs = Date.now() - start
  let parsed: NormalizedFood | null = null
  let parsedOk = false

  try {
    parsed = parseAiJson<NormalizedFood>(raw)
    parsedOk = true
  } catch {
    parsed = {
      canonicalName: inputText,
      brand: '',
      category: 'other',
      flavorProfile: [],
      regionHint: 'IN'
    }
  }

  await logPipelineCall({
    searchId,
    callNumber:  1,
    provider,
    model:       provider === 'groq' ? 'llama-3.1-8b-instant' : 'gemini-2.0-flash',
    prompt,
    rawResponse: raw,
    parsedOk,
    durationMs,
    usedSearch:  false
  })

  return parsed!
}

// ─── Call 2: Find alternatives ────────────────────────────────

export async function findAlternatives(
  normalizedFood: NormalizedFood,
  offProduct: FoodFactsProduct | null,
  city: string,
  searchId: string | null = null,
  retried: boolean = false
): Promise<AlternativeCandidate[]> {
  const prompt = buildAlternativesPrompt(
    normalizedFood,
    offProduct,
    city,
    normalizedFood.regionHint === 'unknown' ? 'IN' : normalizedFood.regionHint
  )
  const start = Date.now()
  let raw = ''
  let provider: 'groq' | 'gemini' = 'gemini'
  let parsedOk = false
  let candidates: AlternativeCandidate[] = []

  try {
    raw = await callGemini(prompt, true)
  } catch (err) {
    console.error('[pipeline] Gemini Call 2 failed, falling back to Groq:', err)
    provider = 'groq'
    raw = await callGroq(
      [{ role: 'user', content: prompt }],
      'llama-3.3-70b-versatile'
    )
  }

  const durationMs = Date.now() - start

  try {
    const result = parseAiJson<AlternativeCandidate[]>(raw)
    if (Array.isArray(result)) {
      candidates = result.filter(c => {
        if (!c.name || !c.brand || !c.whySimilar) return false
        if (typeof c.estimatedNova !== 'number') return false
        if (c.estimatedNova > 3) return false
        if (!c.keyCleanIngredients || c.keyCleanIngredients.length === 0) return false
        if (!c.redFlagsRemoved || c.redFlagsRemoved.length === 0) return false
        const q = (c.searchQueryForBuy ?? '').toLowerCase()
        const platformNames = ['blinkit', 'zepto', 'bigbasket', 'amazon', 'instacart', 'swiggy', 'whole foods']
        if (platformNames.some(p => q.includes(p))) return false
        return true
      })
      parsedOk = true
    }
  } catch {
    candidates = []
  }

  await logPipelineCall({
    searchId,
    callNumber:  2,
    provider,
    model:       provider === 'gemini' ? 'gemini-2.0-flash' : 'llama-3.3-70b-versatile',
    prompt,
    rawResponse: raw,
    parsedOk,
    durationMs,
    usedSearch:  provider === 'gemini'
  })

  // If validation wiped everything, retry once
  if (candidates.length === 0 && !retried) {
    console.log('[pipeline] All candidates filtered, retrying...')
    return findAlternatives(normalizedFood, offProduct, city, searchId, true)
  }

  return candidates
}

// ─── Call 3: Generate explanation ────────────────────────────

export async function generateExplanation(
  original: NormalizedFood,
  alternative: AlternativeCandidate,
  searchId: string | null = null
): Promise<string> {
  const prompt = buildExplanationPrompt(original, alternative)
  const start = Date.now()
  let raw = ''
  let parsedOk = false

  try {
    raw = await callGroq([{ role: 'user', content: prompt }])
    parsedOk = true
  } catch (err) {
    console.error('[pipeline] Groq Call 3 failed:', err)
    raw = `${alternative.name} by ${alternative.brand} is a cleaner alternative
to ${original.canonicalName}, made with ${alternative.keyCleanIngredients[0] ?? 'wholesome ingredients'}
and free from ${alternative.redFlagsRemoved[0] ?? 'artificial additives'}.`
  }

  const durationMs = Date.now() - start

  await logPipelineCall({
    searchId,
    callNumber:  3,
    provider:    'groq',
    model:       'llama-3.1-8b-instant',
    prompt,
    rawResponse: raw,
    parsedOk,
    durationMs,
    usedSearch:  false
  })

  return raw.trim()
}

// ─── Full pipeline ────────────────────────────────────────────

export type PipelineResult = {
  normalizedFood: NormalizedFood
  candidates: Array<{
    candidate: AlternativeCandidate
    explanation: string
  }>
}

export async function runSearchPipeline(
  inputText: string,
  offProduct: FoodFactsProduct | null,
  city: string,
  searchId: string | null = null
): Promise<PipelineResult> {
  const normalizedFood = await normalizeFood(inputText, searchId)
  const candidates = await findAlternatives(normalizedFood, offProduct, city, searchId)

  if (candidates.length === 0) {
    return { normalizedFood, candidates: [] }
  }

  const withExplanations = await Promise.all(
    candidates.map(async candidate => ({
      candidate,
      explanation: await generateExplanation(normalizedFood, candidate, searchId)
    }))
  )

  return {
    normalizedFood,
    candidates: withExplanations
  }
}