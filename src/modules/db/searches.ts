import { supabaseAdmin } from '@/lib/supabase/server'
import { Search } from '@/lib/types'

export async function createSearch(data: {
  sessionId: string
  email?: string
  citySlug: string
  regionCode: string
  inputText: string
  normalizedFood: string
}): Promise<Search | null> {
  const { data: row, error } = await supabaseAdmin
    .from('searches')
    .insert({
      session_id:      data.sessionId,
      email:           data.email ?? null,
      city_slug:       data.citySlug,
      region_code:     data.regionCode,
      input_text:      data.inputText,
      normalized_food: data.normalizedFood
    })
    .select()
    .single()

  if (error) {
    console.error('[db/searches] createSearch error:', error.message)
    return null
  }

  return {
    id:             row.id,
    sessionId:      row.session_id,
    email:          row.email,
    citySlug:       row.city_slug,
    regionCode:     row.region_code,
    inputText:      row.input_text,
    normalizedFood: row.normalized_food,
    createdAt:      row.created_at
  }
}

export async function updateSearchEmail(
  searchId: string,
  email: string
): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('searches')
    .update({ email })
    .eq('id', searchId)

  if (error) {
    console.error('[db/searches] updateSearchEmail error:', error.message)
    return false
  }

  return true
}