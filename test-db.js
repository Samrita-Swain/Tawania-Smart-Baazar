require('dotenv').config();
const { Pool } = require('pg');

console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set (hidden for security)' : 'Not set');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('localhost') ? false : {
    rejectUnauthorized: false // Required for Neon PostgreSQL
  }
});

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const client = await pool.connect();
    console.log('Database connection successful');
    
    const result = await client.query('SELECT NOW()');
    console.log(`Database time: ${result.rows[0].now}`);
    
    client.release();
    await pool.end();
    
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return false;
  }
}

testConnection().then(connected => {
  console.log('Connection test result:', connected ? 'SUCCESS' : 'FAILED');
  process.exit(connected ? 0 : 1);
});
