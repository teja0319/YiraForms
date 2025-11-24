import { z } from "zod"

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(128),
  orgId: z.string().optional(),
})

export const loginSchema = registerSchema

export const orgCreateSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  contactEmail: z.string().email().optional(),
})

export const orgUpdateSchema = orgCreateSchema.partial()

const baseFieldSchema = z.object({
  id: z.string().nullable().optional(),
  label: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(["text", "textarea", "number", "date", "select", "checkbox", "radio", "file"]),
  options: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
  required: z.boolean().default(false),
  validations: z
    .object({
      minLength: z.number().int().positive().optional(),
      maxLength: z.number().int().positive().optional(),
      pattern: z.string().optional(),
      min: z.number().optional(),
      max: z.number().optional(),
    })
    .partial()
    .optional(),
  order: z.number().int().default(0),
})

export const formCreateSchema = z.object({
  formId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  fields: z.array(baseFieldSchema).default([]),
  settings: z
    .object({
      acceptAnonymousSubmissions: z.boolean().default(false),
      allowSecondaryKey: z.boolean().default(true),
    })
    .default({ acceptAnonymousSubmissions: false, allowSecondaryKey: true }),
})

export const formUpdateSchema = formCreateSchema.partial()

export const submissionSchema = z.object({
  primaryKey: z.string().min(1),
  secondaryKey: z.string().min(1).optional().nullable(),
  data: z.record(z.any()),
})

export const orgAccountCreateSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  email: z.string().email("Valid organization email is required"),
  password: z.string().min(6).max(128),
  address: z.string().min(1, "Address is required"),
})
