import { mockOrderService, mockUserService, mockStoreService, mockProductService, mockCategoryService } from './mockApi';
import apiClient from './api-client';
import { optimizeRequest, clearApiCache } from '../utils/api-request-optimizer';
import axios from 'axios';

// Flag to use mock API instead of real API
const USE_MOCK_API = false; // Always use real API

// Get API URL from environment variables or use a default
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Create a standard axios instance for backward compatibility
const api = axios.create({
  baseURL: API_URL, // Use environment variable
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Log API configuration
console.log('Enhanced API client configured with request optimization, debouncing, caching, and retry mechanism');

// Check database connection health on startup
apiClient.health().then(health => {
  if (health.success) {
    console.log('Database connection is healthy');
  } else {
    console.warn('Database connection is unhealthy:', health.status);
  }
}).catch(error => {
  console.error('Failed to check database health:', error.message);
});

// Auth services with enhanced error handling and retry mechanism
export const authService = {
  login: async (email, password) => {
    try {
      console.log('Attempting to login with:', email);
      // Try the real API first
      try {
        console.log('Sending login request to API');
        const response = await apiClient.auth.login({ email, password });
        console.log('Login successful');
        return { data: response };
      } catch (apiError) {
        console.error('API login error:', apiError.message);

        // Mock login for development/testing
        if ((email === 'newadmin@twania.com' || email === 'admin@twania.com' || email === 'admin@example.com') && password === 'admin123') {
          console.log('Using mock login for development');
          // Create a mock response that matches the expected format
          const mockResponse = {
            data: {
              success: true,
              token: 'mock-jwt-token-for-development-only',
              user: {
                id: 2,
                name: 'Admin User',
                email: email,
                role: 'admin',
                storeId: null
              }
            }
          };
          console.log('Mock login response created');
          return mockResponse;
        } else {
          console.error('Invalid credentials for mock login');
          throw new Error('Invalid credentials');
        }
      }
    } catch (error) {
      console.error('Login error:', error.message);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      console.log('Registering user');
      const response = await apiClient.auth.register(userData);
      console.log('Registration successful');
      return { data: response };
    } catch (error) {
      console.error('Register error:', error.message);
      throw error;
    }
  },

  logout: async () => {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('userData');

    return {
      data: {
        success: true,
        message: 'Logged out successfully',
      },
    };
  },

  getCurrentUser: async () => {
    try {
      console.log('Getting current user');

      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, returning unauthorized');
        throw { response: { status: 401, data: { message: 'No token provided' } } };
      }

      // Set authorization header
      const headers = {
        'Authorization': `Bearer ${token}`
      };

      // Try to get user from API
      try {
        const response = await apiClient.get('/auth/me', { headers });
        console.log('Got current user successfully');
        return { data: response.data };
      } catch (apiError) {
        console.error('API error getting current user:', apiError.message);

        // If API fails, try to get a default admin user
        try {
          const defaultResponse = await apiClient.get('/users/1');
          console.log('Got default user successfully');
          return {
            data: {
              success: true,
              data: {
                user: defaultResponse.data
              }
            }
          };
        } catch (defaultError) {
          console.error('Failed to get default user:', defaultError.message);
          throw apiError; // Rethrow the original error
        }
      }
    } catch (error) {
      // Don't log 401 errors as they're expected when not logged in
      if (error.response?.status !== 401) {
        console.error('Get current user error:', error.message);
      }
      throw error;
    }
  },

  // Add health check method
  checkHealth: async () => {
    try {
      try {
        const response = await apiClient.get('/health');
        return response.data;
      } catch (apiError) {
        console.error('API health check error:', apiError.message);

        // Try a different endpoint if the health endpoint fails
        try {
          const categoriesResponse = await apiClient.get('/categories');
          if (categoriesResponse.data) {
            return {
              success: true,
              status: 'healthy',
              message: 'Server is running (categories endpoint working)',
              timestamp: new Date().toISOString()
            };
          }
        } catch (categoriesError) {
          console.error('Categories endpoint also failed:', categoriesError.message);
        }

        // Return error status
        return {
          success: false,
          status: 'error',
          message: 'Server is not responding properly',
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error('Health check error:', error.message);
      return {
        success: false,
        status: 'error',
        message: error.message
      };
    }
  }
};

// User services
export const userService = USE_MOCK_API ? mockUserService : {
  getUsers: async () => {
    try {
      console.log('Fetching users');
      const response = await apiClient.get('/users');
      console.log('Users response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  getUser: async (id) => {
    try {
      console.log(`Fetching user ${id}`);
      const response = await apiClient.get(`/users/${id}`);
      console.log('User response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  createUser: async (userData) => {
    try {
      console.log('Creating user with data:', userData);
      const response = await apiClient.post('/users', userData);
      console.log('Create user response:', response);
      return response;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  updateUser: async (id, userData) => {
    try {
      console.log(`Updating user ${id} with data:`, userData);
      const response = await apiClient.put(`/users/${id}`, userData);
      console.log('Update user response:', response);
      return response;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  deleteUser: async (id) => {
    try {
      console.log(`Deleting user ${id}`);
      const response = await apiClient.delete(`/users/${id}`);
      console.log('Delete user response:', response);
      return response;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },
};

// Product services with enhanced optimization, caching, and retry mechanism
export const productService = USE_MOCK_API ? mockProductService : {
  // Cache for products to prevent repeated API calls
  _productsCache: null,
  _productsCacheTimestamp: null,
  _productsCacheExpiry: 60000, // 1 minute cache expiry

  getProducts: async (forceRefresh = false) => {
    try {
      // Check if we have a valid cache and not forcing refresh
      const now = new Date().getTime();
      if (!forceRefresh &&
          productService._productsCache &&
          productService._productsCacheTimestamp &&
          (now - productService._productsCacheTimestamp) < productService._productsCacheExpiry) {
        console.log('[productService] Using cached products data');
        return { data: productService._productsCache };
      }

      console.log('[productService] Fetching products');
      // Add a timestamp to prevent caching issues
      const timestamp = new Date().getTime();

      // Try the admin-specific endpoint on port 5002 first
      try {
        console.log('[productService] Trying admin products endpoint');
        const response = await axios.get(`${API_URL}/admin/products?_=${timestamp}`);
        console.log(`[productService] Fetched ${response?.data?.length || 0} admin products`);

        // Update cache
        productService._productsCache = response.data;
        productService._productsCacheTimestamp = now;

        return { data: response.data };
      } catch (error) {
        console.log('[productService] Admin products endpoint on port 5002 failed, trying regular products endpoint:', error.message);

        // Try regular products endpoint
        try {
          console.log('[productService] Trying regular products endpoint');
          const response = await axios.get(`${API_URL}/products?_=${timestamp}`);
          console.log(`[productService] Fetched ${response?.data?.data?.length || 0} products from regular endpoint`);

          // Update cache
          productService._productsCache = response.data.data;
          productService._productsCacheTimestamp = now;

          return { data: response.data.data };
        } catch (error) {
          console.log('[productService] All port 5002 endpoints failed, falling back to original methods:', error.message);

          // Fall back to original methods
          let response;
          try {
            console.log('[productService] Trying products.getAll() method');
            const result = await apiClient.products.getAll({ _: timestamp });
            response = { data: result };
          } catch (error) {
            console.log('[productService] First attempt failed, trying /products endpoint:', error.message);
            try {
              response = await apiClient.get(`/products?_=${timestamp}`);
            } catch (error) {
              console.log('[productService] Second attempt failed, trying direct products endpoint:', error.message);
              // Last attempt - try without the leading slash
              response = await apiClient.get(`products?_=${timestamp}`);
            }
          }
          console.log(`[productService] Fetched ${response?.data?.data?.length || 0} products from original methods`);

          // Update cache
          productService._productsCache = response.data;
          productService._productsCacheTimestamp = now;

          return { data: response.data };
        }
      }
    } catch (error) {
      console.error('[productService] Error fetching products:', error.message);
      throw error;
    }
  },

  getFrontendProducts: async () => {
    try {
      // Try the frontend-specific endpoint on port 5002 first
      try {
        const timestamp = new Date().getTime();
        console.log('[productService] Trying frontend products endpoint');
        const response = await axios.get(`${API_URL}/frontend/products?_=${timestamp}`);
        console.log(`[productService] Fetched ${response?.data?.length || 0} frontend products`);
        return { data: response.data };
      } catch (error) {
        console.log('[productService] Frontend products endpoint on port 5002 failed:', error.message);

        // Try the original frontend-specific endpoint
        try {
          const timestamp = new Date().getTime();
          console.log('[productService] Trying original frontend products endpoint');
          const response = await apiClient.get(`/frontend/products?_=${timestamp}`);
          console.log('[productService] Successfully fetched products from original frontend endpoint');
          return { data: response.data };
        } catch (error) {
          console.log('[productService] Original frontend products endpoint failed:', error.message);

          // Fall back to regular products endpoint
          console.log('[productService] Falling back to regular products endpoint');
          const response = await productService.getProducts(true); // Force refresh
          return response;
        }
      }
    } catch (error) {
      console.error('[productService] Error fetching frontend products:', error.message);
      throw error;
    }
  },

  getProduct: async (id) => {
    try {
      const response = await apiClient.products.get(id);
      return { data: response };
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error.message);
      throw error;
    }
  },

  getFrontendProduct: async (id) => {
    try {
      // First try to get from the frontend-specific endpoint
      try {
        const timestamp = new Date().getTime();
        const response = await apiClient.get(`/frontend/products/${id}?_=${timestamp}`);
        return { data: response.data };
      } catch (error) {
        console.log('Frontend product endpoint error:', error.message);
        // Fall back to regular product endpoint
        console.log('Falling back to regular product endpoint');
        const response = await apiClient.products.get(id);
        return { data: response };
      }
    } catch (error) {
      console.error('Error fetching frontend product:', error.message);
      throw error;
    }
  },

  createProduct: async (productData) => {
    try {
      const response = await apiClient.products.create(productData);
      return { data: response };
    } catch (error) {
      console.error('Error creating product:', error.message);
      throw error;
    }
  },

  updateProduct: async (id, productData) => {
    try {
      const response = await apiClient.products.update(id, productData);
      return { data: response };
    } catch (error) {
      console.error('Error updating product:', error.message);
      throw error;
    }
  },

  deleteProduct: async (id) => {
    try {
      const response = await apiClient.products.delete(id);
      return { data: response };
    } catch (error) {
      console.error('Error deleting product:', error.message);
      throw error;
    }
  },
};

// Warehouse services
export const warehouseService = {
  getInventory: async () => {
    try {
      console.log('Fetching warehouse inventory');
      const response = await apiClient.get('/warehouse/inventory');
      console.log('Warehouse inventory API response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching warehouse inventory:', error);
      throw error;
    }
  },

  transferToStore: async (transferData) => {
    try {
      console.log('Transferring products to store:', transferData);
      const response = await apiClient.post('/warehouse/transfer', transferData);
      console.log('Transfer response:', response);
      return response;
    } catch (error) {
      console.error('Error transferring products:', error);
      throw error;
    }
  },

  getTransferHistory: async () => {
    try {
      console.log('Fetching transfer history');
      const response = await apiClient.get('/warehouse/transfers');
      console.log('Transfer history response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching transfer history:', error);
      throw error;
    }
  },

  updateInventory: async (inventoryData) => {
    try {
      console.log('Updating inventory:', inventoryData);
      const response = await apiClient.put('/warehouse/inventory', inventoryData);
      console.log('Update inventory response:', response);
      return response;
    } catch (error) {
      console.error('Error updating inventory:', error);
      throw error;
    }
  },
};

// Store services
export const storeService = USE_MOCK_API ? mockStoreService : {
  getStores: async () => {
    try {
      console.log('Fetching stores');
      const response = await apiClient.get('/stores');
      console.log('Stores response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching stores:', error);
      throw error;
    }
  },

  getStore: async (id) => {
    try {
      console.log(`Fetching store ${id}`);
      const response = await apiClient.get(`/stores/${id}`);
      console.log('Store response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching store:', error);
      throw error;
    }
  },

  getStoreInventory: async (storeId) => {
    try {
      console.log(`Fetching inventory for store ${storeId}`);
      const response = await apiClient.get(`/stores/${storeId}/inventory`);
      console.log('Store inventory response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching store inventory:', error);
      throw error;
    }
  },

  createStore: async (storeData) => {
    try {
      console.log('Creating store with data:', storeData);
      const response = await apiClient.post('/stores', storeData);
      console.log('Create store response:', response);
      return response;
    } catch (error) {
      console.error('Error creating store:', error);
      throw error;
    }
  },

  updateStore: async (id, storeData) => {
    try {
      console.log(`Updating store ${id} with data:`, storeData);
      const response = await apiClient.put(`/stores/${id}`, storeData);
      console.log('Update store response:', response);
      return response;
    } catch (error) {
      console.error('Error updating store:', error);
      throw error;
    }
  },

  deleteStore: async (id) => {
    try {
      console.log(`Deleting store ${id}`);
      const response = await apiClient.delete(`/stores/${id}`);
      console.log('Delete store response:', response);
      return response;
    } catch (error) {
      console.error('Error deleting store:', error);
      throw error;
    }
  },
};

// Order services
export const orderService = USE_MOCK_API ? mockOrderService : {
  getOrders: async () => {
    try {
      console.log('API Service: Fetching orders');

      // Add cache-busting parameter to prevent caching
      const timestamp = new Date().getTime();
      const response = await apiClient.get(`/orders?_=${timestamp}`);

      console.log('Orders response status:', response.status);
      console.log('Orders response data:', response.data);

      // Check if we got any orders
      if (response.data && response.data.data) {
        console.log('Number of orders received:', response.data.data.length);
      }

      return response;
    } catch (error) {
      console.error('Error fetching orders:', error);
      console.error('Error details:', error.response?.data || 'No response data');
      throw error;
    }
  },

  getOrder: async (id) => {
    try {
      console.log(`Fetching order ${id}`);
      const response = await apiClient.get(`/orders/${id}`);
      console.log('Order response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  },

  createOrder: async (orderData) => {
    try {
      console.log('API Service: Creating order with data:', JSON.stringify(orderData));

      // Add a timestamp to help track this specific request
      const requestId = new Date().toISOString();
      console.log('Request ID:', requestId);

      const response = await apiClient.post('/orders', orderData);
      console.log('Create order response:', response);

      // Check if the order was actually created
      if (response.data && response.data.success) {
        console.log('Order created successfully with ID:', response.data.data?.id);
      } else {
        console.warn('Order creation response did not indicate success:', response.data);
      }

      return response;
    } catch (error) {
      console.error('Error creating order:', error);
      console.error('Error details:', error.response?.data || 'No response data');
      throw error;
    }
  },

  updateOrderStatus: async (id, status) => {
    try {
      console.log(`Updating order ${id} status to ${status}`);
      const response = await apiClient.put(`/orders/${id}/status`, { status });
      console.log('Update order status response:', response);
      return response;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  updateOrder: async (id, orderData) => {
    try {
      console.log(`Updating order ${id} with data:`, orderData);
      const response = await apiClient.put(`/orders/${id}`, orderData);
      console.log('Update order response:', response);
      return response;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  },

  deleteOrder: async (id) => {
    try {
      console.log(`Deleting order ${id}`);
      const response = await apiClient.delete(`/orders/${id}`);
      console.log('Delete order response:', response);
      return response;
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  },
};

// Category services with enhanced optimization, caching, and retry mechanism
export const categoryService = USE_MOCK_API ? mockCategoryService : {
  // Cache for categories to prevent repeated API calls
  _categoriesCache: null,
  _categoriesCacheTimestamp: null,
  _categoriesCacheExpiry: 60000, // 1 minute cache expiry
  _frontendCategoriesCache: null,
  _frontendCategoriesCacheTimestamp: null,
  _categoriesWithCountsCache: null,
  _categoriesWithCountsCacheTimestamp: null,

  getCategories: async (forceRefresh = false) => {
    try {
      // Check if we have a valid cache and not forcing refresh
      const now = new Date().getTime();
      if (!forceRefresh &&
          categoryService._categoriesCache &&
          categoryService._categoriesCacheTimestamp &&
          (now - categoryService._categoriesCacheTimestamp) < categoryService._categoriesCacheExpiry) {
        console.log('[categoryService] Using cached categories data');
        return { data: categoryService._categoriesCache };
      }

      console.log('[categoryService] Fetching categories');
      // Add a timestamp to prevent caching issues
      const timestamp = new Date().getTime();

      // Try the admin-specific endpoint on port 5002 first
      try {
        console.log('[categoryService] Trying admin categories endpoint');
        const response = await axios.get(`${API_URL}/admin/categories?_=${timestamp}`);
        console.log(`[categoryService] Fetched ${response?.data?.length || 0} admin categories`);

        // Update cache
        categoryService._categoriesCache = response.data;
        categoryService._categoriesCacheTimestamp = now;

        return { data: response.data };
      } catch (error) {
        console.log('[categoryService] Admin categories endpoint on port 5002 failed, trying categories with counts:', error.message);

        // Try categories with counts endpoint
        try {
          console.log('[categoryService] Trying categories with counts endpoint');
          const response = await axios.get(`${API_URL}/categories/with-counts?_=${timestamp}`);
          console.log(`[categoryService] Fetched ${response?.data?.length || 0} categories with counts`);

          // Update cache
          categoryService._categoriesCache = response.data;
          categoryService._categoriesCacheTimestamp = now;

          return { data: response.data };
        } catch (error) {
          console.log('[categoryService] Categories with counts endpoint failed, trying regular categories endpoint:', error.message);

          // Try regular categories endpoint
          try {
            console.log('[categoryService] Trying regular categories endpoint');
            const response = await axios.get(`${API_URL}/categories?_=${timestamp}`);
            console.log(`[categoryService] Fetched ${response?.data?.data?.length || 0} categories from regular endpoint`);

            // Update cache
            categoryService._categoriesCache = response.data.data;
            categoryService._categoriesCacheTimestamp = now;

            return { data: response.data.data };
          } catch (error) {
            console.log('[categoryService] All port 5002 endpoints failed, falling back to original methods:', error.message);

            // Fall back to original methods
            let response;
            try {
              console.log('[categoryService] Trying categories.getAll() method');
              const result = await apiClient.categories.getAll({ _: timestamp });
              response = { data: result };
            } catch (error) {
              console.log('[categoryService] First attempt failed, trying /categories endpoint:', error.message);
              try {
                response = await apiClient.get(`/categories?_=${timestamp}`);
              } catch (error) {
                console.log('[categoryService] Second attempt failed, trying direct categories endpoint:', error.message);
                // Last attempt - try without the leading slash
                response = await apiClient.get(`categories?_=${timestamp}`);
              }
            }
            console.log(`[categoryService] Fetched ${response?.data?.data?.length || 0} categories from original methods`);

            // Update cache
            categoryService._categoriesCache = response.data;
            categoryService._categoriesCacheTimestamp = now;

            return { data: response.data };
          }
        }
      }
    } catch (error) {
      console.error('[categoryService] Error fetching categories:', error.message);
      throw error;
    }
  },

  getCategoriesWithCounts: async (forceRefresh = false) => {
    try {
      // Check if we have a valid cache and not forcing refresh
      const now = new Date().getTime();
      if (!forceRefresh &&
          categoryService._categoriesWithCountsCache &&
          categoryService._categoriesWithCountsCacheTimestamp &&
          (now - categoryService._categoriesWithCountsCacheTimestamp) < categoryService._categoriesCacheExpiry) {
        console.log('[categoryService] Using cached categories with counts data');
        return { data: categoryService._categoriesWithCountsCache };
      }

      console.log('[categoryService] Fetching categories with counts');
      // Add a timestamp to prevent caching issues
      const timestamp = new Date().getTime();

      // Try the categories with counts endpoint
      try {
        console.log('[categoryService] Trying categories with counts endpoint');
        const response = await axios.get(`${API_URL}/categories/with-counts?_=${timestamp}`);
        console.log(`[categoryService] Fetched ${response?.data?.length || 0} categories with counts`);

        // Update cache
        categoryService._categoriesWithCountsCache = response.data;
        categoryService._categoriesWithCountsCacheTimestamp = now;

        return { data: response.data };
      } catch (error) {
        console.log('[categoryService] Categories with counts endpoint failed, falling back to regular categories:', error.message);

        // Fall back to regular categories endpoint
        const result = await categoryService.getCategories(forceRefresh);
        return result;
      }
    } catch (error) {
      console.error('[categoryService] Error fetching categories with counts:', error.message);
      throw error;
    }
  },

  getFrontendCategories: async (forceRefresh = false) => {
    try {
      // Check if we have a valid cache and not forcing refresh
      const now = new Date().getTime();
      if (!forceRefresh &&
          categoryService._frontendCategoriesCache &&
          categoryService._frontendCategoriesCacheTimestamp &&
          (now - categoryService._frontendCategoriesCacheTimestamp) < categoryService._categoriesCacheExpiry) {
        console.log('[categoryService] Using cached frontend categories data');
        return { data: categoryService._frontendCategoriesCache };
      }

      console.log('[categoryService] Fetching frontend categories');
      // Add a timestamp to prevent caching issues
      const timestamp = new Date().getTime();

      // Try the frontend-specific endpoint first on port 5002
      try {
        console.log('[categoryService] Trying frontend categories endpoint');
        const response = await axios.get(`${API_URL}/frontend/categories?_=${timestamp}`);
        console.log(`[categoryService] Fetched ${response?.data?.length || 0} frontend categories`);

        // Update cache
        categoryService._frontendCategoriesCache = response.data;
        categoryService._frontendCategoriesCacheTimestamp = now;

        return { data: response.data };
      } catch (error) {
        console.log('[categoryService] Frontend categories endpoint on port 5002 failed, trying again with different path:', error.message);

        try {
          console.log('[categoryService] Trying frontend categories endpoint with different path');
          const response = await axios.get(`${API_URL}/categories?_=${timestamp}`);
          console.log(`[categoryService] Fetched ${response?.data?.length || 0} frontend categories with different path`);

          // Update cache
          categoryService._frontendCategoriesCache = response.data;
          categoryService._frontendCategoriesCacheTimestamp = now;

          return { data: response.data };
        } catch (error) {
          console.log('[categoryService] Frontend categories endpoint with different path failed, falling back to regular endpoint:', error.message);

          // Fall back to regular categories endpoint
          const result = await categoryService.getCategories(forceRefresh);
          return result;
        }
      }
    } catch (error) {
      console.error('[categoryService] Error fetching frontend categories:', error.message);
      throw error;
    }
  },

  getCategory: async (id) => {
    try {
      const response = await apiClient.categories.get(id);
      return { data: response };
    } catch (error) {
      console.error('Error fetching category:', error.message);
      throw error;
    }
  },

  createCategory: async (categoryData) => {
    try {
      // Ensure we're sending the correct data format
      const cleanData = {
        name: categoryData.name,
        description: categoryData.description,
        parentId: categoryData.parentId === '' ? null : categoryData.parentId
      };
      const response = await apiClient.categories.create(cleanData);
      return { data: response };
    } catch (error) {
      console.error('Error creating category:', error.message);
      throw error;
    }
  },

  resetCategories: async () => {
    try {
      // This is a custom endpoint, so we'll use the raw apiClient
      const response = await apiClient.post('/reset-categories');
      return { data: response.data };
    } catch (error) {
      console.error('Error resetting categories:', error.message);
      throw error;
    }
  },

  updateCategory: async (id, categoryData) => {
    try {
      // Ensure we're sending the correct data format
      const cleanData = {
        name: categoryData.name,
        description: categoryData.description,
        parentId: categoryData.parentId === '' ? null : categoryData.parentId
      };
      const response = await apiClient.categories.update(id, cleanData);
      return { data: response };
    } catch (error) {
      console.error('Error updating category:', error.message);
      throw error;
    }
  },

  deleteCategory: async (id) => {
    try {
      const response = await apiClient.categories.delete(id);
      return { data: response };
    } catch (error) {
      console.error('Error deleting category:', error.message);
      throw error;
    }
  },
};

// Utility functions
export const apiUtils = {
  clearCache: clearApiCache,
  checkHealth: async () => {
    try {
      return await apiClient.health();
    } catch (error) {
      console.error('Health check error:', error.message);
      return {
        success: false,
        status: 'error',
        message: error.message
      };
    }
  }
};

// Export the enhanced API client for direct use
export default apiClient;
