import { useSQLite, sqliteClient } from '@/lib/db';
import { logger } from '@/lib/logger';

/**
 * Deduplication Module
 *
 * Generic deduplication functions for workflows to track and filter
 * already-processed items. Works with any table and ID column.
 */

export async function filterProcessed(params: {
  tableName: string;
  idColumn: string;
  idsToCheck: string[];
}): Promise<string[]> {
  const { tableName, idColumn, idsToCheck } = params;

  if (!idsToCheck || idsToCheck.length === 0) {
    logger.info('No IDs to check for deduplication');
    return [];
  }

  logger.info(
    { tableName, idColumn, count: idsToCheck.length },
    'Checking for already-processed items'
  );

  try {
    if (!useSQLite || !sqliteClient) {
      throw new Error('PostgreSQL support not yet implemented for deduplication module');
    }

    const placeholders = idsToCheck.map(() => '?').join(',');
    const queryStr = `SELECT DISTINCT ${idColumn} FROM ${tableName} WHERE ${idColumn} IN (${placeholders})`;

    const result = sqliteClient.prepare(queryStr).all(...idsToCheck) as Record<string, unknown>[];
    const existingIds = new Set(result.map(row => String(row[idColumn])));
    const newIds = idsToCheck.filter(id => !existingIds.has(id));

    logger.info(
      {
        tableName,
        totalChecked: idsToCheck.length,
        alreadyProcessed: existingIds.size,
        newItems: newIds.length,
      },
      'Deduplication complete'
    );

    return newIds;
  } catch (error) {
    logger.error({ error, tableName, idColumn }, 'Deduplication failed');
    throw new Error(
      `Failed to check duplicates in ${tableName}.${idColumn}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function hasProcessed(params: {
  tableName: string;
  idColumn: string;
  idToCheck: string;
}): Promise<boolean> {
  const { tableName, idColumn, idToCheck } = params;

  logger.info({ tableName, idColumn, idToCheck }, 'Checking if item already processed');

  try {
    if (!useSQLite || !sqliteClient) {
      throw new Error('PostgreSQL support not yet implemented for deduplication module');
    }

    const queryStr = `SELECT COUNT(*) as count FROM ${tableName} WHERE ${idColumn} = ?`;
    const result = sqliteClient.prepare(queryStr).get(idToCheck) as { count: number } | undefined;
    const count = result?.count || 0;

    logger.info({ tableName, idColumn, idToCheck, exists: count > 0 }, 'Processed check complete');
    return count > 0;
  } catch (error) {
    logger.error({ error, tableName, idColumn }, 'Processed check failed');
    throw new Error(
      `Failed to check if processed in ${tableName}.${idColumn}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function filterProcessedItems<T extends Record<string, unknown>>(params: {
  items: T[];
  tableName: string;
  idColumn: string;
  itemIdField: string;
}): Promise<T[]> {
  const { items, tableName, idColumn, itemIdField } = params;

  if (!items || items.length === 0) {
    return [];
  }

  const idsToCheck = items.map(item => String(item[itemIdField]));
  const newIds = await filterProcessed({ tableName, idColumn, idsToCheck });
  const newIdsSet = new Set(newIds);

  const filteredItems = items.filter(item => newIdsSet.has(String(item[itemIdField])));

  logger.info(
    {
      tableName,
      totalItems: items.length,
      filteredItems: filteredItems.length,
    },
    'Filtered processed items'
  );

  return filteredItems;
}

export async function markAsProcessed(params: {
  tableName: string;
  record: Record<string, unknown>;
}): Promise<void> {
  const { tableName, record } = params;

  logger.info({ tableName, record }, 'Marking item as processed');

  try {
    if (!useSQLite || !sqliteClient) {
      throw new Error('PostgreSQL support not yet implemented for deduplication module');
    }

    const columns = Object.keys(record).join(', ');
    const placeholders = Object.keys(record).map(() => '?').join(', ');
    const queryStr = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;

    sqliteClient.prepare(queryStr).run(...Object.values(record));

    logger.info({ tableName }, 'Item marked as processed');
  } catch (error) {
    logger.error({ error, tableName }, 'Failed to mark as processed');
    throw new Error(
      `Failed to mark as processed in ${tableName}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
