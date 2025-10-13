import type mongoose from "mongoose"
import { Schema, model, models } from "mongoose"

export interface IUser {
  _id: mongoose.Types.ObjectId
  email: string
  passwordHash: string
  createdAt: Date
  updatedAt: Date
  orgId?: mongoose.Types.ObjectId
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    orgId: { type: Schema.Types.ObjectId, ref: "Org", index: true },
  },
  { timestamps: true },
)

export const User = models.User || model<IUser>("User", UserSchema)
