const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

// Create a new pool using the connection string from .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Neon PostgreSQL
  }
});

// Create admin user
const createAdmin = async () => {
  let client;
  try {
    console.log('Creating admin user...');

    // Test connection
    client = await pool.connect();
    console.log('Connected to database');

    // Create a store first (required for foreign key constraint)
    console.log('Creating default store...');
    const storeResult = await client.query(
      'INSERT INTO stores (name, address, phone, email, manager) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      ['Main Store', '123 Main St, Downtown', '555-1234', 'store@twania.com', 'Store Manager']
    );

    const storeId = storeResult.rows[0].id;
    console.log(`Store created with ID: ${storeId}`);

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Create superadmin user
    console.log('Creating superadmin user...');
    try {
      const adminResult = await client.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
        ['Super Admin', 'admin@twania.com', hashedPassword, 'superadmin']
      );
      console.log(`Superadmin created with ID: ${adminResult.rows[0].id}`);
    } catch (err) {
      if (err.code === '23505') { // Duplicate key error
        console.log('Superadmin user already exists, updating password...');
        await client.query(
          'UPDATE users SET password = $1 WHERE email = $2',
          [hashedPassword, 'admin@twania.com']
        );
        console.log('Superadmin password updated');
      } else {
        throw err;
      }
    }

    // Create another admin user
    console.log('Creating another admin user...');
    try {
      const admin2Result = await client.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
        ['New Admin', 'newadmin@twania.com', hashedPassword, 'superadmin']
      );
      console.log(`Second admin created with ID: ${admin2Result.rows[0].id}`);
    } catch (err) {
      if (err.code === '23505') { // Duplicate key error
        console.log('Second admin user already exists, updating password...');
        await client.query(
          'UPDATE users SET password = $1 WHERE email = $2',
          [hashedPassword, 'newadmin@twania.com']
        );
        console.log('Second admin password updated');
      } else {
        throw err;
      }
    }

    // Create store user
    console.log('Creating store user...');
    try {
      const storeUserResult = await client.query(
        'INSERT INTO users (name, email, password, role, store_id) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        ['Store Manager', 'store@twania.com', hashedPassword, 'store', storeId]
      );
      console.log(`Store user created with ID: ${storeUserResult.rows[0].id}`);
    } catch (err) {
      if (err.code === '23505') { // Duplicate key error
        console.log('Store user already exists, updating password and store ID...');
        await client.query(
          'UPDATE users SET password = $1, store_id = $2 WHERE email = $3',
          [hashedPassword, storeId, 'store@twania.com']
        );
        console.log('Store user updated');
      } else {
        throw err;
      }
    }

    // Create warehouse user
    console.log('Creating warehouse user...');
    try {
      const warehouseUserResult = await client.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
        ['Warehouse Manager', 'warehouse@twania.com', hashedPassword, 'warehouse']
      );
      console.log(`Warehouse user created with ID: ${warehouseUserResult.rows[0].id}`);
    } catch (err) {
      if (err.code === '23505') { // Duplicate key error
        console.log('Warehouse user already exists, updating password...');
        await client.query(
          'UPDATE users SET password = $1 WHERE email = $2',
          [hashedPassword, 'warehouse@twania.com']
        );
        console.log('Warehouse user updated');
      } else {
        throw err;
      }
    }

    console.log('All users created successfully');
    client.release();
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin user:', err);
    if (client) client.release();
    process.exit(1);
  }
};

// Run the function
createAdmin();
