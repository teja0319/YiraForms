import { type NextRequest, NextResponse } from "next/server"
import { connectMongo } from "@/lib/mongo"
import { Org } from "@/models/org"
import { Form } from "@/models/form"
import { formUpdateSchema } from "@/lib/validators"
import { makeHttpError, requireAuth } from "@/lib/auth"

export async function GET(_: NextRequest, { params }: { params: { orgId: string; formId: string } }) {
  try {
    await connectMongo()
    // const org = await Org.findById(params.orgId)
    // if (!org) throw makeHttpError("NOT_FOUND", "Org not found", 404)
    const form = await Form.findOne({ formId: params.formId })
    if (!form) throw makeHttpError("NOT_FOUND", "Form not found", 404)
    return NextResponse.json({ ok: true, form }, { status: 200 })
  } catch (e: any) {
    const status = e?.status || 500
    return NextResponse.json(
      e?.body || { ok: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } },
      { status },
    )
  }
}

export async function PUT(req: NextRequest, { params }: { params: { orgId: string; formId: string } }) {
  try {
    await connectMongo()
    const auth = await requireAuth(req)
    const org = await Org.findById(params.orgId)
    if (!org) throw makeHttpError("NOT_FOUND", "Org not found", 404)
    if (String(org.ownerUserId) !== auth.userId) {
      throw makeHttpError("FORBIDDEN", "Only owner can update forms", 403)
    }
    const form = await Form.findOne({ orgId: org._id, formId: params.formId })
    if (!form) throw makeHttpError("NOT_FOUND", "Form not found", 404)

    const body = await req.json()
    const parsed = formUpdateSchema.safeParse(body)
    if (!parsed.success) {
      throw makeHttpError("VALIDATION_ERROR", "Invalid input", 400, parsed.error.flatten())
    }

    // Preserve existing field ids; if an incoming field has same name, keep id
    if (parsed.data.fields) {
      const byName = new Map(form.fields.map((f) => [f.name, f.id]))
      form.fields = parsed.data.fields.map((f) => ({
        ...f,
        id: f.id || byName.get(f.name) || f.id, // keep or use provided
      }))
    }
    if (parsed.data.title !== undefined) form.title = parsed.data.title
    if (parsed.data.description !== undefined) form.description = parsed.data.description
    if (parsed.data.settings !== undefined) form.settings = parsed.data.settings

    await form.save()
    return NextResponse.json({ ok: true, form }, { status: 200 })
  } catch (e: any) {
    const status = e?.status || 500
    return NextResponse.json(
      e?.body || { ok: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } },
      { status },
    )
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { orgId: string; formId: string } }) {
  try {
    await connectMongo()
    const auth = await requireAuth(req)
    const org = await Org.findById(params.orgId)
    if (!org) throw makeHttpError("NOT_FOUND", "Org not found", 404)
    if (String(org.ownerUserId) !== auth.userId) {
      throw makeHttpError("FORBIDDEN", "Only owner can delete forms", 403)
    }
    const form = await Form.findOne({ orgId: org._id, formId: params.formId })
    if (!form) throw makeHttpError("NOT_FOUND", "Form not found", 404)
    await form.deleteOne()
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (e: any) {
    const status = e?.status || 500
    return NextResponse.json(
      e?.body || { ok: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } },
      { status },
    )
  }
}
