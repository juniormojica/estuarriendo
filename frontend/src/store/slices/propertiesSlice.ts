import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from '../../lib/axios';
import { Property, SearchFilters } from '../types';

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
    async (filters?: SearchFilters, { rejectWithValue }) => {
        try {
            const params = new URLSearchParams();

            if (filters?.city) params.append('city', filters.city);
            if (filters?.type) params.append('type', filters.type);
            if (filters?.priceMin) params.append('priceMin', filters.priceMin.toString());
            if (filters?.priceMax) params.append('priceMax', filters.priceMax.toString());
            if (filters?.rooms) params.append('rooms', filters.rooms.toString());
            if (filters?.bathrooms) params.append('bathrooms', filters.bathrooms.toString());
            if (filters?.university) params.append('university', filters.university);
            if (filters?.amenities && filters.amenities.length > 0) {
                params.append('amenities', filters.amenities.join(','));
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
            return response.data.data as Property;
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
    async (propertyData: Partial<Property>, { rejectWithValue }) => {
        try {
            const response = await axios.post('/properties', propertyData);
            return response.data.data as Property;
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
            return response.data.data as Property;
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
            return id;
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
                state.items = action.payload;
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

        // Update Property
        builder
            .addCase(updateProperty.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateProperty.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.items.findIndex(p => p.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
                if (state.currentProperty?.id === action.payload.id) {
                    state.currentProperty = action.payload;
                }
            })
            .addCase(updateProperty.rejected, (state, action) => {
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
    }
});

// Export actions
export const { setFilters, clearCurrentProperty, clearError } = propertiesSlice.actions;

// Export reducer
export default propertiesSlice.reducer;
