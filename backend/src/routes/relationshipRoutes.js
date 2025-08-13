import express from 'express';

export default function setupRelationshipRoutes({ relationshipController }) {
    const router = express.Router();

    // GET /relationships/user/:id - Fetch all connections of a user, including direct relationships and transactions
    router.get('/user/:id', relationshipController.getUserRelationships);

    // GET /relationships/transaction/:id - Fetch all connections of a transaction, including linked users and other transactions
    router.get('/transaction/:id', relationshipController.getTransactionRelationships);

    return router;
}