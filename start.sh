#!/bin/bash

# ensure env file exists
if [ ! -f .env ]; then
    echo "Error: .env file is missing. Please create it based on .env.example."
    exit 1
fi

# ensure api key is set in .env file
if ! grep -q "API_KEY=" .env; then
    echo "Error: API_KEY is missing in .env file. Please add your API key as specified in .env.example."
    exit 1
fi

# ensure user has npm installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed. Please install npm before running this script."
    exit 1
fi

docker compose down
docker compose build --no-cache
docker compose up