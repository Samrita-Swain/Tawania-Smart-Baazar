const { Pool } = require('pg');
require('dotenv').config();

// Create a new pool using the connection string from .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Neon PostgreSQL
  }
});

console.log('Database URL:', process.env.DATABASE_URL);

// Test the connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Connected to PostgreSQL database');
  release();
});

// Export the query function
module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
