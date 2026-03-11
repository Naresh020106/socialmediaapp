import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Post } from '@/models/Post';
import { User } from '@/models/User';

export async function GET() {
  try {
    await connectDB();

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('author', 'username avatar')
      .lean();

    const formattedPosts = posts.map((post: any) => ({
      post_id:      post._id.toString(),
      user_id:      post.author?._id?.toString() || '',
      content:      post.content,
      created_time: post.createdAt,
    }));

    return NextResponse.json({
      success: true,
      count:   formattedPosts.length,
      posts:   formattedPosts,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error:   'Failed to fetch posts',
      details: err.message,
    }, { status: 500 });
  }
}