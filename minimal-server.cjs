const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Handle OPTIONS requests for CORS preflight
app.options('*', cors());

// Categories route
app.get('/api/categories', (req, res) => {
  const categories = [
    { id: 1, name: 'Groceries', description: 'Food and grocery items', parentId: null },
    { id: 2, name: 'Home & Lifestyle', description: 'Products for home and lifestyle', parentId: null },
    { id: 3, name: 'Electronics', description: 'Electronic devices and accessories', parentId: null },
    { id: 4, name: 'Industrial & Professional Supplies', description: 'Supplies for industrial and professional use', parentId: null },
    { id: 5, name: 'Sports', description: 'Sports equipment and accessories', parentId: null },
    { id: 6, name: 'Toys & Luggage', description: 'Toys and travel accessories', parentId: null },
    { id: 7, name: 'Crafts of India', description: 'Handcrafted items from India', parentId: null },
    { id: 8, name: 'Books, Music & Stationery', description: 'Books, music, and stationery items', parentId: null },
    { id: 9, name: 'Furniture', description: 'Furniture for home and office', parentId: null },
    { id: 10, name: 'Wellness', description: 'Health and wellness products', parentId: null }
  ];

  res.json({
    success: true,
    data: categories
  });
});

// Products route
app.get('/api/products', (req, res) => {
  const products = [
    { id: 1, name: 'Organic Apples', description: 'Fresh organic apples from local farms', price: 10.99, category_id: 1, image: 'https://via.placeholder.com/300x200?text=Organic+Apples', stock: 100, sku: 'GROC-001' },
    { id: 2, name: 'Whole Wheat Bread', description: 'Freshly baked whole wheat bread', price: 5.99, category_id: 1, image: 'https://via.placeholder.com/300x200?text=Whole+Wheat+Bread', stock: 50, sku: 'GROC-002' },
    { id: 3, name: 'Ceramic Dinner Set', description: 'Elegant ceramic dinner set for 4 people', price: 89.99, category_id: 2, image: 'https://via.placeholder.com/300x200?text=Ceramic+Dinner+Set', stock: 20, sku: 'HOME-001' },
    { id: 4, name: 'Cotton Bedsheets', description: 'Soft cotton bedsheets with 300 thread count', price: 45.99, category_id: 2, image: 'https://via.placeholder.com/300x200?text=Cotton+Bedsheets', stock: 30, sku: 'HOME-002' },
    { id: 5, name: 'Smartphone X', description: 'Latest smartphone with advanced features', price: 599.99, category_id: 3, image: 'https://via.placeholder.com/300x200?text=Smartphone+X', stock: 15, sku: 'ELEC-001' },
    { id: 6, name: 'Wireless Earbuds', description: 'High-quality wireless earbuds with noise cancellation', price: 129.99, category_id: 3, image: 'https://via.placeholder.com/300x200?text=Wireless+Earbuds', stock: 25, sku: 'ELEC-002' },
    { id: 7, name: 'Industrial Safety Gloves', description: 'Heavy-duty safety gloves for industrial use', price: 35.99, category_id: 4, image: 'https://via.placeholder.com/300x200?text=Safety+Gloves', stock: 100, sku: 'IND-001' },
    { id: 8, name: 'Professional Tool Kit', description: 'Comprehensive tool kit for professionals', price: 199.99, category_id: 4, image: 'https://via.placeholder.com/300x200?text=Tool+Kit', stock: 10, sku: 'IND-002' },
    { id: 9, name: 'Yoga Mat', description: 'Premium yoga mat for comfortable practice', price: 29.99, category_id: 5, image: 'https://via.placeholder.com/300x200?text=Yoga+Mat', stock: 50, sku: 'SPORT-001' },
    { id: 10, name: 'Tennis Racket', description: 'Professional tennis racket for all skill levels', price: 89.99, category_id: 5, image: 'https://via.placeholder.com/300x200?text=Tennis+Racket', stock: 20, sku: 'SPORT-002' },
    { id: 11, name: 'Kids Toy Car', description: 'Remote controlled toy car for children', price: 49.99, category_id: 6, image: 'https://via.placeholder.com/300x200?text=Toy+Car', stock: 30, sku: 'TOY-001' },
    { id: 12, name: 'Travel Luggage', description: 'Durable travel luggage with wheels', price: 129.99, category_id: 6, image: 'https://via.placeholder.com/300x200?text=Travel+Luggage', stock: 15, sku: 'TOY-002' },
    { id: 13, name: 'Handcrafted Pottery', description: 'Beautiful handcrafted pottery from Indian artisans', price: 79.99, category_id: 7, image: 'https://via.placeholder.com/300x200?text=Handcrafted+Pottery', stock: 10, sku: 'CRAFT-001' },
    { id: 14, name: 'Embroidered Cushion Covers', description: 'Intricately embroidered cushion covers', price: 39.99, category_id: 7, image: 'https://via.placeholder.com/300x200?text=Embroidered+Cushion', stock: 25, sku: 'CRAFT-002' },
    { id: 15, name: 'Bestseller Novel', description: 'Latest bestselling novel by renowned author', price: 19.99, category_id: 8, image: 'https://via.placeholder.com/300x200?text=Bestseller+Novel', stock: 50, sku: 'BOOK-001' },
    { id: 16, name: 'Premium Notebook Set', description: 'Set of premium notebooks for work or study', price: 24.99, category_id: 8, image: 'https://via.placeholder.com/300x200?text=Notebook+Set', stock: 40, sku: 'BOOK-002' },
    { id: 17, name: 'Ergonomic Office Chair', description: 'Comfortable ergonomic office chair', price: 249.99, category_id: 9, image: 'https://via.placeholder.com/300x200?text=Office+Chair', stock: 10, sku: 'FURN-001' },
    { id: 18, name: 'Wooden Coffee Table', description: 'Elegant wooden coffee table for living room', price: 179.99, category_id: 9, image: 'https://via.placeholder.com/300x200?text=Coffee+Table', stock: 5, sku: 'FURN-002' },
    { id: 19, name: 'Herbal Tea Collection', description: 'Collection of premium herbal teas', price: 29.99, category_id: 10, image: 'https://via.placeholder.com/300x200?text=Herbal+Tea', stock: 30, sku: 'WELL-001' },
    { id: 20, name: 'Essential Oil Diffuser', description: 'Aromatherapy essential oil diffuser', price: 59.99, category_id: 10, image: 'https://via.placeholder.com/300x200?text=Oil+Diffuser', stock: 20, sku: 'WELL-002' }
  ];

  res.json({
    success: true,
    data: products
  });
});

// Single product route
app.get('/api/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const product = {
    id: productId,
    name: `Product ${productId}`,
    description: `This is a detailed description for product ${productId}. It includes all the features and benefits of the product.`,
    price: productId * 10.99,
    category_id: Math.ceil(productId / 2),
    image: `https://via.placeholder.com/600x400?text=Product+${productId}`,
    stock: 100,
    sku: `SKU-${productId}`,
    created_at: new Date().toISOString()
  };

  res.json({
    success: true,
    data: product
  });
});

// Stores route
app.get('/api/stores', (req, res) => {
  const stores = [
    { id: 1, name: 'Main Store', address: '123 Main St', phone: '555-1234', email: 'main@example.com' },
    { id: 2, name: 'Downtown Store', address: '456 Downtown Ave', phone: '555-5678', email: 'downtown@example.com' },
    { id: 3, name: 'Uptown Store', address: '789 Uptown Blvd', phone: '555-9012', email: 'uptown@example.com' }
  ];

  res.json({
    success: true,
    data: stores
  });
});

// Warehouse inventory route
app.get('/api/warehouse/inventory', (req, res) => {
  const inventory = [
    { id: 1, product_id: 1, quantity: 100, location: 'A1' },
    { id: 2, product_id: 2, quantity: 200, location: 'A2' },
    { id: 3, product_id: 3, quantity: 300, location: 'B1' },
    { id: 4, product_id: 4, quantity: 400, location: 'B2' },
    { id: 5, product_id: 5, quantity: 500, location: 'C1' }
  ];

  res.json({
    success: true,
    data: inventory
  });
});

// Users route
app.get('/api/users', (req, res) => {
  const users = [
    { id: 1, name: 'Admin User', email: 'admin@example.com', role: 'admin' },
    { id: 2, name: 'Store Manager', email: 'manager@example.com', role: 'store', store_id: 1 },
    { id: 3, name: 'Warehouse Manager', email: 'warehouse@example.com', role: 'warehouse' }
  ];

  res.json({
    success: true,
    data: users
  });
});

// Orders route
app.get('/api/orders', (req, res) => {
  const orders = [
    { id: 1, customer_name: 'John Doe', total: 100.99, status: 'completed', created_at: '2023-01-01' },
    { id: 2, customer_name: 'Jane Smith', total: 200.99, status: 'processing', created_at: '2023-01-02' },
    { id: 3, customer_name: 'Bob Johnson', total: 300.99, status: 'pending', created_at: '2023-01-03' }
  ];

  res.json({
    success: true,
    data: orders
  });
});

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  // Simple demo login - accept any credentials
  res.json({
    success: true,
    token: 'demo-token',
    user: {
      id: 1,
      name: 'Admin User',
      email: email || 'admin@example.com',
      role: 'admin'
    }
  });
});

app.get('/api/auth/me', (req, res) => {
  // Get the authorization header
  const authHeader = req.headers.authorization;

  // If no authorization header, return 401
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'No authorization header provided'
    });
  }

  // For demo purposes, accept any token
  res.json({
    success: true,
    data: {
      user: {
        id: 1,
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin'
      }
    }
  });
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Server URL: http://localhost:${PORT}`);
});
