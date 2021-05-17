import mongoose from 'mongoose';

interface IUser {
  name: string;
  type: 'ADMIN' | 'USER';
  avatar: string | null;
  email: string;
  active: boolean;
}

interface IModelUser extends mongoose.Document, IUser {}

export const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: String,
    avatar: { type: String, required: false },
    email: String,
    active: Boolean,
  },
  {
    timestamps: true,
  },
);

export const User = mongoose.model<IModelUser>('User', UserSchema);

export default User;
