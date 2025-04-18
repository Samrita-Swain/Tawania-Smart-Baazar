// Script to alter the products table and add the SKU column
require('dotenv').config();
const { Pool } = require('pg');

console.log('Starting script to alter products table...');

// Create a new PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Function to alter the products table
async function alterProductsTable() {
  const client = await pool.connect();

  try {
    console.log('Connected to PostgreSQL database');

    // Check if the sku column already exists
    const checkColumnResult = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'products' AND column_name = 'sku'
    `);

    if (checkColumnResult.rows.length > 0) {
      console.log('SKU column already exists in products table');
    } else {
      // Add the sku column to the products table
      console.log('Adding SKU column to products table...');
      await client.query(`
        ALTER TABLE products
        ADD COLUMN sku VARCHAR(100)
      `);
      console.log('SKU column added successfully!');
    }

    // Check the current schema of the products table
    const tableSchemaResult = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'products'
      ORDER BY ordinal_position
    `);

    console.log('Current schema of products table:');
    tableSchemaResult.rows.forEach(column => {
      console.log(`- ${column.column_name}: ${column.data_type}`);
    });

  } catch (error) {
    console.error('Error altering products table:', error.message);
    console.error('Error stack:', error.stack);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the function
alterProductsTable()
  .then(() => console.log('Script completed'))
  .catch(err => console.error('Script failed:', err));
