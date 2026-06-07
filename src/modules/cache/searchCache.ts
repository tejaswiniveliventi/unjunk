import { redis } from './redis'

const TTL_SECONDS = 60 * 60 * 24 * 7   // 7 days

// Key format: search:{regionCode}:{citySlug}:{normalizedFoodSlug}
function buildKey(
  regionCode: string,
  citySlug: string,
  normalizedFood: string
): string {
  const foodSlug = normalizedFood
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 60)

  return `search:${regionCode}:${citySlug}:${foodSlug}`
}

export async function getCachedResult(
  regionCode: string,
  citySlug: string,
  normalizedFood: string
): Promise<any | null> {
  try {
    const key = buildKey(regionCode, citySlug, normalizedFood)
    const cached = await redis.get(key)
    return cached ?? null
  } catch {
    // Cache failure should never break the app
    return null
  }
}

export async function setCachedResult(
  regionCode: string,
  citySlug: string,
  normalizedFood: string,
  result: any
): Promise<void> {
  try {
    const key = buildKey(regionCode, citySlug, normalizedFood)
    await redis.set(key, result, { ex: TTL_SECONDS })
  } catch {
    // Cache failure is silent — app continues without it
  }
}