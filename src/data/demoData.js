// Demo data for the admin panel

// Categories
export const categories = [
  { id: 1, name: 'Groceries', description: 'Food and grocery items', parent_id: null },
  { id: 2, name: 'Home & Lifestyle', description: 'Products for home and lifestyle', parent_id: null },
  { id: 3, name: 'Electronics', description: 'Electronic devices and accessories', parent_id: null },
  { id: 4, name: 'Industrial & Professional Supplies', description: 'Supplies for industrial and professional use', parent_id: null },
  { id: 5, name: 'Sports', description: 'Sports equipment and accessories', parent_id: null },
  { id: 6, name: 'Toys & Luggage', description: 'Toys and travel accessories', parent_id: null },
  { id: 7, name: 'Crafts of India', description: 'Handcrafted items from India', parent_id: null },
  { id: 8, name: 'Books, Music & Stationery', description: 'Books, music, and stationery items', parent_id: null },
  { id: 9, name: 'Furniture', description: 'Furniture for home and office', parent_id: null },
  { id: 10, name: 'Wellness', description: 'Health and wellness products', parent_id: null },
  { id: 11, name: 'Technology', description: 'Technology products and services', parent_id: null }
];

// Products
export const products = [
  // Products from Neon PostgreSQL database
  { id: 3, name: 'Test Smartphone XYZ', description: 'The latest smartphone with advanced features including a high-resolution camera, fast processor, and long-lasting battery. This device comes with 128GB storage and 8GB RAM.', price: 799.99, category_id: 3, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', sku: 'PHONE-TEST-001', created_at: '2025-04-15 11:21:25.774', updated_at: '2025-04-15 11:21:27.180256' },
  { id: 4, name: 'Test Smartphone XYZ', description: 'The latest smartphone with advanced features including a high-resolution camera, fast processor, and long-lasting battery. This device comes with 128GB storage and 8GB RAM.', price: 799.99, category_id: 2, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', sku: 'PHONE-TEST-001', created_at: '2025-04-15 11:22:45.951', updated_at: '2025-04-15 12:29:43.868247' },
  { id: 6, name: 'Wipster', description: 'lk', price: 999.99, category_id: 8, image: 'https://www.wipstertechnologies.com/logo.png', sku: 'SKU-1744799279067', created_at: '2025-04-16 10:27:57.439147', updated_at: '2025-04-16 10:27:57.439147' },
  { id: 7, name: 'technology', description: 'wwwwwwwwwwww', price: 999.99, category_id: 7, image: 'https://www.wipstertechnologies.com/logo.png', sku: 'SKU-1744803227947', created_at: '2025-04-16 11:33:46.539314', updated_at: '2025-04-16 11:33:46.539314' },
  { id: 9, name: 'Test Product via Script', description: 'This is a test product added via script', price: 99.99, category_id: 11, image: 'https://via.placeholder.com/300x200?text=Test+Product', sku: 'SKU-1744806098078', created_at: '2025-04-16 12:21:37.308642', updated_at: '2025-04-16 12:21:37.308642' },
  { id: 10, name: 'Test Product via Script', description: 'This is a test product added via script', price: 99.99, category_id: 11, image: 'https://via.placeholder.com/300x200?text=Test+Product', sku: 'SKU-1744806209520', created_at: '2025-04-16 12:23:28.736725', updated_at: '2025-04-16 12:23:28.736725' }
];

// Warehouse Inventory
export const warehouseInventory = [];

// Stores
export const stores = [
  { id: '1', name: 'Main Store', location: 'Downtown', manager: 'John Manager', phone: '123-456-7890', email: 'main@twania.com' },
  { id: '2', name: 'North Branch', location: 'North City', manager: 'Sarah Manager', phone: '234-567-8901', email: 'north@twania.com' },
  { id: '3', name: 'East Branch', location: 'East City', manager: 'Mike Manager', phone: '345-678-9012', email: 'east@twania.com' }
];

// Store Inventory
export const storeInventory = {
  '1': [],
  '2': [],
  '3': []
};

// Note: Orders feature has been removed

// Users
export const users = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@twania.com',
    role: 'superadmin',
    storeId: null,
    lastLogin: '2023-04-05'
  },
  {
    id: '2',
    name: 'New Admin',
    email: 'newadmin@twania.com',
    role: 'admin',
    storeId: null,
    lastLogin: '2023-04-15'
  }
];

// Note: Transfers feature has been removed

// Reports
export const reports = {
  sales: {
    daily: [
      { date: '2023-04-01', total: 0, orders: 0 },
      { date: '2023-04-02', total: 0, orders: 0 },
      { date: '2023-04-03', total: 0, orders: 0 },
      { date: '2023-04-04', total: 0, orders: 0 },
      { date: '2023-04-05', total: 0, orders: 0 }
    ],
    weekly: [
      { week: '2023-W13', total: 0, orders: 0 },
      { week: '2023-W14', total: 0, orders: 0 }
    ],
    monthly: [
      { month: '2023-02', total: 0, orders: 0 },
      { month: '2023-03', total: 0, orders: 0 },
      { month: '2023-04', total: 0, orders: 0 }
    ]
  },
  inventory: {
    lowStock: [],
    topSelling: []
  },
  stores: {
    performance: []
  }
};

// Settings
export const settings = {
  general: {
    storeName: 'Twania Smart Bazaar',
    storeEmail: 'info@twania.com',
    storePhone: '123-456-7890',
    storeAddress: '123 Commerce St, Business District, Country',
    currency: 'USD',
    taxRate: 7.5
  },
  notifications: {
    lowStockThreshold: 50,
    orderNotifications: true,
    inventoryNotifications: true,
    userNotifications: true
  },
  permissions: {
    roles: [
      { id: 'superadmin', name: 'Super Admin', description: 'Full access to all features' },
      { id: 'admin', name: 'Admin', description: 'Administrative access with some restrictions' },
      { id: 'warehouse', name: 'Warehouse Manager', description: 'Manage warehouse inventory and transfers' },
      { id: 'store', name: 'Store Manager', description: 'Manage store inventory and orders' }
    ],
    permissions: {
      'superadmin': ['all'],
      'admin': ['dashboard', 'products', 'categories', 'orders', 'customers', 'reports'],
      'warehouse': ['dashboard', 'inventory', 'transfers'],
      'store': ['dashboard', 'store-inventory', 'store-orders', 'customers']
    }
  }
};

// Export all data as a single object
export default {
  categories,
  products,
  warehouseInventory,
  stores,
  storeInventory,
  users,
  reports,
  settings
};