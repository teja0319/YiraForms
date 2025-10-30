// "use client"

// import type React from "react"

// import { useState } from "react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Textarea } from "@/components/ui/textarea"
// import { Label } from "@/components/ui/label"
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
// import { Checkbox } from "@/components/ui/checkbox"

// type FieldOption = { value: string; label: string }
// type Field = {
//   id: string
//   label: string
//   name?: string
//   type: "text" | "email" | "number" | "select" | "textarea" | "date" | "checkbox" | "radio"
//   required?: boolean
//   options?: Array<string | FieldOption>
// }

// export default function FormRenderer({
//   form,
//   onSubmitted,
// }: {
//   form: { _id: string; title: string; description?: string; fields: Field[] }
//   onSubmitted?: (res: any) => void
// }) {
//   const [values, setValues] = useState<Record<string, any>>({})
//   const [primaryKey, setPrimaryKey] = useState("")
//   const [secondaryKey, setSecondaryKey] = useState<string>("")
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const formId = form._id

//   const normalizeKey = (f: Field) => f.name || f.id
//   const normalizeOptions = (f: Field): FieldOption[] =>
//     (f.options || []).map((o) => (typeof o === "string" ? { value: o, label: o } : o))

//   const onChangeField = (key: string, val: any) => setValues((v) => ({ ...v, [key]: val }))

//   const onSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setError(null)

//     // Basic client-side required check to avoid obvious 400s
//     for (const f of form.fields) {
//       const key = normalizeKey(f)
//       const v = values[key]
//       if (f.required) {
//         if (f.type === "checkbox") {
//           if (v !== true) {
//             setError(`"${f.label}" must be checked`)
//             return
//           }
//         } else if (v === undefined || v === null || v === "") {
//           setError(`"${f.label}" is required`)
//           return
//         }
//       }
//     }
//     if (!primaryKey) {
//       setError("Primary Key is required")
//       return
//     }

//     setLoading(true)
//     try {
//       const res = await fetch(`/api/forms/${formId}/submissions`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           primaryKey,
//           secondaryKey: secondaryKey || null,
//           data: values,
//         }),
//       })
//       if (!res.ok) {
//         const j = await res.json().catch(() => ({}))
//         throw new Error(j?.error?.message || "Failed to submit")
//       }
//       const data = await res.json()
//       onSubmitted?.(data)
//       setValues({})
//       setPrimaryKey("")
//       setSecondaryKey("")
//     } catch (e: any) {
//       setError(e?.message || "Submission failed")
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <form onSubmit={onSubmit} className="grid gap-4">
//       {form.description && <p className="text-muted-foreground">{form.description}</p>}

//       {/* Primary/Secondary Keys */}
//       <div className="grid gap-2">
//         <Label htmlFor="primaryKey">
//           Primary Key <span aria-hidden="true">*</span>
//         </Label>
//         <Input
//           id="primaryKey"
//           name="primaryKey"
//           value={primaryKey}
//           onChange={(e) => setPrimaryKey(e.target.value)}
//           required
//           placeholder="e.g. customer-id or email"
//         />
//       </div>
//       <div className="grid gap-2">
//         <Label htmlFor="secondaryKey">Secondary Key (optional)</Label>
//         <Input
//           id="secondaryKey"
//           name="secondaryKey"
//           value={secondaryKey}
//           onChange={(e) => setSecondaryKey(e.target.value)}
//           placeholder="optional"
//         />
//       </div>

//       {/* Dynamic Fields */}
//       {form.fields.map((f) => {
//         const key = normalizeKey(f)
//         const opts = normalizeOptions(f)
//         const label = f.label || key

//         return (
//           <div key={key} className="grid gap-2">
//             <Label htmlFor={key}>
//               {label}
//               {f.required ? " *" : ""}
//             </Label>

//             {f.type === "text" && (
//               <Input
//                 id={key}
//                 name={key}
//                 value={values[key] ?? ""}
//                 onChange={(e) => onChangeField(key, e.target.value)}
//                 required={!!f.required}
//               />
//             )}

//             {f.type === "email" && (
//               <Input
//                 id={key}
//                 name={key}
//                 type="email"
//                 value={values[key] ?? ""}
//                 onChange={(e) => onChangeField(key, e.target.value)}
//                 required={!!f.required}
//               />
//             )}

//             {f.type === "number" && (
//               <Input
//                 id={key}
//                 name={key}
//                 type="number"
//                 value={values[key] ?? ""}
//                 onChange={(e) => {
//                   const raw = e.target.value
//                   onChangeField(key, raw === "" ? "" : Number(raw))
//                 }}
//                 required={!!f.required}
//               />
//             )}

//             {f.type === "textarea" && (
//               <Textarea
//                 id={key}
//                 name={key}
//                 value={values[key] ?? ""}
//                 onChange={(e) => onChangeField(key, e.target.value)}
//                 required={!!f.required}
//               />
//             )}

//             {f.type === "date" && (
//               <Input
//                 id={key}
//                 name={key}
//                 type="date"
//                 value={values[key] ?? ""}
//                 onChange={(e) => onChangeField(key, e.target.value)}
//                 required={!!f.required}
//               />
//             )}

//             {f.type === "select" && (
//               <select
//                 id={key}
//                 name={key}
//                 className="h-9 rounded-md border bg-background px-2"
//                 value={values[key] ?? ""}
//                 onChange={(e) => onChangeField(key, e.target.value)}
//                 required={!!f.required}
//               >
//                 <option value="" disabled>
//                   Select an option
//                 </option>
//                 {opts.map((opt) => (
//                   <option key={opt.value} value={opt.value}>
//                     {opt.label}
//                   </option>
//                 ))}
//               </select>
//             )}

//             {f.type === "radio" && (
//               <RadioGroup
//                 id={key}
//                 name={key}
//                 value={values[key] ?? ""}
//                 onValueChange={(val) => onChangeField(key, val)}
//                 required={!!f.required}
//               >
//                 {opts.map((opt) => (
//                   <div key={opt.value} className="flex items-center gap-2">
//                     <RadioGroupItem id={`${key}-${opt.value}`} value={opt.value} />
//                     <Label htmlFor={`${key}-${opt.value}`}>{opt.label}</Label>
//                   </div>
//                 ))}
//               </RadioGroup>
//             )}

//             {f.type === "checkbox" && (
//               <div className="flex items-center gap-2">
//                 <Checkbox
//                   id={key}
//                   name={key}
//                   checked={values[key] ?? false}
//                   onCheckedChange={(checked) => onChangeField(key, !!checked)}
//                   required={!!f.required}
//                 />
//                 <Label htmlFor={key}>{label}</Label>
//               </div>
//             )}
//           </div>
//         )
//       })}

//       {error && <p className="text-sm text-red-600">{error}</p>}
//       <Button type="submit" disabled={loading}>
//         {loading ? "Submitting..." : "Submit"}
//       </Button>
//     </form>
//   )
// }

// "use client"

// import type React from "react"
// import { useState, useEffect } from "react"
// import { useSearchParams } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Textarea } from "@/components/ui/textarea"
// import { Label } from "@/components/ui/label"
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
// import { Checkbox } from "@/components/ui/checkbox"

// type FieldOption = { value: string; label: string }
// type Field = {
//   id: string
//   label: string
//   name?: string
//   type:
//     | "text"
//     | "email"
//     | "number"
//     | "select"
//     | "textarea"
//     | "date"
//     | "checkbox"
//     | "radio"
//   required?: boolean
//   options?: Array<string | FieldOption>
// }

// export default function FormRenderer({
//   form,
//   onSubmitted,
// }: {
//   form: { _id: string; title: string; description?: string; fields: Field[] }
//   onSubmitted?: (res: any) => void
// }) {
//   const [values, setValues] = useState<Record<string, any>>({})
//   const [primaryKey, setPrimaryKey] = useState("")
//   const [secondaryKey, setSecondaryKey] = useState<string>("")
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const formId = form._id
//   const searchParams = useSearchParams()

//   // ✅ Fetch primary and secondary keys from URL on mount
//   useEffect(() => {
//     const primaryParam = searchParams.get("primary")
//     const secondaryParam = searchParams.get("secondary")
//     if (primaryParam) setPrimaryKey(primaryParam)
//     if (secondaryParam) setSecondaryKey(secondaryParam)
//   }, [searchParams])

//   const normalizeKey = (f: Field) => f.name || f.id
//   const normalizeOptions = (f: Field): FieldOption[] =>
//     (f.options || []).map((o) =>
//       typeof o === "string" ? { value: o, label: o } : o
//     )

//   const onChangeField = (key: string, val: any) =>
//     setValues((v) => ({ ...v, [key]: val }))

//   const onSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setError(null)

//     // Validate required fields
//     for (const f of form.fields) {
//       const key = normalizeKey(f)
//       const v = values[key]
//       if (f.required) {
//         if (f.type === "checkbox") {
//           if (v !== true) {
//             setError(`"${f.label}" must be checked`)
//             return
//           }
//         } else if (v === undefined || v === null || v === "") {
//           setError(`"${f.label}" is required`)
//           return
//         }
//       }
//     }

//     if (!primaryKey) {
//       setError("Primary Key is required")
//       return
//     }

//     setLoading(true)
//     try {
//       const res = await fetch(`/api/forms/${formId}/submissions`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           primaryKey,
//           secondaryKey: secondaryKey || null,
//           data: values,
//         }),
//       })
//       if (!res.ok) {
//         const j = await res.json().catch(() => ({}))
//         throw new Error(j?.error?.message || "Failed to submit")
//       }
//       const data = await res.json()
//       onSubmitted?.(data)
//       setValues({})
//       setPrimaryKey("")
//       setSecondaryKey("")
//     } catch (e: any) {
//       setError(e?.message || "Submission failed")
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <form onSubmit={onSubmit} className="grid gap-4">
//       {form.description && (
//         <p className="text-muted-foreground">{form.description}</p>
//       )}

//       {/* ✅ Primary/Secondary Keys (readonly if from URL) */}
//       <div className="grid gap-2">
//         <Label htmlFor="primaryKey">Primary Key *</Label>
//         <Input
//           id="primaryKey"
//           name="primaryKey"
//           value={primaryKey}
//           onChange={(e) => setPrimaryKey(e.target.value)}
//           required
//           readOnly={!!searchParams.get("primary")}
//           className={searchParams.get("primary") ? "bg-gray-100 cursor-not-allowed" : ""}
//         />
//       </div>

//       <div className="grid gap-2">
//         <Label htmlFor="secondaryKey">Secondary Key (optional)</Label>
//         <Input
//           id="secondaryKey"
//           name="secondaryKey"
//           value={secondaryKey}
//           onChange={(e) => setSecondaryKey(e.target.value)}
//           readOnly={!!searchParams.get("secondary")}
//           className={searchParams.get("secondary") ? "bg-gray-100 cursor-not-allowed" : ""}
//         />
//       </div>

//       {/* Dynamic Fields */}
//       {form.fields.map((f) => {
//         const key = normalizeKey(f)
//         const opts = normalizeOptions(f)
//         const label = f.label || key

//         return (
//           <div key={key} className="grid gap-2">
//             <Label htmlFor={key}>
//               {label}
//               {f.required ? " *" : ""}
//             </Label>

//             {f.type === "text" && (
//               <Input
//                 id={key}
//                 name={key}
//                 value={values[key] ?? ""}
//                 onChange={(e) => onChangeField(key, e.target.value)}
//                 required={!!f.required}
//               />
//             )}

//             {f.type === "email" && (
//               <Input
//                 id={key}
//                 name={key}
//                 type="email"
//                 value={values[key] ?? ""}
//                 onChange={(e) => onChangeField(key, e.target.value)}
//                 required={!!f.required}
//               />
//             )}

//             {f.type === "number" && (
//               <Input
//                 id={key}
//                 name={key}
//                 type="number"
//                 value={values[key] ?? ""}
//                 onChange={(e) =>
//                   onChangeField(
//                     key,
//                     e.target.value === "" ? "" : Number(e.target.value)
//                   )
//                 }
//                 required={!!f.required}
//               />
//             )}

//             {f.type === "textarea" && (
//               <Textarea
//                 id={key}
//                 name={key}
//                 value={values[key] ?? ""}
//                 onChange={(e) => onChangeField(key, e.target.value)}
//                 required={!!f.required}
//               />
//             )}

//             {f.type === "date" && (
//               <Input
//                 id={key}
//                 name={key}
//                 type="date"
//                 value={values[key] ?? ""}
//                 onChange={(e) => onChangeField(key, e.target.value)}
//                 required={!!f.required}
//               />
//             )}

//             {f.type === "select" && (
//               <select
//                 id={key}
//                 name={key}
//                 className="h-9 rounded-md border bg-background px-2"
//                 value={values[key] ?? ""}
//                 onChange={(e) => onChangeField(key, e.target.value)}
//                 required={!!f.required}
//               >
//                 <option value="" disabled>
//                   Select an option
//                 </option>
//                 {opts.map((opt) => (
//                   <option key={opt.value} value={opt.value}>
//                     {opt.label}
//                   </option>
//                 ))}
//               </select>
//             )}

//             {f.type === "radio" && (
//               <RadioGroup
//                 id={key}
//                 name={key}
//                 value={values[key] ?? ""}
//                 onValueChange={(val) => onChangeField(key, val)}
//                 required={!!f.required}
//               >
//                 {opts.map((opt) => (
//                   <div key={opt.value} className="flex items-center gap-2">
//                     <RadioGroupItem id={`${key}-${opt.value}`} value={opt.value} />
//                     <Label htmlFor={`${key}-${opt.value}`}>{opt.label}</Label>
//                   </div>
//                 ))}
//               </RadioGroup>
//             )}

//             {f.type === "checkbox" && (
//               <div className="flex items-center gap-2">
//                 <Checkbox
//                   id={key}
//                   name={key}
//                   checked={values[key] ?? false}
//                   onCheckedChange={(checked) => onChangeField(key, !!checked)}
//                   required={!!f.required}
//                 />
//                 <Label htmlFor={key}>{label}</Label>
//               </div>
//             )}
//           </div>
//         )
//       })}

//       {error && <p className="text-sm text-red-600">{error}</p>}
//       <Button type="submit" disabled={loading}>
//         {loading ? "Submitting..." : "Submit"}
//       </Button>
//     </form>
//   )
// }


"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type FieldOption = { value: string; label: string }
type Field = {
  id: string
  label: string
  name?: string
  type:
    | "text"
    | "email"
    | "number"
    | "select"
    | "textarea"
    | "date"
    | "checkbox"
    | "radio"
  required?: boolean
  options?: Array<string | FieldOption>
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
  const [error, setError] = useState<string | null>(null)
  const formId = form._id
  const searchParams = useSearchParams()

  // Fetch primary and secondary keys from URL on mount
  useEffect(() => {
    const primaryParam = searchParams.get("primary")
    const secondaryParam = searchParams.get("secondary")
    if (primaryParam) setPrimaryKey(primaryParam)
    if (secondaryParam) setSecondaryKey(secondaryParam)
  }, [searchParams])

  const normalizeKey = (f: Field) => f.name || f.id
  const normalizeOptions = (f: Field): FieldOption[] =>
    (f.options || []).map((o) =>
      typeof o === "string" ? { value: o, label: o } : o
    )

  const onChangeField = (key: string, val: any) =>
    setValues((v) => ({ ...v, [key]: val }))

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate required fields
    for (const f of form.fields) {
      const key = normalizeKey(f)
      const v = values[key]
      if (f.required) {
        if (f.type === "checkbox") {
          if (v !== true) {
            setError(`"${f.label}" must be checked`)
            return
          }
        } else if (v === undefined || v === null || v === "") {
          setError(`"${f.label}" is required`)
          return
        }
      }
    }

    if (!primaryKey) {
      setError("Primary Key is required")
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
      setValues({})
      setPrimaryKey("")
      setSecondaryKey("")
    } catch (e: any) {
      setError(e?.message || "Submission failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background py-6 sm:py-8">
      <div className="container max-w-md sm:max-w-lg mx-auto px-4 sm:px-6">
        <Card className="w-full shadow-lg border-0">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="text-2xl sm:text-3xl font-bold text-foreground">{form.title}</CardTitle>
            {form.description && (
              <CardDescription className="text-base sm:text-lg mt-2">{form.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="pt-2 sm:pt-4">
            <form onSubmit={onSubmit} className="grid gap-6 sm:gap-8">
              {/* Dynamic Fields */}
              {form.fields.map((f) => {
                const key = normalizeKey(f)
                const opts = normalizeOptions(f)
                const label = f.label || key

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
                        className="h-10 sm:h-11"
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
                        className="h-10 sm:h-11"
                      />
                    )}

                    {f.type === "number" && (
                      <Input
                        id={key}
                        name={key}
                        type="number"
                        value={values[key] ?? ""}
                        onChange={(e) =>
                          onChangeField(
                            key,
                            e.target.value === "" ? "" : Number(e.target.value)
                          )
                        }
                        required={!!f.required}
                        className="h-10 sm:h-11"
                      />
                    )}

                    {f.type === "textarea" && (
                      <Textarea
                        id={key}
                        name={key}
                        value={values[key] ?? ""}
                        onChange={(e) => onChangeField(key, e.target.value)}
                        required={!!f.required}
                        className="min-h-[100px] sm:min-h-[120px]"
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
                        className="h-10 sm:h-11"
                      />
                    )}

                    {f.type === "select" && (
                      <select
                        id={key}
                        name={key}
                        className="h-10 sm:h-11 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                        value={values[key] ?? ""}
                        onChange={(e) => onChangeField(key, e.target.value)}
                        required={!!f.required}
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
                        />
                        <Label htmlFor={key} className="text-sm leading-relaxed">
                          {label}
                        </Label>
                      </div>
                    )}
                  </div>
                )
              })}

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-md">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 sm:h-12 text-base font-semibold"
              >
                {loading ? "Submitting..." : "Submit"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
