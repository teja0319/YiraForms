import type mongoose from "mongoose"
import { Schema, model, models } from "mongoose"

export interface IUser {
  _id: mongoose.Types.ObjectId
  email: string
  passwordHash: string
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true },
)

export const User = models.User || model<IUser>("User", UserSchema)
