const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');

// Placeholder for category controller
// In a real implementation, you would import the actual controller
const categoryController = {
  getCategories: (req, res) => {
    res.status(200).json({
      success: true,
      data: [
        {
          id: 1,
          name: 'Electronics',
          description: 'Electronic devices and accessories',
          parentId: null
        },
        {
          id: 2,
          name: 'Smartphones',
          description: 'Mobile phones and accessories',
          parentId: 1
        },
        {
          id: 3,
          name: 'Laptops',
          description: 'Notebook computers and accessories',
          parentId: 1
        }
      ]
    });
  },
  getCategory: (req, res) => {
    res.status(200).json({
      success: true,
      data: {
        id: req.params.id,
        name: 'Electronics',
        description: 'Electronic devices and accessories',
        parentId: null
      }
    });
  },
  createCategory: (req, res) => {
    res.status(201).json({
      success: true,
      data: {
        id: Date.now(),
        ...req.body
      }
    });
  },
  updateCategory: (req, res) => {
    res.status(200).json({
      success: true,
      data: {
        id: req.params.id,
        ...req.body
      }
    });
  },
  deleteCategory: (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  }
};

// Public routes
router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategory);

// Protected routes
router.use(authenticate);

// Admin only routes
router.post('/', authorize('superadmin', 'admin'), categoryController.createCategory);
router.put('/:id', authorize('superadmin', 'admin'), categoryController.updateCategory);
router.delete('/:id', authorize('superadmin', 'admin'), categoryController.deleteCategory);

module.exports = router;
