import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from '../../lib/axios';
import { Property, SearchFilters } from '../../types';

// State interface
interface PropertiesState {
    items: Property[];
    currentProperty: Property | null;
    loading: boolean;
    error: string | null;
    filters: SearchFilters;
}

// Initial state
const initialState: PropertiesState = {
    items: [],
    currentProperty: null,
    loading: false,
    error: null,
    filters: {}
};

// ==================== THUNKS ====================

/**
 * Fetch all properties with optional filters
 * GET /api/properties?city=X&type=Y&priceMin=Z
 */
export const fetchProperties = createAsyncThunk(
    'properties/fetchProperties',
    async (filters: SearchFilters | undefined, { rejectWithValue }) => {
        try {
            const params = new URLSearchParams();

            if (filters?.departmentId) params.append('departmentId', filters.departmentId.toString());
            if (filters?.city) params.append('city', filters.city);
            if (filters?.type) params.append('type', filters.type);
            if (filters?.priceMin) params.append('minPrice', filters.priceMin.toString());
            if (filters?.priceMax) params.append('maxPrice', filters.priceMax.toString());
            if (filters?.rooms) params.append('minBedrooms', filters.rooms.toString());
            if (filters?.bathrooms) params.append('minBathrooms', filters.bathrooms.toString());
            if (filters?.university) params.append('university', filters.university);
            if (filters?.status) params.append('status', filters.status);
            if (filters?.institutionId) params.append('institutionId', filters.institutionId.toString());
            if (filters?.institutionType) params.append('institutionType', filters.institutionType);
            if (filters?.amenities && filters.amenities.length > 0) {
                params.append('amenities', filters.amenities.join(','));
            }

            // Default: Hide rented properties from public search results
            // Unless explicitly requested (e.g. by passing isRented in filters, though UI doesn't support that yet)
            if (filters?.isRented !== undefined) {
                params.append('isRented', String(filters.isRented));
            } else {
                params.append('isRented', 'false');
            }

            const response = await axios.get(`/properties?${params.toString()}`);
            return response.data.data as Property[];
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch properties');
        }
    }
);

/**
 * Fetch a single property by ID
 * GET /api/properties/:id
 */
export const fetchPropertyById = createAsyncThunk(
    'properties/fetchPropertyById',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await axios.get(`/properties/${id}`);
            // Backend returns property directly, not wrapped in data.data
            return response.data as Property;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch property');
        }
    }
);

/**
 * Fetch properties by user/owner ID
 * GET /api/properties/user/:userId
 */
export const fetchUserProperties = createAsyncThunk(
    'properties/fetchUserProperties',
    async (userId: string, { rejectWithValue }) => {
        try {
            const response = await axios.get(`/properties/user/${userId}`);
            return response.data.data as Property[];
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch user properties');
        }
    }
);

/**
 * Create a new property
 * POST /api/properties
 */
export const createProperty = createAsyncThunk(
    'properties/createProperty',
    async (propertyData: Partial<Property>, { rejectWithValue, getState }) => {
        try {
            // Get the current user's ID from auth state
            const state = getState() as any;
            const ownerId = state.auth.user?.id;

            if (!ownerId) {
                return rejectWithValue('User not authenticated');
            }

            // Include ownerId in the request
            const response = await axios.post('/properties', {
                ...propertyData,
                ownerId
            });
            // Handle potentially different response structures
            // Some endpoints return { data: ... } while others return object directly
            return (response.data.data || response.data) as Property;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create property');
        }
    }
);

/**
 * Update an existing property
 * PUT /api/properties/:id
 */
export const updateProperty = createAsyncThunk(
    'properties/updateProperty',
    async ({ id, data }: { id: string; data: Partial<Property> }, { rejectWithValue }) => {
        try {
            const response = await axios.put(`/properties/${id}`, data);
            // Handle both response formats: response.data.data or response.data
            const property = response.data.data || response.data;
            return property as Property;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update property');
        }
    }
);

/**
 * Delete a property
 * DELETE /api/properties/:id
 */
export const deleteProperty = createAsyncThunk(
    'properties/deleteProperty',
    async (id: string, { rejectWithValue }) => {
        try {
            await axios.delete(`/properties/${id}`);
            return Number(id); // Convert to number to match Property.id type
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete property');
        }
    }
);

/**
 * Approve a property (admin only)
 * PUT /api/properties/:id/approve
 */
export const approveProperty = createAsyncThunk(
    'properties/approveProperty',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await axios.put(`/properties/${id}/approve`);
            return response.data.data as Property;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to approve property');
        }
    }
);

/**
 * Reject a property (admin only)
 * PUT /api/properties/:id/reject
 */
export const rejectProperty = createAsyncThunk(
    'properties/rejectProperty',
    async ({ id, reason }: { id: string; reason: string }, { rejectWithValue }) => {
        try {
            const response = await axios.put(`/properties/${id}/reject`, { reason });
            return response.data.data as Property;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to reject property');
        }
    }
);

/**
 * Toggle featured status (admin only)
 * PUT /api/properties/:id/toggle-featured
 */
export const toggleFeatured = createAsyncThunk(
    'properties/toggleFeatured',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await axios.put(`/properties/${id}/toggle-featured`);
            return response.data.data as Property;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to toggle featured status');
        }
    }
);

/**
 * Toggle rented status (owner only)
 * PUT /api/properties/:id/toggle-rented
 */
export const toggleRented = createAsyncThunk(
    'properties/toggleRented',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await axios.put(`/properties/${id}/toggle-rented`);
            return response.data.data as Property;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to toggle rented status');
        }
    }
);

/**
 * Toggle unit rented status (owner only)
 * PATCH /api/units/:id/rental-status
 */
export const toggleUnitRented = createAsyncThunk(
    'properties/toggleUnitRented',
    async ({ unitId, isRented }: { unitId: string; isRented: boolean }, { rejectWithValue }) => {
        try {
            const response = await axios.patch(`/units/${unitId}/rental-status`, { isRented });
            return { unitId, isRented: response.data.data?.isRented ?? isRented };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to toggle unit rented status');
        }
    }
);

// ==================== SLICE ====================

const propertiesSlice = createSlice({
    name: 'properties',
    initialState,
    reducers: {
        // Set search filters
        setFilters: (state, action: PayloadAction<SearchFilters>) => {
            state.filters = action.payload;
        },

        // Clear current property
        clearCurrentProperty: (state) => {
            state.currentProperty = null;
        },

        // Clear error
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        // Fetch Properties
        builder
            .addCase(fetchProperties.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProperties.fulfilled, (state, action) => {
                state.loading = false;
                // Filter out containers where all units are rented
                state.items = action.payload.filter(p => {
                    if (p.isContainer && p.rentalMode === 'by_unit') {
                        // Check if it has 0 available units (or if backend doesn't send availableUnits, fallback to checking units array)
                        const explicitlyZero = p.availableUnits === 0;
                        const implicitlyZero = p.units && p.units.filter(u => !u.isRented).length === 0;

                        // If we have availableUnits property and it's 0, hide it. 
                        // If we don't have availableUnits but we have units[], check if all are rented.
                        if (explicitlyZero || (p.availableUnits === undefined && implicitlyZero)) {
                            return false;
                        }
                    }
                    return true;
                });
            })
            .addCase(fetchProperties.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Fetch Property By ID
        builder
            .addCase(fetchPropertyById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPropertyById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentProperty = action.payload;
                // Also add to items array if not already present (for cache consistency)
                const existingIndex = state.items.findIndex(p => p.id === action.payload.id);
                if (existingIndex === -1) {
                    state.items.push(action.payload);
                } else {
                    state.items[existingIndex] = action.payload;
                }
            })
            .addCase(fetchPropertyById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Fetch User Properties
        builder
            .addCase(fetchUserProperties.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserProperties.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchUserProperties.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Update property
            .addCase(updateProperty.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateProperty.fulfilled, (state, action) => {
                state.loading = false;
                // Update in items list if it exists
                const index = state.items.findIndex(p => p.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
                // Update current property if it's the one we're viewing
                if (state.currentProperty?.id === action.payload.id) {
                    state.currentProperty = action.payload;
                }
            })
            .addCase(updateProperty.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Create Property
        builder
            .addCase(createProperty.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createProperty.fulfilled, (state, action) => {
                state.loading = false;
                state.items.push(action.payload);
            })
            .addCase(createProperty.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });



        // Delete Property
        builder
            .addCase(deleteProperty.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteProperty.fulfilled, (state, action) => {
                state.loading = false;
                state.items = state.items.filter(p => p.id !== action.payload);
                if (state.currentProperty?.id === action.payload) {
                    state.currentProperty = null;
                }
            })
            .addCase(deleteProperty.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Approve Property
        builder
            .addCase(approveProperty.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(approveProperty.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.items.findIndex(p => p.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            .addCase(approveProperty.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Reject Property
        builder
            .addCase(rejectProperty.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(rejectProperty.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.items.findIndex(p => p.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            .addCase(rejectProperty.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Toggle Featured
        builder
            .addCase(toggleFeatured.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(toggleFeatured.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.items.findIndex(p => p.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            .addCase(toggleFeatured.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Toggle Rented
        builder
            .addCase(toggleRented.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(toggleRented.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.items.findIndex(p => p.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
                if (state.currentProperty?.id === action.payload.id) {
                    state.currentProperty = action.payload;
                }
            })
            .addCase(toggleRented.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Toggle Unit Rented
        builder
            .addCase(toggleUnitRented.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(toggleUnitRented.fulfilled, (state, action) => {
                state.loading = false;
                const { unitId, isRented } = action.payload;

                // Find the container that has this unit
                const containerIndex = state.items.findIndex(p =>
                    p.units?.some(u => u.id === parseInt(unitId))
                );

                if (containerIndex !== -1) {
                    const container = state.items[containerIndex];
                    if (container.units) {
                        const unitIndex = container.units.findIndex(u => u.id === parseInt(unitId));
                        if (unitIndex !== -1) {
                            // Update the unit's rental status
                            container.units[unitIndex].isRented = isRented;
                        }
                    }
                }
            })
            .addCase(toggleUnitRented.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    }
});

// Export actions
export const { setFilters, clearCurrentProperty, clearError } = propertiesSlice.actions;

// Export reducer
export default propertiesSlice.reducer;
