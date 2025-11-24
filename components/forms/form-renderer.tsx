"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Field = {
  id: string
  label: string
  type: "text" | "email" | "number" | "select"
  required?: boolean
  options?: string[]
}

export default function FormRenderer({
  form,
  onSubmitted,
}: {
  form: { _id: string; title: string; description?: string; fields: Field[] }
  onSubmitted?: (res: any) => void
}) {
  const [values, setValues] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const formId = form._id

  const onChangeField = (id: string, val: any) => setValues((v) => ({ ...v, [id]: val }))

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(`/api/forms/${formId}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values }),
      })
      if (!res.ok) throw new Error("Failed to submit")
      const data = await res.json()
      onSubmitted?.(data)
      setValues({})
    } catch (e: any) {
      setError(e?.message || "Submission failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      {form.description && <p className="text-muted-foreground">{form.description}</p>}

      {form.fields.map((f) => (
        <label key={f.id} className="grid gap-2">
          <span>
            {f.label}
            {f.required ? " *" : ""}
          </span>

          {f.type === "text" && (
            <Input
              value={values[f.id] ?? ""}
              onChange={(e) => onChangeField(f.id, e.target.value)}
              required={!!f.required}
            />
          )}
          {f.type === "email" && (
            <Input
              type="email"
              value={values[f.id] ?? ""}
              onChange={(e) => onChangeField(f.id, e.target.value)}
              required={!!f.required}
            />
          )}
          {f.type === "number" && (
            <Input
              type="number"
              value={values[f.id] ?? ""}
              onChange={(e) => onChangeField(f.id, e.target.value)}
              required={!!f.required}
            />
          )}
          {f.type === "select" && (
            <select
              className="h-9 rounded-md border bg-background px-2"
              value={values[f.id] ?? ""}
              onChange={(e) => onChangeField(f.id, e.target.value)}
              required={!!f.required}
            >
              <option value="" disabled>
                Select an option
              </option>
              {(f.options || []).map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          )}
        </label>
      ))}

      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Submit"}
      </Button>
    </form>
  )
}
