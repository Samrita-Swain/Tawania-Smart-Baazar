// Script to start the server with proper error handling
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');

console.log('Starting server...');
console.log('Environment variables:');
console.log('- PORT:', process.env.PORT);
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- DATABASE_URL:', process.env.DATABASE_URL ? 'Set (hidden for security)' : 'Not set');

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Neon PostgreSQL
  },
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 15000 // Return an error after 15 seconds if connection not established
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Admin panel categories endpoint
app.get('/api/admin/categories', async (req, res) => {
  try {
    console.log('Fetching categories from database for admin panel...');
    const result = await pool.query('SELECT * FROM categories ORDER BY name');
    console.log(`Found ${result.rows.length} categories in database for admin panel`);

    if (result.rows.length > 0) {
      console.log('First category for admin panel:', JSON.stringify(result.rows[0]));
    }

    // Return direct array format for compatibility with admin panel
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories for admin panel:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json([]);
  }
});

// Frontend categories endpoint
app.get('/api/frontend/categories', async (req, res) => {
  try {
    console.log('Fetching categories from database for frontend...');
    const result = await pool.query('SELECT * FROM categories ORDER BY name');
    console.log(`Found ${result.rows.length} categories in database for frontend`);

    if (result.rows.length > 0) {
      console.log('First category for frontend:', JSON.stringify(result.rows[0]));
    }

    // Return direct array format for compatibility with frontend
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories for frontend:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json([]);
  }
});

// Products endpoint for admin panel
app.get('/api/admin/products', async (req, res) => {
  try {
    console.log('Fetching products from database for admin panel...');
    const result = await pool.query('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.name');
    console.log(`Found ${result.rows.length} products in database for admin panel`);

    if (result.rows.length > 0) {
      console.log('First product for admin panel:', JSON.stringify(result.rows[0]));
    }

    // Return direct array format for compatibility with admin panel
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching products for admin panel:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json([]);
  }
});

// Frontend products endpoint
app.get('/api/frontend/products', async (req, res) => {
  try {
    console.log('Fetching products from database for frontend...');
    const result = await pool.query('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.name');
    console.log(`Found ${result.rows.length} products in database for frontend`);

    if (result.rows.length > 0) {
      console.log('First product for frontend:', JSON.stringify(result.rows[0]));
    }

    // Return direct array format for compatibility with frontend
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching products for frontend:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json([]);
  }
});

// Debug endpoint to list all tables
app.get('/api/debug/tables', async (req, res) => {
  try {
    console.log('Fetching database tables...');
    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);
    
    console.log('Database tables:', result.rows.map(row => row.table_name));
    
    // Get counts for each table
    const tableCounts = {};
    for (const row of result.rows) {
      const tableName = row.table_name;
      try {
        const countResult = await pool.query(`SELECT COUNT(*) FROM ${tableName}`);
        tableCounts[tableName] = parseInt(countResult.rows[0].count);
      } catch (error) {
        console.error(`Error counting rows in ${tableName}:`, error.message);
        tableCounts[tableName] = -1; // Error indicator
      }
    }
    
    res.json({
      tables: result.rows.map(row => row.table_name),
      counts: tableCounts
    });
  } catch (error) {
    console.error('Error fetching database tables:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 5002;

// Check database connection before starting server
pool.connect()
  .then(client => {
    console.log('Successfully connected to database!');
    client.release();

    // Start the server after successful database connection
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Server URL: http://localhost:${PORT}`);
    });

    // Handle server errors
    server.on('error', (error) => {
      console.error('Server error:', error);
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please use a different port.`);
        process.exit(1);
      }
    });
  })
  .catch(error => {
    console.error('Failed to connect to database:', error.message);
    process.exit(1); // Exit with error code
  });
