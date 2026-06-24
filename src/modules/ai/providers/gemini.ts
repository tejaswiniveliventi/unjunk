import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'
import { incrementProviderUsage, checkProviderBudget } from '@/modules/rateLimit/tokenBudget'

const SAFETY_SETTINGS = [
  {
    category:  HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE
  },
  {
    category:  HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE
  }
]

export async function callGemini(
  prompt: string,
  useSearch: boolean = false
): Promise<string> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

  // Check if we recently got a 429 — skip Gemini entirely if so
  const { redis } = await import('@/modules/cache/redis')
  const blocked = await redis.get('gemini:blocked')
  if (blocked) {
    throw new Error('Gemini temporarily blocked due to rate limit')
  }

  const withinBudget = await checkProviderBudget('gemini')
  if (!withinBudget) {
    throw new Error('Gemini daily budget exceeded')
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      safetySettings: SAFETY_SETTINGS,
      tools: useSearch ? [{ googleSearch: {} } as any] : undefined
    })

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2 }
    })

    await incrementProviderUsage('gemini')

    const text = result.response.candidates?.[0]?.content?.parts
      ?.map((p: any) => p.text ?? '')
      .join('')

    return text ?? ''

  } catch (err: any) {
    // If 429, block Gemini for 60 seconds to avoid hammering
    if (err?.status === 429 || err?.message?.includes('429')) {
      await redis.set('gemini:blocked', '1', { ex: 60 })
    }
    throw err
  }
}