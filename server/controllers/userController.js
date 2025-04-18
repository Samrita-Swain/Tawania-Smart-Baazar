const bcrypt = require('bcryptjs');
const db = require('../config/db');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
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
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT u.id, u.name, u.email, u.role, u.store_id, u.created_at, s.name as store_name ' +
      'FROM users u ' +
      'LEFT JOIN stores s ON u.store_id = s.id ' +
      'WHERE u.id = $1',
      [req.params.id]
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
        storeId: user.store_id,
        storeName: user.store_name,
        createdAt: user.created_at
      }
    });
  } catch (err) {
    console.error('Get user error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res) => {
  const { name, email, password, role, storeId } = req.body;
  
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
      'INSERT INTO users (name, email, password, role, store_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, store_id, created_at',
      [name, email, hashedPassword, role, storeId || null]
    );
    
    const user = result.rows[0];
    
    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        storeId: user.store_id,
        createdAt: user.created_at
      }
    });
  } catch (err) {
    console.error('Create user error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  const { name, email, password, role, storeId } = req.body;
  
  try {
    // Check if user exists
    const userCheck = await db.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Prepare update fields
    let query = 'UPDATE users SET name = $1, email = $2, role = $3, store_id = $4';
    let values = [name, email, role, storeId || null];
    
    // If password is provided, hash it and add to update
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      query += ', password = $5';
      values.push(hashedPassword);
    }
    
    // Add updated_at and WHERE clause
    query += ', updated_at = NOW() WHERE id = $' + (values.length + 1) + ' RETURNING id, name, email, role, store_id, updated_at';
    values.push(req.params.id);
    
    // Update user
    const result = await db.query(query, values);
    
    const user = result.rows[0];
    
    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        storeId: user.store_id,
        updatedAt: user.updated_at
      }
    });
  } catch (err) {
    console.error('Update user error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    // Check if user exists
    const userCheck = await db.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Prevent deleting superadmin
    if (userCheck.rows[0].role === 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete superadmin user'
      });
    }
    
    // Delete user
    await db.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (err) {
    console.error('Delete user error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
