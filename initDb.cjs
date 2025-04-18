const { Pool } = require('pg');
require('dotenv').config();

// Create a new pool using the connection string from .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Neon PostgreSQL
  }
});

// SQL schema
const schema = `
-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('superadmin', 'admin', 'store', 'warehouse')),
  store_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stores Table
CREATE TABLE IF NOT EXISTS stores (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  manager VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraint to users table
ALTER TABLE users
ADD CONSTRAINT fk_store
FOREIGN KEY (store_id)
REFERENCES stores(id)
ON DELETE SET NULL;

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  parent_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category_id INTEGER NOT NULL,
  image VARCHAR(255),
  sku VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Warehouse Inventory Table
CREATE TABLE IF NOT EXISTS warehouse_inventory (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  location VARCHAR(100),
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Store Inventory Table
CREATE TABLE IF NOT EXISTS store_inventory (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE(store_id, product_id)
);

-- Note: The following tables have been removed as they are not currently used in both admin panel and frontend:
-- - inventory_transfers
-- - orders
-- - order_items

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_warehouse_inventory_product ON warehouse_inventory(product_id);
CREATE INDEX idx_store_inventory_store ON store_inventory(store_id);
CREATE INDEX idx_store_inventory_product ON store_inventory(product_id);

-- Insert default superadmin user (password: admin123)
INSERT INTO users (name, email, password, role)
VALUES ('Super Admin', 'admin@twania.com', '$2a$10$mLK.rrdlvx9DCFb6Eck1t.TlltnGulepXnov3bBp5T2TloO1MYj52', 'superadmin')
ON CONFLICT (email) DO NOTHING;
`;

// Initialize the database
const initDb = async () => {
  let client;
  try {
    console.log('Initializing database...');

    // Test connection
    client = await pool.connect();
    console.log('Connected to database');

    // Drop existing tables if they exist
    console.log('Dropping existing tables...');
    await client.query(`
      DROP TABLE IF EXISTS store_inventory CASCADE;
      DROP TABLE IF EXISTS warehouse_inventory CASCADE;
      DROP TABLE IF EXISTS products CASCADE;
      DROP TABLE IF EXISTS categories CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS stores CASCADE;
    `);

    // Create new tables
    console.log('Creating new tables...');
    await client.query(schema);

    console.log('Database initialized successfully');
    client.release();
    process.exit(0);
  } catch (err) {
    console.error('Error initializing database:', err);
    if (client) client.release();
    process.exit(1);
  }
};

// Run the initialization
initDb();
