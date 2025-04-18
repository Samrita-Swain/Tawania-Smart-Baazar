// Simple server for categories only
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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
  }
});

// Add global error handlers
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  console.error(err.stack);
  // Don't exit the process
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
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

// Regular categories endpoint (with success wrapper)
app.get('/api/categories', async (req, res) => {
  try {
    console.log('Fetching categories from database (regular endpoint)...');
    const result = await pool.query('SELECT * FROM categories ORDER BY name');
    console.log(`Found ${result.rows.length} categories in database (regular endpoint)`);

    // Return with success wrapper for compatibility with some clients
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching categories (regular endpoint):', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
});

// Categories with product counts
app.get('/api/categories/with-counts', async (req, res) => {
  try {
    console.log('Fetching categories with product counts...');
    const result = await pool.query(`
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id
      ORDER BY c.name
    `);
    console.log(`Found ${result.rows.length} categories with counts`);

    if (result.rows.length > 0) {
      console.log('First category with count:', JSON.stringify(result.rows[0]));
    }

    // Return direct array format
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories with counts:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json([]);
  }
});

// Products endpoint for admin panel (direct format)
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

// Regular products endpoint (with success wrapper)
app.get('/api/products', async (req, res) => {
  try {
    console.log('Fetching products from database (regular endpoint)...');
    const result = await pool.query('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.name');
    console.log(`Found ${result.rows.length} products in database (regular endpoint)`);

    // Return with success wrapper for compatibility with some clients
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching products (regular endpoint):', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
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

// Single product endpoint
app.get('/api/products/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    console.log(`Fetching product with ID ${productId}...`);
    const result = await pool.query('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = $1', [productId]);

    if (result.rows.length === 0) {
      console.log(`Product with ID ${productId} not found`);
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    console.log(`Found product with ID ${productId}:`, JSON.stringify(result.rows[0]));

    // Return with success wrapper
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error(`Error fetching product:`, error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
});

// Start server
const PORT = 5002; // Use a different port

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
    });
  })
  .catch(error => {
    console.error('Failed to connect to database:', error.message);
    process.exit(1); // Exit with error code
  });
