import type { NextRequest } from "next/server"
import { createSwaggerSpec } from "next-swagger-doc"

export async function GET(req: NextRequest) {
  const origin = new URL(req.url).origin

  const spec = createSwaggerSpec({
    apiFolder: "app/api", // point to your API folder for future JSDoc scanning
    definition: {
      title: "Dynamic Forms API",
      version: "1.0.0",
      description:
        "API for account/auth, organizations, dynamic form definitions, public submissions, and protected submissions management.",
      servers: [{ url: origin }],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
        schemas: {
          ApiError: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
          RegisterRequest: {
            type: "object",
            required: ["email", "password"],
            properties: {
              email: { type: "string", format: "email" },
              password: { type: "string", minLength: 6 },
              name: { type: "string" },
            },
          },
          LoginRequest: {
            type: "object",
            required: ["email", "password"],
            properties: {
              email: { type: "string", format: "email" },
              password: { type: "string" },
            },
          },
          AuthResponse: {
            type: "object",
            properties: {
              token: { type: "string", description: "JWT token" },
              user: {
                type: "object",
                properties: {
                  _id: { type: "string" },
                  email: { type: "string" },
                  name: { type: "string" },
                },
              },
            },
          },
          Org: {
            type: "object",
            properties: {
              _id: { type: "string" },
              name: { type: "string" },
              slug: { type: "string" },
              contactEmail: { type: "string", format: "email" },
              address: { type: "string" },
              ownerUserId: { type: "string" },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
            },
          },
          CreateOrgRequest: {
            type: "object",
            required: ["name"],
            properties: { name: { type: "string" } },
          },
          FieldDefinition: {
            type: "object",
            required: ["id", "type", "label"],
            properties: {
              id: { type: "string", description: "Stable field id" },
              type: {
                type: "string",
                enum: ["text", "number", "email", "date", "select", "checkbox"],
              },
              label: { type: "string" },
              required: { type: "boolean" },
              options: {
                type: "array",
                items: { type: "string" },
                description: "For select-type fields",
              },
            },
          },
          Form: {
            type: "object",
            properties: {
              _id: { type: "string" },
              orgId: { type: "string" },
              name: { type: "string" },
              version: { type: "integer" },
              primaryKey: { type: "string" },
              secondaryKey: { type: "string", nullable: true },
              fields: {
                type: "array",
                items: { $ref: "#/components/schemas/FieldDefinition" },
              },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
            },
          },
          CreateFormRequest: {
            type: "object",
            required: ["name", "primaryKey", "fields"],
            properties: {
              name: { type: "string" },
              primaryKey: { type: "string" },
              secondaryKey: { type: "string" },
              fields: {
                type: "array",
                items: { $ref: "#/components/schemas/FieldDefinition" },
              },
            },
          },
          UpdateFormRequest: {
            type: "object",
            properties: {
              name: { type: "string" },
              fields: {
                type: "array",
                items: { $ref: "#/components/schemas/FieldDefinition" },
              },
            },
          },
          Submission: {
            type: "object",
            properties: {
              _id: { type: "string" },
              formId: { type: "string" },
              formVersion: { type: "integer" },
              data: { type: "object", additionalProperties: true },
              createdAt: { type: "string", format: "date-time" },
            },
          },
          PublicSubmitRequest: {
            type: "object",
            properties: {
              data: { type: "object", additionalProperties: true },
            },
            required: ["data"],
          },
          ProtectedQuery: {
            type: "object",
            properties: {
              primary: { type: "string" },
              secondary: { type: "string" },
              page: { type: "integer", minimum: 1, default: 1 },
              limit: { type: "integer", minimum: 1, maximum: 100, default: 20 },
            },
          },
          OrgAccountCreateRequest: {
            type: "object",
            required: ["name", "email", "password", "address"],
            properties: {
              name: { type: "string" },
              email: { type: "string", format: "email" },
              password: { type: "string", minLength: 6 },
              address: { type: "string" },
            },
          },
        },
      },
      security: [{ bearerAuth: [] }],
      paths: {
        "/api/auth/register": {
          post: {
            tags: ["auth"],
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
              "200": {
                description: "Registered successfully",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/AuthResponse" },
                  },
                },
              },
              "400": {
                description: "Bad request",
                content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } },
              },
            },
            security: [], // registration is public
          },
        },
        "/api/auth/login": {
          post: {
            tags: ["auth"],
            summary: "Login to get JWT",
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/LoginRequest" },
                },
              },
            },
            responses: {
              "200": {
                description: "Login success",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/AuthResponse" },
                  },
                },
              },
              "401": { description: "Invalid credentials" },
            },
            security: [], // login is public
          },
        },
        "/api/orgs": {
          get: {
            tags: ["orgs"],
            summary: "List organizations (owned/accessible)",
            responses: {
              "200": {
                description: "List of orgs",
                content: {
                  "application/json": {
                    schema: { type: "array", items: { $ref: "#/components/schemas/Org" } },
                  },
                },
              },
            },
          },
          post: {
            tags: ["orgs"],
            summary: "Create organization",
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/CreateOrgRequest" },
                },
              },
            },
            responses: {
              "201": {
                description: "Created",
                content: { "application/json": { schema: { $ref: "#/components/schemas/Org" } } },
              },
              "400": { description: "Bad request" },
            },
          },
        },
        "/api/orgs/{orgId}": {
          get: {
            tags: ["orgs"],
            summary: "Get organization by id",
            parameters: [{ name: "orgId", in: "path", required: true, schema: { type: "string" } }],
            responses: {
              "200": {
                description: "Org",
                content: { "application/json": { schema: { $ref: "#/components/schemas/Org" } } },
              },
              "404": { description: "Not found" },
            },
          },
        },
        "/api/orgs/{orgId}/forms": {
          get: {
            tags: ["forms"],
            summary: "List forms for org",
            parameters: [{ name: "orgId", in: "path", required: true, schema: { type: "string" } }],
            responses: {
              "200": {
                description: "Forms",
                content: {
                  "application/json": {
                    schema: { type: "array", items: { $ref: "#/components/schemas/Form" } },
                  },
                },
              },
            },
          },
          post: {
            tags: ["forms"],
            summary: "Create a form for org",
            parameters: [{ name: "orgId", in: "path", required: true, schema: { type: "string" } }],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/CreateFormRequest" },
                },
              },
            },
            responses: {
              "201": {
                description: "Created",
                content: { "application/json": { schema: { $ref: "#/components/schemas/Form" } } },
              },
              "400": { description: "Validation error" },
            },
          },
        },
        "/api/orgs/{orgId}/forms/{formId}": {
          get: {
            tags: ["forms"],
            summary: "Get form",
            parameters: [
              { name: "orgId", in: "path", required: true, schema: { type: "string" } },
              { name: "formId", in: "path", required: true, schema: { type: "string" } },
            ],
            responses: {
              "200": {
                description: "Form",
                content: { "application/json": { schema: { $ref: "#/components/schemas/Form" } } },
              },
              "404": { description: "Not found" },
            },
          },
          put: {
            tags: ["forms"],
            summary: "Update form (e.g., fields) and bump version",
            parameters: [
              { name: "orgId", in: "path", required: true, schema: { type: "string" } },
              { name: "formId", in: "path", required: true, schema: { type: "string" } },
            ],
            requestBody: {
              required: true,
              content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateFormRequest" } } },
            },
            responses: {
              "200": {
                description: "Updated",
                content: { "application/json": { schema: { $ref: "#/components/schemas/Form" } } },
              },
            },
          },
          delete: {
            tags: ["forms"],
            summary: "Delete form",
            parameters: [
              { name: "orgId", in: "path", required: true, schema: { type: "string" } },
              { name: "formId", in: "path", required: true, schema: { type: "string" } },
            ],
            responses: { "204": { description: "Deleted" } },
          },
        },
        "/api/forms/{formId}/submissions": {
          post: {
            tags: ["public-submissions"],
            summary: "Public: submit to form by id",
            security: [], // public submit
            parameters: [{ name: "formId", in: "path", required: true, schema: { type: "string" } }],
            requestBody: {
              required: true,
              content: { "application/json": { schema: { $ref: "#/components/schemas/PublicSubmitRequest" } } },
            },
            responses: {
              "201": {
                description: "Submitted",
                content: { "application/json": { schema: { $ref: "#/components/schemas/Submission" } } },
              },
              "400": { description: "Validation error" },
            },
          },
        },
        "/api/orgs/{orgId}/forms/{formId}/submissions": {
          get: {
            tags: ["submissions"],
            summary: "Protected: query submissions",
            parameters: [
              { name: "orgId", in: "path", required: true, schema: { type: "string" } },
              { name: "formId", in: "path", required: true, schema: { type: "string" } },
              { name: "primary", in: "query", schema: { type: "string" } },
              { name: "secondary", in: "query", schema: { type: "string" } },
              { name: "page", in: "query", schema: { type: "integer" } },
              { name: "limit", in: "query", schema: { type: "integer" } },
            ],
            responses: {
              "200": {
                description: "Paginated submissions",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        items: { type: "array", items: { $ref: "#/components/schemas/Submission" } },
                        total: { type: "integer" },
                        page: { type: "integer" },
                        limit: { type: "integer" },
                      },
                    },
                  },
                },
              },
            },
          },
          post: {
            tags: ["submissions"],
            summary: "Protected: create submission (server-side created)",
            parameters: [
              { name: "orgId", in: "path", required: true, schema: { type: "string" } },
              { name: "formId", in: "path", required: true, schema: { type: "string" } },
            ],
            requestBody: {
              required: true,
              content: { "application/json": { schema: { $ref: "#/components/schemas/PublicSubmitRequest" } } },
            },
            responses: {
              "201": {
                description: "Created",
                content: { "application/json": { schema: { $ref: "#/components/schemas/Submission" } } },
              },
            },
          },
        },
        "/api/orgs/{orgId}/forms/{formId}/submissions/{submissionId}": {
          get: {
            tags: ["submissions"],
            summary: "Protected: get submission by id",
            parameters: [
              { name: "orgId", in: "path", required: true, schema: { type: "string" } },
              { name: "formId", in: "path", required: true, schema: { type: "string" } },
              { name: "submissionId", in: "path", required: true, schema: { type: "string" } },
            ],
            responses: {
              "200": {
                description: "Submission",
                content: { "application/json": { schema: { $ref: "#/components/schemas/Submission" } } },
              },
              "404": { description: "Not found" },
            },
          },
          delete: {
            tags: ["submissions"],
            summary: "Protected: delete submission",
            parameters: [
              { name: "orgId", in: "path", required: true, schema: { type: "string" } },
              { name: "formId", in: "path", required: true, schema: { type: "string" } },
              { name: "submissionId", in: "path", required: true, schema: { type: "string" } },
            ],
            responses: { "204": { description: "Deleted" } },
          },
        },
        "/api/orgs/register": {
          post: {
            tags: ["orgs"],
            summary: "Create organization and owner account",
            description: "Creates an organization and an owner user in one call. Returns JWT token.",
            security: [], // public
            requestBody: {
              required: true,
              content: { "application/json": { schema: { $ref: "#/components/schemas/OrgAccountCreateRequest" } } },
            },
            responses: {
              "201": {
                description: "Created org & account",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        token: { type: "string" },
                        org: { $ref: "#/components/schemas/Org" },
                        user: {
                          type: "object",
                          properties: {
                            _id: { type: "string" },
                            email: { type: "string" },
                            orgId: { type: "string" },
                          },
                        },
                      },
                    },
                  },
                },
              },
              "400": { description: "Validation error" },
            },
          },
        },
      },
    },
  })

  return Response.json(spec, { status: 200 })
}
