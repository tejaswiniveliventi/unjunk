import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { updateSearchEmail, scheduleEmail } from '@/modules/db'

const EmailRequestSchema = z.object({
  email:     z.string().email(),
  searchId:  z.string().uuid().nullable(),
  sessionId: z.string().min(10)
})

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false }, { status: 400 })
  }

  const parsed = EmailRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ success: false }, { status: 400 })
  }

  const { email, searchId } = parsed.data

  if (searchId) {
    await updateSearchEmail(searchId, email)
    await scheduleEmail(searchId, email)
  }

  return NextResponse.json({ success: true })
}