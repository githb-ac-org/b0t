#!/usr/bin/env ts-node

/**
 * Check Railway database schema
 * Lists all tables and their row counts
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { sql } from 'drizzle-orm';

async function checkDatabase() {
  // Get Railway database URL from environment
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found in environment');
    process.exit(1);
  }

  console.log('🔍 Connecting to Railway database...\n');

  const pool = new Pool({
    connectionString: databaseUrl,
  });

  const db = drizzle(pool);

  try {
    // List all tables
    const tables = await db.execute(sql`
      SELECT tablename
      FROM pg_catalog.pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `);

    console.log(`📊 Found ${tables.rows.length} tables in database:\n`);

    // Get row count for each table
    for (const table of tables.rows) {
      const tableName = table.tablename as string;

      try {
        const count = await db.execute(
          sql.raw(`SELECT COUNT(*) as count FROM "${tableName}"`)
        );

        const rowCount = count.rows[0]?.count || 0;
        console.log(`  ✓ ${tableName.padEnd(40)} ${rowCount} rows`);
      } catch (error) {
        console.log(`  ⚠ ${tableName.padEnd(40)} Error: ${error instanceof Error ? error.message : 'Unknown'}`);
      }
    }

    console.log('\n✅ Database check complete');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

checkDatabase();
