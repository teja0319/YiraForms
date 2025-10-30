import { type NextRequest, NextResponse } from "next/server"
import { connectMongo } from "@/lib/mongo"
import { Org } from "@/models/org"
import { orgCreateSchema } from "@/lib/validators"
import { makeHttpError, requireApiKey } from "@/lib/auth"
import { parsePagination } from "@/lib/pagination"

export async function GET(req: NextRequest) {
  try {
    await connectMongo()
    const { searchParams } = new URL(req.url)
    const { limit, page, skip } = parsePagination(searchParams)

    const query = {}
    const [items, total] = await Promise.all([
      Org.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Org.countDocuments(query),
    ])
    return NextResponse.json({ ok: true, meta: { page, limit, total }, orgs: items }, { status: 200 })
  } catch (e: any) {
    const status = e?.status || 500
    return NextResponse.json(
      e?.body || { ok: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } },
      { status },
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectMongo()
    const auth = await requireApiKey(req)
    const body = await req.json()
    const parsed = orgCreateSchema.safeParse(body)
    if (!parsed.success) {
      throw makeHttpError("VALIDATION_ERROR", "Invalid input", 400, parsed.error.flatten())
    }
    const { name, slug, contactEmail } = parsed.data

    const exists = await Org.findOne({ slug })
    if (exists) throw makeHttpError("VALIDATION_ERROR", "Slug already exists", 400)

    const org = await Org.create({
      name,
      slug,
      contactEmail,
      ownerUserId: auth.userId,
    })
    return NextResponse.json({ ok: true, org }, { status: 201 })
  } catch (e: any) {
    const status = e?.status || 500
    return NextResponse.json(
      e?.body || { ok: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } },
      { status },
    )
  }
}
