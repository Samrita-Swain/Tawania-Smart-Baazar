// Script to fix the admin panel data synchronization issues
require('dotenv').config();
const { Pool } = require('pg');

// Create a new pool using the connection string from .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('localhost') ? false : {
    rejectUnauthorized: false // Required for Neon PostgreSQL
  }
});

async function fixAdminPanelData() {
  const client = await pool.connect();
  try {
    console.log('Connected to PostgreSQL database');
    
    // Check database tables
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);
    
    console.log('Database tables:', tablesResult.rows.map(row => row.table_name));
    
    // Check products table
    const productsResult = await client.query(`
      SELECT COUNT(*) FROM products
    `);
    
    const productsCount = parseInt(productsResult.rows[0].count);
    console.log(`Found ${productsCount} products in the database`);
    
    // Check categories table
    const categoriesResult = await client.query(`
      SELECT COUNT(*) FROM categories
    `);
    
    const categoriesCount = parseInt(categoriesResult.rows[0].count);
    console.log(`Found ${categoriesCount} categories in the database`);
    
    // Check warehouse_inventory table
    const warehouseResult = await client.query(`
      SELECT COUNT(*) FROM warehouse_inventory
    `);
    
    const warehouseCount = parseInt(warehouseResult.rows[0].count);
    console.log(`Found ${warehouseCount} warehouse inventory records in the database`);
    
    // Check if products have category_id
    const productsWithoutCategory = await client.query(`
      SELECT id, name FROM products WHERE category_id IS NULL
    `);
    
    if (productsWithoutCategory.rows.length > 0) {
      console.log(`Found ${productsWithoutCategory.rows.length} products without category_id`);
      
      // Get a default category
      const defaultCategory = await client.query(`
        SELECT id FROM categories LIMIT 1
      `);
      
      if (defaultCategory.rows.length > 0) {
        const defaultCategoryId = defaultCategory.rows[0].id;
        
        // Update products without category
        for (const product of productsWithoutCategory.rows) {
          await client.query(
            'UPDATE products SET category_id = $1 WHERE id = $2',
            [defaultCategoryId, product.id]
          );
          
          console.log(`Updated product ${product.id} (${product.name}) with category_id ${defaultCategoryId}`);
        }
      }
    }
    
    // Check if products have warehouse inventory
    const productsWithoutInventory = await client.query(`
      SELECT p.id, p.name FROM products p
      LEFT JOIN warehouse_inventory w ON p.id = w.product_id
      WHERE w.id IS NULL
    `);
    
    if (productsWithoutInventory.rows.length > 0) {
      console.log(`Found ${productsWithoutInventory.rows.length} products without warehouse inventory`);
      
      // Add warehouse inventory for products without it
      for (const product of productsWithoutInventory.rows) {
        await client.query(
          'INSERT INTO warehouse_inventory (product_id, quantity) VALUES ($1, $2)',
          [product.id, Math.floor(Math.random() * 100) + 10]
        );
        
        console.log(`Added warehouse inventory for product ${product.id} (${product.name})`);
      }
    }
    
    // Clear localStorage to force refresh of data
    console.log('To complete the fix, please run the following commands in your browser console:');
    console.log('localStorage.removeItem("twania_products");');
    console.log('localStorage.removeItem("twania_categories");');
    console.log('localStorage.removeItem("twania_warehouseInventory");');
    console.log('localStorage.removeItem("twania_storeInventory");');
    console.log('window.location.reload();');
    
    console.log('Database fix completed successfully');
  } catch (error) {
    console.error('Error fixing admin panel data:', error);
  } finally {
    client.release();
    pool.end();
  }
}

// Run the fix
fixAdminPanelData().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
