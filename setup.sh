#!/bin/bash

# Claude Swarm Docker Setup Script

echo "Setting up Claude Swarm Docker environment..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "Please edit .env file and add your ANTHROPIC_API_KEY"
fi

# Create necessary directories
mkdir -p logs projects

# Build Docker image
echo "Building Docker image..."
docker-compose build

# Start services
echo "Starting services..."
docker-compose up -d

# Check status
echo "Checking service status..."
docker-compose ps

echo "Setup complete! Claude Swarm is running."
echo "Access the service at http://localhost:8080"