// Script to fix database connection issues
require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

console.log('Starting database connection fix script...');
console.log('Database URL:', process.env.DATABASE_URL ? 'Set (hidden for security)' : 'Not set');

// Create a new pool with optimized settings
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('localhost') ? false : {
    rejectUnauthorized: false // Required for Neon PostgreSQL
  },
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection not established
  maxUses: 7500 // Close a connection after it has been used 7500 times (prevents memory leaks)
});

async function fixDatabaseConnection() {
  let client;
  
  try {
    console.log('Attempting to connect to the database...');
    client = await pool.connect();
    console.log('Successfully connected to the database!');
    
    // Check database tables
    console.log('Checking database tables...');
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);
    
    const tables = tablesResult.rows.map(row => row.table_name);
    console.log('Database tables:', tables);
    
    // Check for duplicate tables
    const duplicateTables = findDuplicateTables(tables);
    if (duplicateTables.length > 0) {
      console.log('Found potential duplicate tables:', duplicateTables);
      await cleanupDuplicateTables(client, duplicateTables);
    } else {
      console.log('No duplicate tables found.');
    }
    
    // Check table counts
    console.log('Checking table counts...');
    const counts = {};
    for (const table of ['products', 'categories', 'users', 'stores']) {
      if (tables.includes(table)) {
        const countResult = await client.query(`SELECT COUNT(*) FROM ${table}`);
        counts[table] = parseInt(countResult.rows[0].count);
      } else {
        counts[table] = 'table not found';
      }
    }
    console.log('Table counts:', counts);
    
    // Check for connection pool issues
    console.log('Checking connection pool status...');
    console.log('Total clients:', pool.totalCount);
    console.log('Idle clients:', pool.idleCount);
    console.log('Waiting clients:', pool.waitingCount);
    
    // Test a simple query
    console.log('Testing a simple query...');
    const testResult = await client.query('SELECT NOW() as current_time');
    console.log('Current database time:', testResult.rows[0].current_time);
    
    // Check for connection leaks
    if (pool.totalCount > 5) {
      console.log('Warning: High number of connections detected. This might indicate a connection leak.');
      console.log('Attempting to clean up idle connections...');
      
      // Force garbage collection if available
      if (global.gc) {
        console.log('Forcing garbage collection...');
        global.gc();
      } else {
        console.log('Garbage collection not available. Run with --expose-gc flag to enable.');
      }
    }
    
    // Create a health check function in the database
    console.log('Creating health check function in the database...');
    await client.query(`
      CREATE OR REPLACE FUNCTION public.health_check()
      RETURNS boolean AS $$
      BEGIN
        RETURN true;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    // Test the health check function
    const healthCheckResult = await client.query('SELECT public.health_check()');
    console.log('Health check function result:', healthCheckResult.rows[0].health_check);
    
    console.log('Database connection fix completed successfully!');
    
    // Create a connection test script
    createConnectionTestScript();
    
    return true;
  } catch (error) {
    console.error('Error fixing database connection:', error);
    return false;
  } finally {
    if (client) {
      client.release();
      console.log('Database client released.');
    }
    
    try {
      await pool.end();
      console.log('Connection pool closed.');
    } catch (endError) {
      console.error('Error closing connection pool:', endError);
    }
  }
}

// Function to find potential duplicate tables
function findDuplicateTables(tables) {
  const tableNameMap = {};
  const duplicates = [];
  
  for (const table of tables) {
    const baseName = table.replace(/\\d+$/, '').toLowerCase();
    if (!tableNameMap[baseName]) {
      tableNameMap[baseName] = [table];
    } else {
      tableNameMap[baseName].push(table);
    }
  }
  
  for (const [baseName, tableList] of Object.entries(tableNameMap)) {
    if (tableList.length > 1) {
      duplicates.push({
        baseName,
        tables: tableList
      });
    }
  }
  
  return duplicates;
}

// Function to clean up duplicate tables
async function cleanupDuplicateTables(client, duplicateTables) {
  console.log('Starting cleanup of duplicate tables...');
  
  for (const { baseName, tables } of duplicateTables) {
    console.log(`Processing duplicate tables for ${baseName}...`);
    
    // Sort tables by name to keep the one with the lowest number or no number
    tables.sort();
    const tableToKeep = tables[0];
    const tablesToDrop = tables.slice(1);
    
    console.log(`Keeping table: ${tableToKeep}`);
    console.log(`Tables to drop: ${tablesToDrop.join(', ')}`);
    
    // Check if the tables have the same structure
    const structureMap = {};
    
    for (const table of tables) {
      const structureResult = await client.query(`
        SELECT column_name, data_type, character_maximum_length
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [table]);
      
      structureMap[table] = structureResult.rows;
    }
    
    // Check if we should merge data before dropping
    const shouldMergeData = shouldMergeTables(structureMap, tableToKeep, tablesToDrop);
    
    if (shouldMergeData) {
      console.log('Tables have compatible structures. Merging data before dropping...');
      
      // Begin a transaction
      await client.query('BEGIN');
      
      try {
        for (const tableToDrop of tablesToDrop) {
          // Get column names from the table to keep
          const columnsResult = await client.query(`
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = $1
            AND column_name != 'id'
            ORDER BY ordinal_position
          `, [tableToKeep]);
          
          const columns = columnsResult.rows.map(row => row.column_name);
          const columnList = columns.join(', ');
          
          // Insert data from the table to drop into the table to keep
          console.log(`Merging data from ${tableToDrop} into ${tableToKeep}...`);
          await client.query(`
            INSERT INTO ${tableToKeep} (${columnList})
            SELECT ${columnList}
            FROM ${tableToDrop}
            ON CONFLICT DO NOTHING
          `);
          
          // Drop the duplicate table
          console.log(`Dropping table ${tableToDrop}...`);
          await client.query(`DROP TABLE IF EXISTS ${tableToDrop} CASCADE`);
        }
        
        // Commit the transaction
        await client.query('COMMIT');
        console.log('Transaction committed successfully.');
      } catch (error) {
        // Rollback the transaction on error
        await client.query('ROLLBACK');
        console.error('Error merging tables, transaction rolled back:', error);
      }
    } else {
      console.log('Tables have different structures. Dropping without merging data...');
      
      // Drop the duplicate tables without merging
      for (const tableToDrop of tablesToDrop) {
        try {
          console.log(`Dropping table ${tableToDrop}...`);
          await client.query(`DROP TABLE IF EXISTS ${tableToDrop} CASCADE`);
        } catch (error) {
          console.error(`Error dropping table ${tableToDrop}:`, error);
        }
      }
    }
  }
  
  console.log('Duplicate table cleanup completed.');
}

// Function to determine if tables should be merged
function shouldMergeTables(structureMap, tableToKeep, tablesToDrop) {
  const keepStructure = structureMap[tableToKeep];
  
  for (const tableToDrop of tablesToDrop) {
    const dropStructure = structureMap[tableToDrop];
    
    // Check if the table to drop has any columns that match the table to keep
    const matchingColumns = dropStructure.filter(dropCol => 
      keepStructure.some(keepCol => keepCol.column_name === dropCol.column_name && keepCol.data_type === dropCol.data_type)
    );
    
    // If there are no matching columns, don't merge
    if (matchingColumns.length === 0) {
      return false;
    }
  }
  
  return true;
}

// Function to create a connection test script
function createConnectionTestScript() {
  const scriptContent = `// Database connection test script
require('dotenv').config();
const { Pool } = require('pg');

console.log('Testing database connection...');
console.log('Database URL:', process.env.DATABASE_URL ? 'Set (hidden for security)' : 'Not set');

// Create a new pool with optimized settings
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('localhost') ? false : {
    rejectUnauthorized: false // Required for Neon PostgreSQL
  },
  max: 5, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000 // Return an error after 10 seconds if connection not established
});

async function testConnection() {
  let client;
  
  try {
    console.log('Attempting to connect to the database...');
    client = await pool.connect();
    console.log('Successfully connected to the database!');
    
    // Test a simple query
    console.log('Testing a simple query...');
    const testResult = await client.query('SELECT NOW() as current_time');
    console.log('Current database time:', testResult.rows[0].current_time);
    
    // Test the health check function
    try {
      const healthCheckResult = await client.query('SELECT public.health_check()');
      console.log('Health check function result:', healthCheckResult.rows[0].health_check);
    } catch (healthError) {
      console.log('Health check function not available:', healthError.message);
    }
    
    // Check database tables
    console.log('Checking database tables...');
    const tablesResult = await client.query(\`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    \`);
    
    const tables = tablesResult.rows.map(row => row.table_name);
    console.log('Database tables:', tables);
    
    console.log('Connection test completed successfully!');
    return true;
  } catch (error) {
    console.error('Error testing database connection:', error);
    return false;
  } finally {
    if (client) {
      client.release();
      console.log('Database client released.');
    }
    
    try {
      await pool.end();
      console.log('Connection pool closed.');
    } catch (endError) {
      console.error('Error closing connection pool:', endError);
    }
  }
}

testConnection().then(success => {
  console.log('Test result:', success ? 'SUCCESS' : 'FAILURE');
  process.exit(success ? 0 : 1);
});
`;

  const scriptPath = path.join(__dirname, 'test-db-connection.cjs');
  fs.writeFileSync(scriptPath, scriptContent);
  console.log(`Connection test script created at ${scriptPath}`);
}

// Run the fix function
fixDatabaseConnection().then(success => {
  console.log('Fix result:', success ? 'SUCCESS' : 'FAILURE');
  process.exit(success ? 0 : 1);
});
