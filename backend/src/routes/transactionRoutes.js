import express from 'express';

export default function setupTransactionRoutes({ transactionController }) {
    const router = express.Router();

    // POST /transactions - Add or update transaction details
    router.post('/', transactionController.createOrUpdateTransaction);

    // GET /transactions - List all transactions
    router.get('/', transactionController.getAllTransactions);

    return router;
}