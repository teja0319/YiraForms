import { connectMongo } from "@/lib/mongo"
import { Submission } from "@/models/submission"
import { Form } from "@/models/form"
import { Org } from "@/models/org"

export async function main() {
  await connectMongo()
  console.log("[v0] Ensuring indexes...")
  await Promise.all([Submission.syncIndexes(), Form.syncIndexes(), Org.syncIndexes()])
  console.log("[v0] Indexes ensured.")
}

main()
  .then(() => {
    console.log("[v0] Done")
  })
  .catch((e) => {
    console.error("[v0] Error", e)
  })
