import { type NextRequest, NextResponse } from "next/server"
import { connectMongo } from "@/lib/mongo"
import { User } from "@/models/user"
import { loginSchema } from "@/lib/validators"
import { compare } from "bcryptjs"
import { signAuthToken, makeHttpError } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    await connectMongo()
    const body = await req.json()
    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) {
      throw makeHttpError("VALIDATION_ERROR", "Invalid input", 400, parsed.error.flatten())
    }
    const { email, password } = parsed.data

    const user = await User.findOne({ email })
    if (!user) throw makeHttpError("UNAUTHORIZED", "Invalid credentials", 401)

    const ok = await compare(password, user.passwordHash)
    if (!ok) throw makeHttpError("UNAUTHORIZED", "Invalid credentials", 401)

    const token = await signAuthToken({ userId: String(user._id), email: user.email })
    return NextResponse.json({ ok: true, token }, { status: 200 })
  } catch (e: any) {
    const status = e?.status || 500
    return NextResponse.json(
      e?.body || { ok: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } },
      { status },
    )
  }
}
