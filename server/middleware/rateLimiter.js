/**
 * Rate limiter middleware to prevent excessive API calls
 * This middleware will limit the number of requests from a single IP address
 */

const requestCounts = new Map();
const WINDOW_SIZE_MS = 1000; // 1 second window
const MAX_REQUESTS_PER_WINDOW = 5; // Maximum 5 requests per second per IP

/**
 * Rate limiter middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function rateLimiter(req, res, next) {
  // Get client IP
  const clientIp = req.ip || req.connection.remoteAddress;
  
  // Get current timestamp
  const now = Date.now();
  
  // Get or initialize request count for this IP
  if (!requestCounts.has(clientIp)) {
    requestCounts.set(clientIp, {
      count: 0,
      resetAt: now + WINDOW_SIZE_MS
    });
  }
  
  const clientData = requestCounts.get(clientIp);
  
  // If the window has expired, reset the count
  if (now > clientData.resetAt) {
    clientData.count = 0;
    clientData.resetAt = now + WINDOW_SIZE_MS;
  }
  
  // Increment the count
  clientData.count++;
  
  // Check if the client has exceeded the limit
  if (clientData.count > MAX_REQUESTS_PER_WINDOW) {
    console.log(`Rate limit exceeded for ${clientIp}: ${clientData.count} requests in the last second`);
    return res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.'
    });
  }
  
  // Clean up old entries every minute
  if (now % 60000 < 1000) {
    cleanupOldEntries();
  }
  
  next();
}

/**
 * Clean up old entries from the requestCounts map
 */
function cleanupOldEntries() {
  const now = Date.now();
  for (const [ip, data] of requestCounts.entries()) {
    if (now > data.resetAt + 60000) { // Remove entries older than 1 minute
      requestCounts.delete(ip);
    }
  }
}

module.exports = rateLimiter;
