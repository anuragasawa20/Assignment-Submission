#!/bin/bash

echo "🛑 Stopping Flagright Development Environment..."

# Stop and remove containers
docker-compose down

echo "🧹 Cleaning up..."
docker system prune -f

echo "✅ Development environment stopped and cleaned up!"
