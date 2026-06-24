import { NormalizedFood } from '@/lib/types'
import { FoodFactsProduct } from '@/modules/food/sources'

export function buildAlternativesPrompt(
  normalizedFood: NormalizedFood,
  offProduct: FoodFactsProduct | null,
  city: string,
  regionCode: string = 'IN'
): string {
  const ingredientContext = offProduct
    ? `Known ingredients: ${offProduct.ingredientList.slice(0, 15).join(', ')}
NOVA score: ${offProduct.novaScore ?? 'unknown'}
Additives detected: ${offProduct.rawAdditives.slice(0, 10).join(', ') || 'none found'}`
    : `No ingredient data found. Use your knowledge of this product.`

  const isIndia = regionCode === 'IN'

  const marketContext = isIndia
    ? `Indian packaged food market. City: ${city}, India.`
    : `US packaged food market. City: ${city}, USA.`

  const avoidList = isIndia
    ? `vanaspati, maida as primary ingredient, artificial colors, MSG, refined palm oil`
    : `high fructose corn syrup, artificial colors, BHA/BHT, partially hydrogenated oils, artificial sweeteners`

  const preferList = isIndia
    ? `millets, lentils, whole grains, cold pressed oils, FSSAI certified organic`
    : `whole grains, organic certified, non-GMO, natural sweeteners, clean protein sources`

  const platforms = isIndia
    ? `Blinkit, Zepto, or BigBasket`
    : `Amazon, Whole Foods, or Instacart`

  const grainSuggestion = ['chips', 'namkeen', 'biscuit', 'cereal', 'bread'].includes(
    normalizedFood.category
  )
    ? `Preferably use ${preferList} as primary ingredient`
    : `Use whole, minimally processed ingredients appropriate to this food category`

  return `You are a clean food expert specializing in the ${marketContext}

A user wants a cleaner, healthier alternative to "${normalizedFood.canonicalName}" by ${normalizedFood.brand || 'unknown brand'}.

${ingredientContext}

Find 3 real packaged food alternatives that:
1. Taste similar (same flavor profile: ${normalizedFood.flavorProfile.join(', ')})
2. Have cleaner ingredients (lower NOVA score, fewer additives)
3. Are actually available in ${city} on ${platforms}
4. ${grainSuggestion}
5. Avoid: ${avoidList}

Return ONLY a JSON array of 3 objects. No preamble, no markdown. Raw JSON only.

Each object must have this exact shape:
{
  "name": "exact product name",
  "brand": "brand name",
  "whySimilar": "one sentence on taste similarity",
  "keyCleanIngredients": ["ingredient1", "ingredient2"],
  "estimatedNova": 1,
  "redFlagsRemoved": ["what nasty ingredient this avoids"],
  "searchQueryForBuy": "product name and brand only, no platform names"
}`
}