import createContainer from '../container.js';
import dotenv from 'dotenv';
dotenv.config();

class SampleDataGenerator {
    constructor(container) {
        this.container = container;
        this.databaseService = container.databaseService;
        this.userService = container.userService;
        this.transactionService = container.transactionService;
    }

    async generateSampleData() {
        // Check if auto-loading is enabled
        if (process.env.AUTO_LOAD_SAMPLE_DATA === 'false') {
            console.log('⏭️  Auto-loading sample data is disabled. Skipping...');
            return;
        }

        console.log('🚀 Starting sample data generation...');

        try {
            // Connect to database
            await this.databaseService.connect();
            await this.databaseService.initializeConstraints();

            // Clear existing data
            await this.clearExistingData();

            // Generate users with shared attributes
            const users = await this.createSampleUsers();
            console.log(`✅ Created ${users.length} users`);

            // Generate transactions
            const transactions = await this.createSampleTransactions(users);
            console.log(`✅ Created ${transactions.length} transactions`);

            console.log('🎉 Sample data generation completed successfully!');

            // Print summary
            await this.printDataSummary();

        } catch (error) {
            console.error('❌ Error generating sample data:', error);
        } finally {
            await this.databaseService.close();
        }
    }

    async clearExistingData() {
        console.log('🧹 Clearing existing data...');

        const query = `
            MATCH (n)
            DETACH DELETE n
        `;

        await this.databaseService.runQuery(query);
    }

    async createSampleUsers() {
        const users = [
            {
                id: 'user-001',
                name: 'Alice Johnson',
                email: 'alice.johnson@email.com',
                phone: '+1-555-0101',
                address: '123 Main St, New York, NY 10001',
                paymentMethods: ['visa-4532', 'paypal-alice'],
                metadata: { riskLevel: 'low', accountAge: 365 }
            },
            {
                id: 'user-002',
                name: 'Bob Smith',
                email: 'bob.smith@email.com',
                phone: '+1-555-0102',
                address: '456 Oak Ave, New York, NY 10002',
                paymentMethods: ['mastercard-5555', 'bank-account-001'],
                metadata: { riskLevel: 'medium', accountAge: 180 }
            },
            {
                id: 'user-003',
                name: 'Carol Davis',
                email: 'carol.davis@email.com',
                phone: '+1-555-0101', // Shared phone with Alice
                address: '789 Pine Rd, Boston, MA 02101',
                paymentMethods: ['visa-4532', 'apple-pay-carol'], // Shared payment method with Alice
                metadata: { riskLevel: 'high', accountAge: 90 }
            },
            {
                id: 'user-004',
                name: 'David Wilson',
                email: 'david.wilson@email.com',
                phone: '+1-555-0104',
                address: '123 Main St, New York, NY 10001', // Shared address with Alice
                paymentMethods: ['amex-3782', 'crypto-wallet-001'],
                metadata: { riskLevel: 'low', accountAge: 730 }
            },
            {
                id: 'user-005',
                name: 'Eva Brown',
                email: 'eva.brown@email.com',
                phone: '+1-555-0105',
                address: '321 Elm St, Chicago, IL 60601',
                paymentMethods: ['mastercard-5555', 'venmo-eva'], // Shared payment method with Bob
                metadata: { riskLevel: 'medium', accountAge: 270 }
            },
            {
                id: 'user-006',
                name: 'Frank Miller',
                email: 'alice.johnson@email.com', // Shared email with Alice (suspicious!)
                phone: '+1-555-0106',
                address: '654 Cedar Blvd, Miami, FL 33101',
                paymentMethods: ['discover-6011', 'cash-app-frank'],
                metadata: { riskLevel: 'high', accountAge: 30 }
            },
            {
                id: 'user-007',
                name: 'Grace Taylor',
                email: 'grace.taylor@email.com',
                phone: '+1-555-0107',
                address: '987 Maple Dr, Seattle, WA 98101',
                paymentMethods: ['visa-4111', 'google-pay-grace'],
                metadata: { riskLevel: 'low', accountAge: 540 }
            },
            {
                id: 'user-008',
                name: 'Henry Anderson',
                email: 'henry.anderson@email.com',
                phone: '+1-555-0102', // Shared phone with Bob
                address: '147 Birch Ln, Denver, CO 80201',
                paymentMethods: ['mastercard-2222', 'zelle-henry'],
                metadata: { riskLevel: 'medium', accountAge: 420 }
            },
            {
                id: 'user-009',
                name: 'Ivy Chen',
                email: 'ivy.chen@email.com',
                phone: '+1-555-0109',
                address: '789 Pine Rd, Boston, MA 02101', // Shared address with Carol
                paymentMethods: ['visa-4000', 'paypal-ivy'],
                metadata: { riskLevel: 'low', accountAge: 200 }
            },
            {
                id: 'user-010',
                name: 'Jack Robinson',
                email: 'jack.robinson@email.com',
                phone: '+1-555-0110',
                address: '258 Spruce St, Austin, TX 78701',
                paymentMethods: ['amex-3456', 'bitcoin-wallet-jack'],
                metadata: { riskLevel: 'high', accountAge: 60 }
            }
        ];

        const createdUsers = [];
        for (const userData of users) {
            const user = await this.userService.createOrUpdateUser(userData);
            createdUsers.push(user);
        }

        return createdUsers;
    }

    async createSampleTransactions(users) {
        const transactions = [
            {
                id: 'txn-001',
                fromUserId: 'user-001',
                toUserId: 'user-002',
                amount: 150.00,
                currency: 'USD',
                type: 'TRANSFER',
                status: 'COMPLETED',
                description: 'Payment for dinner',
                ipAddress: '192.168.1.100',
                deviceId: 'device-alice-phone',
                metadata: { category: 'personal', merchant: null }
            },
            {
                id: 'txn-002',
                fromUserId: 'user-003',
                toUserId: 'user-001',
                amount: 75.50,
                currency: 'USD',
                type: 'TRANSFER',
                status: 'COMPLETED',
                description: 'Shared taxi fare',
                ipAddress: '192.168.1.100', // Same IP as txn-001 (suspicious)
                deviceId: 'device-carol-laptop',
                metadata: { category: 'transportation', merchant: 'TaxiCorp' }
            },
            {
                id: 'txn-003',
                fromUserId: 'user-004',
                toUserId: 'user-005',
                amount: 500.00,
                currency: 'USD',
                type: 'TRANSFER',
                status: 'COMPLETED',
                description: 'Rent payment',
                ipAddress: '10.0.0.50',
                deviceId: 'device-david-desktop',
                metadata: { category: 'housing', recurring: true }
            },
            {
                id: 'txn-004',
                fromUserId: 'user-006',
                toUserId: 'user-007',
                amount: 25.00,
                currency: 'USD',
                type: 'TRANSFER',
                status: 'COMPLETED',
                description: 'Coffee money',
                ipAddress: '192.168.1.100', // Same IP as txn-001 and txn-002 (very suspicious)
                deviceId: 'device-frank-mobile',
                metadata: { category: 'food', merchant: 'CoffeeShop' }
            },
            {
                id: 'txn-005',
                fromUserId: 'user-002',
                toUserId: 'user-008',
                amount: 300.00,
                currency: 'USD',
                type: 'TRANSFER',
                status: 'COMPLETED',
                description: 'Loan repayment',
                ipAddress: '172.16.0.10',
                deviceId: 'device-bob-tablet',
                metadata: { category: 'loan', installment: 1 }
            },
            {
                id: 'txn-006',
                fromUserId: 'user-009',
                toUserId: 'user-010',
                amount: 120.00,
                currency: 'USD',
                type: 'TRANSFER',
                status: 'COMPLETED',
                description: 'Book purchase',
                ipAddress: '203.0.113.15',
                deviceId: 'device-ivy-phone',
                metadata: { category: 'education', merchant: 'BookStore' }
            },
            {
                id: 'txn-007',
                fromUserId: 'user-007',
                toUserId: 'user-003',
                amount: 89.99,
                currency: 'USD',
                type: 'TRANSFER',
                status: 'COMPLETED',
                description: 'Concert tickets',
                ipAddress: '198.51.100.5',
                deviceId: 'device-grace-laptop',
                metadata: { category: 'entertainment', event: 'MusicFest2024' }
            },
            {
                id: 'txn-008',
                fromUserId: 'user-010',
                toUserId: 'user-001',
                amount: 200.00,
                currency: 'USD',
                type: 'TRANSFER',
                status: 'COMPLETED',
                description: 'Freelance work payment',
                ipAddress: '203.0.113.15', // Same IP as txn-006 (device sharing)
                deviceId: 'device-jack-desktop',
                metadata: { category: 'work', project: 'WebDesign' }
            },
            {
                id: 'txn-009',
                fromUserId: 'user-005',
                toUserId: 'user-004',
                amount: 45.00,
                currency: 'USD',
                type: 'TRANSFER',
                status: 'COMPLETED',
                description: 'Grocery split',
                ipAddress: '10.0.0.50', // Same IP as txn-003
                deviceId: 'device-eva-phone',
                metadata: { category: 'food', shared: true }
            },
            {
                id: 'txn-010',
                fromUserId: 'user-008',
                toUserId: 'user-006',
                amount: 1000.00,
                currency: 'USD',
                type: 'TRANSFER',
                status: 'COMPLETED',
                description: 'Investment return',
                ipAddress: '172.16.0.10', // Same IP as txn-005
                deviceId: 'device-henry-laptop',
                metadata: { category: 'investment', returns: true }
            },
            {
                id: 'txn-011',
                fromUserId: 'user-001',
                toUserId: 'user-009',
                amount: 65.00,
                currency: 'USD',
                type: 'TRANSFER',
                status: 'COMPLETED',
                description: 'Gift money',
                ipAddress: '192.168.1.101',
                deviceId: 'device-alice-phone', // Same device as txn-001
                metadata: { category: 'gift', occasion: 'birthday' }
            },
            {
                id: 'txn-012',
                fromUserId: 'user-004',
                toUserId: 'user-007',
                amount: 180.00,
                currency: 'USD',
                type: 'TRANSFER',
                status: 'COMPLETED',
                description: 'Service payment',
                ipAddress: '10.0.0.51',
                deviceId: 'device-david-mobile',
                metadata: { category: 'services', type: 'consulting' }
            },
            {
                id: 'txn-013',
                fromUserId: 'user-003',
                toUserId: 'user-005',
                amount: 95.00,
                currency: 'USD',
                type: 'TRANSFER',
                status: 'COMPLETED',
                description: 'Utility bill split',
                ipAddress: '198.51.100.6',
                deviceId: 'device-carol-laptop', // Same device as txn-002
                metadata: { category: 'utilities', shared: true }
            },
            {
                id: 'txn-014',
                fromUserId: 'user-009',
                toUserId: 'user-002',
                amount: 35.00,
                currency: 'USD',
                type: 'TRANSFER',
                status: 'COMPLETED',
                description: 'Parking fee',
                ipAddress: '203.0.113.16',
                deviceId: 'device-ivy-tablet',
                metadata: { category: 'transportation', parking: true }
            },
            {
                id: 'txn-015',
                fromUserId: 'user-006',
                toUserId: 'user-010',
                amount: 250.00,
                currency: 'USD',
                type: 'TRANSFER',
                status: 'COMPLETED',
                description: 'Equipment purchase',
                ipAddress: '192.168.1.100', // Same suspicious IP again
                deviceId: 'device-frank-desktop',
                metadata: { category: 'equipment', business: true }
            }
        ];

        const createdTransactions = [];
        for (const transactionData of transactions) {
            const transaction = await this.transactionService.createOrUpdateTransaction(transactionData);
            createdTransactions.push(transaction);
        }

        return createdTransactions;
    }

    async printDataSummary() {
        console.log('\n📊 Data Summary:');

        // Count users and transactions
        const userCountQuery = 'MATCH (u:User) RETURN count(u) as userCount';
        const transactionCountQuery = 'MATCH (t:Transaction) RETURN count(t) as transactionCount';

        const userResult = await this.databaseService.runQuery(userCountQuery);
        const transactionResult = await this.databaseService.runQuery(transactionCountQuery);

        console.log(`👥 Total Users: ${userResult.records[0].get('userCount').toNumber()}`);
        console.log(`💸 Total Transactions: ${transactionResult.records[0].get('transactionCount').toNumber()}`);

        // Count relationships
        const relationshipQuery = `
            MATCH ()-[r]->()
            WITH type(r) as relType, count(r) as count
            RETURN relType, count
            ORDER BY count DESC
        `;

        const relationshipResult = await this.databaseService.runQuery(relationshipQuery);

        console.log('\n🔗 Relationship Breakdown:');
        relationshipResult.records.forEach(record => {
            const relType = record.get('relType');
            const count = record.get('count').toNumber();
            console.log(`  ${relType}: ${count}`);
        });

        // Show shared attributes
        const sharedAttrQuery = `
            MATCH ()-[r:SHARED_EMAIL|SHARED_PHONE|SHARED_ADDRESS|SHARED_PAYMENT_METHOD]-()
            WITH type(r) as sharedType, count(r)/2 as count
            RETURN sharedType, count
            ORDER BY count DESC
        `;

        const sharedAttrResult = await this.databaseService.runQuery(sharedAttrQuery);

        console.log('\n🤝 Shared Attributes:');
        sharedAttrResult.records.forEach(record => {
            const sharedType = record.get('sharedType');
            const count = record.get('count').toNumber();
            console.log(`  ${sharedType}: ${count} connections`);
        });

        // Show transaction patterns
        const transactionPatternQuery = `
            MATCH ()-[r:SHARED_IP|SHARED_DEVICE]-()
            WITH type(r) as patternType, count(r)/2 as count
            RETURN patternType, count
            ORDER BY count DESC
        `;

        const patternResult = await this.databaseService.runQuery(transactionPatternQuery);

        console.log('\n🔍 Transaction Patterns:');
        patternResult.records.forEach(record => {
            const patternType = record.get('patternType');
            const count = record.get('count').toNumber();
            console.log(`  ${patternType}: ${count} connections`);
        });

        console.log('\n🎯 Key Insights:');
        console.log('  • Alice and Frank share the same email (potential fraud)');
        console.log('  • Multiple transactions from IP 192.168.1.100 (device sharing)');
        console.log('  • Carol and Alice share phone number (family/business connection)');
        console.log('  • David and Alice share address (roommates/family)');
        console.log('  • Several users share payment methods (joint accounts)');
    }
}

// Run the script if called directly
async function main() {
    const container = createContainer();
    const generator = new SampleDataGenerator(container);
    await generator.generateSampleData();
}

// Check if this module is being run directly
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (process.argv[1] === __filename) {
    main().catch(console.error);
}

export default SampleDataGenerator;