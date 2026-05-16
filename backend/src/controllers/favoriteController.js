import { Favorite, Property, PropertyImage, PropertyType, Location, User } from '../models/index.js';
import { conflict, notFound } from '../errors/AppError.js';

/**
 * Get all favorite properties for the authenticated user
 */
export const getUserFavorites = async (req, res, next) => {
    try {
        const userId = req.userId;

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
        next(error);
    }
};

/**
 * Add a property to user's favorites
 */
export const addFavorite = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { propertyId } = req.params;

        // Check if property exists
        const property = await Property.findByPk(propertyId);

        if (!property) {
            return next(notFound('Propiedad no encontrada', { code: 'PROPERTY_NOT_FOUND' }));
        }

        // Check if already favorited
        const existingFavorite = await Favorite.findOne({
            where: { userId, propertyId }
        });

        if (existingFavorite) {
            return next(conflict('Esta propiedad ya está en tus favoritos', { code: 'FAVORITE_ALREADY_EXISTS' }));
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
        next(error);
    }
};

/**
 * Remove a property from user's favorites
 */
export const removeFavorite = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { propertyId } = req.params;

        const deleted = await Favorite.destroy({
            where: { userId, propertyId }
        });

        if (deleted === 0) {
            return next(notFound('Favorito no encontrado', { code: 'FAVORITE_NOT_FOUND' }));
        }

        res.json({
            message: 'Propiedad eliminada de favoritos',
            propertyId
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Check if a property is favorited by the user
 */
export const checkFavorite = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { propertyId } = req.params;

        const favorite = await Favorite.findOne({
            where: { userId, propertyId }
        });

        res.json({
            isFavorite: !!favorite,
            propertyId
        });
    } catch (error) {
        next(error);
    }
};
