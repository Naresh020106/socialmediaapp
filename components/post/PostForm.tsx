'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PostForm() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  async function generateAI() {
    if (!prompt.trim()) return;
    setGenerating(true);

    const res = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();
    setContent(data.content ?? '');
    setGenerating(false);
  }

  async function publishPost() {
    if (!content.trim()) return;
    setLoading(true);

    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content,
        isAIGenerated: !!prompt,
        aiPrompt: prompt,
      }),
    });

    setLoading(false);

    if (res.ok) {
      setContent('');
      setPrompt('');
      router.refresh();
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
      <h2 className="font-semibold text-gray-700">Create Post</h2>

      {/* AI Prompt */}
      <div className="flex gap-2">
        <input
          placeholder="✨ AI prompt (e.g. morning coffee vibes)"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          className="flex-1 border border-gray-200 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <button
          onClick={generateAI}
          disabled={generating || !prompt.trim()}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition disabled:opacity-50"
        >
          {generating ? 'Generating...' : '✨ Generate'}
        </button>
      </div>

      {/* Post Content */}
      <textarea
        placeholder="What's on your mind?"
        value={content}
        onChange={e => setContent(e.target.value)}
        rows={4}
        className="w-full border border-gray-200 p-3 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      <div className="flex justify-end">
        <button
          onClick={publishPost}
          disabled={loading || !content.trim()}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Publishing...' : 'Publish'}
        </button>
      </div>
    </div>
  );
}