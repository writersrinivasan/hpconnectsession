#!/usr/bin/env bash
# One command for show day: installs (if needed), builds and starts both apps.
#   Keynote → http://localhost:3000   (presenter view: /presenter)
#   Studio  → http://localhost:3001
set -euo pipefail
cd "$(dirname "$0")"
MODE="${1:-prod}"   # ./start.sh dev  → hot-reload dev servers

for app in keynote studio; do
  [ -d "$app/node_modules" ] || (cd "$app" && npm install)
done

if [ "$MODE" = "dev" ]; then
  (cd studio && npm run dev) &
  (cd keynote && npm run dev) &
else
  (cd studio && npm run build && npm run start) &
  (cd keynote && npm run build && npm run start) &
fi

trap 'kill 0' EXIT
wait
