#!/bin/bash
# Calibre + Tailscale setup for The Economist EPUB automation
# Run this once on your WSL Ubuntu machine

set -e

echo "=== Installing Calibre ==="
sudo apt update
sudo apt install -y calibre

echo "=== Verifying Calibre installation ==="
which ebook-convert || { echo "ebook-convert not found"; exit 1; }
echo "Calibre installed: $(ebook-convert --version)"

echo "=== Checking Tailscale ==="
if command -v tailscale &> /dev/null; then
    echo "Tailscale found: $(tailscale --version)"
else
    echo "Installing Tailscale..."
    curl -fsSL https://tailscale.com/install.sh | sh
fi

echo "=== Creating directories ==="
mkdir -p ~/economist-epub/output
mkdir -p ~/economist-epub/logs

echo "=== Setup complete! ==="
echo ""
echo "Next steps:"
echo "1. Run: tailscale up"
echo "2. Run: ./fetch-economist.sh"
echo "3. Run: ./serve-economist.sh"
