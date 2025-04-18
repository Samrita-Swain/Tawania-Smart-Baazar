// Script to clean up duplicate tables in the database
require('dotenv').config();
const { Pool } = require('pg');

// Create a new pool using the connection string from .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('localhost') ? false : {
    rejectUnauthorized: false // Required for Neon PostgreSQL
  }
});

// Tables to keep (lowercase tables)
const tablesToKeep = [
  'categories',
  'products',
  'stores',
  'warehouse_inventory',
  'store_inventory',
  'users'
];

// Tables to remove (Prisma-generated tables)
const tablesToRemove = [
  'Transfer',
  'Customer',
  'Store',
  'User',
  'Warehouse',
  'Category',
  'Product',
  'WarehouseItem',
  'StoreItem',
  'TransferItem',
  'Order',
  'OrderItem',
  'ProductChange',
  'Permission',
  '_PermissionToUser'
];

async function cleanupDatabase() {
  const client = await pool.connect();
  try {
    console.log('Connected to PostgreSQL database');
    
    // Check if tables exist
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);

    const existingTables = tablesResult.rows.map(row => row.table_name);
    console.log('Existing tables:', existingTables);

    // Start a transaction
    await client.query('BEGIN');

    // Remove Prisma-generated tables
    for (const table of tablesToRemove) {
      if (existingTables.includes(table)) {
        try {
          console.log(`Dropping table: ${table}`);
          await client.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
          console.log(`Table ${table} dropped successfully`);
        } catch (error) {
          console.error(`Error dropping table ${table}:`, error.message);
          // Continue with other tables even if one fails
        }
      } else {
        console.log(`Table ${table} does not exist, skipping`);
      }
    }

    // Commit the transaction
    await client.query('COMMIT');
    console.log('Database cleanup completed successfully');

    // Check remaining tables
    const remainingTablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);

    const remainingTables = remainingTablesResult.rows.map(row => row.table_name);
    console.log('Remaining tables:', remainingTables);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error cleaning up database:', error);
  } finally {
    client.release();
    pool.end();
  }
}

// Run the cleanup
cleanupDatabase().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
