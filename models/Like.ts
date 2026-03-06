import mongoose, { Schema, Types, Document } from 'mongoose';

export interface ILike extends Document {
  post: Types.ObjectId;
  user: Types.ObjectId;
}

const LikeSchema = new Schema<ILike>({
  post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

LikeSchema.index({ post: 1, user: 1 }, { unique: true });

export const Like = mongoose.models.Like ?? mongoose.model<ILike>('Like', LikeSchema);