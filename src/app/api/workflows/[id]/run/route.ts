import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { executeWorkflow } from '@/lib/workflows/executor';

export const dynamic = 'force-dynamic';

/**
 * POST /api/workflows/[id]/run
 * Execute a workflow manually
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    // Optional: Accept trigger data from request body
    const body = await request.json().catch(() => ({}));
    const triggerData = body.triggerData || {};

    // Execute the workflow
    const result = await executeWorkflow(
      id,
      session.user.id,
      'manual',
      triggerData
    );

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          errorStep: result.errorStep,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      output: result.output,
    });
  } catch (error) {
    console.error('Failed to execute workflow:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
