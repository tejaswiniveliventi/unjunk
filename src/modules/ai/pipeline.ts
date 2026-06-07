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
  } catch {
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
    callNumber: 1,
    provider,
    model:      provider === 'groq' ? 'llama-3.1-8b-instant' : 'gemini-2.0-flash',
    prompt,
    rawResponse: raw,
    parsedOk,
    durationMs,
    usedSearch: false
  })

  return parsed!
}

// ─── Call 2: Find alternatives ────────────────────────────────

export async function findAlternatives(
  normalizedFood: NormalizedFood,
  offProduct: FoodFactsProduct | null,
  city: string,
  searchId: string | null = null
): Promise<AlternativeCandidate[]> {
  const prompt = buildAlternativesPrompt(normalizedFood, offProduct, city)
  const start = Date.now()
  let raw = ''
  let provider: 'groq' | 'gemini' = 'gemini'
  let parsedOk = false

  try {
    raw = await callGemini(prompt, true)
  } catch {
    provider = 'groq'
    raw = await callGroq(
      [{ role: 'user', content: prompt }],
      'llama-3.3-70b-versatile'
    )
  }

  const durationMs = Date.now() - start
  let candidates: AlternativeCandidate[] = []

  try {
    const result = parseAiJson<AlternativeCandidate[]>(raw)
    if (Array.isArray(result)) {
      candidates = result.filter(c =>
        c.name &&
        c.brand &&
        c.whySimilar &&
        typeof c.estimatedNova === 'number'
      )
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
  } catch {
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
  // Call 1
  const normalizedFood = await normalizeFood(inputText, searchId)

  // Call 2
  const candidates = await findAlternatives(normalizedFood, offProduct, city, searchId)

  if (candidates.length === 0) {
    return { normalizedFood, candidates: [] }
  }

  // Call 3 — run explanations in parallel, one per candidate
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