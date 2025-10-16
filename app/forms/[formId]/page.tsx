"use client"

import { useParams } from "next/navigation"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import FormRenderer from "@/components/forms/form-renderer"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function PublicFormPage() {
  const params = useParams<{ formId: string }>()
  const { data, isLoading, error } = useSWR(`/api/orgs/_/forms/${params.formId}`, fetcher, { shouldRetryOnError: false })

  if (error) return <p className="text-sm text-muted-foreground">Failed to load form.</p>

  return (
    <main className="container mx-auto p-6 grid gap-6">
      {isLoading && <p className="text-sm text-muted-foreground">Loading form...</p>}
      {data && data.ok && data.form && (
        <Card>
          <CardHeader>
            <CardTitle>{data.form.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <FormRenderer form={data.form} />
          </CardContent>
        </Card>
      )}
      {data && !data.ok && <p className="text-sm text-muted-foreground">Invalid form response.</p>}
      {!isLoading && !data && <p className="text-sm text-muted-foreground">Form not found.</p>}
    </main>
  )
}
