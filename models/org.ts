import type mongoose from "mongoose"
import { Schema, model, models } from "mongoose"

export interface IOrg {
  _id: mongoose.Types.ObjectId
  name: string
  slug: string
  contactEmail?: string
  ownerUserId: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const OrgSchema = new Schema<IOrg>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    contactEmail: { type: String },
    ownerUserId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true },
)

export const Org = models.Org || model<IOrg>("Org", OrgSchema)
