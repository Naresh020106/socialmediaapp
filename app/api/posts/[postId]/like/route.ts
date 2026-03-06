import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Like } from '@/models/Like';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;   // ✅ unwrap the Promise
    const session = await getServerSession(authOptions);
    await connectDB();

    const count = await Like.countDocuments({ post: postId });
    const liked = session?.user?.id
      ? !!(await Like.findOne({ post: postId, user: session.user.id }))
      : false;

    return NextResponse.json({ count, liked });
  } catch (err) {
    return NextResponse.json({ count: 0, liked: false });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { postId } = await params;   // ✅ unwrap the Promise
    await connectDB();

    const existing = await Like.findOne({ post: postId, user: session.user.id });

    if (existing) {
      await Like.deleteOne({ _id: existing._id });
      const count = await Like.countDocuments({ post: postId });
      return NextResponse.json({ liked: false, count });
    } else {
      await Like.create({ post: postId, user: session.user.id });
      const count = await Like.countDocuments({ post: postId });
      return NextResponse.json({ liked: true, count });
    }
  } catch (err) {
    console.error('[LIKE]', err);
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
  }
}
 