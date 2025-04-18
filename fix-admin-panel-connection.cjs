// Script to fix the admin panel connection to the database
require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Create a new pool using the connection string from .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('localhost') ? false : {
    rejectUnauthorized: false // Required for Neon PostgreSQL
  }
});

async function fixAdminPanelConnection() {
  const client = await pool.connect();
  try {
    console.log('Connected to PostgreSQL database');
    
    // Check database connection
    const result = await client.query('SELECT NOW() as current_time');
    console.log('Database time:', result.rows[0].current_time);
    
    // Check database tables
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);
    
    console.log('Database tables:', tablesResult.rows.map(row => row.table_name));
    
    // Check if the API endpoints are correctly configured
    const apiJsPath = path.join(process.cwd(), 'src', 'services', 'api.js');
    
    if (fs.existsSync(apiJsPath)) {
      console.log('Checking API configuration in', apiJsPath);
      
      const apiJsContent = fs.readFileSync(apiJsPath, 'utf8');
      
      // Check if the API is using the correct baseURL
      if (apiJsContent.includes("baseURL: ''")) {
        console.log('API is using the correct baseURL configuration');
      } else {
        console.log('API is not using the correct baseURL configuration');
        console.log('Please update the baseURL in src/services/api.js to be an empty string');
      }
      
      // Check if the API endpoints are using the correct prefix
      const productEndpoints = [
        '/api/products',
        '/api/categories',
        '/api/auth/login',
        '/api/auth/register',
        '/api/auth/me'
      ];
      
      let allEndpointsCorrect = true;
      
      for (const endpoint of productEndpoints) {
        if (!apiJsContent.includes(endpoint)) {
          console.log(`API endpoint ${endpoint} is not correctly configured`);
          allEndpointsCorrect = false;
        }
      }
      
      if (allEndpointsCorrect) {
        console.log('All API endpoints are correctly configured');
      } else {
        console.log('Some API endpoints are not correctly configured');
        console.log('Please ensure all API endpoints use the /api/ prefix');
      }
    } else {
      console.log('API configuration file not found at', apiJsPath);
    }
    
    // Check if the server.cjs file is correctly configured
    const serverJsPath = path.join(process.cwd(), 'server.cjs');
    
    if (fs.existsSync(serverJsPath)) {
      console.log('Checking server configuration in', serverJsPath);
      
      const serverJsContent = fs.readFileSync(serverJsPath, 'utf8');
      
      // Check if the server is using the correct database connection
      if (serverJsContent.includes('process.env.DATABASE_URL')) {
        console.log('Server is using the correct database connection configuration');
      } else {
        console.log('Server is not using the correct database connection configuration');
        console.log('Please update the database connection in server.cjs to use process.env.DATABASE_URL');
      }
      
      // Check if the server is using the correct API endpoints
      const serverEndpoints = [
        'app.get(\'/api/products\'',
        'app.get(\'/api/categories\'',
        'app.post(\'/api/auth/login\'',
        'app.post(\'/api/auth/register\'',
        'app.get(\'/api/auth/me\''
      ];
      
      let allServerEndpointsCorrect = true;
      
      for (const endpoint of serverEndpoints) {
        if (!serverJsContent.includes(endpoint)) {
          console.log(`Server endpoint ${endpoint} is not correctly configured`);
          allServerEndpointsCorrect = false;
        }
      }
      
      if (allServerEndpointsCorrect) {
        console.log('All server endpoints are correctly configured');
      } else {
        console.log('Some server endpoints are not correctly configured');
        console.log('Please ensure all server endpoints use the /api/ prefix');
      }
    } else {
      console.log('Server configuration file not found at', serverJsPath);
    }
    
    // Check if the DemoDataContext.jsx file is correctly configured
    const demoDataContextPath = path.join(process.cwd(), 'src', 'context', 'DemoDataContext.jsx');
    
    if (fs.existsSync(demoDataContextPath)) {
      console.log('Checking DemoDataContext configuration in', demoDataContextPath);
      
      const demoDataContextContent = fs.readFileSync(demoDataContextPath, 'utf8');
      
      // Check if the DemoDataContext is using the correct API services
      if (demoDataContextContent.includes('productService.getProducts')) {
        console.log('DemoDataContext is using the correct API services');
      } else {
        console.log('DemoDataContext is not using the correct API services');
        console.log('Please update the DemoDataContext to use the API services');
      }
    } else {
      console.log('DemoDataContext configuration file not found at', demoDataContextPath);
    }
    
    console.log('\nFix instructions:');
    console.log('1. Clear browser localStorage by running these commands in the browser console:');
    console.log('   localStorage.removeItem("twania_products");');
    console.log('   localStorage.removeItem("twania_categories");');
    console.log('   localStorage.removeItem("twania_warehouseInventory");');
    console.log('   localStorage.removeItem("twania_storeInventory");');
    console.log('2. Restart the server and frontend');
    console.log('3. Refresh the browser');
    
    console.log('\nDatabase connection check completed successfully');
  } catch (error) {
    console.error('Error checking admin panel connection:', error);
  } finally {
    client.release();
    pool.end();
  }
}

// Run the fix
fixAdminPanelConnection().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
