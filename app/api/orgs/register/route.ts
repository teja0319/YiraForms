import { type NextRequest, NextResponse } from "next/server"
import { connectMongo } from "@/lib/mongo"
import { orgAccountCreateSchema } from "@/lib/validators"
import { Org } from "@/models/org"
import { User } from "@/models/user"
import { hash } from "bcryptjs"
import { signAuthToken, makeHttpError } from "@/lib/auth"

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export async function POST(req: NextRequest) {
  try {
    await connectMongo()
    const body = await req.json()
    const parsed = orgAccountCreateSchema.safeParse(body)
    if (!parsed.success) {
      throw makeHttpError("VALIDATION_ERROR", "Invalid input", 400, parsed.error.flatten())
    }
    const { name, email, password, address } = parsed.data

    // check for existing user by email
    const existingUser = await User.findOne({ email })
    if (existingUser) throw makeHttpError("VALIDATION_ERROR", "Email already registered", 400)

    // generate unique slug from name
    const base = slugify(name)
    let candidate = base || "org"
    let i = 0
    // ensure uniqueness
    // eslint-disable-next-line no-constant-condition
    while (true) {
      // avoid infinite loop by adding random suffix after some attempts
      const found = await Org.findOne({ slug: candidate })
      if (!found) break
      i += 1
      candidate = `${base}-${i}`
      if (i > 5) {
        candidate = `${base}-${Math.random().toString(36).slice(2, 6)}`
        // try one more time
        const again = await Org.findOne({ slug: candidate })
        if (!again) break
      }
    }

    // create user first
    const passwordHash = await hash(password, 10)
    const user = await User.create({ email, passwordHash })

    try {
      // create org and link owner
      const org = await Org.create({
        name,
        slug: candidate,
        contactEmail: email,
        address,
        ownerUserId: user._id,
      })

      // link user.orgId
      user.orgId = org._id
      await user.save()

      // sign token
      const token = await signAuthToken({
        userId: String(user._id),
        email: user.email,
        orgId: String(org._id),
      })

      return NextResponse.json(
        {
          ok: true,
          token,
          org: {
            _id: String(org._id),
            name: org.name,
            slug: org.slug,
            contactEmail: org.contactEmail,
            address: org.address,
          },
          user: { _id: String(user._id), email: user.email, orgId: String(org._id) },
        },
        { status: 201 },
      )
    } catch (orgErr: any) {
      // rollback user if org creation failed
      await User.deleteOne({ _id: user._id })
      throw orgErr
    }
  } catch (e: any) {
    const status = e?.status || 500
    return NextResponse.json(
      e?.body || { ok: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } },
      { status },
    )
  }
}
