#!/bin/bash
# Cron script: fetch + notify

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
OUTPUT_DIR="$HOME/economist-epub/output"
LOG_DIR="$HOME/economist-epub/logs"

LATEST_BEFORE=$(ls -1t "$OUTPUT_DIR"/economist-*.epub 2>/dev/null | head -1)

"$SCRIPT_DIR/fetch-economist.sh"

LATEST_AFTER=$(ls -1t "$OUTPUT_DIR"/economist-*.epub 2>/dev/null | head -1)

if [ "$LATEST_AFTER" != "$LATEST_BEFORE" ] && [ -n "$LATEST_AFTER" ]; then
    echo "New Economist downloaded: $LATEST_AFTER"
    
    # Optional: notify via Tailscale or webhook
    # curl -s -d "New Economist: $(basename $LATEST_AFTER)" "your-webhook-url"
fi
