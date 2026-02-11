import cloudinary from '../config/cloudinary.js';

/**
 * Generate Cloudinary Upload Signature
 * GET /api/upload/signature
 * Query: { folder: "optional_folder_name" }
 */
export const generateSignature = async (req, res) => {
    try {
        const { folder } = req.query;

        const timestamp = Math.round((new Date).getTime() / 1000);

        // Parameters to sign
        const paramsToSign = {
            timestamp: timestamp,
        };

        if (folder) {
            paramsToSign.folder = folder;
        }

        // Generate signature using Cloudinary SDK (which uses the configured API_SECRET)
        const signature = cloudinary.utils.api_sign_request(
            paramsToSign,
            process.env.CLOUDINARY_API_SECRET
        );

        res.status(200).json({
            signature,
            timestamp,
            apiKey: process.env.CLOUDINARY_API_KEY,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            folder
        });
    } catch (error) {
        console.error('Error generating Cloudinary signature:', error);
        res.status(500).json({
            error: 'Failed to generate signature',
            message: error.message
        });
    }
};
