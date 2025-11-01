import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { storeCredential, listCredentials } from '@/lib/workflows/credentials';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * GET /api/credentials
 * List all credentials for the authenticated user
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const credentials = await listCredentials(session.user.id);

    return NextResponse.json({ credentials });
  } catch (error) {
    logger.error({ error }, 'Failed to list credentials');
    return NextResponse.json(
      { error: 'Failed to list credentials' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/credentials
 * Store a new credential
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { platform, name, value, type, metadata } = body;

    // Validate required fields
    if (!platform || !name || !value || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: platform, name, value, type' },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes = ['api_key', 'token', 'secret', 'connection_string'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const result = await storeCredential(session.user.id, {
      platform,
      name,
      value,
      type,
      metadata,
    });

    logger.info(
      { userId: session.user.id, platform, credentialId: result.id },
      'Credential stored'
    );

    return NextResponse.json({ id: result.id }, { status: 201 });
  } catch (error) {
    logger.error({ error }, 'Failed to store credential');
    return NextResponse.json(
      { error: 'Failed to store credential' },
      { status: 500 }
    );
  }
}
