const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5002; // Using a different port to avoid conflicts

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

// Test categories
const testCategories = [
  { id: '1', name: 'Test Category 1', description: 'Test Description 1', parentId: null },
  { id: '2', name: 'Test Category 2', description: 'Test Description 2', parentId: null }
];

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to Test API Server');
});

// GET categories
app.get('/api/categories', (req, res) => {
  try {
    console.log('GET /api/categories received');
    res.status(200).json({
      success: true,
      data: testCategories
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

// POST category
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

    // Create a new category
    const newCategory = {
      ...req.body,
      id: (testCategories.length + 1).toString(),
      parentId: req.body.parentId === '' ? null : req.body.parentId
    };

    // Add to test categories
    testCategories.push(newCategory);

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

// Start server
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});
