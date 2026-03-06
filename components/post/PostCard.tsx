'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { PostWithAuthor } from '@/types';

export default function PostCard({ post }: { post: PostWithAuthor }) {
  const { data: session } = useSession();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [loadingComment, setLoadingComment] = useState(false);

  useEffect(() => {
    async function fetchLikes() {
      try {
        const res = await fetch(`/api/posts/${post._id}/like`);
        if (res.ok) {
          const data = await res.json();
          setLikeCount(data.count);
          setLiked(data.liked);
        }
      } catch (err) {
        console.error('Failed to fetch likes', err);
      }
    }
    fetchLikes();
  }, [post._id]);

  async function toggleLike() {
    if (!session?.user?.id) {
      alert('Please login to like posts');
      return;
    }
    try {
      const res = await fetch(`/api/posts/${post._id}/like`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setLiked(data.liked);
      setLikeCount(data.count);
    } catch (err) {
      console.error('Like failed', err);
    }
  }

  async function loadComments() {
    try {
      const res = await fetch(`/api/posts/${post._id}/comment`);
      const data = await res.json();
      setComments(data.comments ?? []);
      setShowComments(true);
    } catch (err) {
      console.error('Failed to load comments', err);
    }
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim() || !session) return;
    setLoadingComment(true);
    try {
      const res = await fetch(`/api/posts/${post._id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: comment }),
      });
      const data = await res.json();
      if (data.comment) {
        setComments(prev => [...prev, data.comment]);
      }
      setComment('');
    } catch (err) {
      console.error('Failed to submit comment', err);
    } finally {
      setLoadingComment(false);
    }
  }

  function shareToWhatsApp() {
    const text = encodeURIComponent(post.content);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-3">
      {/* Author */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
          {post.author.username[0].toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-gray-800">{post.author.username}</p>
          <p className="text-xs text-gray-600">
            {new Date(post.createdAt).toLocaleDateString()}
          </p>
        </div>
        {post.isAIGenerated && (
          <span className="ml-auto text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
            ✨ AI Generated
          </span>
        )}
      </div>

      {/* Content */}
      <p className="text-gray-700 leading-relaxed">{post.content}</p>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-2 border-t border-gray-50">
        <button
          onClick={toggleLike}
          className={`flex items-center gap-1 text-sm font-medium transition ${
            liked ? 'text-red-500' : 'text-gray-600 hover:text-red-400'
          }`}
        >
          {liked ? '❤️' : '🤍'} {likeCount}
        </button>

        <button
          onClick={showComments ? () => setShowComments(false) : loadComments}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-500 transition"
        >
          💬 Comment
        </button>

        <button
          onClick={shareToWhatsApp}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-green-500 transition ml-auto"
        >
          📤 Share
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="space-y-3 pt-2">
          {comments.length === 0 && (
            <p className="text-sm text-gray-600 text-center">
              No comments yet. Be the first!
            </p>
          )}

          {comments.map((c: any) => (
            <div key={c._id} className="flex gap-2 text-sm">
              <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs font-bold">
                {c.author?.username?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div className="bg-gray-50 rounded-lg px-3 py-2 flex-1">
                <span className="font-medium text-gray-700">
                  {c.author?.username ?? 'Unknown'}{' '}
                </span>
                <span className="text-gray-600">{c.content}</span>
              </div>
            </div>
          ))}

          {session && (
            <form onSubmit={submitComment} className="flex gap-2">
              <input
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                type="submit"
                disabled={loadingComment}
                className="bg-blue-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-600 transition disabled:opacity-50"
              >
                {loadingComment ? '...' : 'Post'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}