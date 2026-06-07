import { supabaseAdmin } from '@/lib/supabase/server'

export async function scheduleEmail(
  searchId: string,
  email: string
): Promise<boolean> {
  // Schedule 48 hours after search
  const scheduledFor = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()

  const { error } = await supabaseAdmin
    .from('email_queue')
    .insert({
      search_id:     searchId,
      email,
      scheduled_for: scheduledFor,
      status:        'pending'
    })

  if (error) {
    console.error('[db/emailQueue] scheduleEmail error:', error.message)
    return false
  }

  return true
}

export async function getPendingEmails() {
  const { data, error } = await supabaseAdmin
    .from('email_queue')
    .select('id, search_id, email')
    .eq('status', 'pending')
    .lte('scheduled_for', new Date().toISOString())
    .limit(50)

  if (error) {
    console.error('[db/emailQueue] getPendingEmails error:', error.message)
    return []
  }

  return data
}

export async function markEmailSent(id: string): Promise<void> {
  await supabaseAdmin
    .from('email_queue')
    .update({ status: 'sent', sent_at: new Date().toISOString() })
    .eq('id', id)
}

export async function markEmailFailed(id: string): Promise<void> {
  await supabaseAdmin
    .from('email_queue')
    .update({ status: 'failed' })
    .eq('id', id)
}