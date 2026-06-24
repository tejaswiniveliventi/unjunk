import { NextResponse } from 'next/server'
import { getDailyUsage } from '@/modules/rateLimit/tokenBudget'

export async function GET() {
  const usage = await getDailyUsage()
  return NextResponse.json({ success: true, data: usage })
}