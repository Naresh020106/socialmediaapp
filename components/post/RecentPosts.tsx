'use client';
import { useState } from 'react';
import PostCard from './PostCard';
import { PostWithAuthor } from '@/types';

export default function RecentPosts() {
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');

  async function fetchRecentPosts() {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/posts/recent');
      const data = await res.json();

      if (data.success) {
        const formatted = data.posts.map((post: any) => ({
          _id:           post.post_id,
          content:       post.content,
          isAIGenerated: post.is_ai_generated || false,
          createdAt:     post.created_time,
          author: {
            _id:      post.user_id,
            username: post.username,
            avatar:   post.avatar || '',
          },
        }));
        setPosts(formatted);
        setLoaded(true);
      } else {
        setError('Failed to load posts');
      }
    } catch (err) {
      setError('Something went wrong');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Fetch Button */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-800">🕐 Recent Posts</h2>
          <p className="text-sm text-gray-600">
            Load the 10 most recent posts
          </p>
        </div>
        <button
          onClick={fetchRecentPosts}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? '⏳ Loading...' : loaded ? '🔄 Refresh' : '📥 Load Posts'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
          {error}
        </p>
      )}

      {/* Empty state */}
      {loaded && posts.length === 0 && (
        <div className="text-center py-8 text-gray-600">
          <p className="text-3xl mb-2">📭</p>
          <p>No posts found</p>
        </div>
      )}

      {/* Posts list */}
      {posts.map(post => (
        <PostCard key={post._id} post={post} />
      ))}

      {/* Count */}
      {loaded && posts.length > 0 && (
        <p className="text-center text-sm text-gray-600">
          Showing {posts.length} most recent posts
        </p>
      )}
    </div>
  );
}