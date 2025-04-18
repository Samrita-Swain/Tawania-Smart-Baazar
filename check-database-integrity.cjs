// Script to check database integrity
require('dotenv').config();
const { Pool } = require('pg');

// Create a new pool using the connection string from .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('localhost') ? false : {
    rejectUnauthorized: false // Required for Neon PostgreSQL
  }
});

async function checkDatabaseIntegrity() {
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
    
    // Check foreign key constraints
    console.log('\nChecking foreign key constraints...');
    const constraintsResult = await client.query(`
      SELECT
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM
        information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
      ORDER BY tc.table_name, kcu.column_name
    `);
    
    console.log('Foreign key constraints:');
    constraintsResult.rows.forEach(constraint => {
      console.log(`- ${constraint.table_name}.${constraint.column_name} -> ${constraint.foreign_table_name}.${constraint.foreign_column_name} (${constraint.constraint_name})`);
    });
    
    // Check for orphaned records in warehouse_inventory
    console.log('\nChecking for orphaned records in warehouse_inventory...');
    const orphanedWarehouseResult = await client.query(`
      SELECT wi.id, wi.product_id
      FROM warehouse_inventory wi
      LEFT JOIN products p ON wi.product_id = p.id
      WHERE p.id IS NULL
    `);
    
    if (orphanedWarehouseResult.rows.length > 0) {
      console.log(`Found ${orphanedWarehouseResult.rows.length} orphaned warehouse inventory records:`);
      orphanedWarehouseResult.rows.forEach(record => {
        console.log(`- Warehouse inventory ID: ${record.id}, Product ID: ${record.product_id}`);
      });
      
      // Fix orphaned records
      console.log('Deleting orphaned warehouse inventory records...');
      for (const record of orphanedWarehouseResult.rows) {
        await client.query('DELETE FROM warehouse_inventory WHERE id = $1', [record.id]);
        console.log(`- Deleted warehouse inventory ID: ${record.id}`);
      }
    } else {
      console.log('No orphaned warehouse inventory records found');
    }
    
    // Check for orphaned records in store_inventory
    console.log('\nChecking for orphaned records in store_inventory...');
    const orphanedStoreResult = await client.query(`
      SELECT si.id, si.product_id, si.store_id
      FROM store_inventory si
      LEFT JOIN products p ON si.product_id = p.id
      WHERE p.id IS NULL
    `);
    
    if (orphanedStoreResult.rows.length > 0) {
      console.log(`Found ${orphanedStoreResult.rows.length} orphaned store inventory records:`);
      orphanedStoreResult.rows.forEach(record => {
        console.log(`- Store inventory ID: ${record.id}, Product ID: ${record.product_id}, Store ID: ${record.store_id}`);
      });
      
      // Fix orphaned records
      console.log('Deleting orphaned store inventory records...');
      for (const record of orphanedStoreResult.rows) {
        await client.query('DELETE FROM store_inventory WHERE id = $1', [record.id]);
        console.log(`- Deleted store inventory ID: ${record.id}`);
      }
    } else {
      console.log('No orphaned store inventory records found');
    }
    
    // Check for products without categories
    console.log('\nChecking for products without categories...');
    const productsWithoutCategoriesResult = await client.query(`
      SELECT id, name
      FROM products
      WHERE category_id IS NULL
    `);
    
    if (productsWithoutCategoriesResult.rows.length > 0) {
      console.log(`Found ${productsWithoutCategoriesResult.rows.length} products without categories:`);
      productsWithoutCategoriesResult.rows.forEach(product => {
        console.log(`- Product ID: ${product.id}, Name: ${product.name}`);
      });
      
      // Fix products without categories
      console.log('Assigning default category to products without categories...');
      const defaultCategoryResult = await client.query('SELECT id FROM categories LIMIT 1');
      
      if (defaultCategoryResult.rows.length > 0) {
        const defaultCategoryId = defaultCategoryResult.rows[0].id;
        
        for (const product of productsWithoutCategoriesResult.rows) {
          await client.query('UPDATE products SET category_id = $1 WHERE id = $2', [defaultCategoryId, product.id]);
          console.log(`- Assigned category ID ${defaultCategoryId} to product ID: ${product.id}`);
        }
      } else {
        console.log('No categories found to assign to products');
      }
    } else {
      console.log('No products without categories found');
    }
    
    // Check for products without warehouse inventory
    console.log('\nChecking for products without warehouse inventory...');
    const productsWithoutWarehouseResult = await client.query(`
      SELECT p.id, p.name
      FROM products p
      LEFT JOIN warehouse_inventory wi ON p.id = wi.product_id
      WHERE wi.id IS NULL
    `);
    
    if (productsWithoutWarehouseResult.rows.length > 0) {
      console.log(`Found ${productsWithoutWarehouseResult.rows.length} products without warehouse inventory:`);
      productsWithoutWarehouseResult.rows.forEach(product => {
        console.log(`- Product ID: ${product.id}, Name: ${product.name}`);
      });
      
      // Fix products without warehouse inventory
      console.log('Creating warehouse inventory for products without it...');
      for (const product of productsWithoutWarehouseResult.rows) {
        await client.query(
          'INSERT INTO warehouse_inventory (product_id, quantity) VALUES ($1, $2)',
          [product.id, Math.floor(Math.random() * 100) + 10]
        );
        console.log(`- Created warehouse inventory for product ID: ${product.id}`);
      }
    } else {
      console.log('No products without warehouse inventory found');
    }
    
    // Check for products without store inventory
    console.log('\nChecking for products without store inventory...');
    const storesResult = await client.query('SELECT id FROM stores');
    
    if (storesResult.rows.length > 0) {
      const storeId = storesResult.rows[0].id;
      
      const productsWithoutStoreResult = await client.query(`
        SELECT p.id, p.name
        FROM products p
        LEFT JOIN store_inventory si ON p.id = si.product_id AND si.store_id = $1
        WHERE si.id IS NULL
      `, [storeId]);
      
      if (productsWithoutStoreResult.rows.length > 0) {
        console.log(`Found ${productsWithoutStoreResult.rows.length} products without store inventory for store ID ${storeId}:`);
        productsWithoutStoreResult.rows.forEach(product => {
          console.log(`- Product ID: ${product.id}, Name: ${product.name}`);
        });
        
        // Fix products without store inventory
        console.log('Creating store inventory for products without it...');
        for (const product of productsWithoutStoreResult.rows) {
          await client.query(
            'INSERT INTO store_inventory (product_id, store_id, quantity) VALUES ($1, $2, $3)',
            [product.id, storeId, Math.floor(Math.random() * 50) + 5]
          );
          console.log(`- Created store inventory for product ID: ${product.id} in store ID: ${storeId}`);
        }
      } else {
        console.log(`No products without store inventory found for store ID ${storeId}`);
      }
    } else {
      console.log('No stores found to check store inventory');
    }
    
    console.log('\nDatabase integrity check completed successfully');
  } catch (error) {
    console.error('Error checking database integrity:', error);
  } finally {
    client.release();
    pool.end();
  }
}

// Run the check
checkDatabaseIntegrity().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
