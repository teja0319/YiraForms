import { type NextRequest, NextResponse } from "next/server"
import { connectMongo } from "@/lib/mongo"
import { ApiKey } from "@/models/api-key"
import { requireAuth, makeHttpError } from "@/lib/auth"
import { Types } from "mongoose"

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ keyId: string }> }) {
  try {
    await connectMongo()
    const auth = await requireAuth(req)
    const { keyId } = await params

    if (!Types.ObjectId.isValid(keyId)) {
      throw makeHttpError("VALIDATION_ERROR", "Invalid key ID", 400)
    }

    const apiKey = await ApiKey.findOne({ _id: keyId, userId: auth.userId })
    if (!apiKey) {
      throw makeHttpError("NOT_FOUND", "API key not found", 404)
    }

    await ApiKey.deleteOne({ _id: keyId })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    const status = e?.status || 500
    return NextResponse.json(
      e?.body || { ok: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } },
      { status },
    )
  }
}
