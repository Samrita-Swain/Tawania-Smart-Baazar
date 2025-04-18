import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to Simple API Server');
});

// Create a global products array that can be modified
let globalProducts = [
  {
    id: '1',
    name: 'Smartphone X',
    description: 'Latest smartphone with advanced features',
    price: 999.99,
    category_id: '1',
    category_name: 'Electronics',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    stock: {
      warehouse: 50,
      stores: {
        'Store 1': 20,
        'Store 2': 15
      }
    },
    sku: 'PHONE-001'
  },
  {
    id: '2',
    name: 'Laptop Pro',
    description: 'High-performance laptop for professionals',
    price: 1499.99,
    category_id: '1',
    category_name: 'Electronics',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    stock: {
      warehouse: 35,
      stores: {
        'Store 1': 10,
        'Store 3': 5
      }
    },
    sku: 'LAPTOP-001'
  },
  {
    id: '3',
    name: 'Wireless Headphones',
    description: 'Premium noise-cancelling headphones',
    price: 299.99,
    category_id: '1',
    category_name: 'Electronics',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    stock: {
      warehouse: 75,
      stores: {
        'Store 1': 25,
        'Store 2': 20,
        'Store 3': 15
      }
    },
    sku: 'AUDIO-001'
  },
  {
    id: '4',
    name: 'Cotton T-Shirt',
    description: 'Comfortable cotton t-shirt for everyday wear',
    price: 24.99,
    category_id: '2',
    category_name: 'Clothing',
    category: 'Clothing',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    stock: {
      warehouse: 120,
      stores: {
        'Store 1': 40,
        'Store 2': 50,
        'Store 3': 30
      }
    },
    sku: 'SHIRT-001'
  },
  {
    id: '5',
    name: 'Coffee Maker',
    description: 'Automatic coffee maker for home use',
    price: 89.99,
    category_id: '3',
    category_name: 'Home & Kitchen',
    category: 'Home & Kitchen',
    image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    stock: {
      warehouse: 45,
      stores: {}
    },
    sku: 'COFFEE-001'
  }
];

// Product endpoints
app.get('/api/products', (req, res) => {
  console.log('GET /api/products received');

  res.status(200).json({
    success: true,
    count: globalProducts.length,
    data: globalProducts
  });
});

app.get('/api/products/:id', (req, res) => {
  console.log(`GET /api/products/${req.params.id} received`);

  const product = globalProducts.find(p => p.id === req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  res.status(200).json({
    success: true,
    data: product
  });
});



// POST endpoint to add a new product
app.post('/api/products', (req, res) => {
  console.log('POST /api/products received:', req.body);

  // Create a new product with a unique ID
  const newProduct = {
    ...req.body,
    id: (globalProducts.length + 1).toString(),
    // Ensure the product has the correct structure
    stock: req.body.stock || {
      warehouse: 0,
      stores: {}
    },
    category_name: req.body.category || 'Uncategorized',
    category: req.body.category || 'Uncategorized'
  };

  // Add the new product to the global products array
  globalProducts.push(newProduct);

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: newProduct
  });
});

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
  console.log('POST /api/auth/login received:', req.body);

  const { email, password } = req.body;

  // Simple validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password'
    });
  }

  // Mock user data
  const userData = {
    id: '1',
    name: 'Admin User',
    email: email,
    role: 'admin'
  };

  // Mock token
  const token = 'mock-jwt-token-' + Date.now();

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: userData,
      token
    }
  });
});

app.get('/api/auth/me', (req, res) => {
  console.log('GET /api/auth/me received');

  // Check for token in headers
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token, authorization denied'
    });
  }

  // Mock user data
  const userData = {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin'
  };

  res.status(200).json({
    success: true,
    data: userData
  });
});

// Category endpoints
app.get('/api/categories', (req, res) => {
  console.log('GET /api/categories received');

  // Mock categories data
  const categories = [
    { id: '1', name: 'Electronics', description: 'Electronic devices and accessories' },
    { id: '2', name: 'Clothing', description: 'Apparel and fashion items' },
    { id: '3', name: 'Home & Kitchen', description: 'Home appliances and kitchen essentials' },
    { id: '4', name: 'Books', description: 'Books, magazines, and publications' },
    { id: '5', name: 'Toys & Games', description: 'Toys, games, and entertainment items' }
  ];

  res.status(200).json({
    success: true,
    data: categories
  });
});

// User endpoints
app.get('/api/users', (req, res) => {
  console.log('GET /api/users received');

  // Mock users data
  const users = [
    { id: '1', name: 'Admin User', email: 'admin@example.com', role: 'admin' },
    { id: '2', name: 'Store Manager', email: 'manager@example.com', role: 'store_manager' },
    { id: '3', name: 'Warehouse Staff', email: 'warehouse@example.com', role: 'warehouse_staff' }
  ];

  res.status(200).json({
    success: true,
    data: users
  });
});

// Warehouse endpoints
app.get('/api/warehouse/transfers', (req, res) => {
  console.log('GET /api/warehouse/transfers received');

  // Mock warehouse transfers data
  const transfers = [
    { id: '1', product_id: '1', product_name: 'Smartphone X', from_location: 'Warehouse', to_location: 'Main Store', quantity: 10, status: 'completed', date: '2023-04-01' },
    { id: '2', product_id: '2', product_name: 'Laptop Pro', from_location: 'Warehouse', to_location: 'North Branch', quantity: 5, status: 'pending', date: '2023-04-02' },
    { id: '3', product_id: '3', product_name: 'Wireless Headphones', from_location: 'Main Store', to_location: 'East Branch', quantity: 15, status: 'processing', date: '2023-04-03' }
  ];

  res.status(200).json({
    success: true,
    data: transfers
  });
});

app.get('/api/warehouse/inventory', (req, res) => {
  console.log('GET /api/warehouse/inventory received');

  // Mock warehouse inventory data
  const inventory = [
    { id: '1', product_id: '1', product_name: 'Smartphone X', quantity: 50, location: 'A1' },
    { id: '2', product_id: '2', product_name: 'Laptop Pro', quantity: 35, location: 'A2' },
    { id: '3', product_id: '3', product_name: 'Wireless Headphones', quantity: 75, location: 'B1' },
    { id: '4', product_id: '4', product_name: 'Cotton T-Shirt', quantity: 120, location: 'C1' },
    { id: '5', product_id: '5', product_name: 'Coffee Maker', quantity: 45, location: 'D1' }
  ];

  res.status(200).json({
    success: true,
    data: inventory
  });
});

// Store endpoints
app.get('/api/stores', (req, res) => {
  console.log('GET /api/stores received');

  // Mock stores data
  const stores = [
    { id: '1', name: 'Main Store', location: 'Downtown', manager_id: '2' },
    { id: '2', name: 'North Branch', location: 'North City', manager_id: '3' },
    { id: '3', name: 'East Branch', location: 'East City', manager_id: '4' }
  ];

  res.status(200).json({
    success: true,
    data: stores
  });
});

// Order endpoints
app.get('/api/orders', (req, res) => {
  console.log('GET /api/orders received');

  // Mock orders data
  const orders = [
    { id: '1', customer_name: 'John Doe', total: 1299.99, status: 'completed', date: '2023-04-01' },
    { id: '2', customer_name: 'Jane Smith', total: 499.98, status: 'processing', date: '2023-04-02' },
    { id: '3', customer_name: 'Bob Johnson', total: 89.99, status: 'pending', date: '2023-04-03' }
  ];

  res.status(200).json({
    success: true,
    data: orders
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
