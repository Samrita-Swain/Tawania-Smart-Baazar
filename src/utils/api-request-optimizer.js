/**
 * API Request Optimizer
 * 
 * This utility optimizes API requests by:
 * 1. Debouncing requests to prevent excessive API calls
 * 2. Caching responses to reduce server load
 * 3. Handling rate limiting with automatic retries
 * 4. Batching similar requests together
 */

import { debounceRequest, clearRequestCache } from './requestDebouncer';

// Default cache durations for different types of data (in milliseconds)
const DEFAULT_CACHE_DURATIONS = {
  products: 30 * 1000,       // 30 seconds
  categories: 60 * 1000,     // 1 minute
  stores: 5 * 60 * 1000,     // 5 minutes
  users: 2 * 60 * 1000,      // 2 minutes
  orders: 30 * 1000,         // 30 seconds
  warehouse: 30 * 1000,      // 30 seconds
  auth: 0                    // No caching for auth requests
};

// Request batch queues
const requestBatches = new Map();

/**
 * Optimizes an API request function
 * 
 * @param {Function} requestFn - The API request function to optimize
 * @param {Object} options - Optimization options
 * @param {string} options.type - The type of data being requested (e.g., 'products', 'categories')
 * @param {number} options.cacheDuration - Cache duration in milliseconds (overrides default)
 * @param {boolean} options.useCache - Whether to use caching (default: true)
 * @param {boolean} options.batchable - Whether the request can be batched with similar requests
 * @param {number} options.debounceTime - Debounce time in milliseconds
 * @param {number} options.retries - Number of retries for failed requests
 * @param {number} options.retryDelay - Delay between retries in milliseconds
 * @returns {Function} - Optimized request function
 */
export const optimizeRequest = (requestFn, options = {}) => {
  const {
    type = 'default',
    cacheDuration = DEFAULT_CACHE_DURATIONS[type] || 0,
    useCache = cacheDuration > 0,
    batchable = false,
    debounceTime = 300,
    retries = 3,
    retryDelay = 1000
  } = options;
  
  // Create a debounced version of the request
  const debouncedRequest = debounceRequest(
    async (...args) => {
      // Add cache-busting parameter if not already present
      if (args[0] && typeof args[0] === 'object' && !args[0]._) {
        args[0]._ = Date.now();
      }
      
      // Execute the request with retry logic
      return executeWithRetry(
        () => requestFn(...args),
        retries,
        retryDelay
      );
    },
    {
      debounceTime,
      cacheExpiration: cacheDuration,
      useCache
    }
  );
  
  // If the request is batchable, return a batched version
  if (batchable) {
    return createBatchedRequest(debouncedRequest, type);
  }
  
  // Otherwise, return the debounced request
  return debouncedRequest;
};

/**
 * Executes a function with automatic retry on failure
 * 
 * @param {Function} fn - The function to execute
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delay - Delay between retries in milliseconds
 * @returns {Promise} - Promise that resolves with the function result
 */
const executeWithRetry = async (fn, maxRetries, delay) => {
  let lastError = null;
  
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Check if we should retry
      if (attempt <= maxRetries) {
        // If rate limited, use the retry-after header if available
        if (error.response?.status === 429) {
          const retryAfter = parseInt(error.response.headers['retry-after'] || '1', 10);
          const retryMs = retryAfter * 1000;
          
          console.warn(`Rate limited. Retrying after ${retryAfter} seconds...`);
          await new Promise(resolve => setTimeout(resolve, retryMs));
        } else {
          // For other errors, use exponential backoff
          const backoffDelay = delay * Math.pow(2, attempt - 1);
          console.warn(`Request failed. Retrying in ${backoffDelay}ms... (Attempt ${attempt}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
        }
      } else {
        // We've exhausted all retries
        throw lastError;
      }
    }
  }
};

/**
 * Creates a batched version of a request function
 * 
 * @param {Function} requestFn - The request function to batch
 * @param {string} type - The type of data being requested
 * @returns {Function} - Batched request function
 */
const createBatchedRequest = (requestFn, type) => {
  return async (...args) => {
    const batchKey = `${type}-${JSON.stringify(args)}`;
    
    // If there's already a batch in progress for this request, join it
    if (requestBatches.has(batchKey)) {
      return requestBatches.get(batchKey);
    }
    
    // Create a new batch
    const batchPromise = requestFn(...args);
    requestBatches.set(batchKey, batchPromise);
    
    try {
      // Execute the batch and return the result
      const result = await batchPromise;
      return result;
    } finally {
      // Clean up the batch
      requestBatches.delete(batchKey);
    }
  };
};

/**
 * Clears all API request caches
 */
export const clearApiCache = () => {
  clearRequestCache();
  console.log('API request cache cleared');
};

export default {
  optimizeRequest,
  clearApiCache
};
