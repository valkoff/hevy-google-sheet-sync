#!/bin/bash

# Default port
PORT=${1:-3000}

echo "Testing Hevy Webhook on localhost:$PORT..."

curl -X POST http://localhost:$PORT/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "id": "00000000-0000-0000-0000-000000000001",
    "payload": {
      "workoutId": "f1085cdb-32b2-4003-967d-53a3af8eaecb"
    }
  }'

echo -e "\n\nCheck the server logs to see the result."
