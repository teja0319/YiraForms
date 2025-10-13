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
  name: string
  type: "text" | "textarea" | "number" | "date" | "select" | "checkbox" | "radio" | "file"
  required?: boolean
  options?: string[] // for select/radio, we'll map to { value, label } on save
}

export default function FormBuilder({ orgId, onCreated }: { orgId: string; onCreated?: (form: any) => void }) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [fields, setFields] = useState<Field[]>([])
  const [formId, setFormId] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function slugify(input: string) {
    return input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")
  }

  const addField = () => {
    const nextIndex = fields.length + 1
    const defaultLabel = `Field ${nextIndex}`
    const newField: Field = {
      id: crypto.randomUUID(),
      label: defaultLabel,
      name: slugify(defaultLabel),
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
      const payload = {
        formId: formId, // required by backend
        title,
        description,
        fields: fields.map((f, index) => ({
          id: f.id,
          label: f.label,
          name: f.name, // required by backend
          type: f.type,
          required: !!f.required,
          options: (f.options || []).map((opt) => ({ value: slugify(opt), label: opt })),
          order: index,
        })),
        // optional settings with backend defaults preserved
        settings: {
          acceptAnonymousSubmissions: false,
          allowSecondaryKey: true,
        },
      }
      const res = await apiFetch(`/api/orgs/${orgId}/forms`, {
        method: "POST",
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const errTxt = await res.text().catch(() => "")
        throw new Error(errTxt || "Failed to create form")
      }
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
            <span>Form ID</span>
            <Input value={formId} onChange={(e) => setFormId(slugify(e.target.value))} placeholder="happiness-index" />
          </label>
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
              <div className="grid md:grid-cols-4 gap-3">
                <label className="grid gap-1">
                  <span>Label</span>
                  <Input
                    value={f.label}
                    onChange={(e) => {
                      const label = e.target.value
                      // if name was previously auto-generated and matches old slug, keep it synced
                      const prevSlug = slugify(f.label)
                      const isAuto = f.name === prevSlug || f.name === ""
                      updateField(idx, { label, name: isAuto ? slugify(label) : f.name })
                    }}
                  />
                </label>
                <label className="grid gap-1">
                  <span>Name</span>
                  <Input
                    value={f.name}
                    onChange={(e) => updateField(idx, { name: slugify(e.target.value) })}
                    placeholder="key-used-in-submissions"
                  />
                </label>
                <label className="grid gap-1">
                  <span>Type</span>
                  <select
                    className="h-9 rounded-md border bg-background px-2"
                    value={f.type}
                    onChange={(e) => updateField(idx, { type: e.target.value as Field["type"] })}
                  >
                    <option value="text">Text</option>
                    <option value="textarea">Textarea</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="select">Select</option>
                    <option value="checkbox">Checkbox</option>
                    <option value="radio">Radio</option>
                    <option value="file">File</option>
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

              {(f.type === "select" || f.type === "radio") && (
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
        <CardContent className="grid gap-2">
          <p className="text-sm text-muted-foreground">
            Primary/Secondary keys are provided by your third-party system when submitting data (as primaryKey and
            secondaryKey in the submission request). They are not stored in the form definition.
          </p>
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
