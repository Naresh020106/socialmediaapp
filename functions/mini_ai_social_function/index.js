const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;

// Post Schema
const PostSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, required: true },
    isAIGenerated: { type: Boolean, default: false },
    aiPrompt: { type: String, default: '' },
  },
  { timestamps: true }
);

// User Schema (for populate)
const UserSchema = new mongoose.Schema({
  username: { type: String },
  avatar: { type: String },
});

// Singleton connection
let isConnected = false;

async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log('Using existing MongoDB connection');
    return;
  }

  await mongoose.connect(MONGODB_URI, {
    bufferCommands: false,
  });

  isConnected = true;
  console.log('MongoDB connected');
}

module.exports = async (context, basicIO) => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Get models
    const Post = mongoose.models.Post || mongoose.model('Post', PostSchema);
    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    // Fetch 10 most recent posts
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('author', 'username avatar')
      .lean();

    // Format response
    const formattedPosts = posts.map(post => ({
      post_id: post._id.toString(),
      user_id: post.author?._id?.toString() || '',
      username: post.author?.username || 'Unknown',
      avatar: post.author?.avatar || '',
      content: post.content,
      is_ai_generated: post.isAIGenerated,
      created_time: post.createdAt,
    }));

    // Send response
    basicIO.setHeader('Content-Type', 'application/json');
    basicIO.setStatusCode(200);
    basicIO.write(JSON.stringify({
      success: true,
      count: formattedPosts.length,
      posts: formattedPosts,
    }));

    context.close();
  } catch (err) {
    console.error('Error fetching posts:', err);
    basicIO.setStatusCode(500);
    basicIO.write(JSON.stringify({
      success: false,
      error: 'Failed to fetch posts',
      details: err.message,
    }));
    context.close();
  }
};