"use client"

import { useState } from "react"

export default function Home() {
  const [token, setToken] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [orgId, setOrgId] = useState("")
  const [orgSlug, setOrgSlug] = useState("")

  const [formId, setFormId] = useState("feedback-2025")
  const [submissionPrimary, setSubmissionPrimary] = useState("user-123")
  const [submissionSecondary, setSubmissionSecondary] = useState("session-456")

  async function register() {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (data.token) setToken(data.token)
    alert(JSON.stringify(data, null, 2))
  }

  async function login() {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (data.token) setToken(data.token)
    alert(JSON.stringify(data, null, 2))
  }

  async function createOrg() {
    const res = await fetch("/api/orgs", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: "My Org", slug: orgSlug || "my-org", contactEmail: email }),
    })
    const data = await res.json()
    if (data?.org?._id) setOrgId(data.org._id)
    alert(JSON.stringify(data, null, 2))
  }

  async function createForm() {
    if (!orgId) return alert("Create org first")
    const res = await fetch(`/api/orgs/${orgId}/forms`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        formId,
        title: "Customer Feedback",
        description: "Feedback form",
        fields: [
          { id: "f1", label: "Name", name: "name", type: "text", required: true, order: 1 },
          {
            id: "f2",
            label: "Rating",
            name: "rating",
            type: "number",
            required: true,
            validations: { min: 1, max: 5 },
            order: 2,
          },
        ],
        settings: { acceptAnonymousSubmissions: true, allowSecondaryKey: true },
      }),
    })
    const data = await res.json()
    alert(JSON.stringify(data, null, 2))
  }

  async function submitToForm() {
    const res = await fetch(`/api/forms/${formId}/submissions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        primaryKey: submissionPrimary,
        secondaryKey: submissionSecondary,
        data: { name: "Jane", rating: 5 },
      }),
    })
    const data = await res.json()
    alert(JSON.stringify(data, null, 2))
  }

  async function retrieveSubmissions() {
    if (!orgId) return alert("Create org first")
    const res = await fetch(
      `/api/orgs/${orgId}/forms/${formId}/submissions?primaryKey=${encodeURIComponent(submissionPrimary)}`,
      {
        headers: { authorization: `Bearer ${token}` },
      },
    )
    const data = await res.json()
    alert(JSON.stringify(data, null, 2))
  }

  async function runEnsureIndexes() {
    try {
      const res = await fetch("/api/admin/ensure-indexes", { method: "POST" })
      const data = await res.json()
      if (!res.ok) {
        alert(`Failed: ${JSON.stringify(data, null, 2)}`)
        return
      }
      alert("Indexes ensured successfully!")
    } catch (error) {
      console.error("[v0] Error ensuring indexes:", error)
      alert("Failed to ensure indexes. Check the console for details.")
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4 text-balance">Dynamic Forms API Demo</h1>

      <section className="mb-6 border rounded-lg p-4">
        <h2 className="text-lg font-medium mb-2">Database</h2>
        <button className="px-3 py-2 rounded bg-primary text-primary-foreground" onClick={runEnsureIndexes}>
          Ensure Indexes
        </button>
      </section>

      <section className="mb-6 border rounded-lg p-4">
        <h2 className="text-lg font-medium mb-2">Auth</h2>
        <div className="grid grid-cols-1 gap-3">
          <input
            className="border rounded p-2 bg-background text-foreground"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="border rounded p-2 bg-background text-foreground"
            placeholder="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex gap-2">
            <button className="px-3 py-2 rounded bg-primary text-primary-foreground" onClick={register}>
              Register
            </button>
            <button className="px-3 py-2 rounded bg-primary text-primary-foreground" onClick={login}>
              Login
            </button>
          </div>
          <p className="text-xs break-all">Token: {token}</p>
        </div>
      </section>

      <section className="mb-6 border rounded-lg p-4">
        <h2 className="text-lg font-medium mb-2">Org</h2>
        <div className="grid grid-cols-1 gap-3">
          <input
            className="border rounded p-2 bg-background text-foreground"
            placeholder="org slug e.g. my-org"
            value={orgSlug}
            onChange={(e) => setOrgSlug(e.target.value)}
          />
          <button className="px-3 py-2 rounded bg-primary text-primary-foreground" onClick={createOrg}>
            Create Org
          </button>
          <p className="text-xs">Org ID: {orgId}</p>
        </div>
      </section>

      <section className="mb-6 border rounded-lg p-4">
        <h2 className="text-lg font-medium mb-2">Form</h2>
        <div className="grid grid-cols-1 gap-3">
          <input
            className="border rounded p-2 bg-background text-foreground"
            placeholder="formId"
            value={formId}
            onChange={(e) => setFormId(e.target.value)}
          />
          <div className="flex gap-2">
            <button className="px-3 py-2 rounded bg-primary text-primary-foreground" onClick={createForm}>
              Create Form
            </button>
            <button className="px-3 py-2 rounded bg-primary text-primary-foreground" onClick={submitToForm}>
              Submit to Form
            </button>
            <button className="px-3 py-2 rounded bg-primary text-primary-foreground" onClick={retrieveSubmissions}>
              Retrieve Submissions
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}
