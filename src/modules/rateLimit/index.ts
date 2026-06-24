import { redis } from '@/modules/cache/redis'

type RateLimitResult = {
  allowed: boolean
  remaining: number
  resetInSeconds: number
  reason?: string
}

async function checkLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  try {
    const now = Date.now()
    const windowKey = `${key}:${Math.floor(now / (windowSeconds * 1000))}`

    const count = await redis.incr(windowKey)

    // Set expiry on first request in window
    if (count === 1) {
      await redis.expire(windowKey, windowSeconds)
    }

    const ttl = await redis.ttl(windowKey)

    return {
      allowed:        count <= limit,
      remaining:      Math.max(0, limit - count),
      resetInSeconds: ttl,
      reason:         count > limit ? key.split(':')[0] : undefined
    }
  } catch {
    // If Redis fails, allow the request — never block users due to cache failure
    return { allowed: true, remaining: 1, resetInSeconds: 0 }
  }
}

export async function checkRateLimits(
  ip: string,
  sessionId: string
): Promise<RateLimitResult> {
  // Run all three checks in parallel
  const [ipLimit, sessionLimit, globalLimit] = await Promise.all([
    checkLimit(`ip:${ip}`,           10,  60 * 60),       // 10/hour per IP
    checkLimit(`session:${sessionId}`, 20, 60 * 60 * 24), // 20/day per session
    checkLimit(`global:searches`,    500, 60 * 60 * 24)   // 500/day global
  ])

  // Return the most restrictive limit that was hit
  if (!globalLimit.allowed) {
    return { ...globalLimit, reason: 'global' }
  }
  if (!ipLimit.allowed) {
    return { ...ipLimit, reason: 'ip' }
  }
  if (!sessionLimit.allowed) {
    return { ...sessionLimit, reason: 'session' }
  }

  return {
    allowed:        true,
    remaining:      Math.min(ipLimit.remaining, sessionLimit.remaining),
    resetInSeconds: Math.max(ipLimit.resetInSeconds, sessionLimit.resetInSeconds)
  }
}