#!/bin/sh
set -e

echo "Running database migrations..."
cd /app/packages/backend
if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations)" ]; then
  prisma migrate deploy
else
  prisma db push --accept-data-loss
fi

echo "Starting backend server..."
exec node /app/packages/backend/dist/index.js
