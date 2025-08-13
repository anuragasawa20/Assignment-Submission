# Flagright Relationship Visualization System

A comprehensive system for visualizing relationships between user accounts using transaction data and shared attributes in a graph database environment. Built with a modern modular JavaScript architecture and Neo4j graph database.

## 🚀 Quick Start

### Prerequisites
- Docker (version 20.10+)
- Docker Compose (version 2.0+)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### 1. Clone and Run
```bash
# Clone the repository
git clone <your-repo-url>
cd Flagright

# Start all services
./start-dev.sh

# Or manually:
docker-compose up --build -d
```

### 2. Access the Application
- **Frontend**: http://localhost:3001 (Interactive visualization interface)
- **Backend API**: http://localhost:3000 (Node.js REST API)
- **Neo4j Browser**: http://localhost:7474
  - Username: `neo4j`
  - Password: `flagright123`

## 🏗️ Architecture Overview

### Frontend Architecture
The frontend uses a **modular ES6 architecture** with clear separation of concerns:

```
frontend/js/
├── main.js                 # Application entry point and coordination
├── api.js                  # API layer and data management
├── graph-explorer.js       # Main graph visualization (explorerCy)
├── graph-transactions.js   # Transaction relationship graph
├── ui.js                   # User interface and DOM manipulation
└── utils.js                # Utility functions and graph styles
```

### Backend Architecture
- **Node.js** with ES6 modules
- **Express.js** REST API
- **Neo4j** graph database
- **Dependency Injection** pattern for clean architecture

### Key Features
- **Interactive Graph Visualization**: Cytoscape.js-powered network graphs
- **Real-time Data Loading**: Dynamic API integration
- **Modular Codebase**: Clean, maintainable, and testable
- **Responsive Design**: Works on all device sizes
- **Advanced Search & Filtering**: Real-time data exploration

## 🛠️ Development Environment

### Docker Setup
- **Frontend**: Node.js development server with hot reload
- **Backend**: Node.js with nodemon for automatic restarts
- **Database**: Neo4j with APOC plugins
- **Data Initialization**: Automatic sample data loading

### Development Scripts
```bash
# Start development environment
./start-dev.sh

# Stop and clean up
./stop-dev.sh

# Test the setup
./test-setup.sh

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 📊 Data Management

### Automatic Data Loading (Default)
- **Service**: `data-init` container runs on startup
- **When**: Every time you start the application
- **Best for**: Development, testing, and fresh installations

### Manual Data Management
```bash
# Load sample data via API
curl -X POST http://localhost:3000/api/data/load-sample

# Clear all data via API
curl -X DELETE http://localhost:3000/api/data/clear

# Or use the provided script
./load-sample-data.sh
```

## 🎯 Core Functionality

### 1. Graph Explorer
- **User Nodes**: Color-coded by risk level (low/medium/high)
- **Transaction Nodes**: Financial transaction visualization
- **Relationship Edges**: Shared attributes and transaction flows
- **Interactive Features**: Click, hover, zoom, and pan

### 2. Transaction Relationships
- **Transaction Analysis**: Deep dive into specific transactions
- **Shared Attributes**: IP addresses, devices, payment methods
- **Network Mapping**: Visualize transaction networks
- **Risk Assessment**: Identify suspicious patterns

### 3. User Management
- **User Profiles**: Complete user information and metadata
- **Risk Scoring**: Automated risk level assessment
- **Relationship Mapping**: Visualize user connections
- **Search & Filter**: Advanced user discovery

### 4. Data Export
- **CSV Export**: Structured data export for analysis
- **JSON Export**: Complete data dump for processing
- **Real-time Data**: Live data from Neo4j database

## 🗄️ Database Schema

### Neo4j Graph Model
```
(User)-[:HAS_ACCOUNT]->(Account)
(User)-[:SHARES_ATTRIBUTE]->(SharedAttribute)<-[:SHARES_ATTRIBUTE]-(User)
(User)-[:SENT_TO]->(Transaction)-[:RECEIVED_BY]->(User)
(Transaction)-[:SHARES_ATTRIBUTE]->(SharedAttribute)<-[:SHARES_ATTRIBUTE]-(Transaction)
```

### Sample Data Includes
- **Users**: 50+ sample users with realistic profiles
- **Transactions**: 100+ financial transactions
- **Relationships**: Shared emails, phones, addresses, devices
- **Risk Patterns**: Various risk levels and suspicious activities

## 📡 API Endpoints

### Core Endpoints
```
GET    /health                    # Service health status
GET    /users                     # Get all users
GET    /transactions              # Get all transactions
GET    /relationships/user/:id     # Get user relationships
GET    /relationships/transaction/:id # Get transaction relationships
```

### Data Management
```
POST   /api/data/load-sample      # Load sample data
DELETE /api/data/clear            # Clear all data
```

## 🔧 Configuration

### Environment Variables
```bash
# Create .env file to override defaults
NEO4J_PASSWORD=your-password
PORT=3000
AUTO_LOAD_SAMPLE_DATA=false
```

### Default Configuration
- **Neo4j**: neo4j/flagright123
- **Backend**: Port 3000
- **Frontend**: Port 3001
- **Auto-load**: Sample data loads automatically

## 🚨 Troubleshooting

### Common Issues

#### Port Conflicts
```bash
# Check port usage
lsof -i :3000
lsof -i :3001
lsof -i :7474

# Kill processes if needed
kill -9 <PID>
```

#### Services Not Starting
```bash
# Check Docker status
docker-compose ps

# View logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs neo4j
```

#### Database Issues
```bash
# Check Neo4j status
docker exec flagright-neo4j neo4j status

# Test connection
docker exec flagright-backend wget -O- http://neo4j:7474
```

#### Frontend Issues
```bash
# Check browser console for errors
# Verify all JavaScript modules are loading
# Check network tab for API calls
```

### Reset Everything
```bash
# Complete reset
./stop-dev.sh
docker system prune -f
./start-dev.sh
```

## 📁 Project Structure
```
Flagright/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── container.js     # Dependency injection container
│   │   ├── server.js        # Express server setup
│   │   ├── controllers/     # API controllers
│   │   ├── services/        # Business logic services
│   │   └── routes/          # API route definitions
│   └── package.json
├── frontend/                # Modern web application
│   ├── js/                  # Modular JavaScript architecture
│   │   ├── main.js          # Application entry point
│   │   ├── api.js           # API layer
│   │   ├── graph-explorer.js # Main graph visualization
│   │   ├── graph-transactions.js # Transaction graphs
│   │   ├── ui.js            # User interface layer
│   │   └── utils.js         # Utility functions
│   ├── index.html           # Main HTML structure
│   ├── styles.css           # Comprehensive styling
│   └── README.md            # Frontend documentation
├── docker-compose.yml       # Service orchestration
├── start-dev.sh             # Development startup script
├── stop-dev.sh              # Development stop script
├── load-sample-data.sh      # Manual data loading script
└── README.md                # This file
```

## 🧪 Testing

### Manual Testing
1. **Start the application**: `./start-dev.sh`
2. **Open frontend**: http://localhost:3001
3. **Test graph explorer**: Navigate between tabs
4. **Test interactions**: Click nodes, hover edges, use search
5. **Test refresh**: Use refresh button to reload data

### API Testing
```bash
# Test health endpoint
curl http://localhost:3000/health

# Test data loading
curl -X POST http://localhost:3000/api/data/load-sample

# Test user retrieval
curl http://localhost:3000/users
```

## 🔮 Future Enhancements

### Planned Features
- **Real-time Updates**: WebSocket integration for live data
- **Advanced Analytics**: Machine learning for risk detection
- **Mobile App**: React Native mobile application
- **API Documentation**: Swagger/OpenAPI specification
- **Performance Monitoring**: Application performance metrics

### Extensibility
- **Plugin System**: Modular graph visualization plugins
- **Custom Algorithms**: User-defined relationship detection
- **Data Connectors**: Integration with external data sources
- **Reporting Engine**: Advanced reporting and analytics

## 📝 License

This project is licensed under the ISC License.

## 🤝 Contributing

### Development Guidelines
1. **Follow modular architecture**: Keep modules focused and independent
2. **Use ES6 modules**: Import/export syntax for clean dependencies
3. **Maintain separation of concerns**: UI, API, and business logic separation
4. **Write clean code**: Consistent formatting and clear naming
5. **Test thoroughly**: Ensure all functionality works as expected

### Code Standards
- **JavaScript**: ES6+ with modern syntax
- **CSS**: BEM methodology for styling
- **HTML**: Semantic markup with accessibility
- **Architecture**: Dependency injection and modular design

---

For detailed frontend documentation, see [frontend/README.md](frontend/README.md)
