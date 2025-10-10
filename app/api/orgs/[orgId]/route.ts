import { type NextRequest, NextResponse } from "next/server"
import { connectMongo } from "@/lib/mongo"
import { Org } from "@/models/org"
import { makeHttpError, requireAuth } from "@/lib/auth"
import { orgUpdateSchema } from "@/lib/validators"

export async function GET(_: NextRequest, { params }: { params: { orgId: string } }) {
  try {
    await connectMongo()
    const org = await Org.findById(params.orgId)
    if (!org) throw makeHttpError("NOT_FOUND", "Org not found", 404)
    return NextResponse.json({ ok: true, org }, { status: 200 })
  } catch (e: any) {
    const status = e?.status || 500
    return NextResponse.json(
      e?.body || { ok: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } },
      { status },
    )
  }
}

export async function PUT(req: NextRequest, { params }: { params: { orgId: string } }) {
  try {
    await connectMongo()
    const auth = await requireAuth(req)
    const org = await Org.findById(params.orgId)
    if (!org) throw makeHttpError("NOT_FOUND", "Org not found", 404)
    if (String(org.ownerUserId) !== auth.userId) {
      throw makeHttpError("FORBIDDEN", "Only owner can update org", 403)
    }
    const body = await req.json()
    const parsed = orgUpdateSchema.safeParse(body)
    if (!parsed.success) {
      throw makeHttpError("VALIDATION_ERROR", "Invalid input", 400, parsed.error.flatten())
    }
    Object.assign(org, parsed.data)
    await org.save()
    return NextResponse.json({ ok: true, org }, { status: 200 })
  } catch (e: any) {
    const status = e?.status || 500
    return NextResponse.json(
      e?.body || { ok: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } },
      { status },
    )
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { orgId: string } }) {
  try {
    await connectMongo()
    const auth = await requireAuth(req)
    const org = await Org.findById(params.orgId)
    if (!org) throw makeHttpError("NOT_FOUND", "Org not found", 404)
    if (String(org.ownerUserId) !== auth.userId) {
      throw makeHttpError("FORBIDDEN", "Only owner can delete org", 403)
    }
    await org.deleteOne()
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (e: any) {
    const status = e?.status || 500
    return NextResponse.json(
      e?.body || { ok: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } },
      { status },
    )
  }
}
