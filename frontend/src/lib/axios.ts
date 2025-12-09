import axios from 'axios';

// Create axios instance with base configuration
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 seconds
});

// Request interceptor to add JWT token to headers
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('estuarriendo_token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle 401 Unauthorized (token expired or invalid)
        if (error.response?.status === 401) {
            // Clear token
            localStorage.removeItem('estuarriendo_token');
            localStorage.removeItem('estuarriendo_current_user');

            // Only redirect if on a protected page
            const currentPath = window.location.pathname;
            const publicPaths = ['/', '/login', '/registro', '/forgot-password', '/reset-password', '/planes', '/favoritos'];
            const isPublicPath = publicPaths.some(path => currentPath === path || currentPath.startsWith('/propiedad/'));

            if (!isPublicPath) {
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
