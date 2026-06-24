import { redis } from '@/modules/cache/redis'

// Daily budgets — conservative to stay within free tiers
// Groq free tier: ~14,400 req/day
// Gemini free tier: ~1,500 req/day
const BUDGETS = {
  groq_requests:   200,   // max Groq calls per day
  gemini_requests: 50,    // max Gemini calls per day
}

type Provider = 'groq' | 'gemini'

function todayKey(provider: Provider): string {
  const date = new Date().toISOString().slice(0, 10)  // 'YYYY-MM-DD'
  return `budget:${provider}:${date}`
}

export async function incrementProviderUsage(
  provider: Provider
): Promise<void> {
  try {
    const key = todayKey(provider)
    await redis.incr(key)
    await redis.expire(key, 60 * 60 * 25)  // 25 hours — covers timezone edge cases
  } catch {
    // Silent — never block on budget tracking failure
  }
}

export async function checkProviderBudget(
  provider: Provider
): Promise<boolean> {
  try {
    const key = todayKey(provider)
    const count = await redis.get<number>(key) ?? 0
    return count < BUDGETS[`${provider}_requests`]
  } catch {
    return true  // Allow on failure
  }
}

export async function getDailyUsage(): Promise<{
  groq: number
  gemini: number
  groqBudget: number
  geminiBudget: number
}> {
  try {
    const [groq, gemini] = await Promise.all([
      redis.get<number>(todayKey('groq')) ?? 0,
      redis.get<number>(todayKey('gemini')) ?? 0
    ])
    return {
      groq:         groq ?? 0,
      gemini:       gemini ?? 0,
      groqBudget:   BUDGETS.groq_requests,
      geminiBudget: BUDGETS.gemini_requests
    }
  } catch {
    return { groq: 0, gemini: 0, groqBudget: 200, geminiBudget: 50 }
  }
}