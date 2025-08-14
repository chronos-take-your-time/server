#!/bin/bash

# Start the server, verifying environment and dependencies
set -e

# Check for .env file
if [[ ! -f .env ]]; then
    echo "Error: .env file is missing. Please create it based on .env.example." >&2
    exit 1
fi

# Check required environment variables
for var in NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY CLERK_SECRET_KEY; do
    if ! grep -q "^$var=" .env; then
        echo "Error: $var is missing in .env file. Please add it as specified in .env.example." >&2
        exit 1
    fi
done

# Check for required commands
for cmd in npm docker; do
    if ! command -v "$cmd" >/dev/null 2>&1; then
        echo "Error: $cmd is not installed. Please install $cmd before running this script." >&2
        exit 1
    fi
done

# Clean start the server
docker compose down
docker compose build --no-cache
docker compose up