#!/bin/bash
# Start backend and frontend in parallel
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Starting School Dashboard..."

# Start backend
cd "$SCRIPT_DIR/backend"
node server.js &
BACKEND_PID=$!
echo "Backend started (PID: $BACKEND_PID) → http://localhost:3001"

# Start frontend
cd "$SCRIPT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!
echo "Frontend started (PID: $FRONTEND_PID) → http://localhost:5173"

echo ""
echo "Dashboard: http://localhost:5173"
echo "Press Ctrl+C to stop both servers."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Stopped.'" EXIT
wait
