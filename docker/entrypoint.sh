#!/bin/sh
set -eu

npx prisma migrate deploy
node dist/core/database/seed.js
exec node dist/main.js
