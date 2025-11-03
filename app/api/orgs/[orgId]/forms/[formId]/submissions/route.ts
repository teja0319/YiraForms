import { type NextRequest, NextResponse } from "next/server"
import { connectMongo } from "@/lib/mongo"
import { Org } from "@/models/org"
import { Form } from "@/models/form"
import { Submission } from "@/models/submission"
import { makeHttpError, requireApiKey } from "@/lib/auth"
import { parsePagination } from "@/lib/pagination"

// export async function GET(req: NextRequest, { params }: { params: Promise<{ orgId: string; formId: string }> }) {
//   try {
//     await connectMongo()
//     const auth = await requireApiKey(req)
//     const { orgId, formId } = await params
//     const org = await Org.findById(orgId)
//     if (!org) throw makeHttpError("NOT_FOUND", "Org not found", 404)
//     if (String(org.ownerUserId) !== auth.userId) {
//       throw makeHttpError("FORBIDDEN", "Only owner can retrieve submissions", 403)
//     }
//     const form = await Form.findOne({ orgId: org._id, formId })
//     if (!form) throw makeHttpError("NOT_FOUND", "Form not found", 404)

//     const { searchParams } = new URL(req.url)
//     const primaryKey = searchParams.get("primaryKey")
//     const secondaryKey = searchParams.get("secondaryKey")
//     const fromDate = searchParams.get("fromDate")
//     const toDate = searchParams.get("toDate")

//     if (!primaryKey) throw makeHttpError("VALIDATION_ERROR", "primaryKey is required", 400)

//     const q: any = { formId: form.formId, primaryKey }
//     if (secondaryKey !== null && secondaryKey !== undefined && secondaryKey !== "") {
//       q.secondaryKey = secondaryKey
//       const item = await Submission.findOne(q)
//       if (!item) throw makeHttpError("NOT_FOUND", "Submission not found", 404)
//       return NextResponse.json({ ok: true, submission: item }, { status: 200 })
//     } else {
//       if (fromDate) q.createdAt = { ...(q.createdAt || {}), $gte: new Date(fromDate) }
//       if (toDate) q.createdAt = { ...(q.createdAt || {}), $lte: new Date(toDate) }
//       const { limit, page, skip } = parsePagination(searchParams)
//       const [items, total] = await Promise.all([
//         Submission.find(q).sort({ createdAt: -1 }).skip(skip).limit(limit),
//         Submission.countDocuments(q),
//       ])
//       return NextResponse.json({ ok: true, meta: { page, limit, total }, submissions: items }, { status: 200 })
//     }
//   } catch (e: any) {
//     const status = e?.status || 500
//     return NextResponse.json(
//       e?.body || { ok: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } },
//       { status },
//     )
//   }
// }


export async function GET(req: NextRequest, { params }: { params: Promise<{ orgId: string; formId: string }> }) {
  try {
    await connectMongo();
    const auth = await requireApiKey(req);
    const { orgId, formId } = await params;

    const org = await Org.findById(orgId);
    if (!org) throw makeHttpError("NOT_FOUND", "Org not found", 404);

    if (String(org.ownerUserId) !== auth.userId) {
      throw makeHttpError("FORBIDDEN", "Only the owner can retrieve submissions", 403);
    }

    const form = await Form.findOne({ orgId: org._id, formId });
    if (!form) throw makeHttpError("NOT_FOUND", "Form not found", 404);

    const { searchParams } = new URL(req.url);
    const primaryKey = searchParams.get("primaryKey");
    const secondaryKey = searchParams.get("secondaryKey");
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");

    // ✅ Build dynamic query object
    const q: any = { formId: form.formId };

    if (primaryKey) q.primaryKey = primaryKey;
    if (secondaryKey) q.secondaryKey = secondaryKey;
    if (fromDate) q.createdAt = { ...(q.createdAt || {}), $gte: new Date(fromDate) };
    if (toDate) q.createdAt = { ...(q.createdAt || {}), $lte: new Date(toDate) };

    // ✅ Single record lookup (when both keys exist)
    if (primaryKey && secondaryKey) {
      const item = await Submission.findOne(q);
      if (!item) throw makeHttpError("NOT_FOUND", "Submission not found", 404);
      return NextResponse.json({ ok: true, submission: item }, { status: 200 });
    }

    // ✅ Otherwise, list results
    const { limit, page, skip } = parsePagination(searchParams);
    const [items, total] = await Promise.all([
      Submission.find(q).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Submission.countDocuments(q),
    ]);

    return NextResponse.json(
      { ok: true, meta: { page, limit, total }, submissions: items },
      { status: 200 },
    );
  } catch (e: any) {
    const status = e?.status || 500;
    return NextResponse.json(
      e?.body || { ok: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } },
      { status },
    );
  }
}
