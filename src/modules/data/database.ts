import { useSQLite, sqliteClient } from '@/lib/db';
import { logger } from '@/lib/logger';

/**
 * Database Module
 *
 * Generic database operations for workflows.
 * Provides safe, parameterized queries for common database tasks.
 *
 * Perfect for:
 * - Querying records with filters
 * - Inserting workflow results
 * - Updating existing records
 * - Checking existence of data
 */

export async function query(params: {
  table: string;
  select?: string[];
  where?: Record<string, unknown>;
  limit?: number;
}): Promise<Record<string, unknown>[]> {
  const { table, select, where, limit } = params;

  logger.info({ table, select, where, limit }, 'Querying database');

  try {
    if (!useSQLite || !sqliteClient) {
      throw new Error('PostgreSQL support not yet implemented for database module');
    }

    const columns = select && select.length > 0 ? select.join(', ') : '*';
    let queryStr = `SELECT ${columns} FROM ${table}`;
    const values: unknown[] = [];

    if (where && Object.keys(where).length > 0) {
      const conditions = Object.keys(where).map(key => `${key} = ?`);
      queryStr += ` WHERE ${conditions.join(' AND ')}`;
      values.push(...Object.values(where));
    }

    if (limit) {
      queryStr += ` LIMIT ?`;
      values.push(limit);
    }

    const results = sqliteClient.prepare(queryStr).all(...values) as Record<string, unknown>[];
    logger.info({ table, resultCount: results.length }, 'Query complete');
    return results;
  } catch (error) {
    logger.error({ error, table }, 'Query failed');
    throw new Error(
      `Database query failed for table ${table}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function queryWhereIn(params: {
  table: string;
  column: string;
  values: unknown[];
  select?: string[];
}): Promise<Record<string, unknown>[]> {
  const { table, column, values, select } = params;

  if (!values || values.length === 0) {
    logger.info({ table, column }, 'No values to query');
    return [];
  }

  logger.info({ table, column, valueCount: values.length }, 'Querying with WHERE IN');

  try {
    if (!useSQLite || !sqliteClient) {
      throw new Error('PostgreSQL support not yet implemented for database module');
    }

    const columns = select && select.length > 0 ? select.join(', ') : '*';
    const placeholders = values.map(() => '?').join(',');
    const queryStr = `SELECT ${columns} FROM ${table} WHERE ${column} IN (${placeholders})`;

    const results = sqliteClient.prepare(queryStr).all(...values) as Record<string, unknown>[];
    logger.info({ table, resultCount: results.length }, 'WHERE IN query complete');
    return results;
  } catch (error) {
    logger.error({ error, table, column }, 'WHERE IN query failed');
    throw new Error(
      `Database query failed for table ${table}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function insert(params: {
  table: string;
  data: Record<string, unknown> | Record<string, unknown>[];
}): Promise<void> {
  const { table, data } = params;
  const records = Array.isArray(data) ? data : [data];

  if (records.length === 0) {
    logger.info({ table }, 'No records to insert');
    return;
  }

  logger.info({ table, recordCount: records.length }, 'Inserting records');

  try {
    if (!useSQLite || !sqliteClient) {
      throw new Error('PostgreSQL support not yet implemented for database module');
    }

    const columns = Object.keys(records[0]);
    const columnNames = columns.join(', ');
    const recordPlaceholders = columns.map(() => '?').join(', ');

    for (const record of records) {
      const queryStr = `INSERT INTO ${table} (${columnNames}) VALUES (${recordPlaceholders})`;
      const values = columns.map(col => record[col]);
      sqliteClient.prepare(queryStr).run(...values);
    }

    logger.info({ table, recordCount: records.length }, 'Insert complete');
  } catch (error) {
    logger.error({ error, table }, 'Insert failed');
    throw new Error(
      `Database insert failed for table ${table}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function update(params: {
  table: string;
  data: Record<string, unknown>;
  where: Record<string, unknown>;
}): Promise<void> {
  const { table, data, where } = params;

  if (Object.keys(data).length === 0) {
    logger.info({ table }, 'No data to update');
    return;
  }

  if (Object.keys(where).length === 0) {
    throw new Error('WHERE condition is required for UPDATE to prevent accidental full table updates');
  }

  logger.info({ table, updateFields: Object.keys(data), whereFields: Object.keys(where) }, 'Updating records');

  try {
    if (!useSQLite || !sqliteClient) {
      throw new Error('PostgreSQL support not yet implemented for database module');
    }

    const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const setValues = Object.values(data);
    const whereClause = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
    const whereValues = Object.values(where);

    const queryStr = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
    sqliteClient.prepare(queryStr).run(...setValues, ...whereValues);

    logger.info({ table }, 'Update complete');
  } catch (error) {
    logger.error({ error, table }, 'Update failed');
    throw new Error(
      `Database update failed for table ${table}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function deleteRecords(params: {
  table: string;
  where: Record<string, unknown>;
}): Promise<void> {
  const { table, where } = params;

  if (Object.keys(where).length === 0) {
    throw new Error('WHERE condition is required for DELETE to prevent accidental full table deletion');
  }

  logger.info({ table, whereFields: Object.keys(where) }, 'Deleting records');

  try {
    if (!useSQLite || !sqliteClient) {
      throw new Error('PostgreSQL support not yet implemented for database module');
    }

    const whereClause = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
    const whereValues = Object.values(where);
    const queryStr = `DELETE FROM ${table} WHERE ${whereClause}`;

    sqliteClient.prepare(queryStr).run(...whereValues);

    logger.info({ table }, 'Delete complete');
  } catch (error) {
    logger.error({ error, table }, 'Delete failed');
    throw new Error(
      `Database delete failed for table ${table}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function count(params: {
  table: string;
  where?: Record<string, unknown>;
}): Promise<number> {
  const { table, where } = params;

  logger.info({ table, where }, 'Counting records');

  try {
    if (!useSQLite || !sqliteClient) {
      throw new Error('PostgreSQL support not yet implemented for database module');
    }

    let queryStr = `SELECT COUNT(*) as count FROM ${table}`;
    const values: unknown[] = [];

    if (where && Object.keys(where).length > 0) {
      const conditions = Object.keys(where).map(key => `${key} = ?`);
      queryStr += ` WHERE ${conditions.join(' AND ')}`;
      values.push(...Object.values(where));
    }

    const result = sqliteClient.prepare(queryStr).get(...values) as { count: number } | undefined;
    const recordCount = result?.count || 0;

    logger.info({ table, count: recordCount }, 'Count complete');
    return recordCount;
  } catch (error) {
    logger.error({ error, table }, 'Count failed');
    throw new Error(
      `Database count failed for table ${table}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function exists(params: {
  table: string;
  where: Record<string, unknown>;
}): Promise<boolean> {
  const recordCount = await count(params);
  return recordCount > 0;
}

export async function getOne(params: {
  table: string;
  where: Record<string, unknown>;
  select?: string[];
}): Promise<Record<string, unknown> | null> {
  const results = await query({ ...params, limit: 1 });
  return results.length > 0 ? results[0] : null;
}
