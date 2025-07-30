#!/bin/bash

# THIS SCRIPT IS USED TO START THE SERVER PROPERLY, VERIFYING ENVIRONMENT AND DEPENDENCIES

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

# ensure user has docker installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed. Please install Docker before running this script."
    exit 1
fi

# clean start the server
docker compose down
docker compose build --no-cache
docker compose up