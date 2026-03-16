#!/bin/bash
# Uses Calibre's built-in Economist recipe to fetch the weekly issue
# Outputs EPUB to ~/economist-epub/output/

OUTPUT_DIR="$HOME/economist-epub/output"
LOG_FILE="$HOME/economist-epub/logs/$(date +%Y%m%d-%H%M%S).log"

mkdir -p "$OUTPUT_DIR"

echo "Fetching The Economist... (log: $LOG_FILE)"

# Run Calibre's news fetch
# --username/--password needed if Economist requires login
# Remove those flags if not using a subscription
ebook-convert \
    "The Economist.recipe" \
    "$OUTPUT_DIR/economist-$(date +%Y%m%d).epub" \
    --username "your-email@example.com" \
    --password "your-password" \
    --output-profile kindle \
    2>&1 | tee "$LOG_FILE"

if [ $? -eq 0 ]; then
    echo "Success! EPUB created: $OUTPUT_DIR/economist-$(date +%Y%m%d).epub"
    
    # List all available EPUBs
    echo ""
    echo "Available EPUBs:"
    ls -la "$OUTPUT_DIR"/*.epub 2>/dev/null || echo "No EPUBs found"
else
    echo "Failed to fetch The Economist. Check $LOG_FILE"
    exit 1
fi
