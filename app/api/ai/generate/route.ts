import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateSocialPost } from '@/lib/gemini';
import { z } from 'zod';

const schema = z.object({ prompt: z.string().min(3).max(200) });

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body   = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid prompt' }, { status: 400 });
    }

    const generatedContent = await generateSocialPost(parsed.data.prompt);
    return NextResponse.json({ content: generatedContent });
  } catch (err) {
    console.error('[AI_GENERATE]', err);
    return NextResponse.json({ error: 'AI generation failed' }, { status: 500 });
  }
}