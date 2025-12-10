import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import { sequelize, testConnection } from './config/database.js';
import { seedEnums } from './config/seedEnums.js';

// Import all routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import verificationRoutes from './routes/verificationRoutes.js';
import amenityRoutes from './routes/amenityRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import paymentRequestRoutes from './routes/paymentRequestRoutes.js';
import studentRequestRoutes from './routes/studentRequestRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import activityLogRoutes from './routes/activityLogRoutes.js';
import systemConfigRoutes from './routes/systemConfigRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for base64 images
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check route
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'EstuArriendo API is running',
        timestamp: new Date().toISOString(),
        version: '2.0.0'
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/amenities', amenityRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/payment-requests', paymentRequestRoutes);
app.use('/api/student-requests', studentRequestRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/system-config', systemConfigRoutes);
app.use('/api/upload', uploadRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Initialize database and start server
const startServer = async () => {
    try {
        await testConnection();

        // Seed ENUM types before syncing models
        await seedEnums();

        // Sync database
        // Note: We use sync() without alter to avoid ENUM recreation conflicts
        // ENUMs are managed separately via seedEnums()
        if (process.env.NODE_ENV === 'development') {
            // Only create tables if they don't exist, don't alter existing ones
            // This prevents Sequelize from trying to recreate ENUMs
            await sequelize.sync({ force: false, alter: true });
            console.log('✅ Database models synchronized');
        }

        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🗄️  Database: ${process.env.DB_NAME}`);
            console.log(`\n📋 Available routes:`);
            console.log(`   - GET  /api/health`);
            console.log(`   - *    /api/auth`);
            console.log(`   - *    /api/users`);
            console.log(`   - *    /api/verification`);
            console.log(`   - *    /api/amenities`);
            console.log(`   - *    /api/properties`);
            console.log(`   - *    /api/payment-requests`);
            console.log(`   - *    /api/student-requests`);
            console.log(`   - *    /api/notifications`);
            console.log(`   - *    /api/activity-logs`);
            console.log(`   - *    /api/system-config`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

export default app;
