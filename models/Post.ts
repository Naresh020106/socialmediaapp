import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPost extends Document {
  author: Types.ObjectId;
  content: string;
  isAIGenerated: boolean;
  aiPrompt?: string;
  createdAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    author:        { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content:       { type: String, required: true, maxlength: 2000 },
    isAIGenerated: { type: Boolean, default: false },
    aiPrompt:      { type: String, default: '' },
  },
  { timestamps: true }
);

PostSchema.index({ author: 1, createdAt: -1 });

export const Post = mongoose.models.Post ?? mongoose.model<IPost>('Post', PostSchema);