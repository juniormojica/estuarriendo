import { UserVerificationDocuments, User, UserVerification, Notification } from '../models/index.js';
import { VerificationStatus, NotificationType, UserType } from '../utils/enums.js';
import { uploadImage } from '../utils/cloudinaryUtils.js';
import { Op } from 'sequelize';

/**
 * Verification Controller
 * Handles user verification document submission and review
 */

// Submit verification documents
export const submitVerificationDocuments = async (req, res) => {
    try {
        const { userId, idFront, idBack, selfie, utilityBill } = req.body;

        // Validate required fields
        if (!userId || !idFront || !idBack || !selfie) {
            return res.status(400).json({ error: 'ID Front, ID Back and Selfie are required' });
        }

        // Check if user exists
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Upload images to Cloudinary
        console.log(`Uploading verification documents for user ${userId}...`);

        // Upload concurrently for better performance
        const uploadPromises = [
            uploadImage(idFront, 'verification_documents'),
            uploadImage(idBack, 'verification_documents'),
            uploadImage(selfie, 'verification_documents'),
        ];

        // Only upload utility bill if provided (owners)
        if (utilityBill) {
            uploadPromises.push(uploadImage(utilityBill, 'verification_documents'));
        }

        const results = await Promise.all(uploadPromises);

        const idFrontResult = results[0];
        const idBackResult = results[1];
        const selfieResult = results[2];
        const utilityBillResult = utilityBill ? results[3] : null;

        console.log('Documents uploaded to Cloudinary successfully');
        console.log('ID Front URL:', idFrontResult.url);
        console.log('ID Back URL:', idBackResult.url);

        // Check if documents already exist
        const existing = await UserVerificationDocuments.findByPk(userId);

        const documentData = {
            userId,
            idFront: idFrontResult.url,
            idBack: idBackResult.url,
            selfie: selfieResult.url,
            utilityBill: utilityBillResult ? utilityBillResult.url : null,
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

        // Update UserVerification status (Normalized)
        const [verification, created] = await UserVerification.findOrCreate({
            where: { userId },
            defaults: {
                verificationStatus: VerificationStatus.PENDING,
                isVerified: false
            }
        });

        if (!created) {
            await verification.update({
                verificationStatus: VerificationStatus.PENDING,
                verificationRejectionReason: null,
                updatedAt: new Date()
            });
        }

        // ALSO update user verification status for backwards compatibility/frontend ease
        await user.update({
            verificationStatus: VerificationStatus.PENDING,
            updatedAt: new Date()
        });

        // Notify all admins about new verification submission
        try {
            const admins = await User.findAll({
                where: {
                    userType: {
                        [Op.in]: [UserType.ADMIN, UserType.SUPER_ADMIN]
                    }
                }
            });

            for (const admin of admins) {
                await Notification.create({
                    userId: admin.id,
                    type: NotificationType.VERIFICATION_SUBMITTED,
                    title: 'Nueva verificación pendiente',
                    message: `${user.name} ha enviado sus documentos de verificación`,
                    interestedUserId: userId,
                    isRead: false,
                    createdAt: new Date()
                });
            }
        } catch (error) {
            console.error('Error creating admin notifications:', error);
            // Continue execution, notification failure shouldn't block submission
        }

        res.status(201).json({
            message: 'Verification documents submitted and uploaded successfully',
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
        // Find users with PENDING status
        const pendingUsers = await User.findAll({
            where: {
                verificationStatus: VerificationStatus.PENDING
            },
            attributes: ['id', 'name', 'email', 'phone', 'verificationStatus', 'joinedAt'],
            include: [
                {
                    model: UserVerificationDocuments,
                    as: 'verificationDocuments',
                    attributes: ['submittedAt', 'idFront', 'idBack', 'selfie', 'utilityBill'] // Include document URLs
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
            return res.status(404).json({ error: 'Verification documents not found' }); // Or allow approval without docs if exceptional? No, enforce docs.
        }

        // Update UserVerification model
        const verification = await UserVerification.findOne({ where: { userId } });
        if (verification) {
            await verification.update({
                verificationStatus: VerificationStatus.VERIFIED,
                isVerified: true,
                verificationRejectionReason: null,
                verifiedAt: new Date(),
                updatedAt: new Date()
            });
        } else {
            // Create if missing (should exist if flow followed, but be safe)
            await UserVerification.create({
                userId,
                verificationStatus: VerificationStatus.VERIFIED,
                isVerified: true,
                verifiedAt: new Date()
            });
        }

        // Update User model (denormalized status)
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

        // Notify user about verification approval
        try {
            await Notification.create({
                userId,
                type: NotificationType.VERIFICATION_APPROVED,
                title: '¡Verificación aprobada!',
                message: 'Tu verificación ha sido aprobada. Ya tienes acceso completo.',
                isRead: false,
                createdAt: new Date()
            });
        } catch (error) {
            console.error('Error creating approval notification:', error);
        }

        res.json({
            message: 'Verification approved successfully',
            user: {
                id: user.id,
                name: user.name,
                verificationStatus: VerificationStatus.VERIFIED,
                isVerified: true
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
            // Allow rejection even if docs missing? Yes, usually.
        }

        // Update UserVerification model
        const verification = await UserVerification.findOne({ where: { userId } });
        if (verification) {
            await verification.update({
                verificationStatus: VerificationStatus.REJECTED,
                isVerified: false,
                verificationRejectionReason: reason,
                updatedAt: new Date()
            });
        } else {
            await UserVerification.create({
                userId,
                verificationStatus: VerificationStatus.REJECTED,
                isVerified: false,
                verificationRejectionReason: reason
            });
        }

        // Update User model
        await user.update({
            verificationStatus: VerificationStatus.REJECTED,
            isVerified: false,
            verificationRejectionReason: reason,
            updatedAt: new Date()
        });

        // Update documents processed timestamp
        if (documents) {
            await documents.update({
                processedAt: new Date()
            });
        }

        // Notify user about verification rejection
        try {
            await Notification.create({
                userId,
                type: NotificationType.VERIFICATION_REJECTED,
                title: 'Verificación rechazada',
                message: `Tu verificación fue rechazada. Motivo: ${reason}`,
                isRead: false,
                createdAt: new Date()
            });
        } catch (error) {
            console.error('Error creating rejection notification:', error);
        }

        res.json({
            message: 'Verification rejected',
            user: {
                id: user.id,
                name: user.name,
                verificationStatus: VerificationStatus.REJECTED,
                verificationRejectionReason: reason
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
