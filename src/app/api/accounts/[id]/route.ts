import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { useSQLite, sqliteDb, postgresDb } from '@/lib/db';
import { accountsTableSQLite } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: accountId } = await params;

    if (useSQLite) {
      if (!sqliteDb) throw new Error('SQLite database not initialized');

      // Delete the account (with ownership check)
      const result = await sqliteDb
        .delete(accountsTableSQLite)
        .where(
          and(
            eq(accountsTableSQLite.id, accountId),
            eq(accountsTableSQLite.userId, session.user.id)
          )
        )
        .returning();

      if (result.length === 0) {
        return NextResponse.json(
          { error: 'Account not found or unauthorized' },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true });
    } else {
      if (!postgresDb) throw new Error('PostgreSQL database not initialized');
      // TODO: Implement PostgreSQL
      return NextResponse.json({ error: 'PostgreSQL not yet supported' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error disconnecting account:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect account' },
      { status: 500 }
    );
  }
}
