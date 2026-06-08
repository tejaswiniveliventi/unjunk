import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { ApiResponse } from '@/lib/types'
import { getCachedResult, setCachedResult } from '@/modules/cache'
import { searchProductByName } from '@/modules/food/sources'
import { runSearchPipeline } from '@/modules/ai'
import { getCityBySlug } from '@/modules/regions/cities'
import { buildBuyLinks } from '@/modules/regions/platforms'
import { scoreProduct } from '@/modules/food/scoring'
import {
  createSearch,
  upsertProduct,
  createAlternative,
  scheduleEmail
} from '@/modules/db'
import { supabaseAdmin } from '@/lib/supabase/server'


// ─── Request validation ───────────────────────────────────────

const SearchRequestSchema = z.object({
  inputText: z.string().min(2).max(200),
  citySlug:  z.string().min(2).max(50),
  sessionId: z.string().min(10).max(100),
  email:     z.string().email().optional()
})

// ─── Route handler ────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1. Parse and validate request
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return respond(400, null, 'Invalid JSON', 'INVALID_JSON')
  }

  const parsed = SearchRequestSchema.safeParse(body)
  if (!parsed.success) {
    return respond(400, null, 'Invalid request', 'VALIDATION_ERROR')
  }

  const { inputText, citySlug, sessionId, email } = parsed.data

  // 2. Validate city exists and is active
  const city = getCityBySlug(citySlug)
  if (!city || !city.isActive) {
    return respond(400, null, 'City not supported', 'CITY_NOT_SUPPORTED')
  }

  const regionCode = city.regionCode

  // 3. Fetch rubric config for this region
  const { data: regionRow } = await supabaseAdmin
    .from('regions')
    .select('rubric_config')
    .eq('code', regionCode)
    .single()

  const rubricConfig = regionRow?.rubric_config ?? {}

  // 4. Check Redis cache — return immediately if hit
  const cached = await getCachedResult(regionCode, citySlug, inputText)
  if (cached) {
    await createSearch({
      sessionId,
      email,
      citySlug,
      regionCode,
      inputText,
      normalizedFood: cached.normalizedFood ?? inputText
    })
    return respond(200, { ...cached, fromCache: true })
  }

  // 5. Fetch from Open Food Facts
  const offProduct = await searchProductByName(inputText, regionCode)

  // 6. Create search record BEFORE pipeline so we have searchId for logs
  const search = await createSearch({
    sessionId,
    email,
    citySlug,
    regionCode,
    inputText,
    normalizedFood: inputText   // placeholder, updated after pipeline
  })

  const searchId = search?.id ?? null

  // 7. Run AI pipeline — pass searchId so logs are linked
  let pipelineResult
  try {
    pipelineResult = await runSearchPipeline(
      inputText,
      offProduct,
      city.name,
      searchId
    )
  } catch (err) {
    console.error('[api/search] pipeline error:', err)
    return respond(500, null, 'Search failed, please try again', 'PIPELINE_ERROR')
  }

  const { normalizedFood, candidates } = pipelineResult

  // 8. Update search record with normalized food name
  if (search) {
    await supabaseAdmin
      .from('searches')
      .update({ normalized_food: normalizedFood.canonicalName })
      .eq('id', search.id)
  }

  if (candidates.length === 0) {
    return respond(200, {
      normalizedFood: normalizedFood.canonicalName,
      alternatives:   [],
      fromCache:      false
    })
  }

  // 9. Build and save alternatives
  const alternatives = await Promise.all(
    candidates.slice(0, 3).map(async ({ candidate, explanation }, index) => {
      const productId = await upsertProduct(candidate, regionCode, rubricConfig)

      const buyLinks = buildBuyLinks(
        city.platforms,
        candidate.searchQueryForBuy
      )

      if (search && productId) {
        await createAlternative({
          searchId:          search.id,
          productId,
          rank:              (index + 1) as 1 | 2 | 3,
          tasteSimilarityAi: 3.5,
          buyLinks,
          explanation
        })
      }

      const scoring = scoreProduct(
        {
          novaScore:       candidate.estimatedNova,
          ingredientCount: candidate.keyCleanIngredients.length,
          additiveFlags: {
            artificialColors:     [],
            artificialSweeteners: [],
            preservatives:        [],
            hydrogenatedOils:     [],
            msgGlutamates:        [],
            hfcs:                 [],
            nitrates:             [],
            vanaspati:            false,
            maidaPrimary:         false,
            bhaBht:               false
          }
        },
        rubricConfig
      )

      return {
        rank:                index + 1,
        name:                candidate.name,
        brand:               candidate.brand,
        whySimilar:          candidate.whySimilar,
        keyCleanIngredients: candidate.keyCleanIngredients,
        redFlagsRemoved:     candidate.redFlagsRemoved,
        estimatedNova:       candidate.estimatedNova,
        cleanlinessScore:    scoring.total,
        explanation,
        buyLinks
      }
    })
  )

  // 10. Schedule survey email if email provided
  if (email && search) {
    await scheduleEmail(search.id, email)
  }

  // 11. Build response
  const result = {
    normalizedFood: normalizedFood.canonicalName,
    alternatives,
    fromCache:      false
  }

  // 12. Cache for next time
  await setCachedResult(regionCode, citySlug, inputText, result)

  return respond(200, result)
}

// ─── Response helper ──────────────────────────────────────────

function respond(
  status: number,
  data: any,
  error?: string,
  code?: string
) {
  const body: ApiResponse<any> = data !== null
    ? { success: true, data }
    : { success: false, error: error!, code: code! }

  return NextResponse.json(body, { status })
}