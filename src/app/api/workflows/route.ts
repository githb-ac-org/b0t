import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { sqliteDb } from '@/lib/db';
import { workflowsTableSQLite } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * GET /api/workflows
 * List all workflows for the authenticated user
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!sqliteDb) {
      throw new Error('Database not initialized');
    }

    const workflows = await sqliteDb
      .select({
        id: workflowsTableSQLite.id,
        name: workflowsTableSQLite.name,
        description: workflowsTableSQLite.description,
        status: workflowsTableSQLite.status,
        trigger: workflowsTableSQLite.trigger,
        config: workflowsTableSQLite.config,
        createdAt: workflowsTableSQLite.createdAt,
        lastRun: workflowsTableSQLite.lastRun,
        lastRunStatus: workflowsTableSQLite.lastRunStatus,
        runCount: workflowsTableSQLite.runCount,
      })
      .from(workflowsTableSQLite)
      .where(eq(workflowsTableSQLite.userId, session.user.id))
      .orderBy(workflowsTableSQLite.createdAt);

    return NextResponse.json({ workflows });
  } catch (error) {
    logger.error({ error }, 'Failed to list workflows');
    return NextResponse.json(
      { error: 'Failed to list workflows' },
      { status: 500 }
    );
  }
}
