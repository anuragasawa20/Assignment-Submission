// External dependencies
import express from 'express';
import cors from 'cors';

// Database Service
import DatabaseService from './services/databaseService.js';

// Services
import UserService from './services/userService.js';
import TransactionService from './services/transactionService.js';

// Controllers
import UserController from './controllers/userController.js';
import TransactionController from './controllers/transactionController.js';
import RelationshipController from './controllers/relationshipController.js';

// Routes
import setupUserRoutes from './routes/userRoutes.js';
import setupTransactionRoutes from './routes/transactionRoutes.js';
import setupRelationshipRoutes from './routes/relationshipRoutes.js';

export default function createContainer() {
    const container = {};

    // PHASE 1: EXTERNAL DEPENDENCIES - Third-party modules
    container.express = express;
    container.cors = cors;

    // PHASE 2: CORE SERVICES - Foundation services (singletons)
    container.databaseService = DatabaseService;

    // PHASE 3: DOMAIN SERVICES - Business logic services
    container.userService = new UserService({
        databaseService: container.databaseService
    });

    container.transactionService = new TransactionService({
        databaseService: container.databaseService,
        userService: container.userService
    });

    // PHASE 4: CONTROLLERS - HTTP request handlers
    container.userController = new UserController({
        userService: container.userService
    });

    container.transactionController = new TransactionController({
        transactionService: container.transactionService
    });

    container.relationshipController = new RelationshipController({
        userService: container.userService,
        transactionService: container.transactionService,
        databaseService: container.databaseService
    });

    // PHASE 5: ROUTES - Route definitions
    container.userRoutes = setupUserRoutes({
        userController: container.userController
    });

    container.transactionRoutes = setupTransactionRoutes({
        transactionController: container.transactionController
    });

    container.relationshipRoutes = setupRelationshipRoutes({
        relationshipController: container.relationshipController
    });

    // PHASE 6: APPLICATION SETUP - Main application routes
    container.setupApiRoutes = (app) => {
        // Middleware - CORS configuration
        const allowedOrigins = [
            'http://localhost:3001',
            'http://localhost:5500',
            process.env.CORS_ORIGIN  // Production frontend URL
        ].filter(Boolean);  // Remove undefined values

        app.use(container.cors({
            origin: allowedOrigins,
            credentials: true
        }));
        app.use(container.express.json());
        app.use(express.static('public')); // Serve HTML, CSS, JS files


        // API Routes
        app.use('/users', container.userRoutes);
        app.use('/transactions', container.transactionRoutes);
        app.use('/relationships', container.relationshipRoutes);

        // Health check endpoint
        app.get('/health', (req, res) => {
            res.json({
                status: 'OK',
                message: 'Flagright Relationship Visualization API is running',
                timestamp: new Date().toISOString()
            });
        });

        // Data management endpoints
        app.post('/api/data/load-sample', async (req, res) => {
            try {
                console.log('🔄 Manual sample data generation triggered via API');

                // Import and run sample data generation
                const { exec } = await import('child_process');
                const { promisify } = await import('util');
                const execAsync = promisify(exec);

                // Run the sample data script
                const { stdout, stderr } = await execAsync('node src/scripts/sampleData.js', {
                    cwd: process.cwd(),
                    env: {
                        ...process.env,
                        NEO4J_URI: process.env.NEO4J_URI || 'neo4j://neo4j:7687',
                        NEO4J_USERNAME: process.env.NEO4J_USERNAME || 'neo4j',
                        NEO4J_PASSWORD: process.env.NEO4J_PASSWORD || 'flagright123'
                    }
                });

                if (stderr) {
                    console.warn('Sample data generation warnings:', stderr);
                }

                console.log('✅ Sample data generation completed via API');
                res.json({
                    status: 'success',
                    message: 'Sample data loaded successfully',
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                console.error('❌ Error generating sample data via API:', error);
                res.status(500).json({
                    status: 'error',
                    message: 'Failed to load sample data',
                    error: error.message
                });
            }
        });

        app.delete('/api/data/clear', async (req, res) => {
            try {
                console.log('🧹 Manual data clearing triggered via API');

                // Clear all data using database service
                const query = 'MATCH (n) DETACH DELETE n';
                await container.databaseService.runQuery(query);

                console.log('✅ All data cleared via API');
                res.json({
                    status: 'success',
                    message: 'All data cleared successfully',
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                console.error('❌ Error clearing data via API:', error);
                res.status(500).json({
                    status: 'error',
                    message: 'Failed to clear data',
                    error: error.message
                });
            }
        });

        // Error handling middleware
        app.use((err, req, res, next) => {
            console.error('Error:', err);
            res.status(500).json({
                error: 'Internal Server Error',
                message: err.message
            });
        });

        // 404 handler
        // app.use('*', (req, res) => {
        //     res.status(404).json({
        //         error: 'Not Found',
        //         message: 'The requested resource was not found'
        //     });
        // });
    };

    return container;
}
