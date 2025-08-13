export default class UserService {
    constructor(dependencies) {
        this.databaseService = dependencies.databaseService;
    }

    async createOrUpdateUser(userData) {
        const {
            id,
            name,
            email,
            phone,
            address,
            paymentMethods = [],
            metadata = {}
        } = userData;

        // Convert metadata object to string for Neo4j storage
        const metadataString = JSON.stringify(metadata);

        const query = `
            MERGE (u:User {id: $id})
            ON CREATE SET u.createdAt = datetime()
            ON MATCH SET u.updatedAt = datetime()
            SET u.name = $name,
                u.email = $email,
                u.phone = $phone,
                u.address = $address,
                u.paymentMethods = $paymentMethods,
                u.metadata = $metadataString
            RETURN u
        `;

        const result = await this.databaseService.runQuery(query, {
            id,
            name,
            email,
            phone,
            address,
            paymentMethods,
            metadataString
        });

        if (result.records.length > 0) {
            const user = this.databaseService.convertNeo4jIntegers(result.records[0].get('u').properties);

            // After creating/updating user, detect and create shared attribute relationships
            await this.detectAndCreateSharedAttributeRelationships(id);

            return user;
        }

        throw new Error('Failed to create or update user');
    }

    async getAllUsers() {
        const query = `
            MATCH (u:User)
            RETURN u
            ORDER BY u.createdAt DESC
        `;

        const result = await this.databaseService.runQuery(query);
        return result.records.map(record =>
            this.databaseService.convertNeo4jIntegers(record.get('u').properties)
        );
    }

    async getUserById(id) {
        const query = `
            MATCH (u:User {id: $id})
            RETURN u
        `;

        const result = await this.databaseService.runQuery(query, { id });

        if (result.records.length > 0) {
            return this.databaseService.convertNeo4jIntegers(result.records[0].get('u').properties);
        }

        return null;
    }


    async detectAndCreateSharedAttributeRelationships(userId) {
        const user = await this.getUserById(userId);
        if (!user) return;

        // Find users with shared email
        if (user.email) {
            await this.createSharedAttributeRelationship(
                userId,
                'email',
                user.email,
                'SHARED_EMAIL'
            );
        }

        // Find users with shared phone
        if (user.phone) {
            await this.createSharedAttributeRelationship(
                userId,
                'phone',
                user.phone,
                'SHARED_PHONE'
            );
        }

        // Find users with shared address
        if (user.address) {
            await this.createSharedAttributeRelationship(
                userId,
                'address',
                user.address,
                'SHARED_ADDRESS'
            );
        }

        // Find users with shared payment methods
        if (user.paymentMethods && user.paymentMethods.length > 0) {
            for (const paymentMethod of user.paymentMethods) {
                await this.createSharedPaymentMethodRelationship(userId, paymentMethod);
            }
        }
    }

    async createSharedAttributeRelationship(userId, attributeType, attributeValue, relationshipType) {
        const query = `
            MATCH (u1:User {id: $userId})
            MATCH (u2:User)
            WHERE u2.${attributeType} = $attributeValue AND u2.id <> $userId
            MERGE (u1)-[r:${relationshipType} {
                attribute: $attributeType,
                value: $attributeValue,
                createdAt: datetime()
            }]-(u2)
            RETURN count(r) as relationshipsCreated
        `;

        await this.databaseService.runQuery(query, {
            userId,
            attributeType,
            attributeValue
        });
    }

    async createSharedPaymentMethodRelationship(userId, paymentMethod) {
        const query = `
            MATCH (u1:User {id: $userId})
            MATCH (u2:User)
            WHERE $paymentMethod IN u2.paymentMethods AND u2.id <> $userId
            MERGE (u1)-[r:SHARED_PAYMENT_METHOD {
                paymentMethod: $paymentMethod,
                createdAt: datetime()
            }]-(u2)
            RETURN count(r) as relationshipsCreated
        `;

        await this.databaseService.runQuery(query, {
            userId,
            paymentMethod
        });
    }

    async getUserRelationships(userId) {
        const query = `
            MATCH (u:User {id: $userId})
            OPTIONAL MATCH (u)-[r1:SHARED_EMAIL|SHARED_PHONE|SHARED_ADDRESS|SHARED_PAYMENT_METHOD]-(relatedUser:User)
            OPTIONAL MATCH (u)-[r2:SENT_TO|RECEIVED_FROM]-(transaction:Transaction)
            OPTIONAL MATCH (transaction)-[r3:SENT_TO|RECEIVED_FROM]-(otherUser:User)
            WHERE otherUser.id <> $userId
            
            WITH u, 
                 collect(DISTINCT {
                    type: type(r1),
                    relatedUser: relatedUser,
                    relationship: r1
                 }) as directRelationships,
                 collect(DISTINCT {
                    transaction: transaction,
                    relationship: r2,
                    otherUser: otherUser
                 }) as transactions
            
            RETURN {
                user: u,
                directRelationships: directRelationships,
                transactions: transactions
            } as result
        `;

        const result = await this.databaseService.runQuery(query, { userId });

        if (result.records.length > 0) {
            const data = result.records[0].get('result');
            return this.databaseService.convertNeo4jIntegers(data);
        }

        return null;
    }
}