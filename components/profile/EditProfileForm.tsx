'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface EditProfileFormProps {
  currentBio: string;
  currentAvatar: string;
  username: string;
}

export default function EditProfileForm({
  currentBio,
  currentAvatar,
  username,
}: EditProfileFormProps) {
  const router = useRouter();
  const [bio, setBio] = useState(currentBio || '');
  const [avatar, setAvatar] = useState(currentAvatar || '');
  const [preview, setPreview] = useState(currentAvatar || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to base64 for storage
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setAvatar(base64);
      setPreview(base64);
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const res = await fetch('/api/users/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio, avatar }),
      });

      if (res.ok) {
        setSuccess(true);
        setShowForm(false);
        router.refresh();
      }
    } catch (err) {
      console.error('Update failed', err);
    } finally {
      setLoading(false);
    }
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="text-sm bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
      >
        ✏️ Edit Profile
      </button>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
      <h3 className="font-semibold text-gray-700">Edit Profile</h3>

      {success && (
        <p className="text-green-600 text-sm bg-green-50 p-2 rounded-lg">
          ✅ Profile updated!
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Avatar Upload */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
            {preview ? (
              <img
                src={preview}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              username[0].toUpperCase()
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profile Photo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="text-sm text-gray-700 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
            />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bio
          </label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder="Tell people about yourself..."
            maxLength={200}
            rows={3}
            className="w-full border border-gray-200 p-3 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <p className="text-xs text-gray-600 text-right">{bio.length}/200</p>
        </div>

        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}