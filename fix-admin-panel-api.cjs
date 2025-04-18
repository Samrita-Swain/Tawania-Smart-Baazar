// Script to fix the admin panel API connection issues
require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Function to check and fix API endpoints in server.cjs
function checkAndFixServerEndpoints() {
  console.log('Checking server.cjs for API endpoints...');
  
  const serverJsPath = path.join(process.cwd(), 'server.cjs');
  
  if (!fs.existsSync(serverJsPath)) {
    console.log('server.cjs not found');
    return;
  }
  
  let serverJsContent = fs.readFileSync(serverJsPath, 'utf8');
  
  // Check if the server is using the correct API endpoints
  const endpointsToCheck = [
    { pattern: /app\.get\(\['\/categories'/g, replacement: "app.get(['/api/categories'" },
    { pattern: /app\.get\(\['\/products'/g, replacement: "app.get(['/api/products'" },
    { pattern: /app\.post\('\/products'/g, replacement: "app.post('/api/products'" },
    { pattern: /app\.put\('\/products/g, replacement: "app.put('/api/products" },
    { pattern: /app\.delete\('\/products/g, replacement: "app.delete('/api/products" },
    { pattern: /app\.post\('\/categories'/g, replacement: "app.post('/api/categories'" },
    { pattern: /app\.put\('\/categories/g, replacement: "app.put('/api/categories" },
    { pattern: /app\.delete\('\/categories/g, replacement: "app.delete('/api/categories" },
    { pattern: /app\.get\('\/stores'/g, replacement: "app.get('/api/stores'" },
    { pattern: /app\.post\('\/stores'/g, replacement: "app.post('/api/stores'" },
    { pattern: /app\.put\('\/stores/g, replacement: "app.put('/api/stores" },
    { pattern: /app\.delete\('\/stores/g, replacement: "app.delete('/api/stores" },
    { pattern: /app\.get\('\/warehouse/g, replacement: "app.get('/api/warehouse" },
    { pattern: /app\.post\('\/warehouse/g, replacement: "app.post('/api/warehouse" },
    { pattern: /app\.put\('\/warehouse/g, replacement: "app.put('/api/warehouse" }
  ];
  
  let fixCount = 0;
  
  // Check and fix each endpoint
  for (const endpoint of endpointsToCheck) {
    if (endpoint.pattern.test(serverJsContent)) {
      console.log(`Found endpoint pattern: ${endpoint.pattern}`);
      const oldContent = serverJsContent;
      serverJsContent = serverJsContent.replace(endpoint.pattern, endpoint.replacement);
      
      if (oldContent !== serverJsContent) {
        fixCount++;
        console.log(`Fixed endpoint: ${endpoint.pattern} -> ${endpoint.replacement}`);
      }
    }
  }
  
  // Save the fixed content if any changes were made
  if (fixCount > 0) {
    console.log(`Fixing ${fixCount} endpoints in server.cjs...`);
    fs.writeFileSync(serverJsPath, serverJsContent, 'utf8');
    console.log('server.cjs updated successfully');
  } else {
    console.log('No endpoints need to be fixed in server.cjs');
  }
}

// Function to check and fix API service in src/services/api.js
function checkAndFixApiService() {
  console.log('Checking src/services/api.js for API configuration...');
  
  const apiJsPath = path.join(process.cwd(), 'src', 'services', 'api.js');
  
  if (!fs.existsSync(apiJsPath)) {
    console.log('src/services/api.js not found');
    return;
  }
  
  let apiJsContent = fs.readFileSync(apiJsPath, 'utf8');
  
  // Check if the API is using the correct baseURL
  if (!apiJsContent.includes("baseURL: ''")) {
    console.log('API is not using the correct baseURL configuration');
    
    // Fix the baseURL
    apiJsContent = apiJsContent.replace(/baseURL: .*,/g, "baseURL: '', // Empty baseURL to work with the proxy - paths already include /api");
    
    // Save the fixed content
    fs.writeFileSync(apiJsPath, apiJsContent, 'utf8');
    console.log('src/services/api.js updated successfully');
  } else {
    console.log('API is using the correct baseURL configuration');
  }
}

// Function to clear localStorage in the browser
function clearLocalStorage() {
  console.log('To complete the fix, please run the following commands in your browser console:');
  console.log('localStorage.removeItem("twania_products");');
  console.log('localStorage.removeItem("twania_categories");');
  console.log('localStorage.removeItem("twania_warehouseInventory");');
  console.log('localStorage.removeItem("twania_storeInventory");');
  console.log('window.location.reload();');
}

// Main function to run all checks and fixes
function main() {
  console.log('Starting admin panel API fix...');
  
  // Check and fix server endpoints
  checkAndFixServerEndpoints();
  
  // Check and fix API service
  checkAndFixApiService();
  
  // Clear localStorage
  clearLocalStorage();
  
  console.log('Admin panel API fix completed');
  console.log('Please restart the server and frontend to apply the changes');
}

// Run the main function
main();
