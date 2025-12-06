import { UserVerificationDocuments, User } from '../models/index.js';
import { VerificationStatus } from '../utils/enums.js';

/**
 * Verification Controller
 * Handles user verification document submission and review
 */

// Submit verification documents
export const submitVerificationDocuments = async (req, res) => {
    try {
        const { userId, idFront, idBack, selfie, utilityBill } = req.body;

        // Validate required fields
        if (!userId || !idFront || !idBack || !selfie || !utilityBill) {
            return res.status(400).json({ error: 'All verification documents are required' });
        }

        // Check if user exists
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if documents already exist
        const existing = await UserVerificationDocuments.findByPk(userId);

        const documentData = {
            userId,
            idFront,
            idBack,
            selfie,
            utilityBill,
            submittedAt: new Date()
        };

        let documents;
        if (existing) {
            // Update existing documents
            await existing.update(documentData);
            documents = existing;
        } else {
            // Create new documents
            documents = await UserVerificationDocuments.create(documentData);
        }

        // Update user verification status
        await user.update({
            verificationStatus: VerificationStatus.PENDING,
            updatedAt: new Date()
        });

        res.status(201).json({
            message: 'Verification documents submitted successfully',
            documents: {
                userId: documents.userId,
                submittedAt: documents.submittedAt
            }
        });
    } catch (error) {
        console.error('Error submitting verification documents:', error);
        res.status(500).json({ error: 'Failed to submit verification documents', message: error.message });
    }
};

// Get verification documents (admin only)
export const getVerificationDocuments = async (req, res) => {
    try {
        const { userId } = req.params;

        const documents = await UserVerificationDocuments.findByPk(userId, {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email', 'verificationStatus']
                }
            ]
        });

        if (!documents) {
            return res.status(404).json({ error: 'Verification documents not found' });
        }

        res.json(documents);
    } catch (error) {
        console.error('Error fetching verification documents:', error);
        res.status(500).json({ error: 'Failed to fetch verification documents', message: error.message });
    }
};

// Get all pending verifications (admin only)
export const getPendingVerifications = async (req, res) => {
    try {
        const pendingUsers = await User.findAll({
            where: {
                verificationStatus: VerificationStatus.PENDING
            },
            attributes: ['id', 'name', 'email', 'phone', 'verificationStatus', 'joinedAt'],
            include: [
                {
                    model: UserVerificationDocuments,
                    as: 'verificationDocuments',
                    attributes: ['submittedAt']
                }
            ],
            order: [['joinedAt', 'DESC']]
        });

        res.json(pendingUsers);
    } catch (error) {
        console.error('Error fetching pending verifications:', error);
        res.status(500).json({ error: 'Failed to fetch pending verifications', message: error.message });
    }
};

// Approve verification (admin only)
export const approveVerification = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const documents = await UserVerificationDocuments.findByPk(userId);
        if (!documents) {
            return res.status(404).json({ error: 'Verification documents not found' });
        }

        // Update user status
        await user.update({
            verificationStatus: VerificationStatus.VERIFIED,
            isVerified: true,
            verificationRejectionReason: null,
            updatedAt: new Date()
        });

        // Update documents processed timestamp
        await documents.update({
            processedAt: new Date()
        });

        res.json({
            message: 'Verification approved successfully',
            user: {
                id: user.id,
                name: user.name,
                verificationStatus: user.verificationStatus,
                isVerified: user.isVerified
            }
        });
    } catch (error) {
        console.error('Error approving verification:', error);
        res.status(500).json({ error: 'Failed to approve verification', message: error.message });
    }
};

// Reject verification (admin only)
export const rejectVerification = async (req, res) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({ error: 'Rejection reason is required' });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const documents = await UserVerificationDocuments.findByPk(userId);
        if (!documents) {
            return res.status(404).json({ error: 'Verification documents not found' });
        }

        // Update user status
        await user.update({
            verificationStatus: VerificationStatus.REJECTED,
            isVerified: false,
            verificationRejectionReason: reason,
            updatedAt: new Date()
        });

        // Update documents processed timestamp
        await documents.update({
            processedAt: new Date()
        });

        res.json({
            message: 'Verification rejected',
            user: {
                id: user.id,
                name: user.name,
                verificationStatus: user.verificationStatus,
                verificationRejectionReason: user.verificationRejectionReason
            }
        });
    } catch (error) {
        console.error('Error rejecting verification:', error);
        res.status(500).json({ error: 'Failed to reject verification', message: error.message });
    }
};

export default {
    submitVerificationDocuments,
    getVerificationDocuments,
    getPendingVerifications,
    approveVerification,
    rejectVerification
};
