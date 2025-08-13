export default class TransactionController {
    constructor({ transactionService }) {
        this.transactionService = transactionService;
    }

    createOrUpdateTransaction = async (req, res) => {
        try {
            const transactionData = req.body;

            // Validate required fields
            if (!transactionData.id || !transactionData.fromUserId || !transactionData.toUserId || !transactionData.amount) {
                return res.status(400).json({
                    error: 'Bad Request',
                    message: 'Missing required fields: id, fromUserId, toUserId, amount'
                });
            }

            // Validate amount is positive
            if (parseFloat(transactionData.amount) <= 0) {
                return res.status(400).json({
                    error: 'Bad Request',
                    message: 'Amount must be positive'
                });
            }

            // Validate users are different
            if (transactionData.fromUserId === transactionData.toUserId) {
                return res.status(400).json({
                    error: 'Bad Request',
                    message: 'From user and to user cannot be the same'
                });
            }

            const transaction = await this.transactionService.createOrUpdateTransaction(transactionData);

            res.status(201).json({
                success: true,
                data: transaction,
                message: 'Transaction created/updated successfully'
            });
        } catch (error) {
            console.error('Error creating/updating transaction:', error);

            if (error.message.includes('does not exist')) {
                return res.status(404).json({
                    error: 'Not Found',
                    message: error.message
                });
            }

            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message
            });
        }
    };

    getAllTransactions = async (req, res) => {
        try {
            const transactions = await this.transactionService.getAllTransactions();

            res.json({
                success: true,
                data: transactions,
                count: transactions.length
            });
        } catch (error) {
            console.error('Error fetching transactions:', error);
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

    getTransactionsByUser = async (req, res) => {
        try {
            const { userId } = req.params;
            const transactions = await this.transactionService.getTransactionsByUser(userId);

            res.json({
                success: true,
                data: transactions,
                count: transactions.length
            });
        } catch (error) {
            console.error('Error fetching user transactions:', error);
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message
            });
        }
    };
}