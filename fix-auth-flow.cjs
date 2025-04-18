// Script to fix authentication flow issues
require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Create a new pool using the connection string from .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('localhost') ? false : {
    rejectUnauthorized: false // Required for Neon PostgreSQL
  }
});

async function fixAuthFlow() {
  const client = await pool.connect();
  try {
    console.log('Connected to PostgreSQL database');
    
    // Check if JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
      console.log('JWT_SECRET is not set in .env');
      console.log('Setting default JWT_SECRET...');
      
      // Create .env file with JWT_SECRET if it doesn't exist
      const envPath = path.join(process.cwd(), '.env');
      let envContent = '';
      
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
        
        // Check if JWT_SECRET is already in .env
        if (!envContent.includes('JWT_SECRET=')) {
          envContent += '\nJWT_SECRET=twania_smart_bazaar_secret_key_2025\n';
        }
        
        // Check if JWT_EXPIRES_IN is already in .env
        if (!envContent.includes('JWT_EXPIRES_IN=')) {
          envContent += 'JWT_EXPIRES_IN=7d\n';
        }
      } else {
        envContent = `# Database Configuration
DATABASE_URL='${process.env.DATABASE_URL}'

# Server Configuration
PORT=5001
NODE_ENV=development

# JWT Secret for Authentication
JWT_SECRET=twania_smart_bazaar_secret_key_2025
JWT_EXPIRES_IN=7d
`;
      }
      
      // Write .env file
      fs.writeFileSync(envPath, envContent);
      console.log('.env file updated with JWT_SECRET and JWT_EXPIRES_IN');
      
      // Set JWT_SECRET in process.env
      process.env.JWT_SECRET = 'twania_smart_bazaar_secret_key_2025';
      process.env.JWT_EXPIRES_IN = '7d';
    }
    
    // Check if users table exists and has users
    const usersResult = await client.query('SELECT * FROM users');
    console.log(`Found ${usersResult.rows.length} users in the database`);
    
    // Generate a token for each user
    for (const user of usersResult.rows) {
      console.log(`Generating token for user: ${user.name} (${user.email})`);
      
      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
      
      console.log(`Token generated: ${token.substring(0, 20)}...`);
      console.log(`User ID: ${user.id}`);
      console.log(`User Role: ${user.role}`);
      console.log(`User Email: ${user.email}`);
      console.log('Use this token for testing authentication');
    }
    
    // Check if the frontend is using the correct authentication
    const authContextPath = path.join(process.cwd(), 'src', 'context', 'AuthContext.jsx');
    
    if (fs.existsSync(authContextPath)) {
      console.log('\nChecking AuthContext.jsx for authentication implementation...');
      
      const authContextContent = fs.readFileSync(authContextPath, 'utf8');
      
      // Check if the AuthContext is using localStorage for token storage
      if (authContextContent.includes('localStorage.setItem("token", token)') && 
          authContextContent.includes('localStorage.getItem("token")')) {
        console.log('AuthContext is using localStorage for token storage');
      } else {
        console.log('AuthContext is not using localStorage for token storage');
        console.log('This might cause authentication issues');
      }
      
      // Check if the AuthContext is handling token expiration
      if (authContextContent.includes('token expired') || 
          authContextContent.includes('Token is not valid')) {
        console.log('AuthContext is handling token expiration');
      } else {
        console.log('AuthContext might not be handling token expiration properly');
        console.log('This might cause authentication issues after token expires');
      }
    }
    
    // Check if the API service is adding the token to requests
    const apiJsPath = path.join(process.cwd(), 'src', 'services', 'api.js');
    
    if (fs.existsSync(apiJsPath)) {
      console.log('\nChecking api.js for token handling...');
      
      const apiJsContent = fs.readFileSync(apiJsPath, 'utf8');
      
      // Check if the API service is adding the token to requests
      if (apiJsContent.includes('Authorization') && 
          apiJsContent.includes('Bearer')) {
        console.log('API service is adding the token to requests');
      } else {
        console.log('API service might not be adding the token to requests');
        console.log('This might cause authentication issues');
      }
    }
    
    // Check if the server is validating the token
    const serverJsPath = path.join(process.cwd(), 'server.cjs');
    
    if (fs.existsSync(serverJsPath)) {
      console.log('\nChecking server.cjs for token validation...');
      
      const serverJsContent = fs.readFileSync(serverJsPath, 'utf8');
      
      // Check if the server is validating the token
      if (serverJsContent.includes('jwt.verify(token, process.env.JWT_SECRET)')) {
        console.log('Server is validating the token');
      } else {
        console.log('Server might not be validating the token properly');
        console.log('This might cause authentication issues');
      }
    }
    
    console.log('\nAuth flow check completed');
    console.log('\nTo fix authentication issues:');
    console.log('1. Make sure you have the following in your .env file:');
    console.log('   JWT_SECRET=twania_smart_bazaar_secret_key_2025');
    console.log('   JWT_EXPIRES_IN=7d');
    console.log('2. Restart the server by running: node server.cjs');
    console.log('3. Clear browser localStorage by running these commands in the browser console:');
    console.log('   localStorage.removeItem("token");');
    console.log('   localStorage.removeItem("userData");');
    console.log('4. Refresh the admin panel page');
    console.log('5. Login with one of the users listed above');
    console.log('\nIf you still have issues, you can use the generated token for testing:');
    console.log('1. Open the browser console');
    console.log('2. Run the following commands:');
    console.log('   localStorage.setItem("token", "TOKEN_FROM_ABOVE");');
    console.log('   localStorage.setItem("userData", JSON.stringify({ id: USER_ID, name: "USER_NAME", email: "USER_EMAIL", role: "USER_ROLE" }));');
    console.log('3. Refresh the page');
  } catch (error) {
    console.error('Error fixing auth flow:', error);
  } finally {
    client.release();
    pool.end();
  }
}

// Run the fix
fixAuthFlow().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
