// API configuration utility

// Get API URL from environment variables or use a default
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

// Function to build a full API endpoint URL
export const getApiUrl = (endpoint) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  return `${API_URL}/${cleanEndpoint}`;
};

// Function to get the base server URL (without /api)
export const getServerUrl = () => {
  return API_URL.replace(/\/api$/, '');
};

// Export default configuration object
export default {
  API_URL,
  getApiUrl,
  getServerUrl
};
