"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"

export default function ThankYouPage() {
  const searchParams = useSearchParams()
  const [submissionId, setSubmissionId] = useState<string | null>(null)

  useEffect(() => {
    const id = searchParams.get("submissionId")
    setSubmissionId(id)
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5 flex items-center justify-center py-6 sm:py-8 px-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center pb-6 sm:pb-8">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3">
              <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold text-foreground">Thank You!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="space-y-2">
            <p className="text-base sm:text-lg text-muted-foreground">
              Your submission has been received successfully.
            </p>
            {submissionId && (
              <p className="text-xs sm:text-sm text-muted-foreground/70 break-all">
                Submission ID: <span className="font-mono font-semibold">{submissionId}</span>
              </p>
            )}
          </div>

          <div className="pt-4 space-y-3">
            <p className="text-sm text-muted-foreground">We appreciate your feedback and will review it shortly.</p>
            <Link href="/">
              <Button variant="outline" className="w-full bg-transparent">
                Go Back Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
