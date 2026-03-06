import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  avatar?: string;
  bio?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 30 },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    avatar:   { type: String, default: '' },
    bio:      { type: String, default: '', maxlength: 200 },
  },
  { timestamps: true }
);

UserSchema.set('toJSON', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: function(_doc: any, ret: any) {
    delete ret.password;
    return ret;
  },
});

export const User = mongoose.models.User ?? mongoose.model<IUser>('User', UserSchema);