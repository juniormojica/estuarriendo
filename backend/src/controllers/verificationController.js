import { UserVerificationDocuments, User, UserVerification, Notification, UserIdentificationDetails, UserProfile, ActivityLog } from '../models/index.js';
import { VerificationStatus, DocumentVerificationStatus, NotificationType, UserType } from '../utils/enums.js';
import { badRequest, forbidden, notFound } from '../errors/AppError.js';

import { Op } from 'sequelize';

/**
 * Verification Controller
 * Handles user verification document submission and review
 */

// Submit verification documents
export const submitVerificationDocuments = async (req, res, next) => {
    try {
        const { idFront, idBack, selfie, utilityBill } = req.body;
        const userId = req.auth.userId;

        // Validate required fields
        if (!idFront || !idBack || !selfie) {
            return next(badRequest('ID Front, ID Back and Selfie are required', {
                code: 'VERIFICATION_REQUIRED_DOCUMENTS_MISSING'
            }));
        }

        // Check if user exists
        const user = await User.findByPk(userId);
        if (!user) {
            return next(notFound('User not found', { code: 'USER_NOT_FOUND' }));
        }

        // Check if documents already exist
        const existing = await UserVerificationDocuments.findByPk(userId);

        const documentData = {
            userId,
            idFront, // Now receiving URLs directly from frontend
            idBack,
            selfie,
            utilityBill: utilityBill || null,
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

        try {
            await ActivityLog.create({
                type: 'verification_submitted',
                message: `${user.name} envió sus documentos de verificación`,
                userId: user.id,
                timestamp: new Date()
            });
        } catch (activityError) {
            console.error('Error creating activity log:', activityError);
        }

        res.status(201).json({
            message: 'Verification documents submitted successfully',
            documents: {
                userId: documents.userId,
                submittedAt: documents.submittedAt
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get verification documents (admin only)
export const getVerificationDocuments = async (req, res, next) => {
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
            return next(notFound('Verification documents not found', {
                code: 'VERIFICATION_DOCUMENTS_NOT_FOUND'
            }));
        }

        res.json(documents);
    } catch (error) {
        next(error);
    }
};

// Get all pending verifications (admin only)
export const getPendingVerifications = async (req, res, next) => {
    try {
        // Find users with PENDING or IN_PROGRESS status
        const pendingUsers = await User.findAll({
            where: {
                verificationStatus: {
                    [Op.in]: [VerificationStatus.PENDING, VerificationStatus.IN_PROGRESS]
                }
            },
            attributes: ['id', 'name', 'email', 'phone', 'verificationStatus', 'joinedAt'],
            include: [
                {
                    model: UserVerificationDocuments,
                    as: 'verificationDocuments',
                    attributes: [
                        'submittedAt',
                        'idFront', 'idFrontStatus', 'idFrontRejectionReason',
                        'idBack', 'idBackStatus', 'idBackRejectionReason',
                        'selfie', 'selfieStatus', 'selfieRejectionReason',
                        'utilityBill', 'utilityBillStatus', 'utilityBillRejectionReason'
                    ] // Include document URLs and statuses
                },
                {
                    model: UserIdentificationDetails,
                    as: 'identification',
                    attributes: ['idType', 'idNumber']
                },
                {
                    model: UserProfile,
                    as: 'profile',
                    attributes: ['birthDate']
                }
            ],
            order: [['joinedAt', 'DESC']]
        });

        res.json(pendingUsers);
    } catch (error) {
        next(error);
    }
};

// Approve verification (admin only)
export const approveVerification = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const user = await User.findByPk(userId);
        if (!user) {
            return next(notFound('User not found', { code: 'USER_NOT_FOUND' }));
        }

        const documents = await UserVerificationDocuments.findByPk(userId);
        if (!documents) {
            return next(notFound('Verification documents not found', {
                code: 'VERIFICATION_DOCUMENTS_NOT_FOUND'
            })); // Or allow approval without docs if exceptional? No, enforce docs.
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
        next(error);
    }
};

// Reject verification (admin only)
export const rejectVerification = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body;

        if (!reason) {
            return next(badRequest('Rejection reason is required', {
                code: 'REJECTION_REASON_REQUIRED'
            }));
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return next(notFound('User not found', { code: 'USER_NOT_FOUND' }));
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
        next(error);
    }
};

// ==========================================
// NEW INDIVIDUAL DOCUMENT FLOW
// ==========================================

export const submitSingleDocument = async (req, res, next) => {
    try {
        const userId = req.auth.userId;
        const { documentType, documentUrl, idNumber } = req.body;

        if (!documentType || !documentUrl) {
            return next(badRequest('Missing required fields', {
                code: 'VERIFICATION_REQUIRED_FIELDS_MISSING'
            }));
        }

        const validDocumentTypes = ['idFront', 'idBack', 'selfie', 'utilityBill'];
        if (!validDocumentTypes.includes(documentType)) {
            return next(badRequest('Invalid document type', {
                code: 'VERIFICATION_INVALID_DOCUMENT_TYPE'
            }));
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return next(notFound('User not found', { code: 'USER_NOT_FOUND' }));
        }

        // Upsert user verification document record
        const [docs, created] = await UserVerificationDocuments.findOrCreate({
            where: { userId },
            defaults: {
                [documentType]: documentUrl,
                [`${documentType}Status`]: DocumentVerificationStatus.PENDING,
                submittedAt: new Date()
            }
        });

        if (!created) {
            // Check if document was already approved, if so don't allow overwrite
            // (Unless we want to allow replacing approved docs? Usually not)
            const currentStatus = docs[`${documentType}Status`];
            if (currentStatus === DocumentVerificationStatus.APPROVED) {
                return next(badRequest('Document is already approved and cannot be modified', {
                    code: 'VERIFICATION_DOCUMENT_ALREADY_APPROVED'
                }));
            }

            // Update specific document
            docs[documentType] = documentUrl;
            docs[`${documentType}Status`] = DocumentVerificationStatus.PENDING;
            docs[`${documentType}RejectionReason`] = null;
            docs.submittedAt = new Date();
            await docs.save();
        }

        // Update User verification status to IN_PROGRESS if NOT_SUBMITTED
        if (user.verificationStatus === VerificationStatus.NOT_SUBMITTED || user.verificationStatus === VerificationStatus.REJECTED) {
            user.verificationStatus = VerificationStatus.IN_PROGRESS;
            await user.save();
        }

        // Notify Admins
        try {
            const superAdmin = await User.findOne({ where: { userType: UserType.SUPER_ADMIN } });
            if (superAdmin) {
                await Notification.create({
                    userId: superAdmin.id,
                    type: NotificationType.VERIFICATION_DOC_SUBMITTED,
                    title: 'Nuevo Documento Subido',
                    message: `${user.name} ha subido su ${documentType}.`,
                    metadata: { tenantId: user.id, documentType },
                    isRead: false,
                    createdAt: new Date()
                });
            }
        } catch (notificationError) {
            console.error('Error creating notification:', notificationError);
        }

        try {
            await ActivityLog.create({
                type: 'verification_doc_submitted',
                message: `${user.name} subió documento de verificación: ${documentType}`,
                userId: user.id,
                timestamp: new Date()
            });
        } catch (activityError) {
            console.error('Error creating activity log:', activityError);
        }

        res.json({
            message: 'Document submitted successfully',
            documentType,
            status: DocumentVerificationStatus.PENDING
        });

    } catch (error) {
        next(error);
    }
};

export const getVerificationProgress = async (req, res, next) => {
    try {
        const { userId } = req.params;
        if (req.auth.userId !== userId) {
            return next(forbidden('No tienes permiso para ver el progreso de verificación de este usuario', {
                code: 'VERIFICATION_PROGRESS_FORBIDDEN'
            }));
        }

        const docs = await UserVerificationDocuments.findByPk(userId);
        const user = await User.findByPk(userId, { 
            attributes: ['verificationStatus', 'name', 'userType'],
            include: [
                {
                    model: UserIdentificationDetails,
                    as: 'identification',
                    attributes: ['idType', 'idNumber']
                },
                {
                    model: UserProfile,
                    as: 'profile',
                    attributes: ['birthDate']
                }
            ]
        });

        if (!user) {
            return next(notFound('User not found', { code: 'USER_NOT_FOUND' }));
        }

        const userInfo = {
            name: user.name,
            userType: user.userType,
            idType: user.identification?.idType,
            idNumber: user.identification?.idNumber,
            birthDate: user.profile?.birthDate
        };

        if (!docs) {
            return res.json({
                globalStatus: user.verificationStatus,
                userInfo,
                documents: {
                    idFront: { status: DocumentVerificationStatus.NOT_SUBMITTED, url: null, rejectionReason: null },
                    idBack: { status: DocumentVerificationStatus.NOT_SUBMITTED, url: null, rejectionReason: null },
                    selfie: { status: DocumentVerificationStatus.NOT_SUBMITTED, url: null, rejectionReason: null },
                    utilityBill: { status: DocumentVerificationStatus.NOT_SUBMITTED, url: null, rejectionReason: null }
                }
            });
        }

        res.json({
            globalStatus: user.verificationStatus,
            userInfo,
            documents: {
                idFront: { status: docs.idFrontStatus, url: docs.idFront, rejectionReason: docs.idFrontRejectionReason },
                idBack: { status: docs.idBackStatus, url: docs.idBack, rejectionReason: docs.idBackRejectionReason },
                selfie: { status: docs.selfieStatus, url: docs.selfie, rejectionReason: docs.selfieRejectionReason },
                utilityBill: { status: docs.utilityBillStatus, url: docs.utilityBill, rejectionReason: docs.utilityBillRejectionReason }
            }
        });

    } catch (error) {
        next(error);
    }
};

export const reviewSingleDocument = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { documentType, status, reason } = req.body; // status should be 'approved' or 'rejected'

        if (!userId || !documentType || !status) {
            return next(badRequest('Missing required fields', {
                code: 'VERIFICATION_REQUIRED_FIELDS_MISSING'
            }));
        }

        const validDocumentTypes = ['idFront', 'idBack', 'selfie', 'utilityBill'];
        if (!validDocumentTypes.includes(documentType)) {
            return next(badRequest('Invalid document type', {
                code: 'VERIFICATION_INVALID_DOCUMENT_TYPE'
            }));
        }

        if (status === DocumentVerificationStatus.REJECTED && !reason) {
            return next(badRequest('Reason is required when rejecting a document', {
                code: 'VERIFICATION_REJECTION_REASON_REQUIRED'
            }));
        }

        const docs = await UserVerificationDocuments.findByPk(userId);
        const user = await User.findByPk(userId);

        if (!docs || !user) {
            return next(notFound('Documentation or user not found', {
                code: 'VERIFICATION_DOCUMENTS_OR_USER_NOT_FOUND'
            }));
        }

        // Apply document status update
        docs[`${documentType}Status`] = status;
        if (status === DocumentVerificationStatus.REJECTED) {
            docs[`${documentType}RejectionReason`] = reason;
        } else {
            docs[`${documentType}RejectionReason`] = null;
        }
        await docs.save();

        // Notify user about the specific document
        try {
            await Notification.create({
                userId: user.id,
                type: status === DocumentVerificationStatus.APPROVED ? NotificationType.VERIFICATION_DOC_APPROVED : NotificationType.VERIFICATION_DOC_REJECTED,
                title: status === DocumentVerificationStatus.APPROVED ? 'Documento Aprobado' : 'Documento Rechazado',
                message: status === DocumentVerificationStatus.APPROVED 
                    ? `Tu documento (${documentType}) fue aprobado.` 
                    : `Tu documento (${documentType}) fue rechazado: ${reason}`,
                metadata: { documentType },
                isRead: false,
                createdAt: new Date()
            });
        } catch (notificationError) {
            console.error('Error creating notification:', notificationError);
        }

        // Check if ALL required documents are now APPROVED to update Global Status
        const requiredDocs = ['idFrontStatus', 'idBackStatus', 'selfieStatus'];
        if (user.userType === UserType.OWNER) requiredDocs.push('utilityBillStatus');

        const allApproved = requiredDocs.every(docStatusField => docs[docStatusField] === DocumentVerificationStatus.APPROVED);
        const anyRejected = requiredDocs.some(docStatusField => docs[docStatusField] === DocumentVerificationStatus.REJECTED);

        if (allApproved) {
            user.verificationStatus = VerificationStatus.VERIFIED;
            await user.save();
            // Optional: send generic "You are fully verified" notification
            try {
                await Notification.create({
                    userId: user.id,
                    type: NotificationType.VERIFICATION_APPROVED,
                    title: '¡Identidad Verificada!',
                    message: 'Todos tus documentos han sido validados exitosamente.',
                    isRead: false,
                    createdAt: new Date()
                });
            } catch (err) {}
        } else if (anyRejected) {
            // Keep IN_PROGRESS, but maybe flag some sort of pending revision?
            // "REJECTED" at user level could mean "entire request denied", but we use individual docs for that.
            user.verificationStatus = VerificationStatus.IN_PROGRESS;
            await user.save();
        } else {
            // At least one is still IN_PROGRESS/PENDING
            user.verificationStatus = VerificationStatus.IN_PROGRESS;
            await user.save();
        }

        res.json({
            message: `Document ${documentType} marked as ${status}`,
            documentType,
            status,
            globalStatus: user.verificationStatus
        });

    } catch (error) {
        next(error);
    }
};

export default {
    submitVerificationDocuments,
    getVerificationDocuments,
    getPendingVerifications,
    approveVerification,
    rejectVerification,
    submitSingleDocument,
    getVerificationProgress,
    reviewSingleDocument
};
