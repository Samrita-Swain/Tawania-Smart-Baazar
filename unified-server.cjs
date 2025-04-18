// Unified server for Twania Smart Bazaar
// Combines functionality of minimal-server.cjs and server.cjs
// Supports both mock data mode and database mode

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { query, getConnectionStatus, checkConnection } = require('./db-connection-utility.cjs');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Health check route
app.get('/api/health', (req, res) => {
  const dbStatus = getConnectionStatus();

  res.json({
    success: true,
    status: 'healthy',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    database: dbStatus
  });
});

// Categories route
app.get('/api/categories', async (req, res) => {
  try {
    const result = await query('SELECT * FROM categories ORDER BY name');
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

// Products route
app.get('/api/products', async (req, res) => {
  try {
    const result = await query('SELECT * FROM products ORDER BY name');
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

// Single product route
app.get('/api/products/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const result = await query('SELECT * FROM products WHERE id = $1', [productId]);

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

// Create product route
app.post('/api/products', async (req, res) => {
  try {
    const { name, description, price, category_id, image, sku } = req.body;

    // Validate required fields
    if (!name || !price || !category_id) {
      return res.status(400).json({
        success: false,
        message: 'Name, price, and category_id are required'
      });
    }

    const result = await query(
      'INSERT INTO products (name, description, price, category_id, image, sku, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING *',
      [name, description, price, category_id, image, sku]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating product:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
});

// Update product route
app.put('/api/products/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const { name, description, price, category_id, image, sku } = req.body;

    // Validate required fields
    if (!name || !price || !category_id) {
      return res.status(400).json({
        success: false,
        message: 'Name, price, and category_id are required'
      });
    }

    const result = await query(
      'UPDATE products SET name = $1, description = $2, price = $3, category_id = $4, image = $5, sku = $6, updated_at = NOW() WHERE id = $7 RETURNING *',
      [name, description, price, category_id, image, sku, productId]
    );

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
    console.error('Error updating product:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    });
  }
});

// Delete product route
app.delete('/api/products/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const result = await query('DELETE FROM products WHERE id = $1 RETURNING *', [productId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting product:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message
    });
  }
});

// Stores route
app.get('/api/stores', async (req, res) => {
  try {
    const result = await query('SELECT * FROM stores ORDER BY name');
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching stores:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stores',
      error: error.message
    });
  }
});

// Warehouse inventory route
app.get('/api/warehouse/inventory', async (req, res) => {
  try {
    const result = await query(`
      SELECT wi.*, p.name as product_name, p.sku
      FROM warehouse_inventory wi
      JOIN products p ON wi.product_id = p.id
      ORDER BY wi.location
    `);
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching warehouse inventory:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch warehouse inventory',
      error: error.message
    });
  }
});

// Users route
app.get('/api/users', async (req, res) => {
  try {
    const result = await query(`
      SELECT id, name, email, role, store_id, created_at, updated_at
      FROM users
      ORDER BY name
    `);
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check credentials against database
    // This is a simplified example - in production, you would use proper password hashing
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = result.rows[0];

    // In a real app, you would verify the password hash here
    // For demo purposes, we'll accept any password

    // Remove password from user object
    delete user.password;

    res.json({
      success: true,
      token: 'token-' + Date.now(),
      user
    });
  } catch (error) {
    console.error('Error during login:', error.message);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;

    // If no authorization header, return 401
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'No authorization header provided'
      });
    }

    // Verify token and get user from database
    // This is a simplified example - in production, you would use proper token verification
    const token = authHeader.split(' ')[1];

    // For demo purposes, we'll accept any token and return the first user
    // In a real app, you would decode the token and get the user ID from it
    const result = await query('SELECT id, name, email, role, store_id FROM users WHERE id = 1');

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    res.json({
      success: true,
      data: {
        user: result.rows[0]
      }
    });
  } catch (error) {
    console.error('Error getting current user:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get current user',
      error: error.message
    });
  }
});

// Catch-all route to serve the frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 5001;

// Check database connection before starting server
checkConnection(5).then(connected => {
  if (connected) {
    console.log('Successfully connected to database!');

    // Start the server after successful database connection
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Server URL: http://localhost:${PORT}`);

      // Log database connection status
      const dbStatus = getConnectionStatus();
      console.log('Database connection status:', dbStatus);
    });
  } else {
    console.error('Failed to connect to database. Server will not start.');
    process.exit(1); // Exit with error code
  }
}).catch(error => {
  console.error('Error checking database connection:', error.message);
  process.exit(1); // Exit with error code
});
