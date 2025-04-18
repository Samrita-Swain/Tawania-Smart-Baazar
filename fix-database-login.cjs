// Script to fix database login issues
require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Create a new pool using the connection string from .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('localhost') ? false : {
    rejectUnauthorized: false // Required for Neon PostgreSQL
  }
});

async function fixDatabaseLogin() {
  const client = await pool.connect();
  try {
    console.log('Connected to PostgreSQL database');
    
    // Check database tables
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);
    
    console.log('Database tables:', tablesResult.rows.map(row => row.table_name));
    
    // Check if users table exists
    const usersTableExists = tablesResult.rows.some(row => row.table_name === 'users');
    
    if (!usersTableExists) {
      console.log('Users table does not exist. Creating users table...');
      
      // Create users table
      await client.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(20) NOT NULL CHECK (role IN ('superadmin', 'admin', 'store', 'warehouse')),
          store_id INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      console.log('Users table created successfully');
    }
    
    // Check if there are any users in the database
    const usersResult = await client.query('SELECT COUNT(*) FROM users');
    const usersCount = parseInt(usersResult.rows[0].count);
    
    console.log(`Found ${usersCount} users in the database`);
    
    // If there are no users, create a default admin user
    if (usersCount === 0) {
      console.log('No users found. Creating default admin user...');
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      // Create admin user
      await client.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
        ['Admin', 'admin@twania.com', hashedPassword, 'superadmin']
      );
      
      console.log('Default admin user created successfully');
      console.log('Email: admin@twania.com');
      console.log('Password: admin123');
    }
    
    // Check if there's a login endpoint in server.cjs
    const serverJsPath = path.join(process.cwd(), 'server.cjs');
    
    if (fs.existsSync(serverJsPath)) {
      console.log('Checking server.cjs for login endpoint...');
      
      const serverJsContent = fs.readFileSync(serverJsPath, 'utf8');
      
      // Check if the login endpoint exists
      if (serverJsContent.includes("app.post('/api/auth/login'")) {
        console.log('Login endpoint exists in server.cjs');
        
        // Check if the login endpoint is properly implemented
        if (serverJsContent.includes("const { email, password } = req.body") && 
            serverJsContent.includes("bcrypt.compare(password, user.password)")) {
          console.log('Login endpoint is properly implemented');
        } else {
          console.log('Login endpoint is not properly implemented');
          console.log('Please check the login endpoint implementation in server.cjs');
        }
      } else {
        console.log('Login endpoint does not exist in server.cjs');
        console.log('Please add a login endpoint to server.cjs');
      }
    } else {
      console.log('server.cjs not found');
    }
    
    // Check if there's a JWT_SECRET in .env
    if (!process.env.JWT_SECRET) {
      console.log('JWT_SECRET not found in .env');
      console.log('Please add JWT_SECRET to .env');
    } else {
      console.log('JWT_SECRET found in .env');
    }
    
    // Check if there's a JWT_EXPIRES_IN in .env
    if (!process.env.JWT_EXPIRES_IN) {
      console.log('JWT_EXPIRES_IN not found in .env');
      console.log('Please add JWT_EXPIRES_IN to .env');
    } else {
      console.log('JWT_EXPIRES_IN found in .env');
    }
    
    // Check if the frontend is using the correct authentication
    const authContextPath = path.join(process.cwd(), 'src', 'context', 'AuthContext.jsx');
    
    if (fs.existsSync(authContextPath)) {
      console.log('Checking AuthContext.jsx for authentication implementation...');
      
      const authContextContent = fs.readFileSync(authContextPath, 'utf8');
      
      // Check if the AuthContext is using the correct authentication
      if (authContextContent.includes("const login = async (email, password)") && 
          authContextContent.includes("const response = await authService.login(email, password)")) {
        console.log('AuthContext is using the correct authentication');
      } else {
        console.log('AuthContext is not using the correct authentication');
        console.log('Please check the authentication implementation in AuthContext.jsx');
      }
    } else {
      console.log('AuthContext.jsx not found');
    }
    
    // Check if the API service is configured correctly
    const apiJsPath = path.join(process.cwd(), 'src', 'services', 'api.js');
    
    if (fs.existsSync(apiJsPath)) {
      console.log('Checking api.js for API service configuration...');
      
      const apiJsContent = fs.readFileSync(apiJsPath, 'utf8');
      
      // Check if the API service is using the correct baseURL
      if (apiJsContent.includes("baseURL: ''")) {
        console.log('API service is using the correct baseURL configuration');
      } else {
        console.log('API service is not using the correct baseURL configuration');
        console.log('Please update the baseURL in src/services/api.js to be an empty string');
      }
      
      // Check if the API service has login and register functions
      if (apiJsContent.includes("login: async (email, password)") && 
          apiJsContent.includes("register: async (userData)")) {
        console.log('API service has login and register functions');
      } else {
        console.log('API service does not have login and register functions');
        console.log('Please add login and register functions to src/services/api.js');
      }
    } else {
      console.log('api.js not found');
    }
    
    console.log('\nDatabase login fix completed');
    console.log('\nTo complete the fix:');
    console.log('1. Make sure you have the following in your .env file:');
    console.log('   JWT_SECRET=twania_smart_bazaar_secret_key_2025');
    console.log('   JWT_EXPIRES_IN=7d');
    console.log('2. Restart the server by running: node server.cjs');
    console.log('3. Clear browser localStorage by running these commands in the browser console:');
    console.log('   localStorage.removeItem("token");');
    console.log('   localStorage.removeItem("userData");');
    console.log('4. Refresh the admin panel page');
    console.log('5. Login with the following credentials:');
    console.log('   Email: admin@twania.com');
    console.log('   Password: admin123');
  } catch (error) {
    console.error('Error fixing database login:', error);
  } finally {
    client.release();
    pool.end();
  }
}

// Run the fix
fixDatabaseLogin().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
