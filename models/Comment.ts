import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IComment extends Document {
  post: Types.ObjectId;
  author: Types.ObjectId;
  content: string;
  createdAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    post:    { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    author:  { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxlength: 500 },
  },
  { timestamps: true }
);

CommentSchema.index({ post: 1 });

export const Comment = mongoose.models.Comment ?? mongoose.model<IComment>('Comment', CommentSchema);