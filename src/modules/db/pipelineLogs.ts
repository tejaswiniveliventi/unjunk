
import { supabaseAdmin } from '@/lib/supabase/server'

export async function logPipelineCall(data: {
  searchId:    string | null
  callNumber:  1 | 2 | 3
  provider:    'groq' | 'gemini'
  model:       string
  prompt:      string
  rawResponse: string
  parsedOk:    boolean
  durationMs:  number
  usedSearch?: boolean
}): Promise<void> {
  const { error } = await supabaseAdmin
    .from('pipeline_logs')
    .insert({
      search_id:    data.searchId,
      call_number:  data.callNumber,
      provider:     data.provider,
      model:        data.model,
      prompt:       data.prompt,
      raw_response: data.rawResponse,
      parsed_ok:    data.parsedOk,
      duration_ms:  data.durationMs,
      used_search:  data.usedSearch ?? false
    })

  if (error) {
    // Never let logging break the app
    console.error('[db/pipelineLogs] log error:', error.message)
  }
}