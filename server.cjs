const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Import custom database connection utility with health check and retry mechanism
const db = require('./db-connection-utility.cjs');

// Import request throttling middleware
const requestThrottle = require('./request-throttle.cjs');

console.log('Database URL:', process.env.DATABASE_URL ? 'Set (hidden for security)' : 'Not set');

// Function to initialize essential tables
async function initializeTables() {
  // Create categories table
  await db.createTableIfNotExists('categories', `
    CREATE TABLE categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      parent_id INTEGER REFERENCES categories(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create products table
  await db.createTableIfNotExists('products', `
    CREATE TABLE products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10, 2) NOT NULL,
      image VARCHAR(255),
      category_id INTEGER REFERENCES categories(id),
      sku VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create stores table
  await db.createTableIfNotExists('stores', `
    CREATE TABLE stores (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      address VARCHAR(255),
      phone VARCHAR(50),
      email VARCHAR(255),
      manager VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create warehouse_inventory table
  await db.createTableIfNotExists('warehouse_inventory', `
    CREATE TABLE warehouse_inventory (
      id SERIAL PRIMARY KEY,
      product_id INTEGER REFERENCES products(id),
      quantity INTEGER NOT NULL DEFAULT 0,
      location VARCHAR(255),
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create store_inventory table
  await db.createTableIfNotExists('store_inventory', `
    CREATE TABLE store_inventory (
      id SERIAL PRIMARY KEY,
      store_id INTEGER REFERENCES stores(id),
      product_id INTEGER REFERENCES products(id),
      quantity INTEGER NOT NULL DEFAULT 0,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Note: inventory_transfers table has been removed as it's not currently used in both admin panel and frontend

  // Create users table
  await db.createTableIfNotExists('users', `
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'user',
      store_id INTEGER REFERENCES stores(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert default data if tables were just created
  const storeExists = await db.query('SELECT COUNT(*) FROM stores');
  if (parseInt(storeExists.rows[0].count) === 0) {
    // Insert default store
    await db.query(
      'INSERT INTO stores (name, address, phone, email, manager) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      ['Main Store', '123 Main St, City', '555-1234', 'store@example.com', 'Store Manager']
    );
    console.log('Default store created');
  }

  const userExists = await db.query('SELECT COUNT(*) FROM users');
  if (parseInt(userExists.rows[0].count) === 0) {
    // Create default admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await db.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
      ['Admin User', 'admin@example.com', hashedPassword, 'admin']
    );
    console.log('Default admin user created');
  }

  // Create default categories if none exist
  const categoriesExist = await db.query('SELECT COUNT(*) FROM categories');
  console.log('Categories count:', categoriesExist.rows[0].count);

  if (parseInt(categoriesExist.rows[0].count) === 0) {
    console.log('No categories found, creating default categories...');

    // Insert default categories
    const defaultCategories = [
      { name: 'Groceries', description: 'Food and grocery items' },
      { name: 'Home & Lifestyle', description: 'Products for home and lifestyle' },
      { name: 'Electronics', description: 'Electronic devices and accessories' },
      { name: 'Industrial & Professional Supplies', description: 'Supplies for industrial and professional use' },
      { name: 'Sports', description: 'Sports equipment and accessories' },
      { name: 'Toys & Luggage', description: 'Toys and travel accessories' },
      { name: 'Crafts of India', description: 'Handcrafted items from India' },
      { name: 'Books, Music & Stationery', description: 'Books, music, and stationery items' },
      { name: 'Furniture', description: 'Furniture for home and office' },
      { name: 'Wellness', description: 'Health and wellness products' }
    ];

    // Insert categories and log each one
    for (const category of defaultCategories) {
      try {
        const result = await db.query(
          'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING id',
          [category.name, category.description]
        );
        console.log(`Created category: ${category.name} with ID ${result.rows[0].id}`);
      } catch (error) {
        console.error(`Error creating category ${category.name}:`, error.message);
      }
    }

    console.log(`Created ${defaultCategories.length} default categories`);
  } else {
    // Log existing categories
    const existingCategories = await db.query('SELECT id, name FROM categories ORDER BY id');
    console.log('Existing categories:');
    existingCategories.rows.forEach(cat => {
      console.log(`- ID: ${cat.id}, Name: ${cat.name}`);
    });
  }
}

// Initialize express app
const app = express();

// Middleware
// Define allowed origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5177',
  'http://localhost:5178',
  'http://localhost:5179',
  'http://localhost:5180',
  'http://localhost:5181',
  'http://localhost:5182',
  'http://localhost:5183',
  'http://localhost:5184',
  'http://localhost:5185',
  'file://'
];

// Configure CORS - Allow all origins for testing
app.use(cors({
  origin: '*', // Allow all origins for testing
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Log CORS configuration
console.log('CORS configured to allow all origins for testing');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply enhanced request throttling to prevent excessive API calls
app.use(requestThrottle({
  windowMs: 60 * 1000, // 1 minute window
  maxRequests: 120,    // Max 120 requests per minute (2 per second)
  message: 'Too many requests, please try again after a minute',
  // Skip throttling for static assets and health checks
  skip: (req) => req.url.startsWith('/static/') ||
                req.url.startsWith('/public/') ||
                req.url === '/api/health',
  // Path-specific rate limits
  pathSpecificLimits: {
    // Higher limits for read-only operations
    '/api/products': 240,      // 4 per second
    '/api/categories': 240,    // 4 per second
    '/api/stores': 180,        // 3 per second

    // Lower limits for write operations
    '/api/products/create': 30,  // 1 every 2 seconds
    '/api/products/update': 30,  // 1 every 2 seconds
    '/api/products/delete': 15,  // 1 every 4 seconds

    // Authentication endpoints
    '/api/auth/login': 20,     // 1 every 3 seconds
    '/api/auth/register': 10,  // 1 every 6 seconds

    // Wildcard patterns
    '/api/warehouse/*': 60,    // 1 per second
    '/api/admin/*': 60         // 1 per second
  },
  // Allow burst requests (2x normal limit) for short periods
  burstMultiplier: 2,
  burstDuration: 5000, // 5 seconds
  // Apply cooldown to reduce count during idle periods
  cooldownFactor: 0.5
}));

// Add database connection health check endpoint
app.get('/api/health', (req, res) => {
  const status = db.getConnectionStatus();
  const isHealthy = status.isConnected;

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    status: isHealthy ? 'healthy' : 'unhealthy',
    database: status
  });
});

// Log requests with minimal information to reduce console spam
app.use((req, res, next) => {
  // Only log the method, URL and a truncated version of the query params
  console.log(`REQUEST: ${req.method} ${req.url}`);

  // Add minimal response logging
  const originalSend = res.send;
  res.send = function(body) {
    console.log(`RESPONSE: ${res.statusCode} for ${req.method} ${req.url}`);
    return originalSend.call(this, body);
  };

  next();
});

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token, authorization denied'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user exists
    const { rows } = await db.query(
      'SELECT id, name, email, role, store_id FROM users WHERE id = $1',
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Add user to request object
    req.user = rows[0];
    next();
  } catch (err) {
    console.error('Authentication error:', err.message);
    return res.status(401).json({
      success: false,
      message: 'Token is not valid'
    });
  }
};

// Authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to access this resource'
      });
    }

    next();
  };
};

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role = 'store', storeId } = req.body;

  try {
    // Check if user already exists
    const userCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);

    if (userCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const result = await db.query(
      'INSERT INTO users (name, email, password, role, store_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, store_id',
      [name, email, hashedPassword, role, storeId || null]
    );

    const user = result.rows[0];

    // Create token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        storeId: user.store_id
      }
    });
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  console.log('Login attempt:', req.body);
  console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set (hidden for security)' : 'Not set');
  console.log('JWT_EXPIRES_IN:', process.env.JWT_EXPIRES_IN);
  const { email, password } = req.body;

  try {
    // Check if user exists
    console.log('Checking if user exists:', email);
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    console.log('User query result rows:', result.rows.length);

    if (result.rows.length === 0) {
      console.log('User not found');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = result.rows[0];
    console.log('User found:', { id: user.id, email: user.email, role: user.role });

    // Check password
    console.log('Comparing passwords...');
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);

    if (!isMatch) {
      console.log('Password does not match');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    console.log('Password matches');

    // Create token
    console.log('Creating token for user:', user.id);
    let token;
    try {
      token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
      console.log('Token created successfully');
    } catch (tokenError) {
      console.error('Error creating token:', tokenError);
      return res.status(500).json({
        success: false,
        message: 'Error creating authentication token'
      });
    }

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        storeId: user.store_id
      }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

app.get('/api/auth/me', authenticate, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, email, role, store_id FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = result.rows[0];

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        storeId: user.store_id
      }
    });
  } catch (err) {
    console.error('Get me error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// User routes
app.get('/api/users', authenticate, authorize('superadmin', 'admin'), async (req, res) => {
  try {
    const result = await db.query(
      'SELECT u.id, u.name, u.email, u.role, u.store_id, u.created_at, s.name as store_name ' +
      'FROM users u ' +
      'LEFT JOIN stores s ON u.store_id = s.id ' +
      'ORDER BY u.created_at DESC'
    );

    const users = result.rows.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      storeId: user.store_id,
      storeName: user.store_name,
      createdAt: user.created_at
    }));

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    console.error('Get users error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Category routes

// Reset categories route
app.post('/api/reset-categories', async (req, res) => {
  try {
    console.log('Resetting categories...');

    // Delete existing categories (this will fail if there are products using these categories)
    try {
      await db.query('DELETE FROM categories WHERE id NOT IN (SELECT DISTINCT category_id FROM products WHERE category_id IS NOT NULL)');
      console.log('Deleted categories not used by products');
    } catch (deleteError) {
      console.error('Error deleting categories:', deleteError.message);
    }

    // Insert default categories if they don't exist
    const defaultCategories = [
      { name: 'Groceries', description: 'Food and grocery items' },
      { name: 'Home & Lifestyle', description: 'Products for home and lifestyle' },
      { name: 'Electronics', description: 'Electronic devices and accessories' },
      { name: 'Industrial & Professional Supplies', description: 'Supplies for industrial and professional use' },
      { name: 'Sports', description: 'Sports equipment and accessories' },
      { name: 'Toys & Luggage', description: 'Toys and travel accessories' },
      { name: 'Crafts of India', description: 'Handcrafted items from India' },
      { name: 'Books, Music & Stationery', description: 'Books, music, and stationery items' },
      { name: 'Furniture', description: 'Furniture for home and office' },
      { name: 'Wellness', description: 'Health and wellness products' }
    ];

    // Insert categories that don't already exist
    let createdCount = 0;
    for (const category of defaultCategories) {
      try {
        // Check if category exists
        const existingCategory = await db.query(
          'SELECT id FROM categories WHERE name = $1',
          [category.name]
        );

        if (existingCategory.rows.length === 0) {
          // Category doesn't exist, create it
          const result = await db.query(
            'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING id',
            [category.name, category.description]
          );
          console.log(`Created category: ${category.name} with ID ${result.rows[0].id}`);
          createdCount++;
        } else {
          console.log(`Category ${category.name} already exists with ID ${existingCategory.rows[0].id}`);
        }
      } catch (error) {
        console.error(`Error processing category ${category.name}:`, error.message);
      }
    }

    // Get all categories to return
    const allCategories = await db.query(
      'SELECT id, name, description, parent_id as "parentId", created_at, updated_at FROM categories ORDER BY name'
    );

    res.status(200).json({
      success: true,
      message: `Categories reset. Created ${createdCount} new categories.`,
      data: allCategories.rows
    });
  } catch (err) {
    console.error('Error resetting categories:', err.message);
    res.status(500).json({
      success: false,
      message: 'Error resetting categories: ' + err.message
    });
  }
});

// Get all categories - support both /categories and /api/categories
app.get(['/categories', '/api/categories', '/api/api/categories'], async (req, res) => {
  console.log('GET categories request received');
  console.log('Request URL:', req.originalUrl);
  console.log('Headers:', req.headers);
  console.log('Query params:', req.query);

  try {
    console.log('Executing categories query...');
    const result = await db.query(
      'SELECT id, name, description, parent_id as "parentId", created_at, updated_at FROM categories ORDER BY name'
    );

    console.log(`Found ${result.rows.length} categories in database`);
    if (result.rows.length > 0) {
      console.log('First few categories:', result.rows.slice(0, 3));
    }

    // Format the response
    const response = {
      success: true,
      count: result.rows.length,
      data: result.rows
    };

    console.log(`Returning ${result.rows.length} categories`);
    res.status(200).json(response);
  } catch (err) {
    console.error('Get categories error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Create a new category - support both /categories and /api/categories
app.post(['/categories', '/api/categories'], async (req, res) => {
  const { name, description, parentId } = req.body;
  console.log('Creating new category:', { name, description, parentId });

  try {
    // Check if category with this name already exists
    const existingCategory = await db.query(
      'SELECT id FROM categories WHERE name = $1',
      [name]
    );

    if (existingCategory.rows.length > 0) {
      console.log('Category with this name already exists:', existingCategory.rows[0]);
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    // Insert the new category
    const result = await db.query(
      'INSERT INTO categories (name, description, parent_id) VALUES ($1, $2, $3) RETURNING id, name, description, created_at, updated_at',
      [name, description, parentId]
    );

    console.log('Category created successfully:', result.rows[0]);

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    console.error('Create category error:', err.message);
    console.error('Error stack:', err.stack);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + err.message,
      error: err.toString(),
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Get a single category by ID - support both /categories/:id and /api/categories/:id
app.get(['/categories/:id', '/api/categories/:id'], async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'SELECT id, name, description, created_at, updated_at FROM categories WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Get products in this category
    const productsResult = await db.query(
      'SELECT id, name, description, price, image, category_id, created_at, updated_at ' +
      'FROM products WHERE category_id = $1 ORDER BY name',
      [id]
    );

    const category = result.rows[0];
    category.products = productsResult.rows;

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (err) {
    console.error('Get category error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update a category - support both /categories/:id and /api/categories/:id
app.put(['/categories/:id', '/api/categories/:id'], async (req, res) => {
  const { id } = req.params;
  const { name, description, parentId } = req.body;
  console.log('Updating category:', { id, name, description, parentId });

  try {
    // Check if category exists
    const categoryCheck = await db.query(
      'SELECT id FROM categories WHERE id = $1',
      [id]
    );

    if (categoryCheck.rows.length === 0) {
      console.log('Category not found:', id);
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if name is already taken by another category
    if (name) {
      const nameCheck = await db.query(
        'SELECT id FROM categories WHERE name = $1 AND id != $2',
        [name, id]
      );

      if (nameCheck.rows.length > 0) {
        console.log('Category name already in use:', name);
        return res.status(400).json({
          success: false,
          message: 'Category name already in use'
        });
      }
    }

    // Update the category
    const result = await db.query(
      `UPDATE categories
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           parent_id = COALESCE($3, parent_id),
           updated_at = NOW()
       WHERE id = $4
       RETURNING id, name, description, parent_id, created_at, updated_at`,
      [name, description, parentId, id]
    );

    console.log('Category updated successfully:', result.rows[0]);

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    console.error('Update category error:', err.message);
    console.error('Error stack:', err.stack);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + err.message,
      error: err.toString(),
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Delete a category - support both /categories/:id and /api/categories/:id
app.delete(['/categories/:id', '/api/categories/:id'], async (req, res) => {
  const { id } = req.params;
  console.log('Deleting category:', id);

  try {
    // Check if category exists
    const categoryCheck = await db.query(
      'SELECT id FROM categories WHERE id = $1',
      [id]
    );

    if (categoryCheck.rows.length === 0) {
      console.log('Category not found:', id);
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category is used by any products
    const productsCheck = await db.query(
      'SELECT COUNT(*) FROM products WHERE category_id = $1',
      [id]
    );

    if (parseInt(productsCheck.rows[0].count) > 0) {
      console.log('Category is used by products:', id);
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category that is used by products'
      });
    }

    // Check if category has subcategories
    const subcategoriesCheck = await db.query(
      'SELECT COUNT(*) FROM categories WHERE parent_id = $1',
      [id]
    );

    if (parseInt(subcategoriesCheck.rows[0].count) > 0) {
      console.log('Category has subcategories:', id);
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category that has subcategories'
      });
    }

    // Delete the category
    await db.query('DELETE FROM categories WHERE id = $1', [id]);

    console.log('Category deleted successfully:', id);

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (err) {
    console.error('Delete category error:', err.message);
    console.error('Error stack:', err.stack);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + err.message,
      error: err.toString(),
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Product routes
// Get a single product by ID
app.get(['/api/products/:id', '/products/:id'], async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`GET /api/products/${id} received`);

    // Special case for 'add' - this is a frontend route, not an actual product ID
    if (id === 'add') {
      console.log('Special case: /api/products/add is a frontend route, not a product ID');
      return res.status(200).json({
        success: true,
        message: 'This is a frontend route for adding products, not an actual product',
        data: null
      });
    }

    // Get product details
    const productResult = await db.query(
      'SELECT p.id, p.name, p.description, p.price, p.image, p.sku, p.category_id, ' +
      'c.name as category_name, ' +
      'w.quantity as warehouse_quantity, ' +
      'p.created_at, p.updated_at ' +
      'FROM products p ' +
      'LEFT JOIN categories c ON p.category_id = c.id ' +
      'LEFT JOIN warehouse_inventory w ON p.id = w.product_id ' +
      'WHERE p.id = $1',
      [id]
    );

    if (productResult.rows.length === 0) {
      console.log(`Product with ID ${id} not found`);
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    console.log(`Product with ID ${id} found:`, productResult.rows[0]);
    const product = productResult.rows[0];

    // Get store inventory for the product
    const storeInventory = await db.query(
      'SELECT si.store_id, s.name as store_name, si.quantity ' +
      'FROM store_inventory si ' +
      'JOIN stores s ON si.store_id = s.id ' +
      'WHERE si.product_id = $1',
      [id]
    );

    console.log(`Found ${storeInventory.rows.length} store inventory records for product ${id}`);

    // Create a simplified stores object with just store_id: quantity
    const stores = {};
    storeInventory.rows.forEach(item => {
      stores[item.store_id] = parseInt(item.quantity);
      console.log(`Store ${item.store_id} quantity for product ${id}: ${item.quantity}`);
    });

    // Format the response with proper stock structure
    const formattedProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: parseFloat(product.price),
      image: product.image,
      sku: product.sku,
      category_id: product.category_id,
      category_name: product.category_name,
      stock: {
        warehouse: parseInt(product.warehouse_quantity) || 0,
        stores: stores
      },
      created_at: product.created_at,
      updated_at: product.updated_at
    };

    console.log(`Returning formatted product with stock:`, formattedProduct.stock);

    res.status(200).json({
      success: true,
      data: formattedProduct
    });
  } catch (err) {
    console.error('Get product error:', err.message);
    console.error('Error stack:', err.stack);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + err.message,
      error: err.toString(),
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Create a new product
app.post('/api/products', async (req, res) => {
  console.log('POST /api/products received:', req.body);

  try {
    const { name, description, price, category, category_id, category_id_str, category_name, image, stock } = req.body;

    console.log('Processing product with category data:', {
      category,
      category_id,
      category_id_str,
      category_name,
      category_id_type: typeof category_id,
      category_id_str_type: typeof category_id_str
    });

    // Determine the category ID
    let categoryId;

    // If category_id is provided and not 'new', use it directly
    if (category_id && category_id !== 'new') {
      categoryId = category_id;
      console.log('Using provided category_id:', categoryId, 'Type:', typeof categoryId);
    }
    // If category_id_str is provided, use it as a fallback
    else if (category_id_str && category_id_str !== 'new') {
      categoryId = category_id_str;
      console.log('Using provided category_id_str:', categoryId, 'Type:', typeof categoryId);
    }
    // If category is a string (not 'new'), look it up by name
    else if (category && category !== 'new') {
      const categoryResult = await db.query(
        'SELECT id FROM categories WHERE name = $1',
        [category]
      );

      if (categoryResult.rows.length > 0) {
        categoryId = categoryResult.rows[0].id;
        console.log('Found existing category by name:', categoryId);
      } else {
        // Create new category from the name
        const newCategoryResult = await db.query(
          'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING id',
          [category, `Category for ${category} products`]
        );
        categoryId = newCategoryResult.rows[0].id;
        console.log('Created new category from name:', categoryId);
      }
    }
    // If category_name is provided (from a newly created category in frontend)
    else if (category_name) {
      const categoryResult = await db.query(
        'SELECT id FROM categories WHERE name = $1',
        [category_name]
      );

      if (categoryResult.rows.length > 0) {
        categoryId = categoryResult.rows[0].id;
        console.log('Found existing category by category_name:', categoryId);
      } else {
        // Create new category from category_name
        const newCategoryResult = await db.query(
          'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING id',
          [category_name, `Category for ${name} products`]
        );
        categoryId = newCategoryResult.rows[0].id;
        console.log('Created new category from category_name:', categoryId);
      }
    } else {
      // Default category if nothing is provided
      const defaultCategoryResult = await db.query(
        'SELECT id FROM categories WHERE name = $1',
        ['Uncategorized']
      );

      if (defaultCategoryResult.rows.length > 0) {
        categoryId = defaultCategoryResult.rows[0].id;
        console.log('Using default Uncategorized category:', categoryId);
      } else {
        // Create Uncategorized category
        const newCategoryResult = await db.query(
          'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING id',
          ['Uncategorized', 'Default category for uncategorized products']
        );
        categoryId = newCategoryResult.rows[0].id;
        console.log('Created default Uncategorized category:', categoryId);
      }
    }

    // Get the category name for the selected category ID
    const categoryNameResult = await db.query(
      'SELECT name FROM categories WHERE id = $1',
      [categoryId]
    );
    const categoryNameValue = categoryNameResult.rows.length > 0 ? categoryNameResult.rows[0].name : null;
    console.log(`Category name for ID ${categoryId}: ${categoryNameValue}`);

    // Insert the product
    console.log('Inserting product with data:', {
      name,
      description,
      price,
      image,
      categoryId,
      categoryId_type: typeof categoryId,
      categoryName: categoryNameValue
    });

    const sku = `SKU-${Date.now()}`;
    console.log('Generated SKU:', sku);

    // Ensure categoryId is properly formatted
    const formattedCategoryId = categoryId ? categoryId : null;
    console.log('Formatted category ID for insertion:', formattedCategoryId, 'Type:', typeof formattedCategoryId);

    const productResult = await db.query(
      'INSERT INTO products (name, description, price, image, category_id, sku) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, description, price, image, formattedCategoryId, sku]
    );

    console.log('Product inserted successfully, result:', productResult.rows);
    const productId = productResult.rows[0].id;
    console.log('New product ID:', productId);
    console.log('Inserted product category_id:', productResult.rows[0].category_id, 'Type:', typeof productResult.rows[0].category_id);

    // Add warehouse inventory
    if (stock && stock.warehouse) {
      await db.query(
        'INSERT INTO warehouse_inventory (product_id, quantity) VALUES ($1, $2)',
        [productId, stock.warehouse]
      );
    }

    // Add store inventory
    if (stock && stock.stores) {
      for (const [storeId, quantity] of Object.entries(stock.stores)) {
        if (quantity > 0) {
          await db.query(
            'INSERT INTO store_inventory (product_id, store_id, quantity) VALUES ($1, $2, $3)',
            [productId, storeId, quantity]
          );
        }
      }
    }

    // Get the complete product data to return
    const completeProductResult = await db.query(
      'SELECT p.id, p.name, p.description, p.price, p.image, p.category_id, ' +
      'c.name as category_name, ' +
      'p.sku, p.created_at, p.updated_at ' +
      'FROM products p ' +
      'LEFT JOIN categories c ON p.category_id = c.id ' +
      'WHERE p.id = $1',
      [productId]
    );

    const productData = completeProductResult.rows[0];

    // Log the category information
    console.log('Product created with category information:', {
      category_id: productData.category_id,
      category_id_type: typeof productData.category_id,
      category_name: productData.category_name
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: {
        id: productId,
        name: productData.name,
        description: productData.description,
        price: productData.price,
        image: productData.image,
        category_id: productData.category_id,
        category_name: productData.category_name,
        sku: productData.sku,
        created_at: productData.created_at,
        updated_at: productData.updated_at,
        stock: {
          warehouse: stock?.warehouse || 0,
          stores: stock?.stores || {}
        }
      }
    });
  } catch (err) {
    console.error('Create product error:', err.message);
    console.error('Error stack:', err.stack);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + err.message,
      error: err.toString(),
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Get all products
app.get(['/api/products', '/products'], async (req, res) => {
  try {
    console.log('GET /api/products received');
    const result = await db.query(
      'SELECT p.id, p.name, p.description, p.price, p.image, p.category_id, ' +
      'c.name as category_name, ' +
      'p.sku, ' +
      'w.quantity as warehouse_quantity, ' +
      'p.created_at, p.updated_at ' +
      'FROM products p ' +
      'LEFT JOIN categories c ON p.category_id = c.id ' +
      'LEFT JOIN warehouse_inventory w ON p.id = w.product_id ' +
      'ORDER BY p.created_at DESC'
    );

    console.log(`Found ${result.rows.length} products in database`);

    // Get store inventory for each product
    const products = await Promise.all(result.rows.map(async (product) => {
      console.log(`Processing product ID ${product.id}: ${product.name}`);

      const storeInventory = await db.query(
        'SELECT si.store_id, s.name as store_name, si.quantity ' +
        'FROM store_inventory si ' +
        'JOIN stores s ON si.store_id = s.id ' +
        'WHERE si.product_id = $1',
        [product.id]
      );

      console.log(`Found ${storeInventory.rows.length} store inventory records for product ${product.id}`);

      // Create a simplified stores object with just store_id: quantity
      const stores = {};
      storeInventory.rows.forEach(item => {
        stores[item.store_id] = parseInt(item.quantity);
        console.log(`Store ${item.store_id} quantity for product ${product.id}: ${item.quantity}`);
      });

      // Create the product object with stock information
      const productWithStock = {
        id: product.id,
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        category_id: product.category_id,
        category_name: product.category_name,
        image: product.image,
        sku: product.sku,
        stock: {
          warehouse: parseInt(product.warehouse_quantity) || 0,
          stores: stores
        },
        created_at: product.created_at,
        updated_at: product.updated_at
      };

      console.log(`Product ${product.id} stock data:`, productWithStock.stock);
      return productWithStock;
    }));

    console.log(`Returning ${products.length} products with stock information`);
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (err) {
    console.error('Get products error:', err.message);
    console.error('Error stack:', err.stack);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + err.message,
      error: err.toString(),
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Update a product
app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`PUT /api/products/${id} received with data:`, req.body);
    const { name, description, price, category, category_id, image, sku, stock } = req.body;

    // Check if product exists
    const productCheck = await db.query(
      'SELECT id FROM products WHERE id = $1',
      [id]
    );

    if (productCheck.rows.length === 0) {
      console.log(`Product with ID ${id} not found`);
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    console.log(`Product with ID ${id} found, proceeding with update`);

    // Determine category ID
    let categoryId;

    // If category_id is provided and not 'new', use it directly
    if (category_id && category_id !== 'new') {
      categoryId = category_id;
      console.log(`Using provided category_id: ${categoryId}`);
    }
    // If category is a string (not 'new'), look it up by name
    else if (category && category !== 'new') {
      const categoryResult = await db.query(
        'SELECT id FROM categories WHERE name = $1',
        [category]
      );

      if (categoryResult.rows.length > 0) {
        categoryId = categoryResult.rows[0].id;
        console.log(`Found existing category by name: ${categoryId}`);
      } else {
        // Create new category from the name
        const newCategoryResult = await db.query(
          'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING id',
          [category, `Category for ${category} products`]
        );
        categoryId = newCategoryResult.rows[0].id;
        console.log(`Created new category from name: ${categoryId}`);
      }
    } else {
      // Use the existing category ID if nothing is provided
      const existingCategoryResult = await db.query(
        'SELECT category_id FROM products WHERE id = $1',
        [id]
      );
      categoryId = existingCategoryResult.rows[0].category_id;
      console.log(`Using existing category ID: ${categoryId}`);
    }

    // Update the product
    console.log(`Updating product with data:`, {
      name, description, price, image, sku, categoryId
    });

    // Get the category name for the selected category ID
    const categoryNameResult = await db.query(
      'SELECT name FROM categories WHERE id = $1',
      [categoryId]
    );
    const categoryName = categoryNameResult.rows.length > 0 ? categoryNameResult.rows[0].name : null;
    console.log(`Category name for ID ${categoryId}: ${categoryName}`);

    await db.query(
      'UPDATE products SET name = $1, description = $2, price = $3, image = $4, category_id = $5, sku = $6, updated_at = NOW() WHERE id = $7',
      [name, description, price, image, categoryId, sku, id]
    );

    console.log(`Product basic information updated successfully`);

    // Update warehouse inventory
    if (stock && stock.warehouse !== undefined) {
      console.log(`Updating warehouse inventory to ${stock.warehouse} units`);

      // Check if warehouse inventory exists
      const warehouseCheck = await db.query(
        'SELECT id FROM warehouse_inventory WHERE product_id = $1',
        [id]
      );

      if (warehouseCheck.rows.length > 0) {
        // Update existing inventory
        console.log(`Updating existing warehouse inventory record`);
        await db.query(
          'UPDATE warehouse_inventory SET quantity = $1, last_updated = NOW() WHERE product_id = $2',
          [stock.warehouse, id]
        );
      } else {
        // Create new inventory record
        console.log(`Creating new warehouse inventory record`);
        await db.query(
          'INSERT INTO warehouse_inventory (product_id, quantity) VALUES ($1, $2)',
          [id, stock.warehouse]
        );
      }
    }

    // Update store inventory
    if (stock && stock.stores) {
      console.log(`Updating store inventory:`, stock.stores);

      for (const [storeId, quantity] of Object.entries(stock.stores)) {
        console.log(`Processing store ${storeId} with quantity ${quantity}`);

        // Check if store inventory exists
        const storeCheck = await db.query(
          'SELECT id FROM store_inventory WHERE product_id = $1 AND store_id = $2',
          [id, storeId]
        );

        if (storeCheck.rows.length > 0) {
          // Update existing inventory
          console.log(`Updating existing store inventory record for store ${storeId}`);
          await db.query(
            'UPDATE store_inventory SET quantity = $1, last_updated = NOW() WHERE product_id = $2 AND store_id = $3',
            [quantity, id, storeId]
          );
        } else if (quantity > 0) {
          // Create new inventory record
          console.log(`Creating new store inventory record for store ${storeId}`);
          await db.query(
            'INSERT INTO store_inventory (product_id, store_id, quantity) VALUES ($1, $2, $3)',
            [id, storeId, quantity]
          );
        }
      }
    }

    console.log(`Product update completed successfully`);

    // Get the updated product to return
    const updatedProductResult = await db.query(
      'SELECT p.id, p.name, p.description, p.price, p.image, p.category_id, ' +
      'c.name as category_name, p.sku, ' +
      'w.quantity as warehouse_quantity, ' +
      'p.created_at, p.updated_at ' +
      'FROM products p ' +
      'LEFT JOIN categories c ON p.category_id = c.id ' +
      'LEFT JOIN warehouse_inventory w ON p.id = w.product_id ' +
      'WHERE p.id = $1',
      [id]
    );

    const updatedProduct = updatedProductResult.rows[0];

    // Get store inventory for the updated product
    const storeInventory = await db.query(
      'SELECT si.store_id, s.name as store_name, si.quantity ' +
      'FROM store_inventory si ' +
      'JOIN stores s ON si.store_id = s.id ' +
      'WHERE si.product_id = $1',
      [id]
    );

    const stores = {};
    storeInventory.rows.forEach(item => {
      stores[item.store_id] = parseInt(item.quantity);
    });

    // Format the response
    const formattedProduct = {
      id: updatedProduct.id,
      name: updatedProduct.name,
      description: updatedProduct.description,
      price: parseFloat(updatedProduct.price),
      category_id: updatedProduct.category_id,
      category_name: updatedProduct.category_name,
      image: updatedProduct.image,
      sku: updatedProduct.sku,
      stock: {
        warehouse: parseInt(updatedProduct.warehouse_quantity) || 0,
        stores: stores
      },
      created_at: updatedProduct.created_at,
      updated_at: updatedProduct.updated_at
    };

    console.log(`Returning updated product:`, formattedProduct);

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: formattedProduct
    });
  } catch (err) {
    console.error('Update product error:', err.message);
    console.error('Error stack:', err.stack);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + err.message,
      error: err.toString(),
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Delete a product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`DELETE /api/products/${id} received`);

    // Start a transaction
    const client = await db.pool.connect();

    try {
      await client.query('BEGIN');

      // Check if product exists
      const productCheck = await client.query(
        'SELECT id, name FROM products WHERE id = $1',
        [id]
      );

      if (productCheck.rows.length === 0) {
        console.log(`Product with ID ${id} not found`);
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      const productName = productCheck.rows[0].name;
      console.log(`Deleting product ${id}: ${productName}`);

      // Delete warehouse inventory first (foreign key constraint)
      console.log(`Deleting warehouse inventory for product ${id}`);
      await client.query('DELETE FROM warehouse_inventory WHERE product_id = $1', [id]);

      // Delete store inventory (foreign key constraint)
      console.log(`Deleting store inventory for product ${id}`);
      await client.query('DELETE FROM store_inventory WHERE product_id = $1', [id]);

      // Finally delete the product
      console.log(`Deleting product record for ${id}`);
      await client.query('DELETE FROM products WHERE id = $1', [id]);

      // Commit the transaction
      await client.query('COMMIT');
      console.log(`Product ${id} deleted successfully`);

      res.status(200).json({
        success: true,
        message: 'Product deleted successfully',
        data: {
          id: id,
          name: productName
        }
      });
    } catch (err) {
      // Rollback the transaction on error
      await client.query('ROLLBACK');
      console.error('Transaction rolled back due to error:', err);
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Delete product error:', err.message);
    console.error('Error stack:', err.stack);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + err.message,
      error: err.toString(),
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Frontend product endpoints
app.get('/api/frontend/products', async (req, res) => {
  try {
    console.log('GET /api/frontend/products received');
    const result = await db.query(
      'SELECT p.id, p.name, p.description, p.price, p.image, p.category_id, ' +
      'c.name as category_name, ' +
      'w.quantity as warehouse_quantity, ' +
      'p.created_at, p.updated_at ' +
      'FROM products p ' +
      'LEFT JOIN categories c ON p.category_id = c.id ' +
      'LEFT JOIN warehouse_inventory w ON p.id = w.product_id ' +
      'ORDER BY p.created_at DESC'
    );

    // Format products for frontend - simple and fast approach
    const frontendProducts = result.rows.map(product => {
      console.log(`Processing frontend product ${product.id}: ${product.name}`);
      console.log(`Category data: ID=${product.category_id}, Name=${product.category_name}`);

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        category: product.category_name,
        category_name: product.category_name,
        category_id: product.category_id,
        image: product.image,
        inStock: (product.warehouse_quantity > 0),
        stock: parseInt(product.warehouse_quantity) || 0,
        created_at: product.created_at,
        updated_at: product.updated_at
      };
    });

    res.status(200).json({
      success: true,
      count: frontendProducts.length,
      data: frontendProducts
    });
  } catch (err) {
    console.error('Get frontend products error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

app.get('/api/frontend/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'SELECT p.id, p.name, p.description, p.price, p.image, p.category_id, ' +
      'c.name as category_name, ' +
      'w.quantity as warehouse_quantity, ' +
      'p.created_at, p.updated_at ' +
      'FROM products p ' +
      'LEFT JOIN categories c ON p.category_id = c.id ' +
      'LEFT JOIN warehouse_inventory w ON p.id = w.product_id ' +
      'WHERE p.id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const product = result.rows[0];

    // Format product for frontend - simple and fast approach
    const frontendProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: parseFloat(product.price),
      category: product.category_name,
      category_name: product.category_name,
      category_id: product.category_id,
      image: product.image,
      inStock: (product.warehouse_quantity > 0),
      stock: parseInt(product.warehouse_quantity) || 0,
      created_at: product.created_at,
      updated_at: product.updated_at
    };

    console.log(`Returning frontend product ${product.id} with category data:`);
    console.log(`- category: ${frontendProduct.category}`);
    console.log(`- category_name: ${frontendProduct.category_name}`);
    console.log(`- category_id: ${frontendProduct.category_id}`);

    res.status(200).json({
      success: true,
      data: frontendProduct
    });
  } catch (err) {
    console.error('Get frontend product error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Warehouse routes
app.get(['/api/warehouse/inventory', '/warehouse/inventory'], async (req, res) => {
  try {
    console.log('GET /api/warehouse/inventory received');

    // Get all products first
    const productsResult = await db.query('SELECT id, name FROM products');
    const products = productsResult.rows;

    if (products.length === 0) {
      console.log('No products found, returning empty inventory');
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }

    // Get existing inventory
    const inventoryResult = await db.query(
      'SELECT id, product_id, quantity, location, last_updated FROM warehouse_inventory'
    );

    // Create a map of product_id to inventory
    const inventoryMap = {};
    inventoryResult.rows.forEach(item => {
      inventoryMap[item.product_id] = {
        id: item.id,
        quantity: parseInt(item.quantity) || 0,
        location: item.location,
        lastUpdated: item.last_updated
      };
    });

    // Create inventory items for all products
    const inventory = [];
    for (const product of products) {
      const inventoryItem = inventoryMap[product.id] || {
        quantity: 0,
        location: 'Main Warehouse',
        lastUpdated: new Date()
      };

      inventory.push({
        id: inventoryItem.id,
        productId: product.id,
        productName: product.name,
        quantity: inventoryItem.quantity,
        location: inventoryItem.location,
        lastUpdated: inventoryItem.lastUpdated
      });
    }

    console.log(`Returning ${inventory.length} warehouse inventory items`);
    return res.status(200).json({
      success: true,
      count: inventory.length,
      data: inventory
    });
  } catch (err) {
    console.error('Get warehouse inventory error:', err.message);
    res.status(500).json({
      success: true, // Return success even on error to prevent frontend issues
      count: 0,
      data: [],
      error: err.message
    });
  }
});

// Note: This endpoint has been removed as the inventory_transfers table is no longer used
app.get('/api/warehouse/transfers', async (req, res) => {
  console.log('GET /api/warehouse/transfers received');
  // Return empty transfers since the table has been removed
  return res.status(200).json({
    success: true,
    count: 0,
    data: [],
    message: 'Inventory transfers feature is not currently implemented'
  });
});

// User routes
app.get('/api/users', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, email, role, created_at, updated_at FROM users ORDER BY name'
    );

    const users = result.rows.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    }));

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    console.error('Get users error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = result.rows[0];

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }
    });
  } catch (err) {
    console.error('Get user error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Store routes
app.get(['/api/stores', '/stores'], async (req, res) => {
  try {
    console.log('GET /api/stores received');

    // Get all stores
    const result = await db.query(
      'SELECT id, name, address, phone, email, manager, created_at, updated_at FROM stores ORDER BY name'
    );

    const stores = result.rows.map(store => ({
      id: store.id,
      name: store.name,
      address: store.address,
      phone: store.phone,
      email: store.email,
      manager: store.manager,
      createdAt: store.created_at,
      updatedAt: store.updated_at
    }));

    // If no stores found, create a default store
    if (stores.length === 0) {
      console.log('No stores found, creating default store');

      try {
        const newStoreResult = await db.query(
          'INSERT INTO stores (name, address, phone, email, manager) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, address, phone, email, manager, created_at, updated_at',
          ['Main Store', '123 Main St, City', '555-1234', 'store@example.com', 'Store Manager']
        );

        const newStore = newStoreResult.rows[0];
        stores.push({
          id: newStore.id,
          name: newStore.name,
          address: newStore.address,
          phone: newStore.phone,
          email: newStore.email,
          manager: newStore.manager,
          createdAt: newStore.created_at,
          updatedAt: newStore.updated_at
        });

        console.log('Default store created successfully');
      } catch (insertError) {
        console.error('Error creating default store:', insertError.message);
      }
    }

    console.log(`Returning ${stores.length} stores`);
    return res.status(200).json({
      success: true,
      count: stores.length,
      data: stores
    });
  } catch (err) {
    console.error('Get stores error:', err.message);
    res.status(500).json({
      success: true, // Return success even on error to prevent frontend issues
      count: 0,
      data: [],
      error: err.message
    });
  }
});

app.get('/api/stores/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'SELECT id, name, address, phone, email, manager, created_at, updated_at FROM stores WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    const store = result.rows[0];

    res.status(200).json({
      success: true,
      data: {
        id: store.id,
        name: store.name,
        address: store.address,
        phone: store.phone,
        email: store.email,
        manager: store.manager,
        createdAt: store.created_at,
        updatedAt: store.updated_at
      }
    });
  } catch (err) {
    console.error('Get store error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Note: Order routes have been removed as the orders and order_items tables are not currently used
// Placeholder endpoints to maintain API compatibility

// Order routes
app.get('/api/orders', async (req, res) => {
  console.log('GET /api/orders received');
  // Return empty orders since the table has been removed
  return res.status(200).json({
    success: true,
    count: 0,
    data: [],
    message: 'Orders feature is not currently implemented'
  });
});

app.get('/api/orders/:id', async (req, res) => {
  console.log(`GET /api/orders/${req.params.id} received`);
  return res.status(404).json({
    success: false,
    message: 'Orders feature is not currently implemented'
  });
});

app.post('/api/orders', async (req, res) => {
  console.log('POST /api/orders received');
  return res.status(501).json({
    success: false,
    message: 'Orders feature is not currently implemented'
  });
});

app.put('/api/orders/:id', async (req, res) => {
  console.log(`PUT /api/orders/${req.params.id} received`);
  return res.status(501).json({
    success: false,
    message: 'Orders feature is not currently implemented'
  });
});

app.put('/api/orders/:id/status', async (req, res) => {
  console.log(`PUT /api/orders/${req.params.id}/status received`);
  return res.status(501).json({
    success: false,
    message: 'Orders feature is not currently implemented'
  });
});

// Sample data route
app.get('/api/sample-data', async (req, res) => {
  try {
    // Check if categories table is empty
    const categoriesCount = await db.query('SELECT COUNT(*) FROM categories');

    if (parseInt(categoriesCount.rows[0].count) === 0) {
      console.log('Adding sample categories...');

      // Add sample categories
      await db.query(
        'INSERT INTO categories (name, description) VALUES ($1, $2), ($3, $4), ($5, $6), ($7, $8), ($9, $10)',
        [
          'Electronics', 'Electronic devices and accessories',
          'Clothing', 'Apparel and fashion items',
          'Home & Kitchen', 'Home appliances and kitchen essentials',
          'Books', 'Books, magazines, and publications',
          'Toys & Games', 'Toys, games, and entertainment items'
        ]
      );

      console.log('Sample categories added successfully!');
    }

    // Check if products table is empty
    const productsCount = await db.query('SELECT COUNT(*) FROM products');

    if (parseInt(productsCount.rows[0].count) === 0) {
      console.log('Adding sample products...');

      // Get category IDs
      const categories = await db.query('SELECT id, name FROM categories');
      const categoryMap = {};

      categories.rows.forEach(category => {
        categoryMap[category.name] = category.id;
      });

      // Add sample products
      if (Object.keys(categoryMap).length > 0) {
        await db.query(
          'INSERT INTO products (name, description, price, image, category_id, sku) VALUES ' +
          '($1, $2, $3, $4, $5, $6), ' +
          '($7, $8, $9, $10, $11, $12), ' +
          '($13, $14, $15, $16, $17, $18), ' +
          '($19, $20, $21, $22, $23, $24), ' +
          '($25, $26, $27, $28, $29, $30)',
          [
            'Smartphone X', 'Latest smartphone with advanced features', 999.99, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', categoryMap['Electronics'], 'PHONE-001',
            'Laptop Pro', 'High-performance laptop for professionals', 1499.99, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', categoryMap['Electronics'], 'LAPTOP-001',
            'Wireless Headphones', 'Premium noise-cancelling headphones', 299.99, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', categoryMap['Electronics'], 'AUDIO-001',
            'Cotton T-Shirt', 'Comfortable cotton t-shirt for everyday wear', 24.99, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', categoryMap['Clothing'], 'SHIRT-001',
            'Coffee Maker', 'Automatic coffee maker for home use', 89.99, 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', categoryMap['Home & Kitchen'], 'COFFEE-001'
          ]
        );

        // Add warehouse inventory for products
        const products = await db.query('SELECT id FROM products');

        for (const product of products.rows) {
          await db.query(
            'INSERT INTO warehouse_inventory (product_id, quantity) VALUES ($1, $2)',
            [product.id, Math.floor(Math.random() * 100) + 10] // Random quantity between 10 and 109
          );
        }

        console.log('Sample products added successfully!');
      }
    }

    res.status(200).json({
      success: true,
      message: 'Sample data added successfully!'
    });
  } catch (err) {
    console.error('Error adding sample data:', err.message);
    res.status(500).json({
      success: false,
      message: 'Error adding sample data'
    });
  }
});

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to Twania Smart Bazaar API');
});

// Test endpoints
app.get('/api/test', (req, res) => {
  console.log('GET /api/test received');
  res.status(200).json({
    success: true,
    message: 'Test GET endpoint working',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/test', (req, res) => {
  console.log('POST /api/test received:', req.body);
  res.status(200).json({
    success: true,
    message: 'Test POST endpoint working',
    data: req.body,
    timestamp: new Date().toISOString()
  });
});

// Enhanced error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);

  // Check if headers have already been sent
  if (res.headersSent) {
    return next(err);
  }

  // Send appropriate error response
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

// Start server with enhanced error handling
const PORT = process.env.PORT || 5001;
let server;

try {
  server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Server URL: http://localhost:${PORT}`);
    console.log('Server is now waiting for requests...');

    // Perform initial database health check
    db.checkConnection().then(connected => {
      if (connected) {
        console.log('Initial database health check: PASSED');
        // Initialize tables after successful database connection
        initializeTables().then(() => {
          console.log('Database tables initialized successfully');
        }).catch(error => {
          console.error('Error initializing database tables:', error.message);
        });
      } else {
        console.error('Initial database health check: FAILED - Server will continue running but database operations may fail');
      }
    });
  });

  // Handle server errors
  server.on('error', (error) => {
    console.error('Server error:', error);
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Please use a different port.`);
      process.exit(1);
    }
  });
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}

// Graceful shutdown
const gracefulShutdown = () => {
  console.log('Received shutdown signal. Closing server gracefully...');

  // Set a timeout for the graceful shutdown
  const shutdownTimeout = setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000); // 30 seconds timeout

  // Close the server
  server.close(() => {
    console.log('HTTP server closed');

    // Close database connections
    try {
      const pool = db.pool();
      if (pool) {
        pool.end(() => {
          console.log('Database connections closed');
          clearTimeout(shutdownTimeout);
          process.exit(0);
        });
      } else {
        console.log('No active database pool to close');
        clearTimeout(shutdownTimeout);
        process.exit(0);
      }
    } catch (error) {
      console.error('Error closing database connections:', error);
      clearTimeout(shutdownTimeout);
      process.exit(1);
    }
  });
};

// Register shutdown handlers
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  gracefulShutdown();
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
  // Don't exit for unhandled rejections, just log them
});

// Add a keep-alive interval with database health check
const healthCheckInterval = setInterval(async () => {
  console.log(`Server still running on port ${PORT} - ${new Date().toISOString()}`);

  // Perform periodic database health check
  const connected = await db.checkConnection();
  if (!connected) {
    console.error('Database health check failed - attempting to reconnect...');
  }
}, 60000); // Check every minute

// Ensure the interval doesn't keep the process alive
if (healthCheckInterval.unref) {
  healthCheckInterval.unref();
}

module.exports = app;
