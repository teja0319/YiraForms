"use client"

import { useParams } from "next/navigation"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import FormRenderer from "@/components/forms/form-renderer"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function PublicFormPage() {
  const params = useParams<{ formId: string }>()
  const { data, isLoading } = useSWR(`/api/orgs/_/forms/${params.formId}`, fetcher, { shouldRetryOnError: false })

  // Note: adjust the fetch URL above if your "get form by id" endpoint differs. If it's /api/orgs/{orgId}/forms/{formId}, create a public fetch route or include org id in URL.

  return (
    <main className="container mx-auto p-6 grid gap-6">
      {isLoading && <p className="text-sm text-muted-foreground">Loading form...</p>}
      {data && (
        <Card>
          <CardHeader>
            <CardTitle>{data.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <FormRenderer form={data} />
          </CardContent>
        </Card>
      )}
      {!isLoading && !data && <p className="text-sm text-muted-foreground">Form not found.</p>}
    </main>
  )
}
