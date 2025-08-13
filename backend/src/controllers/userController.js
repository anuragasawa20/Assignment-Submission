export default class UserController {
    constructor({ userService }) {
        this.userService = userService;
    }

    createOrUpdateUser = async (req, res) => {
        try {
            const userData = req.body;

            // Validate required fields
            if (!userData.id || !userData.name || !userData.email) {
                return res.status(400).json({
                    error: 'Bad Request',
                    message: 'Missing required fields: id, name, email'
                });
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(userData.email)) {
                return res.status(400).json({
                    error: 'Bad Request',
                    message: 'Invalid email format'
                });
            }

            const user = await this.userService.createOrUpdateUser(userData);

            res.status(201).json({
                success: true,
                data: user,
                message: 'User created/updated successfully'
            });
        } catch (error) {
            console.error('Error creating/updating user:', error);
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message
            });
        }
    };

    getAllUsers = async (req, res) => {
        try {
            const users = await this.userService.getAllUsers();

            res.json({
                success: true,
                data: users,
                count: users.length
            });
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message
            });
        }
    };

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
}