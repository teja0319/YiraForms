import type mongoose from "mongoose"
import { Schema, model, models } from "mongoose"

export interface ISubmission {
  _id: mongoose.Types.ObjectId
  orgId: mongoose.Types.ObjectId
  formId: string
  primaryKey: string
  secondaryKey?: string | null
  data: Record<string, any>
  formVersion?: number
  ipAddress?: string
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "Org", required: true, index: true },
    formId: { type: String, required: true, index: true },
    primaryKey: { type: String, required: true, index: true },
    secondaryKey: { type: String, default: null },
    data: { type: Schema.Types.Mixed, required: true },
    formVersion: { type: Number, default: 1 },
    ipAddress: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
)

// Optimize retrieval by keys
SubmissionSchema.index({ formId: 1, primaryKey: 1, secondaryKey: 1 }, { name: "form_primary_secondary" })

export const Submission = models.Submission || model<ISubmission>("Submission", SubmissionSchema)
