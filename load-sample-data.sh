#!/bin/bash

# Simple script to load sample data into Neo4j

echo "📊 Loading sample data into Neo4j..."

# Check if services are running
if ! docker ps --format "table {{.Names}}" | grep -q "flagright-backend"; then
    echo "❌ Backend service is not running. Please start services first with:"
    echo "   docker-compose up -d"
    exit 1
fi

# Load sample data
echo "🚀 Executing sample data script..."
docker-compose exec backend node src/scripts/sampleData.js

if [ $? -eq 0 ]; then
    echo "✅ Sample data loaded successfully!"
    echo ""
    echo "🌐 You can now access:"
    echo "   Frontend: http://localhost:3001"
    echo "   Neo4j Browser: http://localhost:7474 (neo4j/flagright123)"
else
    echo "❌ Failed to load sample data. Check logs with:"
    echo "   docker-compose logs backend"
fi
