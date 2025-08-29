import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';
dotenv.config();

class DatabaseService {
    constructor() {
        this.driver = null;
        this.session = null;
        this.maxRetries = 30; // Maximum retry attempts
        this.retryDelay = 2000; // Delay between retries in milliseconds
    }

    async connect() {
        let retries = 0;

        while (retries < this.maxRetries) {
            try {
                console.log(`Attempting to connect to Neo4j (attempt ${retries + 1}/${this.maxRetries})...`);

                // Neo4j connection configuration
                const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
                const username = process.env.NEO4J_USERNAME || 'neo4j';
                const password = process.env.NEO4J_PASSWORD || 'flagright123';

                console.log(`🔗 Neo4j URI: ${uri}`);
                console.log(`👤 Neo4j Username: ${username}`);

                console.log(`Connecting to: ${uri}`);

                this.driver = neo4j.driver(uri, neo4j.auth.basic(username, password));

                // Test the connection
                const serverInfo = await this.driver.getServerInfo();
                console.log('✅ Successfully connected to Neo4j:', serverInfo);
                return;

            } catch (error) {
                retries++;
                console.log(`❌ Connection attempt ${retries} failed:`, error.message);

                if (retries >= this.maxRetries) {
                    console.error('❌ Max retries reached. Failed to connect to Neo4j.');
                    throw error;
                }

                console.log(`⏳ Waiting ${this.retryDelay}ms before retry...`);
                await this.sleep(this.retryDelay);
            }
        }
    }

    // Helper method to sleep
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getSession() {
        if (!this.driver) {
            throw new Error('Database not connected. Call connect() first.');
        }
        return this.driver.session();
    }

    async close() {
        if (this.driver) {
            await this.driver.close();
        }
    }

    async initializeConstraints() {
        const session = this.getSession();

        try {
            // Create constraints and indexes for better performance
            const constraints = [
                // User constraints
                'CREATE CONSTRAINT user_id_unique IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE',
                // Removed email unique constraint to allow shared emails for fraud detection

                // Transaction constraints
                'CREATE CONSTRAINT transaction_id_unique IF NOT EXISTS FOR (t:Transaction) REQUIRE t.id IS UNIQUE',

                // Indexes for better query performance
                'CREATE INDEX user_phone_index IF NOT EXISTS FOR (u:User) ON (u.phone)',
                'CREATE INDEX user_address_index IF NOT EXISTS FOR (u:User) ON (u.address)',
                'CREATE INDEX transaction_amount_index IF NOT EXISTS FOR (t:Transaction) ON (t.amount)',
                'CREATE INDEX transaction_timestamp_index IF NOT EXISTS FOR (t:Transaction) ON (t.timestamp)'
            ];

            for (const constraint of constraints) {
                await session.run(constraint);
            }
        } finally {
            await session.close();
        }
    }

    async runQuery(query, parameters = {}) {
        const session = this.getSession();

        try {
            const result = await session.run(query, parameters);
            return result;
        } finally {
            await session.close();
        }
    }

    async runTransaction(transactionFunction) {
        const session = this.getSession();

        try {
            return await session.executeWrite(transactionFunction);
        } finally {
            await session.close();
        }
    }

    // Helper method to convert Neo4j records to plain objects
    recordsToObjects(records) {
        return records.map(record => {
            const obj = {};
            record.keys.forEach(key => {
                const value = record.get(key);
                if (value && typeof value === 'object' && value.properties) {
                    // Neo4j node or relationship
                    obj[key] = value.properties;
                } else {
                    obj[key] = value;
                }
            });
            return obj;
        });
    }

    // Helper method to convert Neo4j types to JavaScript types
    convertNeo4jIntegers(obj) {
        if (obj && typeof obj === 'object') {
            // Create a new object to avoid modifying read-only Neo4j objects
            const converted = {};

            for (const key in obj) {
                const value = obj[key];

                if (neo4j.isInt(value)) {
                    converted[key] = value.toNumber();
                } else if (neo4j.isDateTime(value)) {
                    converted[key] = value.toString();
                } else if (neo4j.isDate(value)) {
                    converted[key] = value.toString();
                } else if (neo4j.isTime(value)) {
                    converted[key] = value.toString();
                } else if (neo4j.isLocalDateTime(value)) {
                    converted[key] = value.toString();
                } else if (neo4j.isLocalTime(value)) {
                    converted[key] = value.toString();
                } else if (typeof value === 'object' && value !== null) {
                    converted[key] = this.convertNeo4jIntegers(value);
                } else if (key === 'metadata' && typeof value === 'string') {
                    // Parse metadata string back to object
                    try {
                        converted[key] = JSON.parse(value);
                    } catch (error) {
                        console.warn('Failed to parse metadata:', error.message);
                        converted[key] = {};
                    }
                } else {
                    converted[key] = value;
                }
            }

            return converted;
        }
        return obj;
    }
}

export default new DatabaseService();
