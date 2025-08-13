import express from 'express';

export default function setupUserRoutes({ userController }) {
    const router = express.Router();

    // POST /users - Add or update user information
    router.post('/', userController.createOrUpdateUser);

    // GET /users - List all users
    router.get('/', userController.getAllUsers);

    return router;
}