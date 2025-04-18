require('dotenv').config();
const { Pool } = require('pg');

console.log('Testing database connection...');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set (hidden for security)' : 'Not set');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('localhost') ? false : {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  let client;
  try {
    client = await pool.connect();
    console.log('Connected to database successfully!');
    
    const result = await client.query('SELECT NOW() as time');
    console.log('Database time:', result.rows[0].time);
    
    return true;
  } catch (err) {
    console.error('Error connecting to database:', err.message);
    return false;
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

testConnection()
  .then(success => {
    console.log('Database test completed:', success ? 'SUCCESS' : 'FAILED');
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });
