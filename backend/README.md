# Flagright Relationship Visualization System

A prototype system to visualize relationships between user accounts using transaction data and shared attributes in a graph database environment, inspired by Flagright's FRAML API.

## 🎯 Overview

This system uses **Neo4j** graph database to detect and visualize relationships between users and transactions through:

- **Direct Transaction Links**: Credit/debit relationships between users
- **Shared Attribute Links**: Users sharing emails, phones, addresses, or payment methods  
- **Transaction Pattern Links**: Transactions sharing IP addresses or device IDs

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   REST API      │    │   Neo4j Graph   │    │   Sample Data   │
│   (Express.js)  │◄──►│   Database      │◄───│   Generator     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Dependency Injection Architecture

This project follows a **clean dependency injection architecture** with ES6 modules:

```
Container → Services → Controllers → Routes → Server
```

**Key Principles:**
- **ES6 Modules**: Pure `import/export` syntax, no CommonJS
- **Constructor Injection**: All dependencies injected through constructors
- **Centralized Container**: Single source of truth for dependency management
- **Class-Based Design**: Controllers and services as ES6 classes
- **Arrow Functions**: Request handlers use arrow functions to maintain `this` context
- **Functional Routes**: Route definitions as pure functions receiving dependencies

### Components

- **Express.js API**: RESTful endpoints with dependency injection
- **Neo4j Database**: Graph storage with centralized service management
- **Relationship Engine**: Automatic detection of shared attributes and patterns
- **Dependency Container**: Centralized dependency injection system
- **Docker Setup**: Containerized deployment for easy setup and scalability

## 🚀 Quick Start

### Option 1: Docker (Recommended)

1. **Clone and navigate to the project**:
   ```bash
   cd /Users/mavens/Flagright/backend
   ```

2. **Start the services**:
   ```bash
   npm run docker:up
   ```

3. **Check service health**:
   ```bash
   # API health check
   curl http://localhost:3000/health
   
   # Neo4j browser
   open http://localhost:7474
   # Login: neo4j / password123
   ```

4. **View logs**:
   ```bash
   npm run docker:logs
   ```

The sample data will be automatically loaded when the services start.

### Option 2: Local Development

1. **Install Neo4j**:
   ```bash
   # macOS
   brew install neo4j
   
   # Or download from https://neo4j.com/download/
   ```

2. **Start Neo4j**:
   ```bash
   neo4j start
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Set up environment** (create `.env` file):
   ```env
   PORT=3000
   NODE_ENV=development
   NEO4J_URI=bolt://localhost:7687
   NEO4J_USERNAME=neo4j
   NEO4J_PASSWORD=password
   ```

5. **Start the server**:
   ```bash
   npm run dev
   ```

6. **Load sample data**:
   ```bash
   npm run load-sample-data
   ```

## 📊 Sample Data

The system includes comprehensive test data:

- **10 Users** with realistic shared attributes
- **15 Transactions** with various relationship patterns
- **Shared Attributes**: Emails, phones, addresses, payment methods
- **Transaction Patterns**: IP addresses, device IDs

### Key Test Scenarios

- 🚨 **Fraud Pattern**: Alice and Frank share the same email
- 🏠 **Address Sharing**: Alice and David live at the same address  
- 📱 **Device Sharing**: Multiple transactions from IP `192.168.1.100`
- 💳 **Payment Method Sharing**: Several users share payment methods

## 🔗 API Endpoints

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/users` | Add or update user information |
| `GET` | `/users` | List all users |

### Transactions

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/transactions` | Add or update transaction details |
| `GET` | `/transactions` | List all transactions |

### Relationships

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/relationships/user/:id` | Fetch all connections of a user, including direct relationships and transactions |
| `GET` | `/relationships/transaction/:id` | Get transaction relationships |

## 📝 API Examples

### Create a User

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "id": "user-new",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1-555-0199",
    "address": "123 New St, City, State 12345",
    "paymentMethods": ["visa-1234", "paypal-john"],
    "metadata": {"riskLevel": "low", "accountAge": 30}
  }'
```

### Create a Transaction

```bash
curl -X POST http://localhost:3000/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "id": "txn-new",
    "fromUserId": "user-001",
    "toUserId": "user-002",
    "amount": 100.00,
    "currency": "USD",
    "type": "TRANSFER",
    "description": "Test payment",
    "ipAddress": "192.168.1.150",
    "deviceId": "device-test",
    "metadata": {"category": "test"}
  }'
```

### Get User Relationships

```bash
curl http://localhost:3000/relationships/user/user-001
```

### Get Transaction Relationships

```bash
curl http://localhost:3000/relationships/transaction/txn-001
```

## 🔍 Graph Queries

Access Neo4j browser at `http://localhost:7474` and try these Cypher queries:

### View All Relationships
```cypher
MATCH (n)-[r]->(m) 
RETURN n, r, m 
LIMIT 50
```

### Find Users with Shared Emails
```cypher
MATCH (u1:User)-[r:SHARED_EMAIL]-(u2:User) 
RETURN u1.name, u2.name, r.value
```

### Find Suspicious Transaction Patterns
```cypher
MATCH (t1:Transaction)-[r:SHARED_IP]-(t2:Transaction)
RETURN t1.id, t2.id, r.value as sharedIP
```

### High-Risk Users Analysis
```cypher
MATCH (u:User)
OPTIONAL MATCH (u)-[r1:SHARED_EMAIL|SHARED_PHONE|SHARED_ADDRESS|SHARED_PAYMENT_METHOD]-(relatedUser:User)
OPTIONAL MATCH (u)-[r2:SENT_TO|RECEIVED_FROM]-(t:Transaction)
WITH u, count(DISTINCT relatedUser) as connections, count(DISTINCT t) as transactions
WHERE connections > 2 OR transactions > 3
RETURN u.name, u.email, connections, transactions, (connections * 2 + transactions) as riskScore
ORDER BY riskScore DESC
```

## 🛠️ Development

### Project Structure

```
backend/
├── src/
│   ├── container.js         # Dependency injection container
│   ├── server.js            # Application entry point
│   ├── controllers/         # Request handlers (ES6 classes)
│   ├── services/            # Business logic (ES6 classes)
│   ├── routes/              # API route functions
│   └── scripts/             # Utility scripts
├── Dockerfile               # Container definition
├── docker-compose.yml       # Multi-service setup
└── package.json             # Dependencies and scripts (ES6 modules)
```

### Key Features

1. **Dependency Injection Architecture**: Clean, testable, and maintainable code structure following enterprise patterns.

2. **ES6 Module System**: Modern JavaScript with pure `import/export` syntax throughout.

3. **Automatic Relationship Detection**: When users or transactions are created, the system automatically detects and creates relationship edges based on shared attributes.

4. **Graph-Based Queries**: Leverages Neo4j's powerful graph query capabilities for complex relationship analysis.

5. **RESTful API**: Clean, well-documented API following REST principles with proper HTTP status codes.

6. **Containerized Deployment**: Docker setup for easy deployment and scalability.

7. **Sample Data Generation**: Comprehensive test data with realistic fraud patterns.

### Dependency Injection Container

The system uses a centralized container (`src/container.js`) that manages all dependencies:

```javascript
// PHASE 1: External Dependencies
container.express = express;
container.cors = cors;

// PHASE 2: Core Services (singletons)
container.databaseService = DatabaseService;

// PHASE 3: Domain Services (with dependencies)
container.userService = new UserService({
    databaseService: container.databaseService
});

// PHASE 4: Controllers (with service injection)
container.userController = new UserController({
    userService: container.userService
});

// PHASE 5: Routes (functional with dependency injection)
container.userRoutes = setupUserRoutes({
    userController: container.userController
});
```

**Benefits:**
- **Testability**: Easy to mock dependencies for unit testing
- **Maintainability**: Clear separation of concerns
- **Scalability**: Easy to add new modules following the same pattern
- **Flexibility**: Dependencies can be swapped without changing implementation

## 🐳 Docker Commands

```bash
# Build and start services
npm run docker:up

# Stop services
npm run docker:down

# View logs
npm run docker:logs

# Rebuild and restart
npm run docker:down && npm run docker:up

# Access Neo4j shell
docker exec -it flagright-neo4j cypher-shell -u neo4j -p password123
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | API server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `NEO4J_URI` | Neo4j connection URI | `bolt://localhost:7687` |
| `NEO4J_USERNAME` | Neo4j username | `neo4j` |
| `NEO4J_PASSWORD` | Neo4j password | `password` |

## 🚨 Security Considerations

- Change default Neo4j password in production
- Implement authentication and authorization
- Add input validation and sanitization
- Use HTTPS in production
- Implement rate limiting
- Add logging and monitoring

## 📈 Scaling Considerations

- **Database Clustering**: Use Neo4j Enterprise for clustering
- **API Load Balancing**: Deploy multiple API instances behind a load balancer
- **Caching**: Implement Redis for frequently accessed data
- **Monitoring**: Add application performance monitoring (APM)

## 🆘 Troubleshooting

### Neo4j Connection Issues
```bash
# Check if Neo4j is running
docker ps | grep neo4j

# Check Neo4j logs
docker logs flagright-neo4j
```

### API Issues
```bash
# Check API logs
docker logs flagright-api

# Test API health
curl http://localhost:3000/health
```

### Port Conflicts
If ports 3000 or 7474/7687 are in use, modify the `docker-compose.yml` file to use different ports.

---

**Built with ❤️ for Flagright's relationship detection and fraud prevention capabilities**
