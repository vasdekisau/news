#!/bin/bash
# upload_pdf.sh - Upload a PDF to News Vasdekis for text extraction
# Usage: ./upload_pdf.sh path/to/document.pdf

set -e

API_URL="https://api.vasdekis.com.au/api/pdfs"

if [ -z "$1" ]; then
    echo "Usage: $0 <pdf-file>"
    exit 1
fi

PDF_FILE="$1"

if [ ! -f "$PDF_FILE" ]; then
    echo "Error: File not found: $PDF_FILE"
    exit 1
fi

if [ ! "$PDF_FILE" =~ \.pdf$ ]; then
    echo "Error: File must be a PDF"
    exit 1
fi

echo "Uploading $PDF_FILE..."
response=$(curl -s -X POST "$API_URL" \
    -F "file=@$PDF_FILE")

echo "Response: $response"
