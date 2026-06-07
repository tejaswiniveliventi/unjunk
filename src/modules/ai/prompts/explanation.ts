import { NormalizedFood, AlternativeCandidate } from '@/lib/types'

export function buildExplanationPrompt(
  original: NormalizedFood,
  alternative: AlternativeCandidate
): string {
  return `Write a friendly 2-sentence explanation for why "${alternative.name}" 
is a great clean alternative to "${original.canonicalName}".

Mention one specific bad ingredient that's avoided and one good thing about the alternative.
Tone: helpful friend texting you, not a nutritionist lecturing.
Max 50 words total. No bullet points. Plain text only.

Original: ${original.canonicalName}
Alternative: ${alternative.name} by ${alternative.brand}
Red flags removed: ${alternative.redFlagsRemoved.join(', ')}
Clean ingredients: ${alternative.keyCleanIngredients.join(', ')}`
}