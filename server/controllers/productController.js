const db = require('../config/db');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT p.id, p.name, p.description, p.price, p.image, p.category_id, ' +
      'c.name as category_name, ' +
      'w.quantity as warehouse_quantity, ' +
      'p.created_at, p.updated_at ' +
      'FROM products p ' +
      'LEFT JOIN categories c ON p.category_id = c.id ' +
      'LEFT JOIN warehouse_inventory w ON p.id = w.product_id ' +
      'ORDER BY p.created_at DESC'
    );
    
    // Get store inventory for each product
    const products = await Promise.all(result.rows.map(async (product) => {
      const storeInventory = await db.query(
        'SELECT si.store_id, s.name as store_name, si.quantity ' +
        'FROM store_inventory si ' +
        'JOIN stores s ON si.store_id = s.id ' +
        'WHERE si.product_id = $1',
        [product.id]
      );
      
      const stores = {};
      storeInventory.rows.forEach(item => {
        stores[item.store_id] = {
          name: item.store_name,
          quantity: item.quantity
        };
      });
      
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        category: {
          id: product.category_id,
          name: product.category_name
        },
        image: product.image,
        stock: {
          warehouse: product.warehouse_quantity || 0,
          stores
        },
        createdAt: product.created_at,
        updatedAt: product.updated_at
      };
    }));
    
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (err) {
    console.error('Get products error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT p.id, p.name, p.description, p.price, p.image, p.category_id, ' +
      'c.name as category_name, ' +
      'w.quantity as warehouse_quantity, ' +
      'p.created_at, p.updated_at ' +
      'FROM products p ' +
      'LEFT JOIN categories c ON p.category_id = c.id ' +
      'LEFT JOIN warehouse_inventory w ON p.id = w.product_id ' +
      'WHERE p.id = $1',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    const product = result.rows[0];
    
    // Get store inventory
    const storeInventory = await db.query(
      'SELECT si.store_id, s.name as store_name, si.quantity ' +
      'FROM store_inventory si ' +
      'JOIN stores s ON si.store_id = s.id ' +
      'WHERE si.product_id = $1',
      [product.id]
    );
    
    const stores = {};
    storeInventory.rows.forEach(item => {
      stores[item.store_id] = {
        name: item.store_name,
        quantity: item.quantity
      };
    });
    
    res.status(200).json({
      success: true,
      data: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        category: {
          id: product.category_id,
          name: product.category_name
        },
        image: product.image,
        stock: {
          warehouse: product.warehouse_quantity || 0,
          stores
        },
        createdAt: product.created_at,
        updatedAt: product.updated_at
      }
    });
  } catch (err) {
    console.error('Get product error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
  const { name, description, price, categoryId, image, stock } = req.body;
  
  try {
    // Start a transaction
    await db.query('BEGIN');
    
    // Create product
    const productResult = await db.query(
      'INSERT INTO products (name, description, price, category_id, image) ' +
      'VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [name, description, price, categoryId, image]
    );
    
    const productId = productResult.rows[0].id;
    
    // Add warehouse inventory
    if (stock && stock.warehouse) {
      await db.query(
        'INSERT INTO warehouse_inventory (product_id, quantity) VALUES ($1, $2)',
        [productId, stock.warehouse]
      );
    }
    
    // Add store inventory
    if (stock && stock.stores) {
      for (const [storeId, quantity] of Object.entries(stock.stores)) {
        await db.query(
          'INSERT INTO store_inventory (store_id, product_id, quantity) VALUES ($1, $2, $3)',
          [storeId, productId, quantity]
        );
      }
    }
    
    // Commit transaction
    await db.query('COMMIT');
    
    // Get the created product
    const result = await db.query(
      'SELECT p.id, p.name, p.description, p.price, p.image, p.category_id, ' +
      'c.name as category_name, ' +
      'w.quantity as warehouse_quantity, ' +
      'p.created_at, p.updated_at ' +
      'FROM products p ' +
      'LEFT JOIN categories c ON p.category_id = c.id ' +
      'LEFT JOIN warehouse_inventory w ON p.id = w.product_id ' +
      'WHERE p.id = $1',
      [productId]
    );
    
    const product = result.rows[0];
    
    // Get store inventory
    const storeInventory = await db.query(
      'SELECT si.store_id, s.name as store_name, si.quantity ' +
      'FROM store_inventory si ' +
      'JOIN stores s ON si.store_id = s.id ' +
      'WHERE si.product_id = $1',
      [productId]
    );
    
    const stores = {};
    storeInventory.rows.forEach(item => {
      stores[item.store_id] = {
        name: item.store_name,
        quantity: item.quantity
      };
    });
    
    res.status(201).json({
      success: true,
      data: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        category: {
          id: product.category_id,
          name: product.category_name
        },
        image: product.image,
        stock: {
          warehouse: product.warehouse_quantity || 0,
          stores
        },
        createdAt: product.created_at,
        updatedAt: product.updated_at
      }
    });
  } catch (err) {
    // Rollback transaction on error
    await db.query('ROLLBACK');
    
    console.error('Create product error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
  const { name, description, price, categoryId, image, stock } = req.body;
  
  try {
    // Check if product exists
    const productCheck = await db.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    
    if (productCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Start a transaction
    await db.query('BEGIN');
    
    // Update product
    await db.query(
      'UPDATE products SET name = $1, description = $2, price = $3, category_id = $4, image = $5, updated_at = NOW() WHERE id = $6',
      [name, description, price, categoryId, image, req.params.id]
    );
    
    // Update warehouse inventory
    if (stock && stock.warehouse !== undefined) {
      const warehouseCheck = await db.query(
        'SELECT * FROM warehouse_inventory WHERE product_id = $1',
        [req.params.id]
      );
      
      if (warehouseCheck.rows.length === 0) {
        // Insert new warehouse inventory
        await db.query(
          'INSERT INTO warehouse_inventory (product_id, quantity) VALUES ($1, $2)',
          [req.params.id, stock.warehouse]
        );
      } else {
        // Update existing warehouse inventory
        await db.query(
          'UPDATE warehouse_inventory SET quantity = $1, last_updated = NOW() WHERE product_id = $2',
          [stock.warehouse, req.params.id]
        );
      }
    }
    
    // Update store inventory
    if (stock && stock.stores) {
      for (const [storeId, quantity] of Object.entries(stock.stores)) {
        const storeCheck = await db.query(
          'SELECT * FROM store_inventory WHERE store_id = $1 AND product_id = $2',
          [storeId, req.params.id]
        );
        
        if (storeCheck.rows.length === 0) {
          // Insert new store inventory
          await db.query(
            'INSERT INTO store_inventory (store_id, product_id, quantity) VALUES ($1, $2, $3)',
            [storeId, req.params.id, quantity]
          );
        } else {
          // Update existing store inventory
          await db.query(
            'UPDATE store_inventory SET quantity = $1, last_updated = NOW() WHERE store_id = $2 AND product_id = $3',
            [quantity, storeId, req.params.id]
          );
        }
      }
    }
    
    // Commit transaction
    await db.query('COMMIT');
    
    // Get the updated product
    const result = await db.query(
      'SELECT p.id, p.name, p.description, p.price, p.image, p.category_id, ' +
      'c.name as category_name, ' +
      'w.quantity as warehouse_quantity, ' +
      'p.created_at, p.updated_at ' +
      'FROM products p ' +
      'LEFT JOIN categories c ON p.category_id = c.id ' +
      'LEFT JOIN warehouse_inventory w ON p.id = w.product_id ' +
      'WHERE p.id = $1',
      [req.params.id]
    );
    
    const product = result.rows[0];
    
    // Get store inventory
    const storeInventory = await db.query(
      'SELECT si.store_id, s.name as store_name, si.quantity ' +
      'FROM store_inventory si ' +
      'JOIN stores s ON si.store_id = s.id ' +
      'WHERE si.product_id = $1',
      [req.params.id]
    );
    
    const stores = {};
    storeInventory.rows.forEach(item => {
      stores[item.store_id] = {
        name: item.store_name,
        quantity: item.quantity
      };
    });
    
    res.status(200).json({
      success: true,
      data: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        category: {
          id: product.category_id,
          name: product.category_name
        },
        image: product.image,
        stock: {
          warehouse: product.warehouse_quantity || 0,
          stores
        },
        createdAt: product.created_at,
        updatedAt: product.updated_at
      }
    });
  } catch (err) {
    // Rollback transaction on error
    await db.query('ROLLBACK');
    
    console.error('Update product error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
  try {
    // Check if product exists
    const productCheck = await db.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    
    if (productCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Start a transaction
    await db.query('BEGIN');
    
    // Delete warehouse inventory
    await db.query('DELETE FROM warehouse_inventory WHERE product_id = $1', [req.params.id]);
    
    // Delete store inventory
    await db.query('DELETE FROM store_inventory WHERE product_id = $1', [req.params.id]);
    
    // Delete product
    await db.query('DELETE FROM products WHERE id = $1', [req.params.id]);
    
    // Commit transaction
    await db.query('COMMIT');
    
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (err) {
    // Rollback transaction on error
    await db.query('ROLLBACK');
    
    console.error('Delete product error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
