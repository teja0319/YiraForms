"use client"
import { useParams } from "next/navigation"
import useSWR from "swr"
import { Card, CardContent } from "@/components/ui/card"
import FormRenderer from "@/components/forms/form-renderer"
import { Loader2, AlertCircle } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function PublicFormPage() {
    const params = useParams<{ formId: string }>()
    const { data, isLoading, error } = useSWR(
        `/api/orgs/_/forms/${params.formId}`,
        fetcher,
        { shouldRetryOnError: false }
    )

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-950 py-4 px-3 sm:py-8 sm:px-6">
            <div className="max-w-2xl mx-auto">
                {isLoading && (
                    <Card className="w-full border border-gray-200 dark:border-gray-800 shadow-none rounded-xl">
                        <CardContent className="p-5 sm:p-8 md:p-10">
                            <div className="flex flex-col items-center justify-center py-16 sm:py-20 gap-3">
                                <Loader2 className="h-7 w-7 sm:h-8 sm:w-8 animate-spin text-gray-400" />
                                <p className="text-xs sm:text-sm text-gray-500">Loading...</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {error && (
                    <Card className="w-full border border-gray-200 dark:border-gray-800 shadow-none rounded-xl">
                        <CardContent className="p-5 sm:p-8 md:p-10">
                            <div className="flex flex-col items-center justify-center py-16 sm:py-20 gap-3 text-center px-4">
                                <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-red-500" />
                                <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100">Failed to load form</p>
                                <p className="text-xs sm:text-sm text-gray-500">Please try again later</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {data && data.ok && data.form && (
                    <div className="
                        [&_[data-slot='card-title']]:text-sm [&_[data-slot='card-title']]:sm:text-lg
                        [&_[data-slot='card-description']]:text-[10px] [&_[data-slot='card-description']]:sm:text-[15px] [&_[data-slot='card-description']]:text-gray-500
                        [&_label]:text-[13px] [&_label]:sm:text-base
                        [&_[data-slot='label']]:text-[13px] [&_[data-slot='label']]:sm:text-base
                        [&_input]:text-xs [&_input]:sm:text-[15px] [&_input]:px-2.5 [&_input]:py-2 [&_input]:sm:px-3 [&_input]:sm:py-2.5 [&_input]:h-[35px] [&_input]:sm:h-[38px]
                        [&_textarea]:text-xs [&_textarea]:sm:text-[15px] [&_textarea]:px-2.5 [&_textarea]:py-2 [&_textarea]:sm:px-3 [&_textarea]:sm:py-2.5 [&_textarea]:h-auto
                        [&_select]:text-xs [&_select]:sm:text-[15px] [&_select]:px-2.5 [&_select]:py-2 [&_select]:sm:px-3 [&_select]:sm:py-2.5 [&_select]:h-[35px] [&_select]:sm:h-[38px]
                        [&_[data-slot='input']]:text-xs [&_[data-slot='input']]:sm:text-[15px] [&_[data-slot='input']]:px-2.5 [&_[data-slot='input']]:py-2 [&_[data-slot='input']]:sm:px-3 [&_[data-slot='input']]:sm:py-2.5 [&_[data-slot='input']]:h-[35px] [&_[data-slot='input']]:sm:h-[38px]
                    ">
                        <FormRenderer form={data.form} />
                    </div>
                )}

                {data && !data.ok && (
                    <Card className="w-full border border-gray-200 dark:border-gray-800 shadow-none rounded-xl">
                        <CardContent className="p-5 sm:p-8 md:p-10">
                            <div className="flex flex-col items-center justify-center py-16 sm:py-20 gap-3 text-center px-4">
                                <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-orange-500" />
                                <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100">Invalid form</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {!isLoading && !data && !error && (
                    <Card className="w-full border border-gray-200 dark:border-gray-800 shadow-none rounded-xl">
                        <CardContent className="p-5 sm:p-8 md:p-10">
                            <div className="flex flex-col items-center justify-center py-16 sm:py-20 gap-3 text-center px-4">
                                <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
                                <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100">Form not found</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </main>
    )
}