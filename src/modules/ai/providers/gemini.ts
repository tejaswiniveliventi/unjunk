import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold
} from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const SAFETY_SETTINGS = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE
  }
]

export async function callGemini(
  prompt: string,
  useSearch: boolean = false
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    safetySettings: SAFETY_SETTINGS,
    generationConfig: {
      temperature: 0.2
    },
    tools: useSearch ? [{ googleSearch: {} } as any] : undefined
  })

  const result = await model.generateContent(prompt)
  const response = result.response

  // Extract text across all parts (search grounding adds extra parts)
  const text = response.candidates?.[0]?.content?.parts
    ?.map((p: any) => p.text ?? '')
    .join('')

  return text ?? ''
}