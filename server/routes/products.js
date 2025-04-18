const express = require('express');
const router = express.Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getProducts);
router.get('/:id', getProduct);

// Protected routes
router.use(authenticate);

// Admin only routes
router.post('/', authorize('superadmin', 'admin'), createProduct);
router.put('/:id', authorize('superadmin', 'admin'), updateProduct);
router.delete('/:id', authorize('superadmin', 'admin'), deleteProduct);

module.exports = router;
