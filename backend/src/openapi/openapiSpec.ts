/**
 * OpenAPI 3 spec for Swagger UI. Kept in sync with route modules and Zod schemas.
 */
export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Finance API",
    version: "1.0.0",
    description:
      "REST API for the finance dashboard: JWT auth, financial records, dashboard aggregates, and role-based access (viewer / analyst / admin).",
  },
  servers: [{ url: "/", description: "Use the same host as this service (e.g. http://localhost:4000)" }],
  tags: [
    { name: "Health" },
    { name: "Auth" },
    { name: "Users", description: "Admin only" },
    { name: "Records" },
    { name: "Dashboard" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      ApiSuccess: {
        type: "object",
        required: ["success", "data"],
        properties: {
          success: { type: "boolean", enum: [true] },
          data: {},
        },
      },
      ApiError: {
        type: "object",
        required: ["success", "error"],
        properties: {
          success: { type: "boolean", enum: [false] },
          error: {
            type: "object",
            required: ["code", "message"],
            properties: {
              code: { type: "string" },
              message: { type: "string" },
              details: {},
            },
          },
        },
      },
      Role: { type: "string", enum: ["VIEWER", "ANALYST", "ADMIN"] },
      UserStatus: { type: "string", enum: ["ACTIVE", "INACTIVE"] },
      RecordType: { type: "string", enum: ["INCOME", "EXPENSE"] },
      RecordStatus: { type: "string", enum: ["PENDING", "CONFIRMED", "VOID"] },
      LoginBody: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 1 },
        },
      },
      LoginResponse: {
        type: "object",
        properties: {
          token: { type: "string" },
          user: {
            type: "object",
            properties: {
              id: { type: "string" },
              email: { type: "string" },
              name: { type: "string", nullable: true },
              role: { $ref: "#/components/schemas/Role" },
              status: { $ref: "#/components/schemas/UserStatus" },
            },
          },
        },
      },
      CreateUserBody: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 8 },
          name: { type: "string", maxLength: 120 },
          role: { $ref: "#/components/schemas/Role" },
        },
      },
      UpdateUserBody: {
        type: "object",
        properties: {
          email: { type: "string", format: "email" },
          name: { type: "string", maxLength: 120, nullable: true },
          role: { $ref: "#/components/schemas/Role" },
        },
        description: "At least one field required.",
      },
      UpdateUserStatusBody: {
        type: "object",
        required: ["status"],
        properties: {
          status: { $ref: "#/components/schemas/UserStatus" },
        },
      },
      CreateRecordBody: {
        type: "object",
        required: ["amount", "type", "category", "date"],
        properties: {
          amount: { type: "number", exclusiveMinimum: 0 },
          type: { $ref: "#/components/schemas/RecordType" },
          category: { type: "string", minLength: 1, maxLength: 80 },
          date: { type: "string", format: "date-time" },
          notes: { type: "string", maxLength: 2000 },
          status: { $ref: "#/components/schemas/RecordStatus" },
        },
      },
      UpdateRecordBody: {
        type: "object",
        properties: {
          amount: { type: "number", exclusiveMinimum: 0 },
          type: { $ref: "#/components/schemas/RecordType" },
          category: { type: "string", minLength: 1, maxLength: 80 },
          date: { type: "string", format: "date-time" },
          notes: { type: "string", maxLength: 2000, nullable: true },
          status: { $ref: "#/components/schemas/RecordStatus" },
        },
        description: "At least one field required.",
      },
    },
    parameters: {
      idPath: {
        name: "id",
        in: "path",
        required: true,
        schema: { type: "string", minLength: 1 },
      },
      recordIdPath: {
        name: "id",
        in: "path",
        required: true,
        schema: { type: "string", minLength: 1 },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        security: [],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", enum: [true] },
                    data: {
                      type: "object",
                      properties: { status: { type: "string", enum: ["ok"] } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Log in",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginBody" },
            },
          },
        },
        responses: {
          "200": {
            description: "JWT issued",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ApiSuccess" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/LoginResponse" },
                      },
                    },
                  ],
                },
              },
            },
          },
          "401": {
            description: "Invalid credentials or inactive account",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } },
          },
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Current user",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "User profile",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ApiSuccess" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            id: { type: "string" },
                            email: { type: "string" },
                            name: { type: "string", nullable: true },
                            role: { $ref: "#/components/schemas/Role" },
                            status: { $ref: "#/components/schemas/UserStatus" },
                            createdAt: { type: "string", format: "date-time" },
                            updatedAt: { type: "string", format: "date-time" },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          "401": {
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } },
            description: "Unauthorized",
          },
        },
      },
    },
    "/users": {
      post: {
        tags: ["Users"],
        summary: "Create user",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateUserBody" },
            },
          },
        },
        responses: {
          "201": {
            description: "Created",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiSuccess" } } },
          },
          "400": {
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } },
            description: "Validation error",
          },
          "403": { description: "Forbidden" },
          "409": { description: "Email already exists" },
        },
      },
      get: {
        tags: ["Users"],
        summary: "List users",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "User list",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiSuccess" } } },
          },
          "403": { description: "Forbidden" },
        },
      },
    },
    "/users/{id}": {
      patch: {
        tags: ["Users"],
        summary: "Update user",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/idPath" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateUserBody" },
            },
          },
        },
        responses: {
          "200": { content: { "application/json": { schema: { $ref: "#/components/schemas/ApiSuccess" } } } },
          "400": { content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          "403": { description: "Forbidden" },
          "404": { description: "Not found" },
        },
      },
    },
    "/users/{id}/status": {
      patch: {
        tags: ["Users"],
        summary: "Update user status (active / inactive)",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/idPath" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateUserStatusBody" },
            },
          },
        },
        responses: {
          "200": { content: { "application/json": { schema: { $ref: "#/components/schemas/ApiSuccess" } } } },
          "400": { content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          "403": { description: "Forbidden" },
          "404": { description: "Not found" },
        },
      },
    },
    "/records": {
      get: {
        tags: ["Records"],
        summary: "List records (filters, pagination)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
          { name: "pageSize", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 20 } },
          { name: "type", in: "query", schema: { $ref: "#/components/schemas/RecordType" } },
          { name: "category", in: "query", schema: { type: "string" } },
          { name: "dateFrom", in: "query", schema: { type: "string", format: "date-time" } },
          { name: "dateTo", in: "query", schema: { type: "string", format: "date-time" } },
          { name: "search", in: "query", schema: { type: "string", maxLength: 200 } },
        ],
        responses: {
          "200": {
            description: "Paginated records",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiSuccess" } } },
          },
          "401": { description: "Unauthorized" },
        },
      },
      post: {
        tags: ["Records"],
        summary: "Create record (admin only)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateRecordBody" },
            },
          },
        },
        responses: {
          "201": { content: { "application/json": { schema: { $ref: "#/components/schemas/ApiSuccess" } } } },
          "400": { content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          "403": { description: "Admin required" },
        },
      },
    },
    "/records/{id}": {
      get: {
        tags: ["Records"],
        summary: "Get record by id",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/recordIdPath" }],
        responses: {
          "200": { content: { "application/json": { schema: { $ref: "#/components/schemas/ApiSuccess" } } } },
          "404": { description: "Not found" },
        },
      },
      patch: {
        tags: ["Records"],
        summary: "Update record (admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/recordIdPath" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateRecordBody" },
            },
          },
        },
        responses: {
          "200": { content: { "application/json": { schema: { $ref: "#/components/schemas/ApiSuccess" } } } },
          "400": { content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          "403": { description: "Admin required" },
          "404": { description: "Not found" },
        },
      },
      delete: {
        tags: ["Records"],
        summary: "Delete record (admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/recordIdPath" }],
        responses: {
          "204": { description: "No content" },
          "403": { description: "Admin required" },
          "404": { description: "Not found" },
        },
      },
    },
    "/dashboard/summary": {
      get: {
        tags: ["Dashboard"],
        summary: "Dashboard summary (viewer+)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "from", in: "query", schema: { type: "string", format: "date-time" } },
          { name: "to", in: "query", schema: { type: "string", format: "date-time" } },
        ],
        responses: {
          "200": { content: { "application/json": { schema: { $ref: "#/components/schemas/ApiSuccess" } } } },
          "403": { description: "Forbidden for this role" },
        },
      },
    },
    "/dashboard/recent-activity": {
      get: {
        tags: ["Dashboard"],
        summary: "Recent activity (viewer+)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "from", in: "query", schema: { type: "string", format: "date-time" } },
          { name: "to", in: "query", schema: { type: "string", format: "date-time" } },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 50, default: 10 } },
        ],
        responses: {
          "200": { content: { "application/json": { schema: { $ref: "#/components/schemas/ApiSuccess" } } } },
          "403": { description: "Forbidden for this role" },
        },
      },
    },
    "/dashboard/category-breakdown": {
      get: {
        tags: ["Dashboard"],
        summary: "Category breakdown (analyst / admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "from", in: "query", schema: { type: "string", format: "date-time" } },
          { name: "to", in: "query", schema: { type: "string", format: "date-time" } },
        ],
        responses: {
          "200": { content: { "application/json": { schema: { $ref: "#/components/schemas/ApiSuccess" } } } },
          "403": { description: "Viewer cannot access" },
        },
      },
    },
    "/dashboard/trends": {
      get: {
        tags: ["Dashboard"],
        summary: "Monthly trends (analyst / admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "from", in: "query", schema: { type: "string", format: "date-time" } },
          { name: "to", in: "query", schema: { type: "string", format: "date-time" } },
        ],
        responses: {
          "200": { content: { "application/json": { schema: { $ref: "#/components/schemas/ApiSuccess" } } } },
          "403": { description: "Viewer cannot access" },
        },
      },
    },
  },
} as const;
