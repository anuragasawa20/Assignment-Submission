export default class RelationshipController {
    constructor({ userService, transactionService, databaseService }) {
        this.userService = userService;
        this.transactionService = transactionService;
        this.databaseService = databaseService;
    }

    getUserRelationships = async (req, res) => {
        try {
            const { id } = req.params;
            const relationships = await this.userService.getUserRelationships(id);

            if (!relationships) {
                return res.status(404).json({
                    error: 'Not Found',
                    message: 'User not found'
                });
            }

            res.json({
                success: true,
                data: relationships
            });
        } catch (error) {
            console.error('Error fetching user relationships:', error);
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message
            });
        }
    };

    getTransactionRelationships = async (req, res) => {
        try {
            const { id } = req.params;
            const relationships = await this.transactionService.getTransactionRelationships(id);

            if (!relationships) {
                return res.status(404).json({
                    error: 'Not Found',
                    message: 'Transaction not found'
                });
            }

            res.json({
                success: true,
                data: relationships
            });
        } catch (error) {
            console.error('Error fetching transaction relationships:', error);
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message
            });
        }
    };

    getNetworkOverview = async (req, res) => {
        try {
            const query = `
                MATCH (u:User)
                OPTIONAL MATCH (u)-[r1:SHARED_EMAIL|SHARED_PHONE|SHARED_ADDRESS|SHARED_PAYMENT_METHOD]-(relatedUser:User)
                OPTIONAL MATCH (u)-[r2:SENT_TO|RECEIVED_FROM]-(t:Transaction)
                OPTIONAL MATCH (t)-[r3:SHARED_IP|SHARED_DEVICE]-(relatedTransaction:Transaction)
                
                RETURN {
                    totalUsers: count(DISTINCT u),
                    totalTransactions: count(DISTINCT t),
                    sharedAttributeRelationships: count(DISTINCT r1),
                    transactionRelationships: count(DISTINCT r2),
                    transactionToTransactionRelationships: count(DISTINCT r3)
                } as overview
            `;

            const result = await this.databaseService.runQuery(query);
            const overview = this.databaseService.convertNeo4jIntegers(result.records[0].get('overview'));

            res.json({
                success: true,
                data: overview
            });
        } catch (error) {
            console.error('Error fetching network overview:', error);
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message
            });
        }
    };

    getSharedAttributeAnalysis = async (req, res) => {
        try {
            const query = `
                MATCH (u1:User)-[r:SHARED_EMAIL|SHARED_PHONE|SHARED_ADDRESS|SHARED_PAYMENT_METHOD]-(u2:User)
                WITH type(r) as relationshipType, count(r) as count
                RETURN collect({
                    type: relationshipType,
                    count: count
                }) as sharedAttributeStats
            `;

            const result = await this.databaseService.runQuery(query);
            const stats = result.records[0].get('sharedAttributeStats');

            res.json({
                success: true,
                data: this.databaseService.convertNeo4jIntegers(stats)
            });
        } catch (error) {
            console.error('Error fetching shared attribute analysis:', error);
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message
            });
        }
    };

    getTransactionPatterns = async (req, res) => {
        try {
            const query = `
                MATCH (t1:Transaction)-[r:SHARED_IP|SHARED_DEVICE]-(t2:Transaction)
                WITH type(r) as relationshipType, count(r) as count
                RETURN collect({
                    type: relationshipType,
                    count: count
                }) as transactionPatternStats
            `;

            const result = await this.databaseService.runQuery(query);
            const stats = result.records[0].get('transactionPatternStats');

            res.json({
                success: true,
                data: this.databaseService.convertNeo4jIntegers(stats)
            });
        } catch (error) {
            console.error('Error fetching transaction patterns:', error);
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message
            });
        }
    };

    getHighRiskUsers = async (req, res) => {
        try {
            const query = `
                MATCH (u:User)
                OPTIONAL MATCH (u)-[r1:SHARED_EMAIL|SHARED_PHONE|SHARED_ADDRESS|SHARED_PAYMENT_METHOD]-(relatedUser:User)
                OPTIONAL MATCH (u)-[r2:SENT_TO|RECEIVED_FROM]-(t:Transaction)
                WITH u, count(DISTINCT relatedUser) as sharedConnections, count(DISTINCT t) as transactionCount
                WHERE sharedConnections > 2 OR transactionCount > 5
                RETURN {
                    user: u,
                    sharedConnections: sharedConnections,
                    transactionCount: transactionCount,
                    riskScore: sharedConnections * 2 + transactionCount
                } as riskProfile
                ORDER BY riskProfile.riskScore DESC
                LIMIT 10
            `;

            const result = await this.databaseService.runQuery(query);
            const riskProfiles = result.records.map(record =>
                this.databaseService.convertNeo4jIntegers(record.get('riskProfile'))
            );

            res.json({
                success: true,
                data: riskProfiles
            });
        } catch (error) {
            console.error('Error fetching high risk users:', error);
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message
            });
        }
    };

    getConnectionPath = async (req, res) => {
        try {
            const { fromUserId, toUserId } = req.query;

            if (!fromUserId || !toUserId) {
                return res.status(400).json({
                    error: 'Bad Request',
                    message: 'Both fromUserId and toUserId are required'
                });
            }

            const query = `
                MATCH path = shortestPath((u1:User {id: $fromUserId})-[*..5]-(u2:User {id: $toUserId}))
                RETURN path
                LIMIT 1
            `;

            const result = await this.databaseService.runQuery(query, { fromUserId, toUserId });

            if (result.records.length === 0) {
                return res.json({
                    success: true,
                    data: {
                        connected: false,
                        message: 'No connection path found between users'
                    }
                });
            }

            const path = result.records[0].get('path');

            res.json({
                success: true,
                data: {
                    connected: true,
                    pathLength: path.length,
                    path: path
                }
            });
        } catch (error) {
            console.error('Error finding connection path:', error);
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message
            });
        }
    };
}