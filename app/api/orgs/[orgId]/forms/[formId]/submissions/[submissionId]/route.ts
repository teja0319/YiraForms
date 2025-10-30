import { type NextRequest, NextResponse } from "next/server"
import { connectMongo } from "@/lib/mongo"
import { Org } from "@/models/org"
import { Form } from "@/models/form"
import { Submission } from "@/models/submission"
import { makeHttpError, requireApiKey } from "@/lib/auth"

export async function GET(
  req: NextRequest,
  { params }: { params: { orgId: string; formId: string; submissionId: string } },
) {
  try {
    await connectMongo()
    const auth = await requireApiKey(req)
    const org = await Org.findById(params.orgId)
    if (!org) throw makeHttpError("NOT_FOUND", "Org not found", 404)
    if (String(org.ownerUserId) !== auth.userId) {
      throw makeHttpError("FORBIDDEN", "Only owner can retrieve submissions", 403)
    }
    const form = await Form.findOne({ orgId: org._id, formId: params.formId })
    if (!form) throw makeHttpError("NOT_FOUND", "Form not found", 404)

    const item = await Submission.findOne({ _id: params.submissionId, formId: form.formId })
    if (!item) throw makeHttpError("NOT_FOUND", "Submission not found", 404)
    return NextResponse.json({ ok: true, submission: item }, { status: 200 })
  } catch (e: any) {
    const status = e?.status || 500
    return NextResponse.json(
      e?.body || { ok: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } },
      { status },
    )
  }
}
