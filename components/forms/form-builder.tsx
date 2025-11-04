"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { apiFetch } from "@/lib/client-fetch"

type Field = {
  id: string
  label: string
  type: "text" | "email" | "number" | "select"
  required?: boolean
  options?: string[] // for select
}

export default function FormBuilder({ orgId, onCreated }: { orgId: string; onCreated?: (form: any) => void }) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [fields, setFields] = useState<Field[]>([])
  const [primaryKeyFieldId, setPrimaryKeyFieldId] = useState<string>("")
  const [secondaryKeyFieldId, setSecondaryKeyFieldId] = useState<string>("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addField = () => {
    const newField: Field = {
      id: crypto.randomUUID(),
      label: `Field ${fields.length + 1}`,
      type: "text",
      required: false,
      options: [],
    }
    setFields((f) => [...f, newField])
  }

  const updateField = (idx: number, patch: Partial<Field>) => {
    setFields((f) => f.map((x, i) => (i === idx ? { ...x, ...patch } : x)))
  }

  const removeField = (idx: number) => {
    setFields((f) => f.filter((_, i) => i !== idx))
  }

  const onSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const body = {
        title,
        description,
        fields,
        primaryKeyFieldId: primaryKeyFieldId || null,
        secondaryKeyFieldId: secondaryKeyFieldId || null,
      }
      const res = await apiFetch(`/api/orgs/${orgId}/forms`, {
        method: "POST",
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error("Failed to create form")
      const data = await res.json()
      onCreated?.(data)
    } catch (e: any) {
      setError(e?.message || "Failed")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Form details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <label className="grid gap-2">
            <span>Title</span>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Customer Feedback" />
          </label>
          <label className="grid gap-2">
            <span>Description</span>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Collect feedback from customers"
            />
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Fields</CardTitle>
          <Button variant="secondary" onClick={addField}>
            Add field
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4">
          {fields.length === 0 && (
            <p className="text-sm text-muted-foreground">No fields yet. Add one to get started.</p>
          )}
          {fields.map((f, idx) => (
            <div key={f.id} className="grid gap-2 border rounded-md p-3">
              <div className="grid md:grid-cols-3 gap-3">
                <label className="grid gap-1">
                  <span>Label</span>
                  <Input value={f.label} onChange={(e) => updateField(idx, { label: e.target.value })} />
                </label>
                <label className="grid gap-1">
                  <span>Type</span>
                  <select
                    className="h-9 rounded-md border bg-background px-2"
                    value={f.type}
                    onChange={(e) => updateField(idx, { type: e.target.value as Field["type"] })}
                  >
                    <option value="text">Text</option>
                    <option value="email">Email</option>
                    <option value="number">Number</option>
                    <option value="select">Select</option>
                  </select>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!f.required}
                    onChange={(e) => updateField(idx, { required: e.target.checked })}
                  />
                  <span>Required</span>
                </label>
              </div>

              {f.type === "select" && (
                <div className="grid gap-2">
                  <span className="text-sm text-muted-foreground">Options (comma separated)</span>
                  <Input
                    value={(f.options || []).join(", ")}
                    onChange={(e) =>
                      updateField(idx, {
                        options: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="Option A, Option B, Option C"
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <Button variant="destructive" onClick={() => removeField(idx)}>
                  Remove
                </Button>
                <span className="text-xs text-muted-foreground">ID: {f.id}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Keys</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <label className="grid gap-2">
            <span>Primary Key Field</span>
            <select
              className="h-9 rounded-md border bg-background px-2"
              value={primaryKeyFieldId}
              onChange={(e) => setPrimaryKeyFieldId(e.target.value)}
            >
              <option value="">None</option>
              {fields.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2">
            <span>Secondary Key Field (optional)</span>
            <select
              className="h-9 rounded-md border bg-background px-2"
              value={secondaryKeyFieldId}
              onChange={(e) => setSecondaryKeyFieldId(e.target.value)}
            >
              <option value="">None</option>
              {fields.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-3">
        <Button onClick={onSave} disabled={saving}>
          {saving ? "Saving..." : "Create form"}
        </Button>
      </div>
    </div>
  )
}
