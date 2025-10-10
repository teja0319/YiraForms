import type mongoose from "mongoose"
import { Schema, model, models } from "mongoose"

export interface IFormField {
  id: string // UUID within form
  label: string
  name: string // key
  type: "text" | "textarea" | "number" | "date" | "select" | "checkbox" | "radio" | "file"
  options?: { value: string; label: string }[]
  required: boolean
  validations?: {
    minLength?: number
    maxLength?: number
    pattern?: string
    min?: number
    max?: number
  }
  order: number
}

export interface IFormSettings {
  acceptAnonymousSubmissions: boolean
  allowSecondaryKey: boolean
}

export interface IForm {
  _id: mongoose.Types.ObjectId
  orgId: mongoose.Types.ObjectId
  formId: string // human-friendly id/slug
  title: string
  description?: string
  fields: IFormField[]
  settings: IFormSettings
  createdAt: Date
  updatedAt: Date
}

const FieldSchema = new Schema<IFormField>(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    options: [{ value: String, label: String }],
    required: { type: Boolean, default: false },
    validations: {
      minLength: Number,
      maxLength: Number,
      pattern: String,
      min: Number,
      max: Number,
    },
    order: { type: Number, default: 0 },
  },
  { _id: false },
)

const FormSchema = new Schema<IForm>(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "Org", required: true, index: true },
    formId: { type: String, required: true },
    title: { type: String, required: true },
    description: String,
    fields: { type: [FieldSchema], default: [] },
    settings: {
      acceptAnonymousSubmissions: { type: Boolean, default: false },
      allowSecondaryKey: { type: Boolean, default: true },
    },
  },
  { timestamps: true },
)

FormSchema.index({ orgId: 1, formId: 1 }, { unique: true })

export const Form = models.Form || model<IForm>("Form", FormSchema)
