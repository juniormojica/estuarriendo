import express from 'express';
import { getUserFavorites, addFavorite, removeFavorite, checkFavorite } from '../controllers/favoriteController.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get user's favorite properties
router.get('/', getUserFavorites);

// Check if a property is favorited
router.get('/check/:propertyId', checkFavorite);

// Add property to favorites
router.post('/:propertyId', addFavorite);

// Remove property from favorites
router.delete('/:propertyId', removeFavorite);

export default router;
