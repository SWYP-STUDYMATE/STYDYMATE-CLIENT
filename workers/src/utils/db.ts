import type { D1Database, D1Result } from '@cloudflare/workers-types';

export type D1Value = string | number | boolean | null;

export async function query<T = unknown>(
  db: D1Database,
  sql: string,
  params: D1Value[] = []
): Promise<T[]> {
  const result = await db.prepare(sql).bind(...params).all<T>();
  return result.results ?? [];
}

export async function queryFirst<T = unknown>(
  db: D1Database,
  sql: string,
  params: D1Value[] = []
): Promise<T | null> {
  const rows = await query<T>(db, sql, params);
  return rows.length > 0 ? rows[0] : null;
}

export async function execute(
  db: D1Database,
  sql: string,
  params: D1Value[] = []
): Promise<D1Result> {
  return db.prepare(sql).bind(...params).run();
}

export async function transaction<T>(
  db: D1Database,
  statements: Array<{ sql: string; params?: D1Value[] }>,
  reducer?: (result: D1Result, index: number, acc: T | undefined) => T
): Promise<T | undefined> {
  let accumulator: T | undefined = undefined;

  await db.batch(
    statements.map(({ sql, params }) => db.prepare(sql).bind(...(params ?? [])))
  ).then((results) => {
    if (reducer) {
      results.forEach((res, index) => {
        accumulator = reducer(res, index, accumulator);
      });
    }
  });

  return accumulator;
}

