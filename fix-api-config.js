// Script to verify and fix API configuration
const fs = require('fs');
const path = require('path');

console.log('Checking API configuration...');

// Check src/utils/apiConfig.js
const apiConfigPath = path.join(process.cwd(), 'src', 'utils', 'apiConfig.js');
if (fs.existsSync(apiConfigPath)) {
  console.log('Checking API config in', apiConfigPath);
  
  let apiConfigContent = fs.readFileSync(apiConfigPath, 'utf8');
  
  // Check if the API URL is correctly configured
  if (apiConfigContent.includes("export const API_URL = import.meta.env.VITE_API_URL || '/api';")) {
    console.log('API URL is correctly configured in apiConfig.js');
  } else {
    console.log('API URL is not correctly configured in apiConfig.js');
    
    // Fix the API URL
    apiConfigContent = apiConfigContent.replace(
      /export const API_URL = .*;/,
      "export const API_URL = import.meta.env.VITE_API_URL || '/api';"
    );
    
    // Save the fixed content
    fs.writeFileSync(apiConfigPath, apiConfigContent, 'utf8');
    console.log('src/utils/apiConfig.js updated successfully');
  }
} else {
  console.log('API config file not found at', apiConfigPath);
}

// Check src/services/api.js
const apiJsPath = path.join(process.cwd(), 'src', 'services', 'api.js');
if (fs.existsSync(apiJsPath)) {
  console.log('Checking API service in', apiJsPath);
  
  let apiJsContent = fs.readFileSync(apiJsPath, 'utf8');
  
  // Check if the API URL is correctly configured
  if (apiJsContent.includes("const API_URL = import.meta.env.VITE_API_URL || '/api';")) {
    console.log('API URL is correctly configured in api.js');
  } else {
    console.log('API URL is not correctly configured in api.js');
    
    // Fix the API URL
    apiJsContent = apiJsContent.replace(
      /const API_URL = .*;/,
      "const API_URL = import.meta.env.VITE_API_URL || '/api';"
    );
    
    // Save the fixed content
    fs.writeFileSync(apiJsPath, apiJsContent, 'utf8');
    console.log('src/services/api.js updated successfully');
  }
} else {
  console.log('API service file not found at', apiJsPath);
}

// Check src/services/api-client.js
const apiClientPath = path.join(process.cwd(), 'src', 'services', 'api-client.js');
if (fs.existsSync(apiClientPath)) {
  console.log('Checking API client in', apiClientPath);
  
  let apiClientContent = fs.readFileSync(apiClientPath, 'utf8');
  
  // Check if the API URL is correctly configured
  if (apiClientContent.includes("const API_URL = import.meta.env.VITE_API_URL || '/api';")) {
    console.log('API URL is correctly configured in api-client.js');
  } else {
    console.log('API URL is not correctly configured in api-client.js');
    
    // Fix the API URL
    apiClientContent = apiClientContent.replace(
      /const API_URL = .*;/,
      "const API_URL = import.meta.env.VITE_API_URL || '/api';"
    );
    
    // Save the fixed content
    fs.writeFileSync(apiClientPath, apiClientContent, 'utf8');
    console.log('src/services/api-client.js updated successfully');
  }
} else {
  console.log('API client file not found at', apiClientPath);
}

// Check vite.config.js
const viteConfigPath = path.join(process.cwd(), 'vite.config.js');
if (fs.existsSync(viteConfigPath)) {
  console.log('Checking Vite config in', viteConfigPath);
  
  let viteConfigContent = fs.readFileSync(viteConfigPath, 'utf8');
  
  // Check if the proxy target is correctly configured
  if (viteConfigContent.includes("target: env.VITE_API_URL || 'http://127.0.0.1:5002',")) {
    console.log('Proxy target is correctly configured in vite.config.js');
  } else {
    console.log('Proxy target is not correctly configured in vite.config.js');
    
    // Fix the proxy target
    viteConfigContent = viteConfigContent.replace(
      /target: .*,/,
      "target: env.VITE_API_URL || 'http://127.0.0.1:5002', // Use environment variable or default"
    );
    
    // Save the fixed content
    fs.writeFileSync(viteConfigPath, viteConfigContent, 'utf8');
    console.log('vite.config.js updated successfully');
  }
} else {
  console.log('Vite config file not found at', viteConfigPath);
}

console.log('API configuration check completed');
