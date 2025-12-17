import { Favorite, Property, PropertyImage, PropertyType, Location, User } from '../models/index.js';

/**
 * Get all favorite properties for the authenticated user
 */
export const getUserFavorites = async (req, res) => {
    try {
        const userId = req.user.id;

        const favorites = await Favorite.findAll({
            where: { userId },
            include: [
                {
                    model: Property,
                    as: 'property',
                    include: [
                        {
                            model: PropertyImage,
                            as: 'images'
                        },
                        {
                            model: PropertyType,
                            as: 'type'
                        },
                        {
                            model: Location,
                            as: 'location'
                        },
                        {
                            model: User,
                            as: 'owner',
                            attributes: { exclude: ['password'] } // Exclude sensitive data
                        }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        // Extract just the properties from the favorites
        const properties = favorites.map(fav => fav.property);

        res.json(properties);
    } catch (error) {
        console.error('Error fetching user favorites:', error);
        res.status(500).json({
            message: 'Error al obtener favoritos',
            error: error.message
        });
    }
};

/**
 * Add a property to user's favorites
 */
export const addFavorite = async (req, res) => {
    try {
        const userId = req.user.id;
        const { propertyId } = req.params;

        // Check if property exists
        const property = await Property.findByPk(propertyId);

        if (!property) {
            return res.status(404).json({ message: 'Propiedad no encontrada' });
        }

        // Check if already favorited
        const existingFavorite = await Favorite.findOne({
            where: { userId, propertyId }
        });

        if (existingFavorite) {
            return res.status(400).json({ message: 'Esta propiedad ya está en tus favoritos' });
        }

        // Create favorite
        await Favorite.create({
            userId,
            propertyId,
            createdAt: new Date()
        });

        res.status(201).json({
            message: 'Propiedad agregada a favoritos',
            propertyId
        });
    } catch (error) {
        console.error('Error adding favorite:', error);
        res.status(500).json({
            message: 'Error al agregar a favoritos',
            error: error.message
        });
    }
};

/**
 * Remove a property from user's favorites
 */
export const removeFavorite = async (req, res) => {
    try {
        const userId = req.user.id;
        const { propertyId } = req.params;

        const deleted = await Favorite.destroy({
            where: { userId, propertyId }
        });

        if (deleted === 0) {
            return res.status(404).json({ message: 'Favorito no encontrado' });
        }

        res.json({
            message: 'Propiedad eliminada de favoritos',
            propertyId
        });
    } catch (error) {
        console.error('Error removing favorite:', error);
        res.status(500).json({
            message: 'Error al eliminar de favoritos',
            error: error.message
        });
    }
};

/**
 * Check if a property is favorited by the user
 */
export const checkFavorite = async (req, res) => {
    try {
        const userId = req.user.id;
        const { propertyId } = req.params;

        const favorite = await Favorite.findOne({
            where: { userId, propertyId }
        });

        res.json({
            isFavorite: !!favorite,
            propertyId
        });
    } catch (error) {
        console.error('Error checking favorite:', error);
        res.status(500).json({
            message: 'Error al verificar favorito',
            error: error.message
        });
    }
};
