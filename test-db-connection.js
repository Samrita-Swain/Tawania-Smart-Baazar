// Database connection test script
require('dotenv').config();
const { Pool } = require('pg');

console.log('Testing database connection...');
console.log('Database URL:', process.env.DATABASE_URL ? 'Set (hidden for security)' : 'Not set');
console.log('PORT:', process.env.PORT);

// Create a new pool with optimized settings
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Neon PostgreSQL
  },
  max: 5, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000 // Return an error after 10 seconds if connection not established
});

async function testConnection() {
  let client;
  try {
    console.log('Attempting to connect to database...');
    client = await pool.connect();
    console.log('Connected to database successfully!');

    // Test a simple query
    console.log('Executing query to get current time...');
    const timeResult = await client.query('SELECT NOW() as current_time');
    console.log('Database time:', timeResult.rows[0].current_time);

    // Check database tables
    console.log('Checking database tables...');
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);
    
    console.log('Database tables:', tablesResult.rows.map(row => row.table_name));

    // Check categories table
    console.log('Checking categories table...');
    const categoriesResult = await client.query('SELECT COUNT(*) FROM categories');
    console.log('Categories count:', categoriesResult.rows[0].count);

    // Check products table
    console.log('Checking products table...');
    const productsResult = await client.query('SELECT COUNT(*) FROM products');
    console.log('Products count:', productsResult.rows[0].count);

    console.log('Database connection test completed successfully!');
  } catch (error) {
    console.error('Error connecting to database:', error);
  } finally {
    if (client) {
      client.release();
    }
    // Close the pool
    await pool.end();
  }
}

testConnection();
