export default class TransactionService {
    constructor(dependencies) {
        this.databaseService = dependencies.databaseService;
        this.userService = dependencies.userService;
    }

    async createOrUpdateTransaction(transactionData) {
        const {
            id,
            fromUserId,
            toUserId,
            amount,
            currency = 'USD',
            type = 'TRANSFER',
            status = 'COMPLETED',
            description = '',
            ipAddress,
            deviceId,
            metadata = {}
        } = transactionData;

        // Convert metadata object to string for Neo4j storage
        const metadataString = JSON.stringify(metadata);

        // Validate that users exist
        const fromUserExists = await this.userExists(fromUserId);
        const toUserExists = await this.userExists(toUserId);

        if (!fromUserExists) {
            throw new Error(`From user with ID ${fromUserId} does not exist`);
        }
        if (!toUserExists) {
            throw new Error(`To user with ID ${toUserId} does not exist`);
        }

        const query = `
            MATCH (fromUser:User {id: $fromUserId})
            MATCH (toUser:User {id: $toUserId})
            MERGE (t:Transaction {id: $id})
            ON CREATE SET t.createdAt = datetime(), t.timestamp = datetime()
            ON MATCH SET t.updatedAt = datetime()
            SET t.amount = $amount,
                t.currency = $currency,
                t.type = $type,
                t.status = $status,
                t.description = $description,
                t.ipAddress = $ipAddress,
                t.deviceId = $deviceId,
                t.metadata = $metadataString
            
            MERGE (fromUser)-[r1:SENT_TO {
                amount: $amount,
                currency: $currency,
                timestamp: t.timestamp
            }]->(t)
            
            MERGE (t)-[r2:RECEIVED_FROM {
                amount: $amount,
                currency: $currency,
                timestamp: t.timestamp
            }]->(toUser)
            
            RETURN t, fromUser, toUser
        `;

        const result = await this.databaseService.runQuery(query, {
            id,
            fromUserId,
            toUserId,
            amount: parseFloat(amount),
            currency,
            type,
            status,
            description,
            ipAddress,
            deviceId,
            metadataString
        });

        if (result.records.length > 0) {
            const transaction = this.databaseService.convertNeo4jIntegers(
                result.records[0].get('t').properties
            );

            // After creating transaction, detect and create transaction-to-transaction relationships
            await this.detectAndCreateTransactionRelationships(id);

            return transaction;
        }

        throw new Error('Failed to create or update transaction');
    }

    async getAllTransactions() {
        const query = `
            MATCH (t:Transaction)
            OPTIONAL MATCH (fromUser:User)-[:SENT_TO]->(t)-[:RECEIVED_FROM]->(toUser:User)
            RETURN t, fromUser.id as fromUserId, toUser.id as toUserId
            ORDER BY t.timestamp DESC
        `;

        const result = await this.databaseService.runQuery(query);
        return result.records.map(record => {
            const transaction = this.databaseService.convertNeo4jIntegers(
                record.get('t').properties
            );
            return {
                ...transaction,
                fromUserId: record.get('fromUserId'),
                toUserId: record.get('toUserId')
            };
        });
    }

    async getTransactionById(id) {
        const query = `
            MATCH (t:Transaction {id: $id})
            OPTIONAL MATCH (fromUser:User)-[:SENT_TO]->(t)-[:RECEIVED_FROM]->(toUser:User)
            RETURN t, fromUser.id as fromUserId, toUser.id as toUserId
        `;

        const result = await this.databaseService.runQuery(query, { id });

        if (result.records.length > 0) {
            const transaction = this.databaseService.convertNeo4jIntegers(
                result.records[0].get('t').properties
            );
            return {
                ...transaction,
                fromUserId: result.records[0].get('fromUserId'),
                toUserId: result.records[0].get('toUserId')
            };
        }

        return null;
    }

    async detectAndCreateTransactionRelationships(transactionId) {
        const transaction = await this.getTransactionById(transactionId);
        if (!transaction) return;

        // Find transactions with shared IP address
        if (transaction.ipAddress) {
            await this.createSharedAttributeTransactionRelationship(
                transactionId,
                'ipAddress',
                transaction.ipAddress,
                'SHARED_IP'
            );
        }

        // Find transactions with shared device ID
        if (transaction.deviceId) {
            await this.createSharedAttributeTransactionRelationship(
                transactionId,
                'deviceId',
                transaction.deviceId,
                'SHARED_DEVICE'
            );
        }
    }

    async createSharedAttributeTransactionRelationship(transactionId, attributeType, attributeValue, relationshipType) {
        let query;

        // Build the query with literal property names (Neo4j doesn't allow parameterized property names)
        switch (attributeType) {
            case 'ipAddress':
                query = `
                    MATCH (t1:Transaction {id: $transactionId})
                    MATCH (t2:Transaction)
                    WHERE t2.ipAddress = $attributeValue AND t2.id <> $transactionId
                    MERGE (t1)-[r:${relationshipType} {
                        attribute: $attributeType,
                        value: $attributeValue,
                        createdAt: datetime()
                    }]-(t2)
                    RETURN count(r) as relationshipsCreated
                `;
                break;
            case 'deviceId':
                query = `
                    MATCH (t1:Transaction {id: $transactionId})
                    MATCH (t2:Transaction)
                    WHERE t2.deviceId = $attributeValue AND t2.id <> $transactionId
                    MERGE (t1)-[r:${relationshipType} {
                        attribute: $attributeType,
                        value: $attributeValue,
                        createdAt: datetime()
                    }]-(t2)
                    RETURN count(r) as relationshipsCreated
                `;
                break;
            default:
                console.warn(`Unknown transaction attribute type: ${attributeType}`);
                return;
        }

        const result = await this.databaseService.runQuery(query, {
            transactionId,
            attributeType,
            attributeValue
        });

        console.log(`Created ${result.records[0]?.get('relationshipsCreated')?.toNumber() || 0} ${relationshipType} relationships for transaction ${transactionId}`);
    }

    async getTransactionRelationships(transactionId) {
        const query = `
            MATCH (t:Transaction {id: $transactionId})
            OPTIONAL MATCH (fromUser:User)-[:SENT_TO]->(t)-[:RECEIVED_FROM]->(toUser:User)
            OPTIONAL MATCH (t)-[r1:SHARED_IP|SHARED_DEVICE]-(relatedTransaction:Transaction)
            OPTIONAL MATCH (relatedFromUser:User)-[:SENT_TO]->(relatedTransaction)-[:RECEIVED_FROM]->(relatedToUser:User)
            
            WITH t, fromUser, toUser,
                 collect(DISTINCT {
                    transaction: relatedTransaction,
                    relationship: r1,
                    fromUser: relatedFromUser,
                    toUser: relatedToUser
                 }) as relatedTransactions
            
            RETURN {
                transaction: t,
                fromUser: fromUser,
                toUser: toUser,
                relatedTransactions: relatedTransactions
            } as result
        `;

        const result = await this.databaseService.runQuery(query, { transactionId });

        if (result.records.length > 0) {
            const data = result.records[0].get('result');
            return this.databaseService.convertNeo4jIntegers(data);
        }

        return null;
    }

    async userExists(userId) {
        const query = `
            MATCH (u:User {id: $userId})
            RETURN count(u) > 0 as exists
        `;

        const result = await this.databaseService.runQuery(query, { userId });
        return result.records[0].get('exists');
    }

    async getTransactionsByUser(userId) {
        const query = `
            MATCH (u:User {id: $userId})
            MATCH (u)-[r:SENT_TO|RECEIVED_FROM]-(t:Transaction)
            OPTIONAL MATCH (otherUser:User)-[r2:SENT_TO|RECEIVED_FROM]-(t)
            WHERE otherUser.id <> $userId
            RETURN t, type(r) as relationshipType, otherUser
            ORDER BY t.timestamp DESC
        `;

        const result = await this.databaseService.runQuery(query, { userId });
        return result.records.map(record => {
            const transaction = this.databaseService.convertNeo4jIntegers(
                record.get('t').properties
            );
            const otherUser = record.get('otherUser') ?
                this.databaseService.convertNeo4jIntegers(record.get('otherUser').properties) : null;

            return {
                ...transaction,
                relationshipType: record.get('relationshipType'),
                otherUser
            };
        });
    }
}