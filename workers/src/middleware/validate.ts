import { Context } from 'hono';
import { z, ZodSchema } from 'zod';
import { AppError } from '../utils/errors';

/**
 * Zod 스키마 검증 미들웨어
 */

/**
 * Request body 검증
 * @param schema - Zod schema
 */
export function validateBody<T extends ZodSchema>(schema: T) {
  return async (c: Context, next: () => Promise<void>) => {
    try {
      const body = await c.req.json();
      const validated = schema.parse(body);

      // 검증된 데이터를 context에 저장
      c.set('validatedBody', validated);

      await next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = formatZodErrors(error);
        throw new AppError(
          'Validation failed',
          400,
          'VALIDATION_ERROR',
          formattedErrors
        );
      }
      throw error;
    }
  };
}

/**
 * Query parameters 검증
 * @param schema - Zod schema
 */
export function validateQuery<T extends ZodSchema>(schema: T) {
  return async (c: Context, next: () => Promise<void>) => {
    try {
      const query = c.req.query();
      const validated = schema.parse(query);

      // 검증된 데이터를 context에 저장
      c.set('validatedQuery', validated);

      await next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = formatZodErrors(error);
        throw new AppError(
          'Query validation failed',
          400,
          'VALIDATION_ERROR',
          formattedErrors
        );
      }
      throw error;
    }
  };
}

/**
 * Path parameters 검증
 * @param schema - Zod schema
 */
export function validateParams<T extends ZodSchema>(schema: T) {
  return async (c: Context, next: () => Promise<void>) => {
    try {
      const params = c.req.param();
      const validated = schema.parse(params);

      // 검증된 데이터를 context에 저장
      c.set('validatedParams', validated);

      await next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = formatZodErrors(error);
        throw new AppError(
          'Parameter validation failed',
          400,
          'VALIDATION_ERROR',
          formattedErrors
        );
      }
      throw error;
    }
  };
}

/**
 * Headers 검증
 * @param schema - Zod schema
 */
export function validateHeaders<T extends ZodSchema>(schema: T) {
  return async (c: Context, next: () => Promise<void>) => {
    try {
      // Headers를 객체로 변환
      const headers: Record<string, string> = {};
      c.req.raw.headers.forEach((value, key) => {
        headers[key] = value;
      });

      const validated = schema.parse(headers);

      // 검증된 데이터를 context에 저장
      c.set('validatedHeaders', validated);

      await next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = formatZodErrors(error);
        throw new AppError(
          'Header validation failed',
          400,
          'VALIDATION_ERROR',
          formattedErrors
        );
      }
      throw error;
    }
  };
}

/**
 * Zod 에러 포맷팅
 * @param error - ZodError
 * @returns 포맷된 에러 객체
 */
function formatZodErrors(error: z.ZodError): Record<string, string[]> {
  const errors: Record<string, string[]> = {};

  error.errors.forEach((err) => {
    const path = err.path.join('.');
    const message = err.message;

    if (!errors[path]) {
      errors[path] = [];
    }

    errors[path].push(message);
  });

  return errors;
}

/**
 * 검증된 데이터 가져오기 헬퍼 함수
 */
export function getValidatedBody<T>(c: Context): T {
  return c.get('validatedBody') as T;
}

export function getValidatedQuery<T>(c: Context): T {
  return c.get('validatedQuery') as T;
}

export function getValidatedParams<T>(c: Context): T {
  return c.get('validatedParams') as T;
}

export function getValidatedHeaders<T>(c: Context): T {
  return c.get('validatedHeaders') as T;
}

/**
 * 복합 검증 (body + query + params)
 */
export function validateAll<
  TBody extends ZodSchema,
  TQuery extends ZodSchema,
  TParams extends ZodSchema
>(schemas: {
  body?: TBody;
  query?: TQuery;
  params?: TParams;
}) {
  return async (c: Context, next: () => Promise<void>) => {
    const errors: Record<string, string[]> = {};

    // Body 검증
    if (schemas.body) {
      try {
        const body = await c.req.json();
        const validated = schemas.body.parse(body);
        c.set('validatedBody', validated);
      } catch (error) {
        if (error instanceof z.ZodError) {
          Object.assign(errors, formatZodErrors(error));
        }
      }
    }

    // Query 검증
    if (schemas.query) {
      try {
        const query = c.req.query();
        const validated = schemas.query.parse(query);
        c.set('validatedQuery', validated);
      } catch (error) {
        if (error instanceof z.ZodError) {
          Object.assign(errors, formatZodErrors(error));
        }
      }
    }

    // Params 검증
    if (schemas.params) {
      try {
        const params = c.req.param();
        const validated = schemas.params.parse(params);
        c.set('validatedParams', validated);
      } catch (error) {
        if (error instanceof z.ZodError) {
          Object.assign(errors, formatZodErrors(error));
        }
      }
    }

    // 에러가 있으면 throw
    if (Object.keys(errors).length > 0) {
      throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', errors);
    }

    await next();
  };
}
