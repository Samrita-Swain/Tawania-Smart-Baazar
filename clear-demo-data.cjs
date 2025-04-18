// Script to clear all demo data
const fs = require('fs');
const path = require('path');

// Path to the demo data file
const demoDataPath = path.join(__dirname, 'src', 'data', 'demoData.js');

// New content with empty arrays
const newContent = `// Demo data for the admin panel

// Categories
export const categories = [];

// Products
export const products = [];

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
    daily: [],
    weekly: [],
    monthly: []
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
};`;

// Write the new content to the file
try {
  fs.writeFileSync(demoDataPath, newContent);
  console.log('Demo data cleared successfully!');
} catch (error) {
  console.error('Error clearing demo data:', error);
}
