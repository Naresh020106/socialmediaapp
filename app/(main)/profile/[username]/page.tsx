import { connectDB } from '@/lib/mongodb';
import { Post } from '@/models/Post';
import { User } from '@/models/User';
import { Follow } from '@/models/Follow';
import PostCard from '@/components/post/PostCard';
import PostForm from '@/components/post/PostForm';
import { PostWithAuthor } from '@/types';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import FollowButton from '@/components/profile/FollowButton';
import EditProfileForm from '@/components/profile/EditProfileForm';

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { username } = await params;

  await connectDB();

  const user = await User.findOne({ username }).lean() as any;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-2">👤</p>
          <p className="text-gray-700">User not found</p>
        </div>
      </div>
    );
  }

  const posts = await Post.find({ author: user._id })
    .sort({ createdAt: -1 })
    .populate('author', 'username avatar')
    .lean();

  const followerCount = await Follow.countDocuments({ following: user._id });
  const followingCount = await Follow.countDocuments({ follower: user._id });

  const isFollowing = session?.user?.id
    ? !!(await Follow.findOne({ follower: session.user.id, following: user._id }))
    : false;

  const isOwnProfile = session?.user?.id === user._id.toString();

  const serialized = JSON.parse(JSON.stringify(posts)) as PostWithAuthor[];
  const serializedUser = JSON.parse(JSON.stringify(user));

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/home" className="text-xl font-bold text-blue-600">
            🌐 Mini AI Social
          </a>
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
              href={`/profile/${session?.user?.name}`}
              className="text-sm bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition font-medium"
            >
              👤 {session?.user?.name}
            </a>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto py-6 px-4 space-y-6">

        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-4">

            {/* Avatar */}
            <div className="w-16 h-16 rounded-full overflow-hidden bg-blue-500 flex items-center justify-center text-white text-2xl font-bold shrink-0">
              {serializedUser.avatar ? (
                <img
                  src={serializedUser.avatar}
                  alt={serializedUser.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                serializedUser.username[0].toUpperCase()
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-800">
                {serializedUser.username}
              </h1>
              <p className="text-gray-700 text-sm mt-1">
                {serializedUser.bio || 'No bio yet'}
              </p>
            </div>

            {/* Follow or Edit Button */}
            {isOwnProfile ? (
              <EditProfileForm
                currentBio={serializedUser.bio || ''}
                currentAvatar={serializedUser.avatar || ''}
                username={serializedUser.username}
              />
            ) : (
              session && (
                <FollowButton
                  userId={serializedUser._id}
                  initialFollowing={isFollowing}
                />
              )
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <p className="font-bold text-gray-800">{serialized.length}</p>
              <p className="text-xs text-gray-600">Posts</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-800">{followerCount}</p>
              <p className="text-xs text-gray-600">Followers</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-800">{followingCount}</p>
              <p className="text-xs text-gray-600">Following</p>
            </div>
          </div>
        </div>

        {/* Show PostForm only on own profile */}
        {isOwnProfile && <PostForm />}

        {/* User Posts */}
        <h2 className="font-semibold text-gray-700">
          {isOwnProfile ? 'My Posts' : `${serializedUser.username}'s Posts`}
        </h2>

        <div className="space-y-4">
          {serialized.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              <p className="text-4xl mb-2">📭</p>
              <p>No posts yet</p>
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