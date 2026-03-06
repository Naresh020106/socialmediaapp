import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { z } from 'zod';

const schema = z.object({
  bio: z.string().max(200).optional(),
  avatar: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    await connectDB();

    const updated = await User.findByIdAndUpdate(
      session.user.id,
      { $set: parsed.data },
      { new: true }
    ).select('-password');

    return NextResponse.json({ user: updated });
  } catch (err) {
    console.error('[UPDATE_PROFILE]', err);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}