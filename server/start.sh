#!/bin/sh
set -e
echo "Running DB migrations..."
npx drizzle-kit migrate
echo "Starting server..."
node dist/index.js
