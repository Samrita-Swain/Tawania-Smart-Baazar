// Script to fix the admin panel not showing products
require('dotenv').config();
const { Pool } = require('pg');

// Create a new pool using the connection string from .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('localhost') ? false : {
    rejectUnauthorized: false // Required for Neon PostgreSQL
  }
});

async function fixAdminPanel() {
  const client = await pool.connect();
  try {
    console.log('Connected to PostgreSQL database');
    
    // Check if products exist
    const productsResult = await client.query(`
      SELECT COUNT(*) FROM products
    `);

    const productsCount = parseInt(productsResult.rows[0].count);
    console.log(`Found ${productsCount} products in the database`);

    if (productsCount === 0) {
      console.log('No products found in the database. Adding sample products...');
      
      // Get categories
      const categoriesResult = await client.query(`
        SELECT id, name FROM categories
      `);
      
      if (categoriesResult.rows.length === 0) {
        console.log('No categories found. Please run the server first to initialize categories.');
        return;
      }
      
      console.log(`Found ${categoriesResult.rows.length} categories`);
      
      // Add sample products
      const sampleProducts = [
        {
          name: 'Smartphone XYZ',
          description: 'Latest smartphone with advanced features',
          price: 799.99,
          image: 'https://via.placeholder.com/300x200?text=Smartphone',
          category_id: categoriesResult.rows.find(c => c.name === 'Electronics')?.id || categoriesResult.rows[0].id
        },
        {
          name: 'Laptop ABC',
          description: 'Powerful laptop for professionals',
          price: 1299.99,
          image: 'https://via.placeholder.com/300x200?text=Laptop',
          category_id: categoriesResult.rows.find(c => c.name === 'Electronics')?.id || categoriesResult.rows[0].id
        },
        {
          name: 'Coffee Maker',
          description: 'Premium coffee maker for home use',
          price: 129.99,
          image: 'https://via.placeholder.com/300x200?text=Coffee+Maker',
          category_id: categoriesResult.rows.find(c => c.name === 'Home & Lifestyle')?.id || categoriesResult.rows[0].id
        }
      ];
      
      // Insert sample products
      for (const product of sampleProducts) {
        const result = await client.query(
          'INSERT INTO products (name, description, price, image, category_id, sku) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
          [product.name, product.description, product.price, product.image, product.category_id, `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`]
        );
        
        const productId = result.rows[0].id;
        console.log(`Added product: ${product.name} with ID ${productId}`);
        
        // Add warehouse inventory
        await client.query(
          'INSERT INTO warehouse_inventory (product_id, quantity) VALUES ($1, $2)',
          [productId, Math.floor(Math.random() * 100) + 10]
        );
        
        console.log(`Added warehouse inventory for product ${productId}`);
      }
      
      console.log('Sample products added successfully');
    } else {
      console.log('Products already exist in the database');
      
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
    }
    
    // Verify the database state
    const finalProductsResult = await client.query(`
      SELECT COUNT(*) FROM products
    `);
    
    const finalWarehouseResult = await client.query(`
      SELECT COUNT(*) FROM warehouse_inventory
    `);
    
    console.log(`Final database state: ${finalProductsResult.rows[0].count} products, ${finalWarehouseResult.rows[0].count} warehouse inventory records`);
    
    console.log('Database fix completed successfully');
  } catch (error) {
    console.error('Error fixing admin panel:', error);
  } finally {
    client.release();
    pool.end();
  }
}

// Run the fix
fixAdminPanel().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
