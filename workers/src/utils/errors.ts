// Error handling utilities

import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';

// Custom error class
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    errorCode: string = 'INTERNAL_ERROR',
    details?: any
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// Common error types
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT_ERROR');
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter?: number) {
    super('Too many requests', 429, 'RATE_LIMIT_ERROR', { retryAfter });
    this.name = 'RateLimitError';
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, originalError?: any) {
    super(
      `External service error: ${service}`,
      502,
      'EXTERNAL_SERVICE_ERROR',
      { service, originalError }
    );
    this.name = 'ExternalServiceError';
  }
}

// Error response formatter
export function formatErrorResponse(error: Error | AppError | HTTPException) {
  // Check if it's our custom error
  if (error instanceof AppError) {
    return {
      error: {
        code: error.errorCode,
        message: error.message,
        details: error.details
      },
      status: error.statusCode
    };
  }

  // Check if it's Hono's HTTPException
  if (error instanceof HTTPException) {
    return {
      error: {
        code: 'HTTP_ERROR',
        message: error.message,
        status: error.status
      },
      status: error.status
    };
  }

  // Generic error
  const isDevelopment = process.env.NODE_ENV === 'development';
  return {
    error: {
      code: 'INTERNAL_ERROR',
      message: isDevelopment ? error.message : 'An unexpected error occurred',
      stack: isDevelopment ? error.stack : undefined
    },
    status: 500
  };
}

// Global error handler middleware
export async function errorHandler(
  err: Error | AppError | HTTPException,
  c: Context
) {
  console.error('Error:', err);

  const { error, status } = formatErrorResponse(err);

  // Add error tracking headers
  const requestId = c.req.header('X-Request-ID') || crypto.randomUUID();
  c.header('X-Request-ID', requestId);

  // Log to external service in production
  if (process.env.NODE_ENV === 'production') {
    // Here you would send to Sentry, DataDog, etc.
    console.error('Production error:', {
      requestId,
      error,
      url: c.req.url,
      method: c.req.method,
      headers: Object.fromEntries(c.req.raw.headers.entries())
    });
  }

  // Handle rate limit errors specially
  if (err instanceof RateLimitError && err.details?.retryAfter) {
    c.header('Retry-After', String(err.details.retryAfter));
  }

  return c.json(error, status);
}

// Async error wrapper
export function asyncHandler<T extends (...args: any[]) => Promise<any>>(
  fn: T
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      throw error;
    }
  }) as T;
}

// Validation helper
export function validateRequired(
  data: Record<string, any>,
  fields: string[]
): void {
  const missing = fields.filter(field => !data[field]);
  if (missing.length > 0) {
    throw new ValidationError(
      `Missing required fields: ${missing.join(', ')}`,
      { missingFields: missing }
    );
  }
}

// Type validation helper
export function validateType(
  value: any,
  type: 'string' | 'number' | 'boolean' | 'array' | 'object',
  fieldName: string
): void {
  let isValid = false;

  switch (type) {
    case 'string':
      isValid = typeof value === 'string';
      break;
    case 'number':
      isValid = typeof value === 'number' && !isNaN(value);
      break;
    case 'boolean':
      isValid = typeof value === 'boolean';
      break;
    case 'array':
      isValid = Array.isArray(value);
      break;
    case 'object':
      isValid = value !== null && typeof value === 'object' && !Array.isArray(value);
      break;
  }

  if (!isValid) {
    throw new ValidationError(
      `Invalid type for ${fieldName}: expected ${type}`,
      { field: fieldName, expectedType: type, actualType: typeof value }
    );
  }
}