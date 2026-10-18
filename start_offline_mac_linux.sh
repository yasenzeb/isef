#!/bin/bash
# SciNexa Virtual Laboratory Engine - Portable Unix/Mac Launcher
cd "$(dirname "$0")"

PORT=5173
echo "==================================================================="
echo "    SciNexa Virtual Laboratory Engine - Unix/Mac Launcher"
echo "==================================================================="

# Target dist directory
SERVE_DIR="./dist"
if [ ! -d "$SERVE_DIR" ]; then
    SERVE_DIR="."
fi

# Try Python 3
if command -v python3 &>/dev/null; then
    echo "Starting with Python 3 at http://localhost:$PORT..."
    (sleep 1 && (open "http://localhost:$PORT" || xdg-open "http://localhost:$PORT")) &
    python3 -m http.server $PORT --directory "$SERVE_DIR"
    exit 0
fi

# Try npx
if command -v npx &>/dev/null; then
    echo "Starting with npx serve at http://localhost:$PORT..."
    (sleep 1 && (open "http://localhost:$PORT" || xdg-open "http://localhost:$PORT")) &
    npx serve -s "$SERVE_DIR" -l $PORT
    exit 0
fi

echo "Please install Python or Node to run locally on Mac/Linux."
