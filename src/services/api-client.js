// Enhanced API client with retry mechanism, debouncing, and better error handling
import axios from 'axios';
import { debounceRequest } from '../utils/requestDebouncer';

// Create a custom axios instance with default config
const apiClient = axios.create({
  baseURL: 'http://localhost:5002/api', // Point directly to the simple-server.cjs
  timeout: 15000, // 15 seconds timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');

    // If token exists, add it to the request headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is due to an expired token and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Clear the invalid token
        localStorage.removeItem('token');

        // Redirect to login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }

        return Promise.reject(error);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    // Handle rate limiting (429 Too Many Requests)
    if (error.response?.status === 429) {
      const retryAfter = parseInt(error.response.headers['retry-after'] || '60', 10);
      console.warn(`Rate limited. Retry after ${retryAfter} seconds.`);

      // Only retry GET requests automatically
      if (originalRequest.method.toLowerCase() === 'get' && !originalRequest._rateLimitRetry) {
        originalRequest._rateLimitRetry = true;

        console.log(`Automatically retrying request after ${retryAfter} seconds...`);

        // Retry after the specified delay
        return new Promise(resolve => {
          setTimeout(() => resolve(apiClient(originalRequest)), retryAfter * 1000);
        });
      }

      // For non-GET requests or if we've already retried, reject with a more informative error
      return Promise.reject(new Error(`Too many requests. Please try again after ${retryAfter} seconds.`));
    }

    // Handle server errors (5xx)
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response?.data || error.message);

      // Check if we should retry the request
      if (!originalRequest._serverErrorRetry && originalRequest.method === 'get') {
        originalRequest._serverErrorRetry = true;

        // Retry after a short delay
        return new Promise(resolve => {
          setTimeout(() => resolve(apiClient(originalRequest)), 2000);
        });
      }
    }

    // Handle network errors
    if (error.message === 'Network Error') {
      console.error('Network error. Please check your connection.');

      // Check if we should retry the request
      if (!originalRequest._networkErrorRetry && originalRequest.method === 'get') {
        originalRequest._networkErrorRetry = true;

        // Retry after a short delay
        return new Promise(resolve => {
          setTimeout(() => resolve(apiClient(originalRequest)), 3000);
        });
      }
    }

    return Promise.reject(error);
  }
);

// Enhanced API methods with better error handling
const api = {
  // Auth methods
  auth: {
    login: async (credentials) => {
      try {
        const response = await apiClient.post('/auth/login', credentials);
        return response.data;
      } catch (error) {
        console.error('Login error:', error.response?.data || error.message);
        throw error;
      }
    },
    register: async (userData) => {
      try {
        const response = await apiClient.post('/auth/register', userData);
        return response.data;
      } catch (error) {
        console.error('Registration error:', error.response?.data || error.message);
        throw error;
      }
    },
    me: async () => {
      try {
        const response = await apiClient.get('/auth/me');
        return response.data;
      } catch (error) {
        // Don't log 401 errors as they're expected when not logged in
        if (error.response?.status !== 401) {
          console.error('Get current user error:', error.response?.data || error.message);
        }
        throw error;
      }
    }
  },

  // Products methods
  products: {
    getAll: async (params = {}) => {
      try {
        // Add cache-busting parameter if not already present
        if (!params._) {
          params._ = Date.now();
        }

        // Use the debounced version of the request
        const debouncedRequest = debounceRequest(async () => {
          try {
            // Try the admin panel endpoint first
            console.log('Trying admin panel products endpoint...');
            const adminResponse = await apiClient.get('/admin/products', { params });
            console.log('Admin panel products response:', adminResponse.data);
            return adminResponse.data;
          } catch (adminError) {
            console.error('Admin panel products endpoint error:', adminError.message);

            // Fall back to regular products endpoint
            console.log('Falling back to regular products endpoint...');
            const response = await apiClient.get('/products', { params });
            console.log('Regular products response:', response.data);

            // If the response is an array, wrap it in the expected format
            if (Array.isArray(response.data)) {
              return {
                success: true,
                data: response.data
              };
            }

            return response.data;
          }
        }, { debounceTime: 300, cacheExpiration: 10000 });

        return await debouncedRequest();
      } catch (error) {
        console.error('Get products error:', error.response?.data || error.message);
        throw error;
      }
    },
    get: async (id) => {
      try {
        const response = await apiClient.get(`/products/${id}`);
        return response.data;
      } catch (error) {
        console.error(`Get product ${id} error:`, error.response?.data || error.message);
        throw error;
      }
    },
    create: async (productData) => {
      try {
        const response = await apiClient.post('/products', productData);
        return response.data;
      } catch (error) {
        console.error('Create product error:', error.response?.data || error.message);
        throw error;
      }
    },
    update: async (id, productData) => {
      try {
        const response = await apiClient.put(`/products/${id}`, productData);
        return response.data;
      } catch (error) {
        console.error(`Update product ${id} error:`, error.response?.data || error.message);
        throw error;
      }
    },
    delete: async (id) => {
      try {
        const response = await apiClient.delete(`/products/${id}`);
        return response.data;
      } catch (error) {
        console.error(`Delete product ${id} error:`, error.response?.data || error.message);
        throw error;
      }
    }
  },

  // Categories methods
  categories: {
    getAll: async (params = {}) => {
      try {
        // Add cache-busting parameter if not already present
        if (!params._) {
          params._ = Date.now();
        }

        // Use the debounced version of the request
        const debouncedRequest = debounceRequest(async () => {
          const response = await apiClient.get('/categories', { params });
          return response.data;
        }, { debounceTime: 300, cacheExpiration: 30000 });

        return await debouncedRequest();
      } catch (error) {
        console.error('Get categories error:', error.response?.data || error.message);
        throw error;
      }
    },
    get: async (id) => {
      try {
        const response = await apiClient.get(`/categories/${id}`);
        return response.data;
      } catch (error) {
        console.error(`Get category ${id} error:`, error.response?.data || error.message);
        throw error;
      }
    },
    create: async (categoryData) => {
      try {
        const response = await apiClient.post('/categories', categoryData);
        return response.data;
      } catch (error) {
        console.error('Create category error:', error.response?.data || error.message);
        throw error;
      }
    },
    update: async (id, categoryData) => {
      try {
        const response = await apiClient.put(`/categories/${id}`, categoryData);
        return response.data;
      } catch (error) {
        console.error(`Update category ${id} error:`, error.response?.data || error.message);
        throw error;
      }
    },
    delete: async (id) => {
      try {
        const response = await apiClient.delete(`/categories/${id}`);
        return response.data;
      } catch (error) {
        console.error(`Delete category ${id} error:`, error.response?.data || error.message);
        throw error;
      }
    }
  },

  // Health check method
  health: async () => {
    try {
      // Add cache-busting parameter
      const params = { _: Date.now() };
      const response = await apiClient.get('/health', { params });
      return response.data;
    } catch (error) {
      console.error('Health check error:', error.response?.data || error.message);
      return {
        success: false,
        status: 'unhealthy',
        error: error.message
      };
    }
  },

  // Clear request cache
  clearCache: () => {
    try {
      // Import and use the clearRequestCache function
      const { clearRequestCache } = require('../utils/requestDebouncer');
      clearRequestCache();
      console.log('API request cache cleared');
      return { success: true };
    } catch (error) {
      console.error('Failed to clear request cache:', error.message);
      return { success: false, error: error.message };
    }
  }
};

// Add the axios instance methods to the api object
apiClient.get = apiClient.get.bind(apiClient);
apiClient.post = apiClient.post.bind(apiClient);
apiClient.put = apiClient.put.bind(apiClient);
apiClient.delete = apiClient.delete.bind(apiClient);

// Merge the api object with the apiClient instance
const enhancedApiClient = { ...apiClient, ...api };

export default enhancedApiClient;
