// Enhanced request throttling middleware to prevent excessive API calls
const requestThrottle = (options = {}) => {
  const {
    windowMs = 60 * 1000, // 1 minute window
    maxRequests = 100,    // Max 100 requests per window
    message = 'Too many requests, please try again later.',
    statusCode = 429,     // Too Many Requests status code
    keyGenerator = (req) => req.ip, // Default to IP-based rate limiting
    skip = () => false,   // Function to skip throttling for certain requests
    pathSpecificLimits = {}, // Path-specific rate limits
    burstMultiplier = 2,  // Allow burst requests up to this multiplier
    burstDuration = 5000, // Duration in ms for burst allowance
    cooldownFactor = 0.5  // Factor to reduce count during cooldown periods
  } = options;

  // Store request counts
  const requestCounts = new Map();

  // Clean up old entries periodically
  const interval = setInterval(() => {
    const now = Date.now();
    for (const [key, data] of requestCounts.entries()) {
      if (now - data.startTime > windowMs) {
        requestCounts.delete(key);
      }
    }
  }, windowMs);

  // Ensure the interval doesn't keep the process alive
  if (interval.unref) {
    interval.unref();
  }

  // Helper function to get path-specific limit
  const getPathLimit = (path) => {
    // Check for exact path match
    if (pathSpecificLimits[path]) {
      return pathSpecificLimits[path];
    }

    // Check for pattern matches (e.g., '/api/products/*')
    for (const pattern in pathSpecificLimits) {
      if (pattern.endsWith('*') && path.startsWith(pattern.slice(0, -1))) {
        return pathSpecificLimits[pattern];
      }
    }

    // Default to global limit
    return maxRequests;
  };

  return (req, res, next) => {
    // Skip throttling if the skip function returns true
    if (skip(req)) {
      return next();
    }

    // Get the appropriate limit for this path
    const pathLimit = getPathLimit(req.path);

    // Generate a key that includes the path for more granular control
    const key = `${keyGenerator(req)}-${req.method}-${req.path.split('/').slice(0, 3).join('/')}`;
    const now = Date.now();

    // Initialize or update request data
    if (!requestCounts.has(key)) {
      requestCounts.set(key, {
        count: 1,
        startTime: now,
        lastRequest: now,
        burstCount: 0,
        burstStart: now
      });
      return next();
    }

    const data = requestCounts.get(key);

    // Reset count if window has passed
    if (now - data.startTime > windowMs) {
      data.count = 1;
      data.startTime = now;
      data.lastRequest = now;
      data.burstCount = 0;
      data.burstStart = now;
      return next();
    }

    // Calculate time since last request
    const timeSinceLastRequest = now - data.lastRequest;

    // Apply cooldown if there's been a significant gap between requests
    if (timeSinceLastRequest > windowMs * cooldownFactor) {
      // Reduce count based on idle time
      const reduction = Math.floor(timeSinceLastRequest / (windowMs * cooldownFactor)) * Math.ceil(pathLimit * 0.25);
      data.count = Math.max(1, data.count - reduction);
    }

    // Reset burst allowance if burst window has passed
    if (now - data.burstStart > burstDuration) {
      data.burstCount = 0;
      data.burstStart = now;
    }

    // Check if request limit is exceeded
    const burstAllowance = Math.min(pathLimit * burstMultiplier - pathLimit, pathLimit);
    const effectiveLimit = pathLimit + (burstAllowance - data.burstCount);

    if (data.count >= effectiveLimit) {
      // Calculate time until reset
      const resetTime = data.startTime + windowMs;
      const timeUntilReset = Math.ceil((resetTime - now) / 1000);

      // Set headers
      res.set('Retry-After', timeUntilReset);
      res.set('X-RateLimit-Limit', pathLimit);
      res.set('X-RateLimit-Remaining', 0);
      res.set('X-RateLimit-Reset', Math.ceil(resetTime / 1000));

      // Send error response
      return res.status(statusCode).json({
        success: false,
        message,
        retryAfter: timeUntilReset
      });
    }

    // Increment count and update last request time
    data.count++;

    // If we're using burst capacity, track it
    if (data.count > pathLimit) {
      data.burstCount++;
    }

    data.lastRequest = now;

    // Set rate limit headers
    res.set('X-RateLimit-Limit', pathLimit);
    res.set('X-RateLimit-Remaining', Math.max(0, effectiveLimit - data.count));
    res.set('X-RateLimit-Reset', Math.ceil((data.startTime + windowMs) / 1000));

    next();
  };
};

module.exports = requestThrottle;
