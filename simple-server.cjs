// Simple server for Twania Smart Bazaar
// Connects to Neon PostgreSQL database and serves API endpoints

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Categories route
app.get('/api/categories', async (req, res) => {
  try {
    console.log('Fetching categories from database...');
    const result = await pool.query('SELECT * FROM categories ORDER BY name');
    console.log(`Found ${result.rows.length} categories in database`);

    if (result.rows.length > 0) {
      console.log('First category:', JSON.stringify(result.rows[0]));
      console.log('All categories:', JSON.stringify(result.rows));
    }

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching categories:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
});

// Special endpoint for frontend categories
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

// Special endpoint for admin panel categories (direct format)
app.get('/api/admin/categories', async (req, res) => {
  try {
    console.log('Fetching categories from database for admin panel (special endpoint)...');
    const result = await pool.query('SELECT * FROM categories ORDER BY name');
    console.log(`Found ${result.rows.length} categories in database for admin panel (special endpoint)`);

    if (result.rows.length > 0) {
      console.log('First category:', JSON.stringify(result.rows[0]));
      console.log('All categories:', JSON.stringify(result.rows));
    }

    // Return direct array format for compatibility with admin panel
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories for admin panel (special endpoint):', error.message);
    res.status(500).json([]);
  }
});

// Direct database query endpoint for categories
app.get('/api/categories/direct', async (req, res) => {
  try {
    console.log('Direct database query for categories...');
    const result = await pool.query('SELECT * FROM categories ORDER BY name');
    console.log(`Found ${result.rows.length} categories in direct database query`);

    if (result.rows.length > 0) {
      console.log('First category from direct query:', JSON.stringify(result.rows[0]));
    }

    // Return direct array format
    res.json(result.rows);
  } catch (error) {
    console.error('Error in direct database query for categories:', error.message);
    res.status(500).json([]);
  }
});

// Debug endpoint to check database tables
app.get('/api/debug/tables', async (req, res) => {
  try {
    console.log('Debug: Checking database tables...');

    // Get list of tables
    const tablesResult = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
    );

    const tables = tablesResult.rows.map(row => row.table_name);
    console.log('Tables in database:', tables);

    // Get count of rows in each table
    const tableCounts = {};
    for (const table of tables) {
      const countResult = await pool.query(`SELECT COUNT(*) FROM ${table}`);
      tableCounts[table] = parseInt(countResult.rows[0].count);
    }

    console.log('Table row counts:', tableCounts);

    // Get categories
    const categoriesResult = await pool.query('SELECT * FROM categories');
    console.log(`Found ${categoriesResult.rows.length} categories`);

    // Return debug info
    res.json({
      tables,
      tableCounts,
      categories: categoriesResult.rows
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Products route
app.get('/api/products', async (req, res) => {
  try {
    console.log('Fetching products from database...');
    const result = await pool.query('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.name');
    console.log(`Found ${result.rows.length} products in database`);

    if (result.rows.length > 0) {
      console.log('First product:', JSON.stringify(result.rows[0]));
      console.log('All products:', JSON.stringify(result.rows));
    }

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching products:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
});

// Products route (alternative format for compatibility)
app.get('/products', async (req, res) => {
  try {
    console.log('Fetching products from database (alternative endpoint)...');
    const result = await pool.query('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.name');
    console.log(`Found ${result.rows.length} products in database (alternative endpoint)`);

    res.json(result.rows); // Return direct array format
  } catch (error) {
    console.error('Error fetching products (alternative endpoint):', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
});

// Admin panel products route
app.get('/admin/products', async (req, res) => {
  try {
    console.log('Fetching products from database for admin panel...');
    const result = await pool.query('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.name');
    console.log(`Found ${result.rows.length} products in database for admin panel`);

    if (result.rows.length > 0) {
      console.log('First product for admin panel:', JSON.stringify(result.rows[0]));
      console.log('All products for admin panel:', JSON.stringify(result.rows));
    }

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching products for admin panel:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products for admin panel',
      error: error.message
    });
  }
});

// Special endpoint for admin panel products (direct format)
app.get('/api/admin/products', async (req, res) => {
  try {
    console.log('Fetching products from database for admin panel (special endpoint)...');
    const result = await pool.query('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.name');
    console.log(`Found ${result.rows.length} products in database for admin panel (special endpoint)`);

    if (result.rows.length > 0) {
      console.log('First product:', JSON.stringify(result.rows[0]));
      console.log('All products:', JSON.stringify(result.rows));
    }

    // Return direct array format for compatibility with admin panel
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching products for admin panel (special endpoint):', error.message);
    res.status(500).json([]);
  }
});

// Single product route
app.get('/api/products/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [productId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching product:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
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

// Start server
const PORT = process.env.PORT || 5001;

// Check database connection before starting server
pool.connect()
  .then(client => {
    console.log('Successfully connected to database!');
    client.release();

    // Start the server after successful database connection
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Server URL: http://localhost:${PORT}`);
    });
  })
  .catch(error => {
    console.error('Failed to connect to database:', error.message);
    process.exit(1); // Exit with error code
  });
