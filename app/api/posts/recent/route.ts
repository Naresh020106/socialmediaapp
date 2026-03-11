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

    // Manually fetch author if populate fails
    const formattedPosts = await Promise.all(
      posts.map(async (post: any) => {
        let username = 'Unknown';
        let avatar = '';

        if (post.author) {
          if (post.author.username) {
            // populate worked
            username = post.author.username;
            avatar = post.author.avatar || '';
          } else {
            // populate failed, fetch manually
            const user = await User.findById(post.author).lean() as any;
            if (user) {
              username = user.username;
              avatar = user.avatar || '';
            }
          }
        }

        return {
          post_id:         post._id.toString(),
          user_id:         post.author?._id?.toString() || post.author?.toString() || '',
          username:        username,
          avatar:          avatar,
          content:         post.content,
          is_ai_generated: post.isAIGenerated || false,
          created_time:    post.createdAt,
        };
      })
    );

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