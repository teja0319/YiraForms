"use client"

import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import FormBuilder from "@/components/forms/form-builder"

export default function NewFormPage() {
  const params = useParams<{ orgId: string }>()
  const router = useRouter()

  return (
    <main className="container mx-auto p-6 grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Create a new form</CardTitle>
        </CardHeader>
        <CardContent>
          <FormBuilder
            orgId={params.orgId}
            onCreated={(form) => router.replace(`/orgs/${params.orgId}/forms/${form._id}/submissions`)}
          />
        </CardContent>
      </Card>
    </main>
  )
}
