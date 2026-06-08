import { NextRequest, NextResponse } from 'next/server'
import { getPendingEmails, markEmailSent, markEmailFailed } from '@/modules/db'
import { sendSurveyEmail } from '@/modules/survey/sendSurveyEmail'
import { supabaseAdmin } from '@/lib/supabase/server'

const TALLY_FORM_URL = process.env.TALLY_FORM_URL!

export async function GET(req: NextRequest) {
  // Protect with a secret so only Vercel cron can call this
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const pending = await getPendingEmails()

  if (pending.length === 0) {
    return NextResponse.json({ processed: 0 })
  }

  let sent = 0
  let failed = 0

  for (const item of pending) {
    // Get the original food name for the email
    const { data: search } = await supabaseAdmin
      .from('searches')
      .select('input_text')
      .eq('id', item.search_id)
      .single()

    const originalFood = search?.input_text ?? 'your food'

    const ok = await sendSurveyEmail(
      item.email,
      item.search_id,
      originalFood,
      TALLY_FORM_URL
    )

    if (ok) {
      await markEmailSent(item.id)
      sent++
    } else {
      await markEmailFailed(item.id)
      failed++
    }
  }

  return NextResponse.json({ processed: pending.length, sent, failed })
}