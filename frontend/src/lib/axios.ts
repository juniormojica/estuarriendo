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

        // Log the request details for debugging
        console.log('🌐 API Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            baseURL: config.baseURL,
            fullURL: `${config.baseURL}${config.url}`,
            hasToken: !!token
        });

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
    (response) => {
        // Log successful responses
        console.log('✅ API Response:', {
            method: response.config.method?.toUpperCase(),
            url: response.config.url,
            status: response.status,
            dataKeys: response.data ? Object.keys(response.data) : []
        });
        return response;
    },
    (error) => {
        // Log error responses
        console.error('❌ API Error:', {
            method: error.config?.method?.toUpperCase(),
            url: error.config?.url,
            status: error.response?.status,
            message: error.message,
            data: error.response?.data
        });

        // Handle 401 Unauthorized (token expired or invalid)
        if (error.response?.status === 401) {
            // Log the error but don't automatically clear tokens
            // This prevents unwanted logouts on page reload
            console.warn('401 Unauthorized - Authentication required');

            // Only clear tokens and redirect if this is an explicit auth endpoint failure
            // or if we're on a protected route and the user is trying to access it
            const isAuthEndpoint = error.config?.url?.includes('/auth/');
            const currentPath = window.location.pathname;
            const publicPaths = ['/', '/login', '/registro', '/forgot-password', '/reset-password', '/planes', '/favoritos'];
            const isPublicPath = publicPaths.some(path => currentPath === path || currentPath.startsWith('/propiedad/'));

            // Only auto-logout if:
            // 1. It's an auth endpoint (like /auth/me) failing, OR
            // 2. User is on a protected page and token is clearly invalid
            if (isAuthEndpoint && !isPublicPath) {
                localStorage.removeItem('estuarriendo_token');
                localStorage.removeItem('estuarriendo_current_user');
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
