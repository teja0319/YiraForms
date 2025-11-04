"use client"

import useSWR from "swr"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiFetch } from "@/lib/client-fetch"
import { useAuth } from "@/hooks/use-auth"

const fetcher = (url: string) => apiFetch(url).then((r) => r.json())

export default function OrgFormsPage() {
  const params = useParams<{ orgId: string }>()
  const { isAuthenticated } = useAuth()
  const { data, isLoading } = useSWR(isAuthenticated ? `/api/orgs/${params.orgId}/forms` : null, fetcher)

  if (!isAuthenticated) return null

  return (
    <main className="container mx-auto p-6 grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Forms</h1>
        <Link href={`/orgs/${params.orgId}/forms/new`}>
          <Button>Create form</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All forms</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
          {Array.isArray(data) && data.length === 0 && <p className="text-sm text-muted-foreground">No forms yet.</p>}
          <ul className="grid gap-2">
            {Array.isArray(data) &&
              data.map((f: any) => (
                <li key={f._id} className="flex items-center justify-between border rounded-md p-3">
                  <div>
                    <div className="font-medium">{f.title}</div>
                    <div className="text-xs text-muted-foreground">{f._id}</div>
                  </div>
                  <div className="flex gap-3">
                    <Link className="underline" href={`/forms/${f._id}`}>
                      Public link
                    </Link>
                    <Link className="underline" href={`/orgs/${params.orgId}/forms/${f._id}/submissions`}>
                      Submissions
                    </Link>
                  </div>
                </li>
              ))}
          </ul>
        </CardContent>
      </Card>
    </main>
  )
}
