import { Resend } from 'resend'

//const resend = new Resend(process.env.RESEND_API_KEY!)

export async function sendSurveyEmail(
  email: string,
  searchId: string,
  originalFood: string,
  tallyFormUrl: string
): Promise<boolean> {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY!)

    const surveyUrl = `${tallyFormUrl}?search_id=${searchId}`

    await resend.emails.send({
      from:    'Unjunk <hello@unjunk.app>',
      to:      email,
      subject: `Did your clean swap taste good? 🌿`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #1A1A1A;">Hey, quick question 👋</h2>
          <p style="color: #6B6B6B; line-height: 1.6;">
            A couple days ago you looked up a cleaner alternative to 
            <strong>${originalFood}</strong> on Unjunk.
          </p>
          <p style="color: #6B6B6B; line-height: 1.6;">
            Did you try it? Did it actually taste similar?
            Takes 30 seconds — your feedback helps everyone find better swaps.
          </p>
          <a 
            href="${surveyUrl}"
            style="
              display: inline-block;
              margin-top: 16px;
              padding: 12px 24px;
              background: #5B9E6F;
              color: #fff;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
            "
          >
            Share your experience →
          </a>
          <p style="color: #999; font-size: 12px; margin-top: 32px;">
            You're receiving this because you searched on Unjunk.
          </p>
        </div>
      `
    })

    return true
  } catch (err) {
    console.error('[survey/sendSurveyEmail] error:', err)
    return false
  }
}