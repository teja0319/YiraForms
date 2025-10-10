import { type NextRequest, NextResponse } from "next/server"
import { connectMongo } from "@/lib/mongo"
import { Org } from "@/models/org"
import { Form } from "@/models/form"
import { makeHttpError, requireAuth } from "@/lib/auth"
import { formCreateSchema } from "@/lib/validators"
import { parsePagination } from "@/lib/pagination"
import { v4 as uuidv4 } from "uuid"

export async function GET(req: NextRequest, { params }: { params: { orgId: string } }) {
  try {
    await connectMongo()
    const org = await Org.findById(params.orgId)
    if (!org) throw makeHttpError("NOT_FOUND", "Org not found", 404)

    const { searchParams } = new URL(req.url)
    const { limit, page, skip } = parsePagination(searchParams)

    const [items, total] = await Promise.all([
      Form.find({ orgId: org._id }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Form.countDocuments({ orgId: org._id }),
    ])

    return NextResponse.json({ ok: true, meta: { page, limit, total }, forms: items }, { status: 200 })
  } catch (e: any) {
    const status = e?.status || 500
    return NextResponse.json(
      e?.body || { ok: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } },
      { status },
    )
  }
}

export async function POST(req: NextRequest, { params }: { params: { orgId: string } }) {
  try {
    await connectMongo()
    const auth = await requireAuth(req)
    const org = await Org.findById(params.orgId)
    if (!org) throw makeHttpError("NOT_FOUND", "Org not found", 404)
    if (String(org.ownerUserId) !== auth.userId) {
      throw makeHttpError("FORBIDDEN", "Only owner can create forms", 403)
    }
    const body = await req.json()
    const parsed = formCreateSchema.safeParse(body)
    if (!parsed.success) {
      throw makeHttpError("VALIDATION_ERROR", "Invalid input", 400, parsed.error.flatten())
    }
    // Ensure field ids exist
    const fields = (parsed.data.fields || []).map((f) => ({ ...f, id: f.id || uuidv4() }))
    const doc = await Form.create({
      orgId: org._id,
      formId: parsed.data.formId,
      title: parsed.data.title,
      description: parsed.data.description,
      fields,
      settings: parsed.data.settings,
    })
    return NextResponse.json({ ok: true, form: doc }, { status: 201 })
  } catch (e: any) {
    const status = e?.status || 500
    return NextResponse.json(
      e?.body || { ok: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } },
      { status },
    )
  }
}
