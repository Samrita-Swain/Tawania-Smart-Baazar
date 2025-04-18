const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

// Read the schema SQL file
const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

// Initialize the database
const initDb = async () => {
  let client;
  try {
    console.log('Initializing database...');

    // Test connection
    client = await pool.connect();
    console.log('Connected to database');

    // Execute the schema SQL
    console.log('Executing schema...');

    // Drop existing tables if they exist
    console.log('Dropping existing tables...');
    await client.query(`
      DROP TABLE IF EXISTS store_inventory CASCADE;
      DROP TABLE IF EXISTS warehouse_inventory CASCADE;
      DROP TABLE IF EXISTS products CASCADE;
      DROP TABLE IF EXISTS categories CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS stores CASCADE;
    `);

    // Create new tables
    console.log('Creating new tables...');
    await client.query(schema);

    console.log('Database initialized successfully');
    client.release();
    process.exit(0);
  } catch (err) {
    console.error('Error initializing database:', err);
    if (client) client.release();
    process.exit(1);
  }
};

// Run the initialization
initDb();
