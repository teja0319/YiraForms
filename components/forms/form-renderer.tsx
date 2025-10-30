"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

type FieldOption = { value: string; label: string }
type Field = {
  id: string
  label: string
  name?: string
  type: "text" | "email" | "number" | "select" | "textarea" | "date" | "checkbox" | "radio"
  required?: boolean
  options?: Array<string | FieldOption>
  validations?: {
    minLength?: number
    maxLength?: number
    pattern?: string
    min?: number
    max?: number
  }
}

export default function FormRenderer({
  form,
  onSubmitted,
}: {
  form: { _id: string; title: string; description?: string; fields: Field[] }
  onSubmitted?: (res: any) => void
}) {
  const [values, setValues] = useState<Record<string, any>>({})
  const [primaryKey, setPrimaryKey] = useState("")
  const [secondaryKey, setSecondaryKey] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const formId = form._id
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const primaryParam = searchParams.get("primary")
    const secondaryParam = searchParams.get("secondary")
    if (primaryParam) setPrimaryKey(primaryParam)
    if (secondaryParam) setSecondaryKey(secondaryParam)
  }, [searchParams])

  const normalizeKey = (f: Field) => f.name || f.id
  const normalizeOptions = (f: Field): FieldOption[] =>
    (f.options || []).map((o) => (typeof o === "string" ? { value: o, label: o } : o))

  const onChangeField = (key: string, val: any) => {
    setValues((v) => ({ ...v, [key]: val }))
    setFieldErrors((e) => {
      const newErrors = { ...e }
      delete newErrors[key]
      return newErrors
    })
  }

  const validateField = (field: Field, value: any): string | null => {
    if (field.required) {
      if (field.type === "checkbox") {
        if (value !== true) return `${field.label} must be checked`
      } else if (value === undefined || value === null || value === "") {
        return `${field.label} is required`
      }
    }

    if (value === undefined || value === null || value === "") return null

    if (field.type === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) return `${field.label} must be a valid email address`
    }

    if (field.type === "number") {
      if (typeof value !== "number" || isNaN(value)) return `${field.label} must be a valid number`
    }

    if (field.type === "date") {
      const d = new Date(value)
      if (typeof value !== "string" || isNaN(d.getTime())) return `${field.label} must be a valid date`
    }

    if (typeof value === "string") {
      if (field.validations?.minLength && value.length < field.validations.minLength) {
        return `${field.label} must be at least ${field.validations.minLength} characters`
      }
      if (field.validations?.maxLength && value.length > field.validations.maxLength) {
        return `${field.label} must be no more than ${field.validations.maxLength} characters`
      }

      if (field.validations?.pattern) {
        try {
          const re = new RegExp(field.validations.pattern)
          if (!re.test(value)) return `${field.label} format is invalid`
        } catch (e) {
          return `${field.label} validation failed`
        }
      }
    }

    if (typeof value === "number") {
      if (field.validations?.min !== undefined && value < field.validations.min) {
        return `${field.label} must be at least ${field.validations.min}`
      }
      if (field.validations?.max !== undefined && value > field.validations.max) {
        return `${field.label} must be no more than ${field.validations.max}`
      }
    }

    if ((field.type === "select" || field.type === "radio") && typeof value === "string") {
      const opts = normalizeOptions(field)
      if (opts.length > 0) {
        const allowed = opts.map((o) => o.value)
        if (!allowed.includes(value)) return `${field.label} selection is invalid`
      }
    }

    return null
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGeneralError(null)
    setFieldErrors({})

    const newErrors: Record<string, string> = {}
    for (const f of form.fields) {
      const key = normalizeKey(f)
      const value = values[key]
      const error = validateField(f, value)
      if (error) newErrors[key] = error
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors)
      setGeneralError("Please fix the errors below")
      return
    }

    if (!primaryKey) {
      setGeneralError("Primary Key is required")
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/forms/${formId}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primaryKey,
          secondaryKey: secondaryKey || null,
          data: values,
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.error?.message || "Failed to submit")
      }
      const data = await res.json()
      onSubmitted?.(data)
      router.push(`/forms/${formId}/thank-you?submissionId=${data.submissionId}`)
    } catch (e: any) {
      setGeneralError(e?.message || "Submission failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5 py-6 sm:py-8">
      <div className="container max-w-md sm:max-w-lg mx-auto px-4 sm:px-6">
        <Card className="w-full shadow-xl border-0">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="text-2xl sm:text-3xl font-bold text-foreground">{form.title}</CardTitle>
            {form.description && (
              <CardDescription className="text-base sm:text-lg mt-2">{form.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="pt-2 sm:pt-4">
            <form onSubmit={onSubmit} className="grid gap-6 sm:gap-8">
              {form.fields.map((f) => {
                const key = normalizeKey(f)
                const opts = normalizeOptions(f)
                const label = f.label || key
                const error = fieldErrors[key]

                return (
                  <div key={key} className="grid gap-2">
                    <Label htmlFor={key} className="text-sm font-semibold text-muted-foreground">
                      {label}
                      {f.required ? <span className="text-destructive ml-1">*</span> : ""}
                    </Label>

                    {f.type === "text" && (
                      <Input
                        id={key}
                        name={key}
                        value={values[key] ?? ""}
                        onChange={(e) => onChangeField(key, e.target.value)}
                        required={!!f.required}
                        className={`h-10 sm:h-11 ${error ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
                        aria-invalid={!!error}
                      />
                    )}

                    {f.type === "email" && (
                      <Input
                        id={key}
                        name={key}
                        type="email"
                        value={values[key] ?? ""}
                        onChange={(e) => onChangeField(key, e.target.value)}
                        required={!!f.required}
                        className={`h-10 sm:h-11 ${error ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
                        aria-invalid={!!error}
                      />
                    )}

                    {f.type === "number" && (
                      <Input
                        id={key}
                        name={key}
                        type="number"
                        value={values[key] ?? ""}
                        onChange={(e) => onChangeField(key, e.target.value === "" ? "" : Number(e.target.value))}
                        required={!!f.required}
                        className={`h-10 sm:h-11 ${error ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
                        aria-invalid={!!error}
                      />
                    )}

                    {f.type === "textarea" && (
                      <Textarea
                        id={key}
                        name={key}
                        value={values[key] ?? ""}
                        onChange={(e) => onChangeField(key, e.target.value)}
                        required={!!f.required}
                        className={`min-h-[100px] sm:min-h-[120px] ${error ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
                        aria-invalid={!!error}
                      />
                    )}

                    {f.type === "date" && (
                      <Input
                        id={key}
                        name={key}
                        type="date"
                        value={values[key] ?? ""}
                        onChange={(e) => onChangeField(key, e.target.value)}
                        required={!!f.required}
                        className={`h-10 sm:h-11 ${error ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
                        aria-invalid={!!error}
                      />
                    )}

                    {f.type === "select" && (
                      <select
                        id={key}
                        name={key}
                        className={`h-10 sm:h-11 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring ${error ? "border-destructive focus:ring-destructive/20" : ""}`}
                        value={values[key] ?? ""}
                        onChange={(e) => onChangeField(key, e.target.value)}
                        required={!!f.required}
                        aria-invalid={!!error}
                      >
                        <option value="" disabled>
                          Select an option
                        </option>
                        {opts.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    )}

                    {f.type === "radio" && (
                      <RadioGroup
                        id={key}
                        name={key}
                        value={values[key] ?? ""}
                        onValueChange={(val) => onChangeField(key, val)}
                        required={!!f.required}
                        className="flex flex-col sm:flex-row gap-3"
                      >
                        {opts.map((opt) => (
                          <div key={opt.value} className="flex items-center gap-2">
                            <RadioGroupItem id={`${key}-${opt.value}`} value={opt.value} />
                            <Label htmlFor={`${key}-${opt.value}`} className="text-sm">
                              {opt.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}

                    {f.type === "checkbox" && (
                      <div className="flex items-start gap-2">
                        <Checkbox
                          id={key}
                          name={key}
                          checked={values[key] ?? false}
                          onCheckedChange={(checked) => onChangeField(key, !!checked)}
                          required={!!f.required}
                          aria-invalid={!!error}
                        />
                        <Label htmlFor={key} className="text-sm leading-relaxed">
                          {label}
                        </Label>
                      </div>
                    )}

                    {error && (
                      <div className="flex items-start gap-2 p-2 bg-destructive/10 border border-destructive/30 rounded-md">
                        <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                        <p className="text-xs sm:text-sm text-destructive">{error}</p>
                      </div>
                    )}
                  </div>
                )
              })}

              {generalError && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-md">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-destructive">{generalError}</p>
                  </div>
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full h-11 sm:h-12 text-base font-semibold">
                {loading ? "Submitting..." : "Submit"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
