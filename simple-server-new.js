import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5001;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: err.message
  });
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

// Update a product
app.put('/api/products/:id', (req, res) => {
  console.log(`PUT /api/products/${req.params.id} received:`, req.body);

  const productId = req.params.id;
  const productIndex = globalProducts.findIndex(p => p.id === productId);

  if (productIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  // Update the product
  const updatedProduct = {
    ...globalProducts[productIndex],
    ...req.body,
    id: productId, // Ensure ID doesn't change
    // Ensure the product has the correct structure
    stock: req.body.stock || globalProducts[productIndex].stock || {
      warehouse: 0,
      stores: {}
    },
    category_name: req.body.category || req.body.category_name || globalProducts[productIndex].category_name || 'Uncategorized',
    category: req.body.category || req.body.category_name || globalProducts[productIndex].category || 'Uncategorized'
  };

  // Replace the product in the array
  globalProducts[productIndex] = updatedProduct;

  res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    data: updatedProduct
  });
});

// Delete a product
app.delete('/api/products/:id', (req, res) => {
  console.log(`DELETE /api/products/${req.params.id} received`);

  const productId = req.params.id;
  const productIndex = globalProducts.findIndex(p => p.id === productId);

  if (productIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  // Remove the product from the array
  const deletedProduct = globalProducts[productIndex];
  globalProducts.splice(productIndex, 1);

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully',
    data: deletedProduct
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
// Create a global categories array that can be modified
let globalCategories = [
  { id: '1', name: 'Electronics', description: 'Electronic devices and accessories', parentId: null },
  { id: '2', name: 'Clothing', description: 'Apparel and fashion items', parentId: null },
  { id: '3', name: 'Home & Kitchen', description: 'Home appliances and kitchen essentials', parentId: null },
  { id: '4', name: 'Books', description: 'Books, magazines, and publications', parentId: null },
  { id: '5', name: 'Toys & Games', description: 'Toys, games, and entertainment items', parentId: null }
];

app.get('/api/categories', (req, res) => {
  try {
    console.log('GET /api/categories received');

    res.status(200).json({
      success: true,
      data: globalCategories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
});

app.get('/api/categories/:id', (req, res) => {
  console.log(`GET /api/categories/${req.params.id} received`);

  const category = globalCategories.find(c => c.id === req.params.id);

  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  res.status(200).json({
    success: true,
    data: category
  });
});

app.post('/api/categories', (req, res) => {
  try {
    console.log('POST /api/categories received:', req.body);

    // Validate required fields
    if (!req.body.name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    // Create a new category with a unique ID
    const newCategory = {
      ...req.body,
      id: (globalCategories.length + 1).toString(),
      // Convert empty string to null for parentId
      parentId: req.body.parentId === '' ? null : req.body.parentId
    };

    // Add the new category to the global categories array
    globalCategories.push(newCategory);

    console.log('Category created successfully:', newCategory);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: newCategory
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: error.message
    });
  }
});

app.put('/api/categories/:id', (req, res) => {
  console.log(`PUT /api/categories/${req.params.id} received:`, req.body);

  const categoryId = req.params.id;
  const categoryIndex = globalCategories.findIndex(c => c.id === categoryId);

  if (categoryIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  // Update the category
  const updatedCategory = {
    ...globalCategories[categoryIndex],
    ...req.body,
    id: categoryId, // Ensure ID doesn't change
    // Convert empty string to null for parentId
    parentId: req.body.parentId === '' ? null : req.body.parentId
  };

  // Replace the category in the array
  globalCategories[categoryIndex] = updatedCategory;

  res.status(200).json({
    success: true,
    message: 'Category updated successfully',
    data: updatedCategory
  });
});

app.delete('/api/categories/:id', (req, res) => {
  console.log(`DELETE /api/categories/${req.params.id} received`);

  const categoryId = req.params.id;
  const categoryIndex = globalCategories.findIndex(c => c.id === categoryId);

  if (categoryIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  // Check if this category has children
  const hasChildren = globalCategories.some(c => c.parentId === categoryId);

  if (hasChildren) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete category with children. Please delete or reassign children first.'
    });
  }

  // Check if this category is used by any products
  const isUsedByProducts = globalProducts.some(p => p.category_id === categoryId);

  if (isUsedByProducts) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete category that is used by products. Please reassign products first.'
    });
  }

  // Remove the category from the array
  const deletedCategory = globalCategories[categoryIndex];
  globalCategories.splice(categoryIndex, 1);

  res.status(200).json({
    success: true,
    message: 'Category deleted successfully',
    data: deletedCategory
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

// Frontend endpoints
app.get('/api/frontend/products', (req, res) => {
  console.log('GET /api/frontend/products received');

  // Return the same products as the admin panel but in a different format
  const frontendProducts = globalProducts.map(product => ({
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    category: product.category || product.category_name,
    image: product.image,
    inStock: product.stock && product.stock.warehouse > 0,
    stock: product.stock ? product.stock.warehouse || 0 : 0  // Add stock property with numeric value
  }));

  res.status(200).json({
    success: true,
    count: frontendProducts.length,
    data: frontendProducts
  });
});

app.get('/api/frontend/products/:id', (req, res) => {
  console.log(`GET /api/frontend/products/${req.params.id} received`);

  const product = globalProducts.find(p => p.id === req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  // Format the product for the frontend
  const frontendProduct = {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    category: product.category || product.category_name,
    image: product.image,
    inStock: product.stock && product.stock.warehouse > 0,
    stock: product.stock ? product.stock.warehouse || 0 : 0  // Add stock property with numeric value
  };

  res.status(200).json({
    success: true,
    data: frontendProduct
  });
});

// Order endpoints
// Orders endpoint moved below

// Order endpoints
let globalOrders = [
  {
    id: '1',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    customerPhone: '123-456-7890',
    shippingAddress: '123 Main St, City, Country',
    storeId: 'store-1',
    status: 'completed',
    paymentStatus: 'paid',
    total: 1299.98,
    date: '2023-04-01',
    items: [
      { productId: '1', quantity: 1, price: 999.99 },
      { productId: '3', quantity: 1, price: 299.99 }
    ],
    notes: 'Customer requested gift wrapping'
  },
  {
    id: '2',
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
    customerPhone: '987-654-3210',
    shippingAddress: '456 Oak St, Town, Country',
    storeId: 'store-2',
    status: 'processing',
    paymentStatus: 'pending',
    total: 1499.99,
    date: '2023-04-02',
    items: [
      { productId: '2', quantity: 1, price: 1499.99 }
    ],
    notes: ''
  }
];

app.get('/api/orders', (req, res) => {
  try {
    console.log('GET /api/orders received');
    console.log('Current number of orders in memory:', globalOrders.length);

    // Log the first few orders for debugging
    if (globalOrders.length > 0) {
      console.log('First order:', JSON.stringify(globalOrders[0]));
    }

    if (globalOrders.length > 1) {
      console.log('Second order:', JSON.stringify(globalOrders[1]));
    }

    res.status(200).json({
      success: true,
      data: globalOrders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
});

app.get('/api/orders/:id', (req, res) => {
  try {
    console.log(`GET /api/orders/${req.params.id} received`);

    const orderId = req.params.id;
    const order = globalOrders.find(o => o.id === orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message
    });
  }
});

app.post('/api/orders', (req, res) => {
  try {
    console.log('POST /api/orders received with body:', JSON.stringify(req.body));

    // Validate required fields
    if (!req.body.customerName || !req.body.storeId || !req.body.items || !req.body.items.length) {
      console.warn('Missing required fields in order request');
      console.log('customerName:', req.body.customerName);
      console.log('storeId:', req.body.storeId);
      console.log('items:', req.body.items);

      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Create a new order
    const newOrder = {
      ...req.body,
      id: (globalOrders.length + 1).toString(),
      date: new Date().toISOString().split('T')[0]
    };

    // Add to global orders
    globalOrders.push(newOrder);

    console.log('Order created successfully with ID:', newOrder.id);
    console.log('Current number of orders:', globalOrders.length);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: newOrder
    });
  } catch (error) {
    console.error('Error creating order:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
});

app.put('/api/orders/:id', (req, res) => {
  try {
    console.log(`PUT /api/orders/${req.params.id} received:`, req.body);

    const orderId = req.params.id;
    const orderIndex = globalOrders.findIndex(o => o.id === orderId);

    if (orderIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update the order
    const updatedOrder = {
      ...globalOrders[orderIndex],
      ...req.body,
      id: orderId // Ensure ID doesn't change
    };

    // Replace the order in the array
    globalOrders[orderIndex] = updatedOrder;

    console.log('Order updated successfully:', updatedOrder);

    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order',
      error: error.message
    });
  }
});

app.put('/api/orders/:id/status', (req, res) => {
  try {
    console.log(`PUT /api/orders/${req.params.id}/status received:`, req.body);

    const orderId = req.params.id;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const orderIndex = globalOrders.findIndex(o => o.id === orderId);

    if (orderIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update the order status
    globalOrders[orderIndex].status = status;

    console.log('Order status updated successfully:', globalOrders[orderIndex]);

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: globalOrders[orderIndex]
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
});

app.delete('/api/orders/:id', (req, res) => {
  try {
    console.log(`DELETE /api/orders/${req.params.id} received`);

    const orderId = req.params.id;
    const orderIndex = globalOrders.findIndex(o => o.id === orderId);

    if (orderIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Remove the order from the array
    const deletedOrder = globalOrders[orderIndex];
    globalOrders.splice(orderIndex, 1);

    console.log('Order deleted successfully:', deletedOrder);

    res.status(200).json({
      success: true,
      message: 'Order deleted successfully',
      data: deletedOrder
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete order',
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
