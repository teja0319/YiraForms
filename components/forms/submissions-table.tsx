"use client"

import useSWR from "swr"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiFetch } from "@/lib/client-fetch"

const fetcher = (url: string) => apiFetch(url).then((r) => r.json())

export default function SubmissionsTable({ orgId, formId }: { orgId: string; formId: string }) {
  const [primaryKey, setPrimaryKey] = useState("")
  const [secondaryKey, setSecondaryKey] = useState("")
  const query = new URLSearchParams()
  if (primaryKey) query.set("primaryKey", primaryKey)
  if (secondaryKey) query.set("secondaryKey", secondaryKey)

  const { data, isLoading, mutate } = useSWR(
    `/api/orgs/${orgId}/forms/${formId}/submissions${query.toString() ? `?${query.toString()}` : ""}`,
    fetcher,
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submissions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid md:grid-cols-3 gap-3">
          <label className="grid gap-1">
            <span>Primary Key</span>
            <Input
              value={primaryKey}
              onChange={(e) => setPrimaryKey(e.target.value)}
              placeholder="e.g. email@example.com"
            />
          </label>
          <label className="grid gap-1">
            <span>Secondary Key</span>
            <Input value={secondaryKey} onChange={(e) => setSecondaryKey(e.target.value)} placeholder="Optional" />
          </label>
          <div className="flex items-end">
            <Button onClick={() => mutate()}>Filter</Button>
          </div>
        </div>

        {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
        {Array.isArray(data?.items) && data.items.length === 0 && (
          <p className="text-sm text-muted-foreground">No submissions yet.</p>
        )}

        {Array.isArray(data?.items) && data.items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left">
                <tr>
                  <th className="p-2">ID</th>
                  <th className="p-2">Created</th>
                  <th className="p-2">Values</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((s: any) => (
                  <tr key={s._id} className="border-t">
                    <td className="p-2">{s._id}</td>
                    <td className="p-2">{s.createdAt ? new Date(s.createdAt).toLocaleString() : "-"}</td>
                    <td className="p-2">
                      <pre className="whitespace-pre-wrap">{JSON.stringify(s.values || s.data || {}, null, 2)}</pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
