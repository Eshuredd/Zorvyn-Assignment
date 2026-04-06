export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized", code = "UNAUTHORIZED") {
    super(401, code, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden", code = "FORBIDDEN") {
    super(403, code, message);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource", code = "NOT_FOUND") {
    super(404, code, `${resource} not found`);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, code = "CONFLICT") {
    super(409, code, message);
  }
}

export class ValidationRequestError extends AppError {
  constructor(message = "Validation failed", details?: unknown) {
    super(400, "VALIDATION_ERROR", message, details);
  }
}
