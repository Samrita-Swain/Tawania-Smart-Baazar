const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function clearWarehouseInventory() {
  try {
    console.log('Starting warehouse inventory cleanup...');
    
    // Get the current count of warehouse inventory records
    const countResult = await pool.query('SELECT COUNT(*) FROM warehouse_inventory');
    const initialCount = parseInt(countResult.rows[0].count);
    console.log(`Found ${initialCount} warehouse inventory records`);
    
    // Delete all records from warehouse_inventory
    const deleteResult = await pool.query('DELETE FROM warehouse_inventory');
    console.log(`Deleted ${deleteResult.rowCount} warehouse inventory records`);
    
    // Verify that all records were deleted
    const verifyResult = await pool.query('SELECT COUNT(*) FROM warehouse_inventory');
    const remainingCount = parseInt(verifyResult.rows[0].count);
    console.log(`Remaining warehouse inventory records: ${remainingCount}`);
    
    if (remainingCount === 0) {
      console.log('All warehouse inventory data has been successfully removed!');
    } else {
      console.log(`Warning: ${remainingCount} records still remain in the warehouse inventory table.`);
    }
    
    // Reset the sequence (auto-increment) for the warehouse_inventory table
    await pool.query('ALTER SEQUENCE warehouse_inventory_id_seq RESTART WITH 1');
    console.log('Reset the warehouse inventory ID sequence');
    
    console.log('Warehouse inventory cleanup completed successfully');
  } catch (err) {
    console.error('Error clearing warehouse inventory:', err);
  } finally {
    pool.end();
  }
}

clearWarehouseInventory();
