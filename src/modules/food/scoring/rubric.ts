import { AdditiveFlags, NovaScore, Product } from '@/lib/types'

type RubricConfig = {
  nova_penalty_per_level: number
  ingredient_count_threshold: number
  ingredient_penalty_per_3_over: number
  recommendation_threshold: number
  additive_penalties: Record<string, number>
  bonuses: Record<string, number>
}

type ScoringInput = {
  novaScore?: NovaScore
  ingredientCount: number
  additiveFlags: AdditiveFlags
  isOrganicCertified?: boolean
  isNonGmo?: boolean
  hasAncientGrains?: boolean
  hasNoAddedSugar?: boolean
  hasColdPressedOil?: boolean
  isFssaiOrganic?: boolean
  isUsdaOrganic?: boolean
  hasWholeGrainFirst?: boolean
}

type ScoringBreakdown = {
  base: number
  novaPenalty: number
  ingredientPenalty: number
  additivePenalty: number
  bonusPoints: number
  total: number
  isRecommendable: boolean
}

export function scoreProduct(
  input: ScoringInput,
  config: RubricConfig
): ScoringBreakdown {
  const base = 10

  // Nova penalty
  const novaPenalty = input.novaScore
    ? (input.novaScore - 1) * config.nova_penalty_per_level
    : 0

  // Ingredient count penalty
  const over = Math.max(0, input.ingredientCount - config.ingredient_count_threshold)
  const ingredientPenalty = Math.floor(over / 3) * config.ingredient_penalty_per_3_over

  // Additive penalties
  let additivePenalty = 0
  const p = config.additive_penalties
  const f = input.additiveFlags

  if (f.artificialColors.length > 0)    additivePenalty += Math.abs(p.artificial_colors ?? 0)
  if (f.artificialSweeteners.length > 0) additivePenalty += Math.abs(p.artificial_sweeteners ?? 0)
  if (f.preservatives.length > 0)        additivePenalty += Math.abs(p.preservatives ?? 0)
  if (f.hydrogenatedOils.length > 0)     additivePenalty += Math.abs(p.hydrogenated_oils ?? 0)
  if (f.msgGlutamates.length > 0)        additivePenalty += Math.abs(p.msg_glutamates ?? 0)
  if (f.hfcs.length > 0)                 additivePenalty += Math.abs(p.hfcs ?? 0)
  if (f.nitrates.length > 0)             additivePenalty += Math.abs(p.nitrates ?? 0)
  if (f.vanaspati)                        additivePenalty += Math.abs(p.vanaspati ?? 0)
  if (f.maidaPrimary)                     additivePenalty += Math.abs(p.maida_primary ?? 0)
  if (f.bhaBht)                           additivePenalty += Math.abs(p.bha_bht ?? 0)

  // Bonuses
  let bonusPoints = 0
  const b = config.bonuses

  if (input.isOrganicCertified)  bonusPoints += b.organic_certified ?? 0
  if (input.isNonGmo)            bonusPoints += b.non_gmo ?? 0
  if (input.hasAncientGrains)    bonusPoints += b.ancient_grains ?? 0
  if (input.hasNoAddedSugar)     bonusPoints += b.no_added_sugar ?? 0
  if (input.hasColdPressedOil)   bonusPoints += b.cold_pressed_oil ?? 0
  if (input.isFssaiOrganic)      bonusPoints += b.fssai_organic ?? 0
  if (input.isUsdaOrganic)       bonusPoints += b.usda_organic ?? 0
  if (input.hasWholeGrainFirst)  bonusPoints += b.whole_grain_first ?? 0

  const total = Math.max(0, base - novaPenalty - ingredientPenalty - additivePenalty + bonusPoints)

  return {
    base,
    novaPenalty,
    ingredientPenalty,
    additivePenalty,
    bonusPoints,
    total,
    isRecommendable: total >= config.recommendation_threshold
  }
}