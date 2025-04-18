const { Pool } = require('pg');
require('dotenv').config();

console.log('Testing database connection...');
console.log('Connection string:', process.env.DATABASE_URL);
console.log('Environment variables:', process.env);

// Create a new pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test the connection
async function testConnection() {
  let client;
  try {
    console.log('Attempting to connect...');
    client = await pool.connect();
    console.log('Connected to database successfully!');

    console.log('Executing query...');
    const result = await client.query('SELECT NOW()');
    console.log('Current time from database:', result.rows[0].now);

    console.log('Test completed successfully!');
    client.release();
    process.exit(0);
  } catch (err) {
    console.error('Error connecting to database:', err);
    if (client) client.release();
    process.exit(1);
  }
}

testConnection();
