import express from 'express';
import createContainer from './container.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database connection
const initializeDatabase = async (container) => {
    try {
        await container.databaseService.connect();
        console.log('Connected to Neo4j database');

        // Initialize database constraints and indexes
        await container.databaseService.initializeConstraints();
        console.log('Database constraints and indexes initialized');
    } catch (error) {
        console.error('Failed to connect to Neo4j:', error);
        process.exit(1);
    }
};

// Graceful shutdown
const setupGracefulShutdown = (container) => {
    process.on('SIGINT', async () => {
        console.log('Shutting down gracefully...');
        await container.databaseService.close();
        process.exit(0);
    });

    process.on('SIGTERM', async () => {
        console.log('Shutting down gracefully...');
        await container.databaseService.close();
        process.exit(0);
    });
};

// Start server
const startServer = async () => {
    try {
        // Create dependency injection container
        const container = createContainer();

        // Initialize database
        await initializeDatabase(container);

        // Setup API routes using container
        container.setupApiRoutes(app);

        // Setup graceful shutdown
        setupGracefulShutdown(container);


        // Start listening
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`📊 Health check: http://localhost:${PORT}/health`);
            console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
