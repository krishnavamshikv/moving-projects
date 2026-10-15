#!/usr/bin/env bash
# Unified development server launcher for Algo Trading Platform

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "=================================================="
echo " Starting Nifty 100 Algo Trading Platform"
echo "=================================================="

# Function to clean up background processes on exit
cleanup() {
    echo ""
    echo "Shutting down servers..."
    if [ -n "$BACKEND_PID" ]; then
        kill "$BACKEND_PID" 2>/dev/null || true
    fi
    if [ -n "$FRONTEND_PID" ]; then
        kill "$FRONTEND_PID" 2>/dev/null || true
    fi
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# 1. Start FastAPI backend
echo "-> Starting FastAPI Backend on http://localhost:8000..."
"$PROJECT_ROOT/.venv/bin/uvicorn" src.api.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# Wait briefly for backend to start
sleep 2

# 2. Start Vite frontend
echo "-> Starting Vite React Frontend on http://localhost:5173..."
cd "$PROJECT_ROOT/frontend"
npm run dev -- --host 0.0.0.0 --port 5173 &
FRONTEND_PID=$!

echo ""
echo "=================================================="
echo "✓ Backend API: http://localhost:8000/docs"
echo "✓ Frontend UI: http://localhost:5173"
echo "Press Ctrl+C to stop both servers."
echo "=================================================="

wait
