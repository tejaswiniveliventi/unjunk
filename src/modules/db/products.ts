import { supabaseAdmin } from '@/lib/supabase/server'
import { Product, RegionCode } from '@/lib/types'
import { AlternativeCandidate } from '@/lib/types'
import { FoodFactsProduct } from '@/modules/food/sources'
import { scoreProduct } from '@/modules/food/scoring'

export async function upsertProduct(
  candidate: AlternativeCandidate,
  regionCode: RegionCode,
  rubricConfig: any
): Promise<string | null> {
  // Build a minimal scoring input from what we know
  const scoringInput = {
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
  }

  const scoring = scoreProduct(scoringInput, rubricConfig)

  const { data: existing } = await supabaseAdmin
    .from('products')
    .select('id')
    .eq('name', candidate.name)
    .eq('brand', candidate.brand)
    .eq('region_code', regionCode)
    .single()

  if (existing) return existing.id

  const { data: row, error } = await supabaseAdmin
    .from('products')
    .insert({
      name:              candidate.name,
      brand:             candidate.brand,
      region_code:       regionCode,
      nova_score:        candidate.estimatedNova,
      ingredient_list:   candidate.keyCleanIngredients,
      ingredient_count:  candidate.keyCleanIngredients.length,
      additive_flags:    scoringInput.additiveFlags,
      cleanliness_score: scoring.total,
      flavor_profile:    [],
      source:            'web_search',
      is_verified:       false
    })
    .select('id')
    .single()

  if (error) {
    console.error('[db/products] upsertProduct error:', error.message)
    return null
  }

  return row.id
}