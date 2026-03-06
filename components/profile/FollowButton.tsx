'use client';
import { useState } from 'react';

interface FollowButtonProps {
  userId: string;
  initialFollowing: boolean;
}

export default function FollowButton({ userId, initialFollowing }: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  async function toggleFollow() {
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${userId}/follow`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setFollowing(data.following);
    } catch (err) {
      console.error('Follow failed', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggleFollow}
      disabled={loading}
      style={{
        padding: '8px 16px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.5 : 1,
        backgroundColor: following ? '#f3f4f6' : '#2563eb',
        color: following ? '#374151' : '#ffffff',
        border: 'none',
      }}
    >
      {loading ? '...' : following ? 'Unfollow' : 'Follow'}
    </button>
  );
}