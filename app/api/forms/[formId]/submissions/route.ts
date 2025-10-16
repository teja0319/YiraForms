import { type NextRequest, NextResponse } from "next/server"
import { connectMongo } from "@/lib/mongo"
import { Form } from "@/models/form"
import { Org } from "@/models/org"
import { Submission } from "@/models/submission"
import { submissionSchema } from "@/lib/validators"
import { makeHttpError, requireAuth } from "@/lib/auth"
import { checkRateLimit, clientKey } from "@/lib/rate-limit"

function ipFrom(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.ip || null
}

export async function POST(req: NextRequest, { params }: { params: { formId: string } }) {
  try {
    await connectMongo()
    debugger
    // best-effort rate limiter
    const ip = ipFrom(req)
    const rl = checkRateLimit(clientKey(ip, req.nextUrl.pathname), 30, 60_000)
    if (!rl.allowed) {
      throw makeHttpError("RATE_LIMITED", "Too many requests", 429, { resetAt: rl.resetAt })
    }

    const body = await req.json()
    const parsed = submissionSchema.safeParse(body)
    if (!parsed.success) {
      throw makeHttpError("VALIDATION_ERROR", "Invalid input", 400, parsed.error.flatten())
    }

    const form = await Form.findOne({ _id: params.formId })
    if (!form) throw makeHttpError("NOT_FOUND", "Form not found", 404)

    const org = await Org.findById(form.orgId)
    if (!org) throw makeHttpError("NOT_FOUND", "Org not found", 404)

    // If not accepting anonymous, require auth
    if (!form.settings.acceptAnonymousSubmissions) {
      // await requireAuth(req)
    }

    // Field-level validation
    const errors: Array<{ field: string; reason: string }> = []

    // Create a map of question–answer pairs (default empty string if no answer)
    const questionAnswerPairs: Record<string, string | number | boolean> = {}

    for (const field of form.fields) {
      const value = parsed.data.data[field.name]
      const answer = value ?? "" // store empty string if no answer
      questionAnswerPairs[field.label || field.name] = answer

      // Required checks
      if (field.required) {
        if (field.type === "checkbox") {
          if (value !== true) {
            errors.push({ field: field.name, reason: "required" })
            continue
          }
        } else if (value === undefined || value === null || value === "") {
          errors.push({ field: field.name, reason: "required" })
          continue
        }
      }

      if (value === undefined || value === null || value === "") continue

      // Type checks
      if (field.type === "number" && typeof value !== "number") {
        errors.push({ field: field.name, reason: "type:number" })
      }
      if ((field.type === "text" || field.type === "textarea" || field.type === "email") && typeof value !== "string") {
        errors.push({ field: field.name, reason: "type:string" })
      }
      if (field.type === "checkbox" && typeof value !== "boolean") {
        errors.push({ field: field.name, reason: "type:boolean" })
      }
      if (field.type === "date") {
        const d = new Date(value)
        if (typeof value !== "string" || isNaN(d.getTime())) {
          errors.push({ field: field.name, reason: "type:date" })
        }
      }
      if (field.type === "select" || field.type === "radio") {
        if (typeof value !== "string") {
          errors.push({ field: field.name, reason: "type:string" })
        } else if (Array.isArray(field.options) && field.options.length > 0) {
          const allowed = field.options.map((o: any) => (typeof o === "string" ? o : o.value))
          if (!allowed.includes(value)) {
            errors.push({ field: field.name, reason: "invalid_option" })
          }
        }
      }

      // String validations
      if (field.validations?.minLength && typeof value === "string" && value.length < field.validations.minLength) {
        errors.push({ field: field.name, reason: "minLength" })
      }
      if (field.validations?.maxLength && typeof value === "string" && value.length > field.validations.maxLength) {
        errors.push({ field: field.name, reason: "maxLength" })
      }
      if (field.validations?.pattern && typeof value === "string") {
        const re = new RegExp(field.validations.pattern)
        if (!re.test(value)) errors.push({ field: field.name, reason: "pattern" })
      }

      // Numeric validations
      if (field.validations?.min !== undefined && typeof value === "number" && value < field.validations.min) {
        errors.push({ field: field.name, reason: "min" })
      }
      if (field.validations?.max !== undefined && typeof value === "number" && value > field.validations.max) {
        errors.push({ field: field.name, reason: "max" })
      }
    }

    if (errors.length) {
      throw makeHttpError("VALIDATION_ERROR", "Field-level validation failed", 400, { errors })
    }

    // Store question–answer structure instead of raw data
    const submission = await Submission.create({
      orgId: org._id,
      formId: form.formId,
      primaryKey: parsed.data.primaryKey,
      secondaryKey: parsed.data.secondaryKey ?? null,
      data: questionAnswerPairs,
      formVersion: 1,
      ipAddress: ip ?? undefined,
    })

    return NextResponse.json(
      {
        ok: true,
        submissionId: String(submission._id),
        primaryKey: submission.primaryKey,
        secondaryKey: submission.secondaryKey,
      },
      { status: 201 },
    )
  } catch (e: any) {
    const status = e?.status || 500
    return NextResponse.json(
      e?.body || { ok: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } },
      { status },
    )
  }
}
