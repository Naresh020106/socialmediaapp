import { connectDB } from '@/lib/mongodb';
import { Post } from '@/models/Post';
import PostForm from '@/components/post/PostForm';
import PostCard from '@/components/post/PostCard';
import { PostWithAuthor } from '@/types';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  await connectDB();

  // Only fetch logged-in user's own posts
  const posts = await Post.find({ author: session.user.id })
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
              href="/discover"
              className="text-sm bg-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200 transition"
            >
              🌍 Discover
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
        <PostForm />

        <h2 className="font-semibold text-gray-700">My Posts</h2>

        <div className="space-y-4">
          {serialized.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              <p className="text-4xl mb-2">📭</p>
              <p>You haven't posted anything yet!</p>
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