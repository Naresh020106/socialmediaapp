import { connectDB } from '@/lib/mongodb';
import { Post } from '@/models/Post';
import { Follow } from '@/models/Follow';
import PostCard from '@/components/post/PostCard';
import { PostWithAuthor } from '@/types';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DiscoverPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  await connectDB();

  // Get list of users this person follows
  const following = await Follow.find({ follower: session.user.id }).select('following');
  const followingIds = following.map(f => f.following);

  // Show posts only from followed users (not own posts)
  const posts = await Post.find({
    author: { $in: followingIds },
  })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate('author', 'username avatar')
    .lean();

  const serialized = JSON.parse(JSON.stringify(posts)) as PostWithAuthor[];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-blue-600">🌐 Mini AI Social</h1>
          <div className="flex gap-3">
            <a
              href="/home"
              className="text-sm bg-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200 transition"
            >
              🏠 Home
            </a>
            <a
              href="/search"
              className="text-sm bg-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200 transition"
            >
              🔍 Search
            </a>
            <a
              href={`/profile/${session.user.name}`}
              className="text-sm bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition font-medium"
            >
              👤 {session.user.name}
            </a>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto py-6 px-4 space-y-6">
        <h2 className="font-semibold text-gray-700">
          🌍 Posts from people you follow
        </h2>

        <div className="space-y-4">
          {serialized.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              <p className="text-4xl mb-2">👥</p>
              <p className="font-medium text-gray-700">No posts yet!</p>
              <p className="text-sm mt-1">Follow some users to see their posts here.</p>
              <a
                href="/search"
                className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
              >
                🔍 Find Users to Follow
              </a>
            </div>
          ) : (
            serialized.map(post => (
              <PostCard key={post._id} post={post} />
            ))
          )}
        </div>
      </div>
    </main>
  );
}