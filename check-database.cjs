// Script to check the database
require('dotenv').config();
const { Pool } = require('pg');

// Create a new pool using the connection string from .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('localhost') ? false : {
    rejectUnauthorized: false // Required for Neon PostgreSQL
  }
});

async function checkDatabase() {
  console.log('Checking database...');
  
  try {
    // Connect to the database
    const client = await pool.connect();
    console.log('Connected to PostgreSQL database');
    
    try {
      // Check products
      const productsResult = await client.query('SELECT * FROM products');
      console.log('Products in database:', productsResult.rows.length);
      console.log('Products:', productsResult.rows.map(p => ({ id: p.id, name: p.name, category_id: p.category_id })));
      
      // Check categories
      const categoriesResult = await client.query('SELECT * FROM categories');
      console.log('Categories in database:', categoriesResult.rows.length);
      console.log('Categories:', categoriesResult.rows.map(c => ({ id: c.id, name: c.name })));
      
      // Check warehouse inventory
      const warehouseResult = await client.query('SELECT * FROM warehouse_inventory');
      console.log('Warehouse inventory items:', warehouseResult.rows.length);
      console.log('Warehouse inventory:', warehouseResult.rows);
      
      // Check store inventory
      const storeResult = await client.query('SELECT * FROM store_inventory');
      console.log('Store inventory items:', storeResult.rows.length);
      console.log('Store inventory:', storeResult.rows);
      
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Database check error:', err);
  } finally {
    await pool.end();
  }
}

checkDatabase()
  .then(() => console.log('Database check complete'))
  .catch(err => console.error('Error:', err));
