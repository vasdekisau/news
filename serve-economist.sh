#!/bin/bash
# Serves Economist EPUBs via Tailscale

OUTPUT_DIR="$HOME/economist-epub/output"
PORT=8080

echo "Serving EPUBs on port $PORT..."
echo "Access via: http://$(hostname).local:$PORT"
echo "Tailscale: use 'tailscale status' to get your tailnet URL"
echo ""
echo "Available EPUBs:"
ls -la "$OUTPUT_DIR"/*.epub 2>/dev/null || echo "No EPUBs yet - run fetch-economist.sh first"

cd "$OUTPUT_DIR"
python3 -m http.server $PORT
