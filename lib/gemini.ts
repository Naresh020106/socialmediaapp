import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateSocialPost(prompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const result = await model.generateContent(
    `You are a creative social media content writer. 
Generate an engaging social media post about: ${prompt}. 
Keep it under 280 characters. Be natural and authentic.`
  );
  
  return result.response.text();
}