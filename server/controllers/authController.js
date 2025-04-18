const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
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
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  console.log('Login attempt:', req.body);
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
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

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
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
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
};
