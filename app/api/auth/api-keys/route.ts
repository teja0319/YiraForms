import { type NextRequest, NextResponse } from "next/server"
import { connectMongo } from "@/lib/mongo"
import { ApiKey } from "@/models/api-key"
import { requireAuth, makeHttpError } from "@/lib/auth"
import { generateApiKey, hashApiKey } from "@/lib/api-key"

export async function GET(req: NextRequest) {
  try {
    await connectMongo()
    const auth = await requireAuth(req)

    const apiKeys = await ApiKey.find({ userId: auth.userId }).select("-key")
    return NextResponse.json({ ok: true, apiKeys })
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
    const auth = await requireAuth(req)
    const body = await req.json()
    const { name } = body

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      throw makeHttpError("VALIDATION_ERROR", "API key name is required", 400)
    }

    const apiKeyPlaintext = generateApiKey()
    const apiKeyHash = hashApiKey(apiKeyPlaintext)

    const apiKey = await ApiKey.create({
      userId: auth.userId,
      key: apiKeyHash,
      name: name.trim(),
    })

    return NextResponse.json({ ok: true, apiKey: apiKeyPlaintext, id: apiKey._id }, { status: 201 })
  } catch (e: any) {
    const status = e?.status || 500
    return NextResponse.json(
      e?.body || { ok: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } },
      { status },
    )
  }
}
