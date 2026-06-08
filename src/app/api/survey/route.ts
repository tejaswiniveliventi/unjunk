import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false }, { status: 400 })
  }

  try {
    const payload = body as any
    const fields = payload?.data?.fields as any[]

    if (!fields || !Array.isArray(fields)) {
      return NextResponse.json({ success: false }, { status: 400 })
    }

    // Extract fields by label
    const getValue = (label: string) =>
      fields.find(f => f.label?.toLowerCase().includes(label.toLowerCase()))?.value

    const searchId    = getValue('search_id')
    const didOrder    = getValue('order')
    const tasteRating = getValue('taste')
    const overallRating = getValue('overall')

    if (!searchId) {
      return NextResponse.json({ success: false, error: 'No search_id' }, { status: 400 })
    }

    // Find the most recent alternative for this search
    const { data: alternatives } = await supabaseAdmin
      .from('alternatives')
      .select('id')
      .eq('search_id', searchId)
      .order('rank', { ascending: true })
      .limit(1)

    const alternativeId = alternatives?.[0]?.id ?? null

    // Save survey response
    await supabaseAdmin
      .from('survey_responses')
      .insert({
        search_id:      searchId,
        alternative_id: alternativeId,
        did_order:      didOrder === 'Yes' || didOrder === true,
        taste_rating:   parseInt(tasteRating) || 3,
        overall_rating: parseInt(overallRating) || 3,
      })

    // Update taste_similarity_real on the alternative
    if (alternativeId && tasteRating) {
      const rating = parseInt(tasteRating)

      // Get current average
      const { data: existing } = await supabaseAdmin
        .from('survey_responses')
        .select('taste_rating')
        .eq('alternative_id', alternativeId)

      if (existing && existing.length > 0) {
        const avg = existing.reduce((sum, r) => sum + r.taste_rating, 0) / existing.length
        await supabaseAdmin
          .from('alternatives')
          .update({ taste_similarity_real: avg })
          .eq('id', alternativeId)
      }
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('[api/survey] error:', err)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}