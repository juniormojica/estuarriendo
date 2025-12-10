import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../lib/axios';
import { Amenity } from '../../types';

interface AmenitiesState {
    items: Amenity[];
    loading: boolean;
    error: string | null;
}

const initialState: AmenitiesState = {
    items: [],
    loading: false,
    error: null,
};

// Async Thunks
export const fetchAmenities = createAsyncThunk<Amenity[], void>(
    'amenities/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/amenities');
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Error al cargar amenidades');
        }
    }
);

export const createAmenity = createAsyncThunk<Amenity, Partial<Amenity>>(
    'amenities/create',
    async (amenityData, { rejectWithValue }) => {
        try {
            const response = await apiClient.post('/amenities', amenityData);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Error al crear amenidad');
        }
    }
);

export const updateAmenity = createAsyncThunk<Amenity, { id: string; data: Partial<Amenity> }>(
    'amenities/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await apiClient.put(`/amenities/${id}`, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Error al actualizar amenidad');
        }
    }
);

export const deleteAmenity = createAsyncThunk<string, string>(
    'amenities/delete',
    async (id, { rejectWithValue }) => {
        try {
            await apiClient.delete(`/amenities/${id}`);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Error al eliminar amenidad');
        }
    }
);

// Slice
const amenitiesSlice = createSlice({
    name: 'amenities',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch Amenities
        builder
            .addCase(fetchAmenities.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAmenities.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
                state.error = null;
            })
            .addCase(fetchAmenities.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Create Amenity
        builder
            .addCase(createAmenity.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createAmenity.fulfilled, (state, action) => {
                state.loading = false;
                state.items.push(action.payload);
                state.error = null;
            })
            .addCase(createAmenity.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Update Amenity
        builder
            .addCase(updateAmenity.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateAmenity.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.items.findIndex(item => item.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
                state.error = null;
            })
            .addCase(updateAmenity.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Delete Amenity
        builder
            .addCase(deleteAmenity.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteAmenity.fulfilled, (state, action) => {
                state.loading = false;
                state.items = state.items.filter(item => item.id !== action.payload);
                state.error = null;
            })
            .addCase(deleteAmenity.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearError } = amenitiesSlice.actions;
export default amenitiesSlice.reducer;
