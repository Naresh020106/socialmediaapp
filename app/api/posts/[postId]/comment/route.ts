import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Comment } from '@/models/Comment';
import { z } from 'zod';

const schema = z.object({ content: z.string().min(1).max(500) });

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;   // ✅ unwrap the Promise
    await connectDB();
    const comments = await Comment.find({ post: postId })
      .sort({ createdAt: 1 })
      .populate('author', 'username avatar');
    return NextResponse.json({ comments });
  } catch (err) {
    console.error('[COMMENT GET]', err);
    return NextResponse.json({ comments: [] });
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

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid content' }, { status: 400 });
    }

    const { postId } = await params;   // ✅ unwrap the Promise
    await connectDB();

    const comment = await Comment.create({
      post: postId,
      author: session.user.id,
      content: parsed.data.content,
    });

    const populated = await comment.populate('author', 'username avatar');
    return NextResponse.json({ comment: populated }, { status: 201 });
  } catch (err) {
    console.error('[COMMENT POST]', err);
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
  }
}
