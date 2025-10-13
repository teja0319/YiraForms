import SwaggerUIPage from "@/components/swagger-ui"

export const metadata = {
  title: "API Docs | Dynamic Forms",
  description: "Swagger UI for the Dynamic Forms API",
}

export default function Page() {
  return <SwaggerUIPage url="/api/swagger" />
}
