// Enhanced database connection utility with health check, retry mechanism, and fallback to mock data
const { Pool } = require('pg');
require('dotenv').config();

// Create a connection pool with optimized settings for Neon PostgreSQL
const createPool = () => {
  console.log('Creating new database connection pool for Neon PostgreSQL...');

  // Check if DATABASE_URL is defined
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not defined!');
    throw new Error('DATABASE_URL environment variable is not defined');
  }

  try {
    // Log the database URL (without sensitive information)
    const dbUrlParts = process.env.DATABASE_URL.split('@');
    const dbHostPart = dbUrlParts.length > 1 ? dbUrlParts[1] : 'unknown-host';
    console.log('Database host:', dbHostPart);

    // Print more detailed connection information for debugging
    console.log('Connecting to Neon PostgreSQL with the following settings:');
    console.log('- SSL enabled: true');
    console.log('- Max pool size: 10');
    console.log('- Connection timeout: 15000ms');
    console.log('- Idle timeout: 30000ms');

    return new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false // Required for Neon PostgreSQL
      },
      max: 10, // Maximum number of clients in the pool (reduced to prevent overloading)
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 15000, // Return an error after 15 seconds if connection not established (increased timeout)
      maxUses: 5000, // Close a connection after it has been used 5000 times (prevents memory leaks)
      allowExitOnIdle: true // Allow the process to exit if the pool is idle
    });
  } catch (error) {
    console.error('Error creating database pool:', error.message);
    throw new Error(`Failed to create database pool: ${error.message}`);
  }
};

// Create the initial pool
let pool = createPool();

// Track connection attempts and failures
let connectionStats = {
  totalAttempts: 0,
  successfulConnections: 0,
  failedConnections: 0,
  lastErrorMessage: null,
  lastSuccessTime: null,
  lastErrorTime: null,
  isConnected: false
};

// Health check function with retry mechanism
const checkConnection = async (retries = 3) => {
  // Ensure pool exists
  if (!pool) {
    console.error('Database pool is not initialized');
    try {
      // Try to create a new pool
      pool = createPool();
      console.log('Created new database pool');
    } catch (error) {
      console.error('Failed to create database pool:', error.message);
      connectionStats.isConnected = false;
      connectionStats.lastErrorTime = new Date();
      connectionStats.lastErrorMessage = error.message;
      return false;
    }
  }

  connectionStats.totalAttempts++;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Database connection attempt ${attempt}/${retries}`);

      const client = await pool.connect();
      connectionStats.successfulConnections++;
      connectionStats.lastSuccessTime = new Date();
      connectionStats.isConnected = true;

      console.log('Database connection successful');

      // Run a simple query to verify connection is working
      const result = await client.query('SELECT NOW()');
      console.log(`Database time: ${result.rows[0].now}`);

      client.release();
      return true;
    } catch (error) {
      connectionStats.failedConnections++;
      connectionStats.lastErrorTime = new Date();
      connectionStats.lastErrorMessage = error.message;
      connectionStats.isConnected = false;

      console.error(`Database connection failed (attempt ${attempt}/${retries}):`, error.message);

      // If this is not the last attempt, wait before retrying
      if (attempt < retries) {
        const waitTime = 1000 * attempt; // Exponential backoff
        console.log(`Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));

        // If connection fails, recreate the pool
        if (pool) {
          try {
            await pool.end();
          } catch (endError) {
            console.error('Error ending pool:', endError.message);
          }
        }

        try {
          pool = createPool();
          console.log('Recreated database pool');
        } catch (error) {
          console.error('Failed to recreate database pool:', error.message);
          // Continue to next attempt
        }
      }
    }
  }

  // If we get here, all retries failed
  console.error(`All ${retries} connection attempts failed`);
  return false;
};

// Mock data for fallback when database is unavailable
const mockData = {
  categories: [
    { id: 1, name: 'Groceries', description: 'Food and grocery items', parent_id: null },
    { id: 2, name: 'Home & Lifestyle', description: 'Products for home and lifestyle', parent_id: null },
    { id: 3, name: 'Electronics', description: 'Electronic devices and accessories', parent_id: null },
    { id: 4, name: 'Industrial & Professional Supplies', description: 'Supplies for industrial and professional use', parent_id: null },
    { id: 5, name: 'Sports', description: 'Sports equipment and accessories', parent_id: null },
    { id: 6, name: 'Toys & Luggage', description: 'Toys and travel accessories', parent_id: null },
    { id: 7, name: 'Crafts of India', description: 'Handcrafted items from India', parent_id: null },
    { id: 8, name: 'Books, Music & Stationery', description: 'Books, music, and stationery items', parent_id: null },
    { id: 9, name: 'Furniture', description: 'Furniture for home and office', parent_id: null },
    { id: 10, name: 'Wellness', description: 'Health and wellness products', parent_id: null },
    { id: 11, name: 'Technology', description: 'Technology products and services', parent_id: null }
  ],
  products: [
    // Products from Neon PostgreSQL database
    { id: 3, name: 'Test Smartphone XYZ', description: 'The latest smartphone with advanced features including a high-resolution camera, fast processor, and long-lasting battery. This device comes with 128GB storage and 8GB RAM.', price: 799.99, category_id: 3, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', sku: 'PHONE-TEST-001', created_at: '2025-04-15 11:21:25.774', updated_at: '2025-04-15 11:21:27.180256' },
    { id: 4, name: 'Test Smartphone XYZ', description: 'The latest smartphone with advanced features including a high-resolution camera, fast processor, and long-lasting battery. This device comes with 128GB storage and 8GB RAM.', price: 799.99, category_id: 2, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', sku: 'PHONE-TEST-001', created_at: '2025-04-15 11:22:45.951', updated_at: '2025-04-15 12:29:43.868247' },
    { id: 6, name: 'Wipster', description: 'lk', price: 999.99, category_id: 8, image: 'https://www.wipstertechnologies.com/logo.png', sku: 'SKU-1744799279067', created_at: '2025-04-16 10:27:57.439147', updated_at: '2025-04-16 10:27:57.439147' },
    { id: 7, name: 'technology', description: 'wwwwwwwwwwww', price: 999.99, category_id: 7, image: 'https://www.wipstertechnologies.com/logo.png', sku: 'SKU-1744803227947', created_at: '2025-04-16 11:33:46.539314', updated_at: '2025-04-16 11:33:46.539314' },
    { id: 9, name: 'Test Product via Script', description: 'This is a test product added via script', price: 99.99, category_id: 11, image: 'https://via.placeholder.com/300x200?text=Test+Product', sku: 'SKU-1744806098078', created_at: '2025-04-16 12:21:37.308642', updated_at: '2025-04-16 12:21:37.308642' },
    { id: 10, name: 'Test Product via Script', description: 'This is a test product added via script', price: 99.99, category_id: 11, image: 'https://via.placeholder.com/300x200?text=Test+Product', sku: 'SKU-1744806209520', created_at: '2025-04-16 12:23:28.736725', updated_at: '2025-04-16 12:23:28.736725' },

    // Additional fallback products
    { id: 1, name: 'Organic Apples', description: 'Fresh organic apples from local farms', price: 10.99, category_id: 1, image: 'https://via.placeholder.com/300x200?text=Organic+Apples', sku: 'GROC-001', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 2, name: 'Whole Wheat Bread', description: 'Freshly baked whole wheat bread', price: 5.99, category_id: 1, image: 'https://via.placeholder.com/300x200?text=Whole+Wheat+Bread', sku: 'GROC-002', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 5, name: 'Smartphone X', description: 'Latest smartphone with advanced features', price: 599.99, category_id: 3, image: 'https://via.placeholder.com/300x200?text=Smartphone+X', sku: 'ELEC-001', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  ],
  users: [
    { id: 1, name: 'Admin User', email: 'admin@example.com', password: '$2a$10$XQCg1z4YSAj5.nQWGFXHEOdztEU/R1qwstK1YvQXM0ZIv7iiW4Fwy', role: 'admin', store_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  ],
  stores: [
    { id: 1, name: 'Main Store', address: '123 Main St', phone: '555-1234', email: 'main@example.com', manager: 'Store Manager', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  ],
  warehouse_inventory: [
    { id: 1, product_id: 1, quantity: 100, location: 'A1', last_updated: new Date().toISOString() },
    { id: 2, product_id: 2, quantity: 200, location: 'A2', last_updated: new Date().toISOString() },
    { id: 3, product_id: 3, quantity: 300, location: 'B1', last_updated: new Date().toISOString() }
  ],
  store_inventory: [
    { id: 1, store_id: 1, product_id: 1, quantity: 50, last_updated: new Date().toISOString() },
    { id: 2, store_id: 1, product_id: 2, quantity: 30, last_updated: new Date().toISOString() }
  ]
};

// Enhanced query function with retry mechanism
const query = async (text, params, retries = 3) => {
  // Ensure pool exists
  if (!pool) {
    console.error('Database pool is not initialized');
    throw new Error('Database pool is not initialized');
  }

  let attempts = 0;
  let lastError = null;

  while (attempts < retries) {
    attempts++;

    try {
      // Only log a very short snippet of the query to reduce console spam
      const queryPreview = text.substring(0, 30).replace(/\s+/g, ' ').trim() + (text.length > 30 ? '...' : '');

      const result = await pool.query(text, params);

      // Only log the row count for successful queries
      if (result.rowCount > 0) {
        console.log(`Query returned ${result.rowCount} rows: ${queryPreview}`);
      }

      // Update connection stats on success
      connectionStats.isConnected = true;
      connectionStats.lastSuccessTime = new Date();

      return result;
    } catch (error) {
      lastError = error;
      console.error(`Query error (attempt ${attempts}/${retries}):`, error.message);

      // Check if this is a connection error
      if (error.code === 'ECONNREFUSED' || error.code === '57P01' || error.code === '08006' || error.code === '08001') {
        connectionStats.isConnected = false;

        // Try to reconnect
        console.log('Connection error detected, attempting to reconnect...');
        await checkConnection();

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      } else {
        // For non-connection errors, don't retry
        break;
      }
    }
  }

  // If we got here, all retries failed
  console.error(`All ${retries} query attempts failed`);
  throw lastError;
};

// Function to handle mock queries
const handleMockQuery = (text, params) => {
  // Convert SQL query to lowercase for easier matching
  const lowerQuery = text.toLowerCase();

  // Extract table name from query
  let tableName = '';
  if (lowerQuery.includes('from')) {
    const fromParts = lowerQuery.split('from')[1].trim().split(' ');
    tableName = fromParts[0].replace(/["'`]/g, '').trim();
  } else if (lowerQuery.includes('insert into')) {
    const intoParts = lowerQuery.split('insert into')[1].trim().split(' ');
    tableName = intoParts[0].replace(/["'`]/g, '').trim();
  } else if (lowerQuery.includes('update')) {
    const updateParts = lowerQuery.split('update')[1].trim().split(' ');
    tableName = updateParts[0].replace(/["'`]/g, '').trim();
  }

  console.log(`Mock query for table: ${tableName}`);

  // Handle different query types
  if (lowerQuery.includes('select')) {
    // For SELECT queries
    if (tableName && mockData[tableName]) {
      return { rows: [...mockData[tableName]], rowCount: mockData[tableName].length };
    } else if (lowerQuery.includes('select now()')) {
      return { rows: [{ now: new Date() }], rowCount: 1 };
    } else if (lowerQuery.includes('select exists')) {
      return { rows: [{ exists: true }], rowCount: 1 };
    } else if (lowerQuery.includes('count(*)')) {
      const count = tableName && mockData[tableName] ? mockData[tableName].length : 0;
      return { rows: [{ count }], rowCount: 1 };
    }
  } else if (lowerQuery.includes('insert into') && params && params.length > 0) {
    // For INSERT queries
    if (tableName && mockData[tableName]) {
      const newId = mockData[tableName].length > 0 ? Math.max(...mockData[tableName].map(item => item.id)) + 1 : 1;
      const newItem = { id: newId };

      // Extract column names from query
      const columnsMatch = lowerQuery.match(/\(([^)]+)\)/);
      if (columnsMatch && columnsMatch[1]) {
        const columns = columnsMatch[1].split(',').map(col => col.trim());

        // Assign values to columns
        columns.forEach((col, index) => {
          if (params[index] !== undefined) {
            newItem[col] = params[index];
          }
        });
      }

      mockData[tableName].push(newItem);
      return { rows: [newItem], rowCount: 1 };
    }
  } else if (lowerQuery.includes('update') && params && params.length > 0) {
    // For UPDATE queries
    if (tableName && mockData[tableName]) {
      // Extract WHERE condition (very simplified)
      const whereMatch = lowerQuery.match(/where\s+([\w_]+)\s*=\s*\$/i);
      if (whereMatch && whereMatch[1]) {
        const whereColumn = whereMatch[1];
        const whereValue = params[params.length - 1]; // Assuming the WHERE value is the last parameter

        // Find the item to update
        const itemIndex = mockData[tableName].findIndex(item => item[whereColumn] == whereValue);
        if (itemIndex !== -1) {
          // Extract SET values
          const setMatch = lowerQuery.match(/set\s+([^\s]+)\s*=\s*\$/i);
          if (setMatch && setMatch[1]) {
            const setColumn = setMatch[1];
            const setValue = params[0]; // Assuming the SET value is the first parameter

            mockData[tableName][itemIndex][setColumn] = setValue;
            return { rows: [mockData[tableName][itemIndex]], rowCount: 1 };
          }
        }
      }
    }
  }

  // Default fallback
  return { rows: [], rowCount: 0 };
};

// Get connection status
const getConnectionStatus = () => {
  // If pool is null, database is not connected
  if (!pool) {
    return {
      isConnected: false,
      message: 'Database not connected',
      timestamp: new Date().toISOString()
    };
  }

  return {
    ...connectionStats,
    poolSize: pool.totalCount,
    idleConnections: pool.idleCount,
    waitingClients: pool.waitingCount
  };
};

// Initialize by checking the connection
checkConnection().then(connected => {
  if (connected) {
    console.log('Database connection utility initialized successfully');
  } else {
    console.error('Failed to initialize database connection utility');
  }
});

// Function to create a table if it doesn't exist
const createTableIfNotExists = async (tableName, createTableSQL) => {
  try {
    console.log(`Checking if table ${tableName} exists...`);

    // Check if table exists
    const tableCheck = await query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = $1)",
      [tableName]
    );

    const tableExists = tableCheck.rows[0].exists;

    if (!tableExists) {
      console.log(`Table ${tableName} does not exist, creating...`);
      await query(createTableSQL);
      console.log(`Table ${tableName} created successfully`);
      return true;
    } else {
      console.log(`Table ${tableName} already exists`);
      return false;
    }
  } catch (error) {
    console.error(`Error creating table ${tableName}:`, error.message);
    throw error;
  }
};

module.exports = {
  query,
  pool: () => pool, // Return the pool as a function to always get the current instance
  checkConnection,
  getConnectionStatus,
  createTableIfNotExists
};
