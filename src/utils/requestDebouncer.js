/**
 * Request Debouncer Utility
 * 
 * This utility prevents excessive API calls by debouncing requests
 * and implementing a cache to avoid duplicate requests.
 */

// Request cache to store responses
const requestCache = new Map();

// Request timestamps to track when requests were made
const requestTimestamps = new Map();

// Default cache expiration time (5 minutes)
const DEFAULT_CACHE_EXPIRATION = 5 * 60 * 1000;

// Default debounce time (500ms)
const DEFAULT_DEBOUNCE_TIME = 500;

// Minimum time between identical requests (2 seconds)
const MIN_REQUEST_INTERVAL = 2000;

/**
 * Debounces a request function to prevent excessive API calls
 * 
 * @param {Function} requestFn - The request function to debounce
 * @param {Object} options - Options for debouncing
 * @param {number} options.debounceTime - Time in ms to debounce (default: 500ms)
 * @param {number} options.cacheExpiration - Time in ms for cache expiration (default: 5 minutes)
 * @param {boolean} options.useCache - Whether to use caching (default: true)
 * @returns {Function} - Debounced request function
 */
export const debounceRequest = (requestFn, options = {}) => {
  const {
    debounceTime = DEFAULT_DEBOUNCE_TIME,
    cacheExpiration = DEFAULT_CACHE_EXPIRATION,
    useCache = true
  } = options;
  
  // Store timeout IDs for each request key
  const timeouts = new Map();
  
  return async (...args) => {
    // Create a unique key for this request based on the function name and arguments
    const requestKey = `${requestFn.name || 'anonymous'}-${JSON.stringify(args)}`;
    
    // Check if we've made this exact request recently
    const lastRequestTime = requestTimestamps.get(requestKey) || 0;
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    // If the same request was made too recently, use cached response or wait
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      console.log(`Request to ${requestKey} throttled (made ${timeSinceLastRequest}ms ago)`);
      
      // If we have a cached response, return it
      if (useCache && requestCache.has(requestKey)) {
        console.log(`Using cached response for ${requestKey}`);
        return requestCache.get(requestKey);
      }
      
      // Otherwise, wait until the minimum interval has passed
      await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
    }
    
    // Update the timestamp for this request
    requestTimestamps.set(requestKey, Date.now());
    
    // If we have a cached response that hasn't expired, return it
    if (useCache && requestCache.has(requestKey)) {
      const { timestamp, response } = requestCache.get(requestKey);
      if (now - timestamp < cacheExpiration) {
        console.log(`Using cached response for ${requestKey}`);
        return response;
      }
    }
    
    // Clear any existing timeout for this request
    if (timeouts.has(requestKey)) {
      clearTimeout(timeouts.get(requestKey));
    }
    
    // Create a new promise that will resolve with the debounced request
    return new Promise((resolve, reject) => {
      // Set a timeout to execute the request after the debounce time
      const timeoutId = setTimeout(async () => {
        try {
          // Execute the request
          const response = await requestFn(...args);
          
          // Cache the response
          if (useCache) {
            requestCache.set(requestKey, {
              timestamp: Date.now(),
              response
            });
          }
          
          // Resolve the promise with the response
          resolve(response);
        } catch (error) {
          // Reject the promise with the error
          reject(error);
        } finally {
          // Clean up the timeout
          timeouts.delete(requestKey);
        }
      }, debounceTime);
      
      // Store the timeout ID
      timeouts.set(requestKey, timeoutId);
    });
  };
};

/**
 * Clears the request cache
 */
export const clearRequestCache = () => {
  requestCache.clear();
  requestTimestamps.clear();
  console.log('Request cache cleared');
};

/**
 * Gets the current size of the request cache
 * 
 * @returns {number} - Number of cached requests
 */
export const getRequestCacheSize = () => {
  return requestCache.size;
};

export default {
  debounceRequest,
  clearRequestCache,
  getRequestCacheSize
};
