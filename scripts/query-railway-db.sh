#!/bin/bash

# Get Railway database connection string
DB_URL=$(railway variables --json | jq -r '.DATABASE_URL')

# Get public hostname (not internal)
DB_PUBLIC_URL=$(railway variables --json | jq -r '.DATABASE_PUBLIC_URL // empty')

echo "🔍 Querying Railway database..."
echo ""

# Use railway shell to run psql command
railway shell << 'EOF'
psql $DATABASE_URL -c "\dt" -c "SELECT schemaname, tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;"
EOF
