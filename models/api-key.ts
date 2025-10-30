import type mongoose from "mongoose"
import { Schema, model, models } from "mongoose"

export interface IApiKey {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  key: string
  name: string
  lastUsedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const ApiKeySchema = new Schema<IApiKey>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    key: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    lastUsedAt: { type: Date },
  },
  { timestamps: true },
)

export const ApiKey = models.ApiKey || model<IApiKey>("ApiKey", ApiKeySchema)
