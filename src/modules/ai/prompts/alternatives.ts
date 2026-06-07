import { NormalizedFood } from '@/lib/types'
import { FoodFactsProduct } from '@/modules/food/sources'

export function buildAlternativesPrompt(
  normalizedFood: NormalizedFood,
  offProduct: FoodFactsProduct | null,
  city: string
): string {
  const ingredientContext = offProduct
    ? `Known ingredients: ${offProduct.ingredientList.slice(0, 15).join(', ')}
NOVA score: ${offProduct.novaScore ?? 'unknown'}
Additives detected: ${offProduct.rawAdditives.slice(0, 10).join(', ') || 'none found'}`
    : `No ingredient data found. Use your knowledge of this product.`

  return `You are a clean food expert specializing in the Indian packaged food market.

A user wants a cleaner, healthier alternative to "${normalizedFood.canonicalName}" by ${normalizedFood.brand || 'unknown brand'}.
Their city is ${city}, India.

${ingredientContext}

Find 3 real Indian packaged food alternatives that:
1. Taste similar (same flavor profile: ${normalizedFood.flavorProfile.join(', ')})
2. Have cleaner ingredients (lower NOVA score, fewer additives)
3. Are actually available in India on Blinkit, Zepto, or BigBasket
const grainSuggestion = ['chips', 'namkeen', 'biscuit', 'cereal', 'bread'].includes(${normalizedFood.category})
  ? '4. Preferably use millets, lentils, or whole grains as primary ingredient'
  : '4. Use whole, minimally processed ingredients appropriate to this food category'
5. Avoid: vanaspati, maida as primary ingredient, artificial colors, MSG

Return ONLY a JSON array of 3 objects. No preamble, no markdown. Raw JSON only.

Each object must have this exact shape:
{
  "name": "exact product name",
  "brand": "brand name",
  "whySimilar": "one sentence on taste similarity",
  "keyCleanIngredients": ["ingredient1", "ingredient2"],
  "estimatedNova": 1,
  "redFlagsRemoved": ["what nasty ingredient this avoids"],
  "searchQueryForBuy": ""searchQueryForBuy": "product name and brand only, no platform names, e.g. 'Slurrp Farm Millet Munch'""
}`
}