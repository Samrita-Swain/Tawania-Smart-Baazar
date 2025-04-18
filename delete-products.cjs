const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function deleteAllProducts() {
  try {
    console.log('Starting product deletion process...');
    
    // First, delete related records in warehouse_inventory
    console.log('Deleting warehouse inventory records...');
    const warehouseResult = await pool.query('DELETE FROM warehouse_inventory WHERE product_id IN (SELECT id FROM products)');
    console.log(`Deleted ${warehouseResult.rowCount} warehouse inventory records`);
    
    // Delete related records in store_inventory
    console.log('Deleting store inventory records...');
    const storeResult = await pool.query('DELETE FROM store_inventory WHERE product_id IN (SELECT id FROM products)');
    console.log(`Deleted ${storeResult.rowCount} store inventory records`);
    
    // Delete products
    console.log('Deleting products...');
    const productResult = await pool.query('DELETE FROM products');
    console.log(`Deleted ${productResult.rowCount} products`);
    
    console.log('All products and related records have been deleted successfully');
  } catch (err) {
    console.error('Error deleting products:', err);
  } finally {
    pool.end();
  }
}

deleteAllProducts();
