const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function createTestProduct() {
  try {
    console.log('Creating test product...');

    // First, create a category if it doesn't exist
    let categoryId;
    try {
      // Check if the category already exists
      const checkCategory = await pool.query(
        'SELECT id FROM categories WHERE name = $1',
        ['Electronics']
      );

      if (checkCategory.rows.length > 0) {
        categoryId = checkCategory.rows[0].id;
        console.log(`Using existing category ID: ${categoryId}`);
      } else {
        // Create a new category
        const categoryResult = await pool.query(
          'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING id',
          ['Electronics', 'Electronic devices and accessories']
        );
        categoryId = categoryResult.rows[0].id;
        console.log(`Created new category with ID: ${categoryId}`);
      }
    } catch (err) {
      console.error('Error with category:', err);
      throw err;
    }

    // Create a test product
    const productResult = await pool.query(
      `INSERT INTO products (
        name, description, price, category_id, image, sku, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [
        'Test Smartphone XYZ',
        'The latest smartphone with advanced features including a high-resolution camera, fast processor, and long-lasting battery. This device comes with 128GB storage and 8GB RAM.',
        799.99,
        categoryId,
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        'PHONE-TEST-001',
        new Date().toISOString()
      ]
    );

    const productId = productResult.rows[0].id;
    console.log(`Created product with ID: ${productId}`);

    // Add warehouse inventory
    await pool.query(
      'INSERT INTO warehouse_inventory (product_id, quantity) VALUES ($1, $2)',
      [productId, 50]
    );
    console.log('Added warehouse inventory');

    // Add store inventory (only for store ID 1 which exists)
    await pool.query(
      'INSERT INTO store_inventory (store_id, product_id, quantity) VALUES ($1, $2, $3)',
      [1, productId, 35]
    );
    console.log('Added store inventory');

    console.log('Test product created successfully!');
    console.log(`You can view it at: http://localhost:5182/products/${productId}`);
  } catch (err) {
    console.error('Error creating test product:', err);
  } finally {
    pool.end();
  }
}

createTestProduct();
