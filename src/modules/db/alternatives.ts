import { supabaseAdmin } from '@/lib/supabase/server'
import { BuyLink } from '@/lib/types'

export async function createAlternative(data: {
  searchId: string
  productId: string
  rank: 1 | 2 | 3
  tasteSimilarityAi: number
  buyLinks: BuyLink[]
  explanation: string
}): Promise<string | null> {
  const { data: row, error } = await supabaseAdmin
    .from('alternatives')
    .insert({
      search_id:           data.searchId,
      product_id:          data.productId,
      rank:                data.rank,
      taste_similarity_ai: data.tasteSimilarityAi,
      buy_links:           data.buyLinks,
      explanation:         data.explanation
    })
    .select('id')
    .single()

  if (error) {
    console.error('[db/alternatives] createAlternative error:', error.message)
    return null
  }

  return row.id
}

export async function getAlternativesForSearch(
  searchId: string
) {
  const { data, error } = await supabaseAdmin
    .from('alternatives')
    .select(`
      id,
      rank,
      taste_similarity_ai,
      taste_similarity_real,
      buy_links,
      explanation,
      products (
        id,
        name,
        brand,
        nova_score,
        cleanliness_score,
        ingredient_list,
        ingredient_count,
        flavor_profile,
        source,
        is_verified
      )
    `)
    .eq('search_id', searchId)
    .order('rank', { ascending: true })

  if (error) {
    console.error('[db/alternatives] getAlternativesForSearch error:', error.message)
    return []
  }

  return data
}