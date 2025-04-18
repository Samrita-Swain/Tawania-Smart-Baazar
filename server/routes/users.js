const express = require('express');
const router = express.Router();
const { getUsers, getUser, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticate);

// Get all users - Admin only
router.get('/', authorize('superadmin', 'admin'), getUsers);

// Get single user - Admin only
router.get('/:id', authorize('superadmin', 'admin'), getUser);

// Create user - Admin only
router.post('/', authorize('superadmin', 'admin'), createUser);

// Update user - Admin only
router.put('/:id', authorize('superadmin', 'admin'), updateUser);

// Delete user - Admin only
router.delete('/:id', authorize('superadmin', 'admin'), deleteUser);

module.exports = router;
