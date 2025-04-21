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
    // Get categories with product counts for admin panel
    const result = await pool.query(`
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id
      ORDER BY c.name
    `);
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

// Categories endpoint (alternative for frontend)
app.get('/api/categories', async (req, res) => {
  try {
    console.log('Fetching categories from database (alternative endpoint)...');
    const result = await pool.query('SELECT * FROM categories ORDER BY name');
    console.log(`Found ${result.rows.length} categories in database (alternative endpoint)`);

    if (result.rows.length > 0) {
      console.log('First category (alternative endpoint):', JSON.stringify(result.rows[0]));
    }

    // Return direct array format for compatibility with frontend
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories (alternative endpoint):', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json([]);
  }
});

// Categories with product counts endpoint
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
    console.log(`Found ${result.rows.length} categories with product counts`);

    if (result.rows.length > 0) {
      console.log('First category with count:', JSON.stringify(result.rows[0]));
    }

    // Return direct array format for compatibility with frontend
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories with counts:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json([]);
  }
});

// Create category endpoint for admin panel
app.post('/api/admin/categories', async (req, res) => {
  try {
    console.log('Creating new category:', req.body);
    const { name, description, parent_id } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    // Insert the new category
    const result = await pool.query(
      'INSERT INTO categories (name, description, parent_id) VALUES ($1, $2, $3) RETURNING *',
      [name, description || '', parent_id || null]
    );

    console.log('Category created:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating category:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update category endpoint for admin panel
app.put('/api/admin/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Updating category ${id}:`, req.body);
    const { name, description, parent_id } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    // Update the category
    const result = await pool.query(
      'UPDATE categories SET name = $1, description = $2, parent_id = $3 WHERE id = $4 RETURNING *',
      [name, description || '', parent_id || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    console.log('Category updated:', result.rows[0]);

    // Get the updated category with product count
    const categoryWithCount = await pool.query(`
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      WHERE c.id = $1
      GROUP BY c.id
    `, [id]);

    res.json(categoryWithCount.rows[0]);
  } catch (error) {
    console.error('Error updating category:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete category endpoint for admin panel
app.delete('/api/admin/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Deleting category ${id}`);

    // Check if category has products
    const productsCheck = await pool.query('SELECT COUNT(*) FROM products WHERE category_id = $1', [id]);
    const productCount = parseInt(productsCheck.rows[0].count);

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category with ${productCount} products. Please reassign or delete the products first.`
      });
    }

    // Delete the category
    const result = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    console.log('Category deleted:', result.rows[0]);
    res.json({ success: true, message: 'Category deleted successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Error deleting category:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ success: false, message: error.message });
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

// Create product endpoint for admin panel
app.post('/api/admin/products', async (req, res) => {
  try {
    console.log('Creating new product:', req.body);
    const { name, description, price, category_id, image, stock } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ success: false, message: 'Product name is required' });
    }

    // Insert the new product
    const result = await pool.query(
      'INSERT INTO products (name, description, price, category_id, image) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, description || '', price || 0, category_id || null, image || '']
    );

    console.log('Product created:', result.rows[0]);

    // Join with category to get category_name
    const productWithCategory = await pool.query(
      'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = $1',
      [result.rows[0].id]
    );

    res.status(201).json(productWithCategory.rows[0]);
  } catch (error) {
    console.error('Error creating product:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ success: false, message: error.message });
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

// Update product endpoint for admin panel
app.put('/api/admin/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Updating product ${id}:`, req.body);
    const { name, description, price, category_id, image } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ success: false, message: 'Product name is required' });
    }

    // Update the product
    const result = await pool.query(
      'UPDATE products SET name = $1, description = $2, price = $3, category_id = $4, image = $5 WHERE id = $6 RETURNING *',
      [name, description || '', price || 0, category_id || null, image || '', id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    console.log('Product updated:', result.rows[0]);

    // Join with category to get category_name
    const productWithCategory = await pool.query(
      'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = $1',
      [result.rows[0].id]
    );

    res.json(productWithCategory.rows[0]);
  } catch (error) {
    console.error('Error updating product:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete product endpoint for admin panel
app.delete('/api/admin/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Deleting product ${id}`);

    // Delete the product
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    console.log('Product deleted:', result.rows[0]);
    res.json({ success: true, message: 'Product deleted successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Error deleting product:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ success: false, message: error.message });
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

// Debug endpoint to check API connectivity
app.get('/api/debug/connectivity', async (req, res) => {
  try {
    console.log('Checking API connectivity...');

    // Test database connection
    const dbTest = await pool.query('SELECT NOW() as time');
    const dbConnected = !!dbTest.rows[0].time;

    // Test categories endpoint
    let categoriesEndpoint = false;
    try {
      const categoriesResult = await pool.query('SELECT COUNT(*) FROM categories');
      categoriesEndpoint = true;
    } catch (error) {
      console.error('Categories endpoint test failed:', error.message);
    }

    // Test products endpoint
    let productsEndpoint = false;
    try {
      const productsResult = await pool.query('SELECT COUNT(*) FROM products');
      productsEndpoint = true;
    } catch (error) {
      console.error('Products endpoint test failed:', error.message);
    }

    res.json({
      success: true,
      status: 'API is running',
      database: {
        connected: dbConnected,
        time: dbTest.rows[0].time
      },
      endpoints: {
        categories: categoriesEndpoint,
        products: productsEndpoint
      },
      server: {
        port: process.env.PORT || 5002,
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error checking API connectivity:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
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
