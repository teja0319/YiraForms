import { NextResponse } from "next/server"
import { connectMongo } from "@/lib/mongo"
import { Submission } from "@/models/submission"
import { Form } from "@/models/form"
import { Org } from "@/models/org"

export async function POST() {
  try {
    await connectMongo()
    console.log("[v0] Ensuring indexes...")
    await Promise.all([Submission.syncIndexes(), Form.syncIndexes(), Org.syncIndexes()])
    console.log("[v0] Indexes ensured.")
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (e: any) {
    console.error("[v0] Ensure indexes error:", e)
    return NextResponse.json({ ok: false, error: e?.message || "Unknown error" }, { status: 500 })
  }
}
