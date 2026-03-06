'use client';
import { useState } from 'react';
import Link from 'next/link';

interface User {
  _id: string;
  username: string;
  bio?: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setUsers(data.users ?? []);
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <a href="/home" className="text-blue-500 text-sm hover:underline">
            ← Back to Home
          </a>
          <h1 className="text-2xl font-bold text-blue-600">🔍 Search Users</h1>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by username..."
            className="flex-1 border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {/* Results */}
        <div className="space-y-3">
          {users.length === 0 && query && !loading && (
            <div className="text-center py-8 text-gray-600">
              <p className="text-3xl mb-2">😕</p>
              <p>No users found for "{query}"</p>
            </div>
          )}

          {users.map(user => (
            <div
              key={user._id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold">
                {user.username[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{user.username}</p>
                <p className="text-sm text-gray-600">{user.bio || 'No bio yet'}</p>
              </div>
              <Link
                href={`/profile/${user.username}`}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
              >
                View Profile
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}