// Database connection test script
require('dotenv').config();
const { Pool } = require('pg');

console.log('Testing database connection...');
console.log('Database URL:', process.env.DATABASE_URL ? 'Set (hidden for security)' : 'Not set');

// Create a new pool with optimized settings
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('localhost') ? false : {
    rejectUnauthorized: false // Required for Neon PostgreSQL
  },
  max: 5, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000 // Return an error after 10 seconds if connection not established
});

async function testConnection() {
  let client;
  
  try {
    console.log('Attempting to connect to the database...');
    client = await pool.connect();
    console.log('Successfully connected to the database!');
    
    // Test a simple query
    console.log('Testing a simple query...');
    const testResult = await client.query('SELECT NOW() as current_time');
    console.log('Current database time:', testResult.rows[0].current_time);
    
    // Test the health check function
    try {
      const healthCheckResult = await client.query('SELECT public.health_check()');
      console.log('Health check function result:', healthCheckResult.rows[0].health_check);
    } catch (healthError) {
      console.log('Health check function not available:', healthError.message);
    }
    
    // Check database tables
    console.log('Checking database tables...');
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);
    
    const tables = tablesResult.rows.map(row => row.table_name);
    console.log('Database tables:', tables);
    
    console.log('Connection test completed successfully!');
    return true;
  } catch (error) {
    console.error('Error testing database connection:', error);
    return false;
  } finally {
    if (client) {
      client.release();
      console.log('Database client released.');
    }
    
    try {
      await pool.end();
      console.log('Connection pool closed.');
    } catch (endError) {
      console.error('Error closing connection pool:', endError);
    }
  }
}

testConnection().then(success => {
  console.log('Test result:', success ? 'SUCCESS' : 'FAILURE');
  process.exit(success ? 0 : 1);
});
