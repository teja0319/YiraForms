"use client"

import useSWR from "swr"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { apiFetch } from "@/lib/client-fetch"
import { useState } from "react"

export const dynamic = "force-dynamic"

const fetcher = (url: string) => apiFetch(url).then((r) => r.json())

export default function OrgsPage() {
  const router = useRouter()
  const { isAuthenticated, logout } = useAuth()
  const { data, isLoading, mutate } = useSWR(isAuthenticated ? "/api/orgs" : null, fetcher)
  const [name, setName] = useState("")

  if (!isAuthenticated) {
    router.replace("/login")
    return null
  }

  const createOrg = async () => {
    const res = await apiFetch("/api/orgs", { method: "POST", body: JSON.stringify({ name }) })
    if (res.ok) {
      setName("")
      mutate()
    }
  }

  return (
    <main className="container mx-auto p-6 grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Organizations</h1>
        <Button variant="outline" onClick={logout}>
          Logout
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create organization</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-[1fr_auto] gap-3">
          <Input placeholder="Org name" value={name} onChange={(e) => setName(e.target.value)} />
          <Button onClick={createOrg} disabled={!name}>
            Create
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your organizations</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
          {Array.isArray(data) && data.length === 0 && <p className="text-sm text-muted-foreground">No orgs yet.</p>}
          <ul className="grid gap-2">
            {Array.isArray(data) &&
              data.map((org: any) => (
                <li key={org._id} className="flex items-center justify-between border rounded-md p-3">
                  <div>
                    <div className="font-medium">{org.name}</div>
                    <div className="text-xs text-muted-foreground">{org._id}</div>
                  </div>
                  <div className="flex gap-2">
                    <Link className="underline" href={`/orgs/${org._id}/forms`}>
                      Forms
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
