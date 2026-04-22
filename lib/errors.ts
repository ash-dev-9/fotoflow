/**
 * Custom error types for the application
 */

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code: string = "INTERNAL_ERROR"
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public fields?: Record<string, string>) {
    super(message, 400, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden") {
    super(message, 403, "FORBIDDEN");
    this.name = "ForbiddenError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Conflict") {
    super(message, 409, "CONFLICT");
    this.name = "ConflictError";
  }
}

export class ServerError extends AppError {
  constructor(message: string = "Internal server error", originalError?: Error) {
    super(message, 500, "INTERNAL_ERROR");
    this.name = "ServerError";
    if (originalError) {
      console.error("ServerError caused by:", originalError);
    }
  }
}

/**
 * Convert errors to JSON response
 */
export function errorToResponse(error: unknown) {
  if (error instanceof AppError) {
    return Response.json(
      {
        error: error.message,
        code: error.code,
        ...(error instanceof ValidationError && error.fields && { fields: error.fields }),
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof Error) {
    console.error("Unhandled error:", error);
    return Response.json(
      {
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }

  return Response.json(
    {
      error: "Unknown error occurred",
      code: "UNKNOWN_ERROR",
    },
    { status: 500 }
  );
}
