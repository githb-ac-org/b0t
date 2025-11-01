import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { useSQLite, sqliteDb } from '@/lib/db';
import { workflowRunsTableSQLite } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

/**
 * GET /api/workflows/[id]/runs
 * Get execution history for a workflow
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    if (!useSQLite || !sqliteDb) {
      throw new Error('Database not initialized');
    }

    // Get last 10 runs for this workflow
    const runs = await sqliteDb
      .select({
        id: workflowRunsTableSQLite.id,
        status: workflowRunsTableSQLite.status,
        startedAt: workflowRunsTableSQLite.startedAt,
        completedAt: workflowRunsTableSQLite.completedAt,
        duration: workflowRunsTableSQLite.duration,
        error: workflowRunsTableSQLite.error,
        errorStep: workflowRunsTableSQLite.errorStep,
        output: workflowRunsTableSQLite.output,
        triggerType: workflowRunsTableSQLite.triggerType,
      })
      .from(workflowRunsTableSQLite)
      .where(eq(workflowRunsTableSQLite.workflowId, id))
      .orderBy(desc(workflowRunsTableSQLite.startedAt))
      .limit(10);

    // Parse JSON fields
    const parsedRuns = runs.map((run) => ({
      ...run,
      output: run.output ? JSON.parse(run.output as string) : null,
    }));

    return NextResponse.json({ runs: parsedRuns });
  } catch (error) {
    console.error('Failed to fetch workflow runs:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
