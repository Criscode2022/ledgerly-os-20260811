#!/bin/sh
set -eu
cd /workspace

if curl -sf -o /dev/null --max-time 2 http://127.0.0.1:8080/ && curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3001/api/health; then
  exit 0
fi

# API
if ! curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3001/api/health; then
  PORT=3001 npm run dev --prefix apps/api >>/tmp/ledgerly-api.log 2>&1 &
fi

# Web (live preview port)
if ! curl -sf -o /dev/null --max-time 2 http://127.0.0.1:8080/; then
  npm run start --prefix apps/web -- --host 0.0.0.0 --port 8080 --proxy-config proxy.conf.json >>/tmp/ledgerly-web.log 2>&1 &
fi

# Wait for readiness
for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15; do
  if curl -sf -o /dev/null --max-time 2 http://127.0.0.1:8080/ && curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3001/api/health; then
    exit 0
  fi
  sleep 1
done
exit 0
