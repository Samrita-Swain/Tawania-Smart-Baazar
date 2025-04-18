import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

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

// Global data storage
let globalProducts = [
  {
    id: '1',
    name: 'Premium Laptop',
    description: 'High-performance laptop with the latest processor',
    price: 999.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80',
    stock: {
      warehouse: 15,
      stores: {
        'store-1': 5,
        'store-2': 3
      }
    }
  },
  {
    id: '2',
    name: 'Smartphone X',
    description: 'Latest smartphone with advanced camera features',
    price: 1499.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1160&q=80',
    stock: {
      warehouse: 20,
      stores: {
        'store-1': 8,
        'store-2': 5
      }
    }
  },
  {
    id: '3',
    name: 'Wireless Headphones',
    description: 'Noise-cancelling wireless headphones with long battery life',
    price: 299.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
    stock: {
      warehouse: 30,
      stores: {
        'store-1': 10,
        'store-2': 8
      }
    }
  }
];

let globalCategories = [
  { id: '1', name: 'Electronics', description: 'Electronic devices and accessories', parentId: null },
  { id: '2', name: 'Clothing', description: 'Apparel and fashion items', parentId: null },
  { id: '3', name: 'Home & Kitchen', description: 'Home appliances and kitchen essentials', parentId: null },
  { id: '4', name: 'Books', description: 'Books, magazines, and publications', parentId: null },
  { id: '5', name: 'Toys & Games', description: 'Toys, games, and entertainment items', parentId: null }
];

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

// Root endpoint
app.get('/', (req, res) => {
  res.send('Twania Smart Bazaar API Server');
});

// Product endpoints
app.get('/api/products', (req, res) => {
  console.log('GET /api/products received');
  res.status(200).json({
    success: true,
    data: globalProducts
  });
});

app.get('/api/products/:id', (req, res) => {
  console.log(`GET /api/products/${req.params.id} received`);

  const productId = req.params.id;
  const product = globalProducts.find(p => p.id === productId);

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
    id: (globalProducts.length + 1).toString()
  };

  // Add to global products
  globalProducts.push(newProduct);

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: newProduct
  });
});

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
    id: productId // Ensure ID doesn't change
  };

  // Replace the product in the array
  globalProducts[productIndex] = updatedProduct;

  res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    data: updatedProduct
  });
});

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
  globalProducts.splice(productIndex, 1);

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully'
  });
});

// Category endpoints
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
  try {
    console.log(`GET /api/categories/${req.params.id} received`);

    const categoryId = req.params.id;
    const category = globalCategories.find(c => c.id === categoryId);

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
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category',
      error: error.message
    });
  }
});

app.post('/api/categories', (req, res) => {
  try {
    console.log('POST /api/categories received with body:', JSON.stringify(req.body));

    // Validate required fields
    if (!req.body.name) {
      console.warn('Missing required fields in category request');
      console.log('name:', req.body.name);

      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    // Create a new category
    const newCategory = {
      ...req.body,
      id: (globalCategories.length + 1).toString(),
      // Convert empty string to null for parentId
      parentId: req.body.parentId === '' ? null : req.body.parentId
    };

    // Add to global categories
    globalCategories.push(newCategory);

    console.log('Category created successfully with ID:', newCategory.id);
    console.log('Current number of categories:', globalCategories.length);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: newCategory
    });
  } catch (error) {
    console.error('Error creating category:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: error.message
    });
  }
});

// Order endpoints
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

// Warehouse inventory endpoints
app.get('/api/warehouse/inventory', (req, res) => {
  try {
    console.log('GET /api/warehouse/inventory received');

    // Create a warehouse inventory from the product data
    const inventory = globalProducts.map(product => ({
      id: product.id,
      name: product.name,
      totalStock: product.stock.warehouse,
      category: product.category,
      price: product.price
    }));

    res.status(200).json({
      success: true,
      data: inventory
    });
  } catch (error) {
    console.error('Error fetching warehouse inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch warehouse inventory',
      error: error.message
    });
  }
});

// Store endpoints
app.get('/api/stores', (req, res) => {
  try {
    console.log('GET /api/stores received');

    // Create mock store data
    const stores = [
      { id: 'store-1', name: 'Main Store', address: '123 Main St', city: 'New York', phone: '123-456-7890' },
      { id: 'store-2', name: 'Downtown Store', address: '456 Market St', city: 'San Francisco', phone: '987-654-3210' }
    ];

    res.status(200).json({
      success: true,
      data: stores
    });
  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stores',
      error: error.message
    });
  }
});

// Authentication endpoints
app.post('/api/auth/login', (req, res) => {
  console.log('POST /api/auth/login received:', req.body);

  const { email, password } = req.body;

  // Simple authentication logic
  if (email === 'admin@twania.com' && password === 'admin123') {
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: '1',
          name: 'Admin User',
          email: 'admin@twania.com',
          role: 'admin'
        },
        token: 'mock-jwt-token-for-admin'
      }
    });
  } else if (email === 'store@twania.com' && password === 'store123') {
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: '2',
          name: 'Store Manager',
          email: 'store@twania.com',
          role: 'store'
        },
        token: 'mock-jwt-token-for-store'
      }
    });
  } else if (email === 'warehouse@twania.com' && password === 'warehouse123') {
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: '3',
          name: 'Warehouse Manager',
          email: 'warehouse@twania.com',
          role: 'warehouse'
        },
        token: 'mock-jwt-token-for-warehouse'
      }
    });
  } else if (email === 'newadmin@twania.com' && password === 'admin123') {
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: '4',
          name: 'New Admin',
          email: 'newadmin@twania.com',
          role: 'superadmin'
        },
        token: 'mock-jwt-token-for-superadmin'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

app.get('/api/auth/me', (req, res) => {
  console.log('GET /api/auth/me received');

  // This would normally validate the token and return the user
  // For simplicity, we'll just return a mock user
  res.status(200).json({
    success: true,
    data: {
      user: {
        id: '4',
        name: 'New Admin',
        email: 'newadmin@twania.com',
        role: 'superadmin'
      }
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
