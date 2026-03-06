import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Follow } from '@/models/Follow';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { userId } = await params;

  if (session.user.id === userId) {
    return NextResponse.json({ error: "You can't follow yourself" }, { status: 400 });
  }

  await connectDB();

  const existing = await Follow.findOne({
    follower: session.user.id,
    following: userId,
  });

  if (existing) {
    await Follow.deleteOne({ _id: existing._id });
    return NextResponse.json({ following: false });
  } else {
    await Follow.create({ follower: session.user.id, following: userId });
    return NextResponse.json({ following: true });
  }
}