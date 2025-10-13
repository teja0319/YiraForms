import { NextResponse } from "next/server"

export async function GET() {
  const spec = {
    openapi: "3.1.0",
    info: {
      title: "Dynamic Forms API",
      version: "1.0.0",
      description:
        "OpenAPI description for the Next.js + MongoDB Dynamic Forms service. Use Bearer JWT for protected routes.",
    },
    servers: [{ url: "/" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        // Common
        ErrorResponse: {
          type: "object",
          properties: {
            ok: { type: "boolean", enum: [false] },
            error: {
              type: "object",
              properties: {
                code: { type: "string" },
                message: { type: "string" },
                details: {},
              },
              required: ["code", "message"],
            },
          },
          required: ["ok", "error"],
        },
        Meta: {
          type: "object",
          properties: {
            page: { type: "integer", minimum: 1 },
            limit: { type: "integer", minimum: 1 },
            total: { type: "integer", minimum: 0 },
          },
          required: ["page", "limit", "total"],
        },

        // Auth
        RegisterRequest: {
          type: "object",
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6, maxLength: 128 },
          },
          required: ["email", "password"],
        },
        LoginRequest: { $ref: "#/components/schemas/RegisterRequest" },
        AuthResponse: {
          type: "object",
          properties: { ok: { type: "boolean" }, token: { type: "string" } },
          required: ["ok", "token"],
        },

        // Orgs
        Org: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            slug: { type: "string" },
            contactEmail: { type: "string", format: "email", nullable: true },
            ownerUserId: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
          required: ["_id", "name", "slug", "ownerUserId", "createdAt", "updatedAt"],
        },
        OrgCreateRequest: {
          type: "object",
          properties: {
            name: { type: "string" },
            slug: { type: "string" },
            contactEmail: { type: "string", format: "email", nullable: true },
          },
          required: ["name", "slug"],
        },
        OrgUpdateRequest: {
          type: "object",
          properties: {
            name: { type: "string" },
            slug: { type: "string" },
            contactEmail: { type: "string", format: "email", nullable: true },
          },
          additionalProperties: false,
        },
        OrgsListResponse: {
          type: "object",
          properties: {
            ok: { type: "boolean" },
            meta: { $ref: "#/components/schemas/Meta" },
            orgs: { type: "array", items: { $ref: "#/components/schemas/Org" } },
          },
          required: ["ok", "meta", "orgs"],
        },
        OrgResponse: {
          type: "object",
          properties: { ok: { type: "boolean" }, org: { $ref: "#/components/schemas/Org" } },
          required: ["ok", "org"],
        },

        // Forms
        FormFieldOption: {
          type: "object",
          properties: { value: { type: "string" }, label: { type: "string" } },
          required: ["value", "label"],
        },
        FormField: {
          type: "object",
          properties: {
            id: { type: "string", description: "Stable UUID per field" },
            label: { type: "string" },
            name: { type: "string", description: "Key used in submission data" },
            type: {
              type: "string",
              enum: ["text", "textarea", "number", "date", "select", "checkbox", "radio", "file"],
            },
            options: { type: "array", items: { $ref: "#/components/schemas/FormFieldOption" } },
            required: { type: "boolean" },
            validations: {
              type: "object",
              properties: {
                minLength: { type: "integer" },
                maxLength: { type: "integer" },
                pattern: { type: "string" },
                min: { type: "number" },
                max: { type: "number" },
              },
              additionalProperties: false,
            },
            order: { type: "integer" },
          },
          required: ["id", "label", "name", "type", "required", "order"],
        },
        FormSettings: {
          type: "object",
          properties: {
            acceptAnonymousSubmissions: { type: "boolean" },
            allowSecondaryKey: { type: "boolean" },
          },
          required: ["acceptAnonymousSubmissions", "allowSecondaryKey"],
        },
        Form: {
          type: "object",
          properties: {
            _id: { type: "string" },
            orgId: { type: "string" },
            formId: { type: "string" },
            title: { type: "string" },
            description: { type: "string", nullable: true },
            fields: { type: "array", items: { $ref: "#/components/schemas/FormField" } },
            settings: { $ref: "#/components/schemas/FormSettings" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
          required: ["_id", "orgId", "formId", "title", "fields", "settings", "createdAt", "updatedAt"],
        },
        FormsListResponse: {
          type: "object",
          properties: {
            ok: { type: "boolean" },
            meta: { $ref: "#/components/schemas/Meta" },
            forms: { type: "array", items: { $ref: "#/components/schemas/Form" } },
          },
          required: ["ok", "meta", "forms"],
        },
        FormResponse: {
          type: "object",
          properties: { ok: { type: "boolean" }, form: { $ref: "#/components/schemas/Form" } },
          required: ["ok", "form"],
        },
        FormCreateRequest: {
          type: "object",
          properties: {
            formId: { type: "string" },
            title: { type: "string" },
            description: { type: "string", nullable: true },
            fields: { type: "array", items: { $ref: "#/components/schemas/FormField" } },
            settings: { $ref: "#/components/schemas/FormSettings" },
          },
          required: ["formId", "title"],
        },
        FormUpdateRequest: {
          type: "object",
          properties: {
            formId: { type: "string" },
            title: { type: "string" },
            description: { type: "string", nullable: true },
            fields: { type: "array", items: { $ref: "#/components/schemas/FormField" } },
            settings: { $ref: "#/components/schemas/FormSettings" },
          },
          additionalProperties: false,
        },

        // Submissions
        Submission: {
          type: "object",
          properties: {
            _id: { type: "string" },
            orgId: { type: "string" },
            formId: { type: "string" },
            primaryKey: { type: "string" },
            secondaryKey: { type: "string", nullable: true },
            data: { type: "object", additionalProperties: true },
            formVersion: { type: "integer", nullable: true },
            ipAddress: { type: "string", nullable: true },
            metadata: { type: "object", additionalProperties: true, nullable: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
          required: ["_id", "orgId", "formId", "primaryKey", "data", "createdAt", "updatedAt"],
        },
        SubmissionListResponse: {
          type: "object",
          properties: {
            ok: { type: "boolean" },
            meta: { $ref: "#/components/schemas/Meta" },
            submissions: { type: "array", items: { $ref: "#/components/schemas/Submission" } },
          },
          required: ["ok", "meta", "submissions"],
        },
        SubmissionResponse: {
          type: "object",
          properties: { ok: { type: "boolean" }, submission: { $ref: "#/components/schemas/Submission" } },
          required: ["ok", "submission"],
        },
        SubmissionCreateRequest: {
          type: "object",
          properties: {
            primaryKey: { type: "string" },
            secondaryKey: { type: "string", nullable: true },
            data: { type: "object", additionalProperties: true },
          },
          required: ["primaryKey", "data"],
        },
        SubmissionCreateResponse: {
          type: "object",
          properties: {
            ok: { type: "boolean" },
            submissionId: { type: "string" },
            primaryKey: { type: "string" },
            secondaryKey: { type: "string", nullable: true },
          },
          required: ["ok", "submissionId", "primaryKey"],
        },
      },
      parameters: {
        PageParam: {
          name: "page",
          in: "query",
          schema: { type: "integer", minimum: 1, default: 1 },
          required: false,
        },
        LimitParam: {
          name: "limit",
          in: "query",
          schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
          required: false,
        },
        PrimaryKeyParam: {
          name: "primaryKey",
          in: "query",
          schema: { type: "string" },
          required: true,
        },
        SecondaryKeyParam: {
          name: "secondaryKey",
          in: "query",
          schema: { type: "string", nullable: true },
          required: false,
        },
        FromDateParam: {
          name: "fromDate",
          in: "query",
          schema: { type: "string", format: "date-time" },
          required: false,
        },
        ToDateParam: {
          name: "toDate",
          in: "query",
          schema: { type: "string", format: "date-time" },
          required: false,
        },
      },
    },
    paths: {
      // Auth
      "/api/auth/register": {
        post: {
          summary: "Register a new user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RegisterRequest" },
              },
            },
          },
          responses: {
            201: {
              description: "Created",
              content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } },
            },
            400: {
              description: "Validation error",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
          },
        },
      },
      "/api/auth/login": {
        post: {
          summary: "Login and get JWT",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginRequest" },
              },
            },
          },
          responses: {
            200: {
              description: "OK",
              content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } },
            },
            401: {
              description: "Unauthorized",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
          },
        },
      },

      // Orgs
      "/api/orgs": {
        get: {
          summary: "List organizations",
          parameters: [{ $ref: "#/components/parameters/PageParam" }, { $ref: "#/components/parameters/LimitParam" }],
          responses: {
            200: {
              description: "OK",
              content: { "application/json": { schema: { $ref: "#/components/schemas/OrgsListResponse" } } },
            },
          },
        },
        post: {
          summary: "Create organization",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/OrgCreateRequest" } } },
          },
          responses: {
            201: {
              description: "Created",
              content: { "application/json": { schema: { $ref: "#/components/schemas/OrgResponse" } } },
            },
            400: {
              description: "Validation error",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            401: {
              description: "Unauthorized",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
          },
        },
      },
      "/api/orgs/{orgId}": {
        get: {
          summary: "Get organization",
          parameters: [{ name: "orgId", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: {
              description: "OK",
              content: { "application/json": { schema: { $ref: "#/components/schemas/OrgResponse" } } },
            },
            404: {
              description: "Not found",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
          },
        },
        put: {
          summary: "Update organization",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "orgId", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/OrgUpdateRequest" } } },
          },
          responses: {
            200: {
              description: "OK",
              content: { "application/json": { schema: { $ref: "#/components/schemas/OrgResponse" } } },
            },
            403: {
              description: "Forbidden",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            404: {
              description: "Not found",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
          },
        },
        delete: {
          summary: "Delete organization",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "orgId", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "OK" },
            403: {
              description: "Forbidden",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            404: {
              description: "Not found",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
          },
        },
      },

      // Forms
      "/api/orgs/{orgId}/forms": {
        get: {
          summary: "List forms in an org",
          parameters: [
            { name: "orgId", in: "path", required: true, schema: { type: "string" } },
            { $ref: "#/components/parameters/PageParam" },
            { $ref: "#/components/parameters/LimitParam" },
          ],
          responses: {
            200: {
              description: "OK",
              content: { "application/json": { schema: { $ref: "#/components/schemas/FormsListResponse" } } },
            },
          },
        },
        post: {
          summary: "Create a form",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "orgId", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/FormCreateRequest" } } },
          },
          responses: {
            201: {
              description: "Created",
              content: { "application/json": { schema: { $ref: "#/components/schemas/FormResponse" } } },
            },
            400: {
              description: "Validation error",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            403: {
              description: "Forbidden",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
          },
        },
      },
      "/api/orgs/{orgId}/forms/{formId}": {
        get: {
          summary: "Get form by formId",
          parameters: [
            { name: "orgId", in: "path", required: true, schema: { type: "string" } },
            { name: "formId", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: {
            200: {
              description: "OK",
              content: { "application/json": { schema: { $ref: "#/components/schemas/FormResponse" } } },
            },
            404: {
              description: "Not found",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
          },
        },
        put: {
          summary: "Update a form",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "orgId", in: "path", required: true, schema: { type: "string" } },
            { name: "formId", in: "path", required: true, schema: { type: "string" } },
          ],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/FormUpdateRequest" } } },
          },
          responses: {
            200: {
              description: "OK",
              content: { "application/json": { schema: { $ref: "#/components/schemas/FormResponse" } } },
            },
            403: {
              description: "Forbidden",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            404: {
              description: "Not found",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
          },
        },
        delete: {
          summary: "Delete a form",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "orgId", in: "path", required: true, schema: { type: "string" } },
            { name: "formId", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: {
            200: { description: "OK" },
            403: {
              description: "Forbidden",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            404: {
              description: "Not found",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
          },
        },
      },

      // Submissions (owner)
      "/api/orgs/{orgId}/forms/{formId}/submissions": {
        get: {
          summary: "List or fetch submissions (by keys)",
          description:
            "Requires primaryKey. If secondaryKey is provided, returns a single submission; otherwise returns a paginated list with optional date filtering.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "orgId", in: "path", required: true, schema: { type: "string" } },
            { name: "formId", in: "path", required: true, schema: { type: "string" } },
            { $ref: "#/components/parameters/PrimaryKeyParam" },
            { $ref: "#/components/parameters/SecondaryKeyParam" },
            { $ref: "#/components/parameters/FromDateParam" },
            { $ref: "#/components/parameters/ToDateParam" },
            { $ref: "#/components/parameters/PageParam" },
            { $ref: "#/components/parameters/LimitParam" },
          ],
          responses: {
            200: {
              description: "OK",
              content: {
                "application/json": {
                  schema: {
                    oneOf: [
                      { $ref: "#/components/schemas/SubmissionResponse" },
                      { $ref: "#/components/schemas/SubmissionListResponse" },
                    ],
                  },
                },
              },
            },
            400: {
              description: "Validation error",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            401: {
              description: "Unauthorized",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            403: {
              description: "Forbidden",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            404: {
              description: "Not found",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
          },
        },
      },
      "/api/orgs/{orgId}/forms/{formId}/submissions/{submissionId}": {
        get: {
          summary: "Get a submission by ID",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "orgId", in: "path", required: true, schema: { type: "string" } },
            { name: "formId", in: "path", required: true, schema: { type: "string" } },
            { name: "submissionId", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: {
            200: {
              description: "OK",
              content: { "application/json": { schema: { $ref: "#/components/schemas/SubmissionResponse" } } },
            },
            401: {
              description: "Unauthorized",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            403: {
              description: "Forbidden",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            404: {
              description: "Not found",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
          },
        },
      },

      // Submissions (public)
      "/api/forms/{formId}/submissions": {
        post: {
          summary: "Submit data to a form (public endpoint or requires auth based on form settings)",
          parameters: [{ name: "formId", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/SubmissionCreateRequest" } } },
          },
          responses: {
            201: {
              description: "Created",
              content: { "application/json": { schema: { $ref: "#/components/schemas/SubmissionCreateResponse" } } },
            },
            400: {
              description: "Validation error",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            404: {
              description: "Not found",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            429: {
              description: "Rate limited",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
          },
        },
      },

      // Admin utility
      "/api/admin/ensure-indexes": {
        post: {
          summary: "Ensure database indexes (admin/ops)",
          description: "Triggers index creation. Use with caution. Security is your responsibility.",
          responses: {
            200: { description: "OK" },
          },
        },
      },
    },
  }

  return NextResponse.json(spec, { status: 200 })
}
