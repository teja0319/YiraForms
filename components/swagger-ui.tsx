"use client"

import SwaggerUI from "swagger-ui-react"
import "swagger-ui-react/swagger-ui.css"

export default function SwaggerUIPage({ url = "/api/swagger" }: { url?: string }) {
  return (
    <div className="min-h-[80vh] p-6">
      <div className="max-w-screen-xl mx-auto">
        <SwaggerUI url={url} docExpansion="list" defaultModelsExpandDepth={0} tryItOutEnabled={true} />
      </div>
    </div>
  )
}
