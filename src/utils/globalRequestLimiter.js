/**
 * Global Request Limiter
 * 
 * This utility provides a global mechanism to limit API requests
 * by forcing a minimum time between requests and preventing duplicate requests.
 */

// Store of pending requests
const pendingRequests = new Map();

// Store of completed requests with their responses
const requestCache = new Map();

// Default cache expiration time (30 seconds)
const DEFAULT_CACHE_EXPIRATION = 30 * 1000;

// Minimum time between any API requests (300ms)
const MIN_REQUEST_INTERVAL = 300;

// Last request timestamp
let lastRequestTime = 0;

/**
 * Initialize the global request limiter
 * This should be called once at application startup
 */
export function initGlobalRequestLimiter() {
  // Monkey patch the global fetch function to apply our limiter
  const originalFetch = window.fetch;
  
  window.fetch = async function limitedFetch(resource, options = {}) {
    // Create a unique key for this request
    const requestKey = typeof resource === 'string' 
      ? resource 
      : resource.url;
    
    // Check if this is an API request that should be limited
    const isApiRequest = requestKey.includes('/api/');
    
    // If not an API request, just pass through to the original fetch
    if (!isApiRequest) {
      return originalFetch(resource, options);
    }
    
    // Check if we have a cached response for this request
    if (requestCache.has(requestKey)) {
      const { timestamp, response } = requestCache.get(requestKey);
      
      // If the cache hasn't expired, return a clone of the cached response
      if (Date.now() - timestamp < DEFAULT_CACHE_EXPIRATION) {
        console.log(`[GlobalRequestLimiter] Using cached response for ${requestKey}`);
        return response.clone();
      }
      
      // Remove expired cache entry
      requestCache.delete(requestKey);
    }
    
    // Check if this request is already in progress
    if (pendingRequests.has(requestKey)) {
      console.log(`[GlobalRequestLimiter] Request already in progress: ${requestKey}`);
      return pendingRequests.get(requestKey);
    }
    
    // Enforce minimum time between requests
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      const delay = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      console.log(`[GlobalRequestLimiter] Delaying request by ${delay}ms: ${requestKey}`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    // Update the last request time
    lastRequestTime = Date.now();
    
    // Create a promise for this request
    const requestPromise = (async () => {
      try {
        // Make the actual fetch request
        const response = await originalFetch(resource, options);
        
        // Clone the response before caching it
        const clonedResponse = response.clone();
        
        // Cache the response
        requestCache.set(requestKey, {
          timestamp: Date.now(),
          response: clonedResponse
        });
        
        return response;
      } finally {
        // Remove this request from pending requests
        pendingRequests.delete(requestKey);
      }
    })();
    
    // Store the promise in pending requests
    pendingRequests.set(requestKey, requestPromise);
    
    // Return the promise
    return requestPromise;
  };
  
  console.log('[GlobalRequestLimiter] Initialized');
}

/**
 * Clear the request cache
 */
export function clearRequestCache() {
  requestCache.clear();
  console.log('[GlobalRequestLimiter] Cache cleared');
}

/**
 * Get the current size of the request cache
 */
export function getRequestCacheSize() {
  return requestCache.size;
}

export default {
  initGlobalRequestLimiter,
  clearRequestCache,
  getRequestCacheSize
};
