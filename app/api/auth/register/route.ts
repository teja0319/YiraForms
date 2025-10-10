import { type NextRequest, NextResponse } from "next/server"
import { connectMongo } from "@/lib/mongo"
import { User } from "@/models/user"
import { registerSchema } from "@/lib/validators"
import { hash } from "bcryptjs"
import { signAuthToken, makeHttpError } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    await connectMongo()
    const body = await req.json()
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      throw makeHttpError("VALIDATION_ERROR", "Invalid input", 400, parsed.error.flatten())
    }
    const { email, password } = parsed.data

    const existing = await User.findOne({ email })
    if (existing) throw makeHttpError("VALIDATION_ERROR", "Email already registered", 400)

    const passwordHash = await hash(password, 10)
    const user = await User.create({ email, passwordHash })

    const token = await signAuthToken({ userId: String(user._id), email: user.email })
    return NextResponse.json({ ok: true, token }, { status: 201 })
  } catch (e: any) {
    const status = e?.status || 500
    return NextResponse.json(
      e?.body || { ok: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } },
      { status },
    )
  }
}
