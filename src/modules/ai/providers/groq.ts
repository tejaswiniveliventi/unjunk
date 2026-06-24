import Groq from 'groq-sdk'
import { incrementProviderUsage, checkProviderBudget } from '@/modules/rateLimit/tokenBudget'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!
})

type GroqMessage = {
  role: 'user' | 'system' | 'assistant'
  content: string
}

export async function callGroq(
  messages: GroqMessage[],
  model: 'llama-3.1-8b-instant' | 'llama-3.3-70b-versatile' = 'llama-3.1-8b-instant'
): Promise<string> {
  const withinBudget = await checkProviderBudget('groq')
  if (!withinBudget) {
    throw new Error('Groq daily budget exceeded')
  }
  const response = await groq.chat.completions.create({
    model,
    messages,
    temperature: 0.1,      // low temp = consistent, structured output
    max_tokens: 1000
  })

  return response.choices[0]?.message?.content ?? ''
}