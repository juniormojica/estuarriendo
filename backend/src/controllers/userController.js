import { User, UserVerificationDocuments } from '../models/index.js';
import { UserType, VerificationStatus } from '../utils/enums.js';

/**
 * User Controller
 * Handles all user-related operations
 */

// Get all users
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] },
            include: [
                {
                    model: UserVerificationDocuments,
                    as: 'verificationDocuments',
                    attributes: ['submittedAt', 'processedAt']
                }
            ]
        });
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users', message: error.message });
    }
};

// Get user by ID
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id, {
            attributes: { exclude: ['password'] },
            include: [
                {
                    model: UserVerificationDocuments,
                    as: 'verificationDocuments',
                    attributes: ['submittedAt', 'processedAt']
                }
            ]
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user', message: error.message });
    }
};

// Create new user
export const createUser = async (req, res) => {
    try {
        const userData = req.body;

        // Validate required fields
        if (!userData.id || !userData.name || !userData.email || !userData.phone || !userData.userType) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check if user already exists
        const existingUser = await User.findByPk(userData.id);
        if (existingUser) {
            return res.status(409).json({ error: 'User already exists' });
        }

        // Set default values
        const newUserData = {
            ...userData,
            joinedAt: new Date(),
            isActive: true,
            isVerified: false,
            verificationStatus: VerificationStatus.NOT_SUBMITTED,
            propertiesCount: 0,
            approvedCount: 0,
            pendingCount: 0,
            rejectedCount: 0,
            plan: 'free'
        };

        const user = await User.create(newUserData);

        // Remove sensitive data from response
        const userResponse = user.toJSON();
        delete userResponse.password;

        res.status(201).json(userResponse);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user', message: error.message });
    }
};

// Update user
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update timestamp
        updates.updatedAt = new Date();

        await user.update(updates);

        const userResponse = user.toJSON();
        delete userResponse.password;

        res.json(userResponse);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user', message: error.message });
    }
};

// Delete user
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        await user.destroy();
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user', message: error.message });
    }
};

// Update user verification status
export const updateVerificationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { verificationStatus, verificationRejectionReason } = req.body;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const updates = {
            verificationStatus,
            updatedAt: new Date()
        };

        if (verificationStatus === VerificationStatus.VERIFIED) {
            updates.isVerified = true;
        } else if (verificationStatus === VerificationStatus.REJECTED) {
            updates.verificationRejectionReason = verificationRejectionReason;
            updates.isVerified = false;
        }

        await user.update(updates);

        const userResponse = user.toJSON();
        delete userResponse.password;

        res.json(userResponse);
    } catch (error) {
        console.error('Error updating verification status:', error);
        res.status(500).json({ error: 'Failed to update verification status', message: error.message });
    }
};

// Update user plan
export const updateUserPlan = async (req, res) => {
    try {
        const { id } = req.params;
        const { plan, planType, planDuration } = req.body;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const now = new Date();
        const expiresAt = new Date(now);

        // Calculate expiration based on plan duration (in days)
        if (planDuration) {
            expiresAt.setDate(expiresAt.getDate() + planDuration);
        }

        const updates = {
            plan,
            planType,
            planStartedAt: now,
            planExpiresAt: expiresAt,
            updatedAt: now
        };

        if (plan === 'premium' && !user.premiumSince) {
            updates.premiumSince = now;
        }

        await user.update(updates);

        const userResponse = user.toJSON();
        delete userResponse.password;

        res.json(userResponse);
    } catch (error) {
        console.error('Error updating user plan:', error);
        res.status(500).json({ error: 'Failed to update user plan', message: error.message });
    }
};

// Get user statistics
export const getUserStatistics = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id, {
            attributes: ['id', 'name', 'propertiesCount', 'approvedCount', 'pendingCount', 'rejectedCount', 'plan', 'planExpiresAt']
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error fetching user statistics:', error);
        res.status(500).json({ error: 'Failed to fetch user statistics', message: error.message });
    }
};

export default {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    updateVerificationStatus,
    updateUserPlan,
    getUserStatistics
};
