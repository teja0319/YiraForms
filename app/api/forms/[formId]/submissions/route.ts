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
    const form = await Form.findOne({ formId: params.formId })
    if (!form) throw makeHttpError("NOT_FOUND", "Form not found", 404)
    const org = await Org.findById(form.orgId)
    if (!org) throw makeHttpError("NOT_FOUND", "Org not found", 404)

    // If not accepting anonymous, require auth
    if (!form.settings.acceptAnonymousSubmissions) {
      await requireAuth(req)
    }

    // Basic data validation according to fields
    const errors: Array<{ field: string; reason: string }> = []
    for (const field of form.fields) {
      const value = parsed.data.data[field.name]
      if (field.required && (value === undefined || value === null || value === "")) {
        errors.push({ field: field.name, reason: "required" })
        continue
      }
      if (value === undefined || value === null) continue

      if (field.type === "number" && typeof value !== "number") {
        errors.push({ field: field.name, reason: "type:number" })
      }
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

    const submission = await Submission.create({
      orgId: org._id,
      formId: form.formId,
      primaryKey: parsed.data.primaryKey,
      secondaryKey: parsed.data.secondaryKey ?? null,
      data: parsed.data.data,
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
