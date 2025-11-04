"use client"

import { useParams } from "next/navigation"
import SubmissionsTable from "@/components/forms/submissions-table"
import useSWR from "swr"
import { apiFetch } from "@/lib/client-fetch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const fetcher = (url: string) => apiFetch(url).then((r) => r.json())

export default function SubmissionsPage() {
  const params = useParams<{ orgId: string; formId: string }>()
  const { data } = useSWR(`/api/orgs/${params.orgId}/forms/${params.formId}`, fetcher)

  return (
    <main className="container mx-auto p-6 grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{data?.title || "Form"}</CardTitle>
        </CardHeader>
        <CardContent>
          <SubmissionsTable orgId={params.orgId} formId={params.formId} />
        </CardContent>
      </Card>
    </main>
  )
}
