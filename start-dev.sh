#!/bin/bash

echo "🚀 Starting Flagright Development Environment..."

# Build and start services
echo "📦 Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
echo "   This may take a few minutes on first run..."

# Wait for Neo4j to be healthy
echo "🔄 Waiting for Neo4j to be ready..."
while ! docker-compose exec -T neo4j wget --no-verbose --tries=1 --spider http://localhost:7474/browser/ >/dev/null 2>&1; do
    echo "   Neo4j still starting... waiting 10 seconds"
    sleep 10
done
echo "✅ Neo4j is ready!"

# Wait for backend to be healthy
echo "🔄 Waiting for backend to be ready..."
while ! docker-compose exec -T backend wget --no-verbose --tries=1 --spider http://localhost:3000/health >/dev/null 2>&1; do
    echo "   Backend still starting... waiting 10 seconds"
    sleep 10
done
echo "✅ Backend is ready!"

# Wait for frontend to be ready
echo "🔄 Waiting for frontend to be ready..."
sleep 15
echo "✅ Frontend should be ready!"

# Show service status
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "🌐 Services are running on:"
echo "   Frontend: http://localhost:3001"
echo "   Backend:  http://localhost:3000"
echo "   Neo4j:    http://localhost:7474"
echo ""
echo "📝 To view logs: docker-compose logs -f"
echo "🛑 To stop: ./stop-dev.sh"
echo ""
echo "✨ Development environment is ready!"