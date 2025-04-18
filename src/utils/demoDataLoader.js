// Import the demo data
import demoData from '../data/demoData';

// Function to check if demo data is available
export const isDemoDataAvailable = () => {
  return (
    demoData &&
    demoData.products &&
    Array.isArray(demoData.products) &&
    demoData.products.length > 0
  );
};

// Function to get demo products
export const getDemoProducts = () => {
  console.log('Getting demo products from data file');
  // Check if we have products in the imported data
  if (demoData && demoData.products && Array.isArray(demoData.products) && demoData.products.length > 0) {
    console.log(`Returning ${demoData.products.length} products from demo data`);
    return demoData.products;
  }

  // Fallback to hardcoded products if the imported data is empty
  console.log('No products in demo data, using hardcoded fallback');
  return [
    { id: 3, name: 'Test Smartphone XYZ', description: 'The latest smartphone with advanced features including a high-resolution camera, fast processor, and long-lasting battery. This device comes with 128GB storage and 8GB RAM.', price: 799.99, category_id: 3, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', sku: 'PHONE-TEST-001', created_at: '2025-04-15 11:21:25.774', updated_at: '2025-04-15 11:21:27.180256' },
    { id: 4, name: 'Test Smartphone XYZ', description: 'The latest smartphone with advanced features including a high-resolution camera, fast processor, and long-lasting battery. This device comes with 128GB storage and 8GB RAM.', price: 799.99, category_id: 2, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', sku: 'PHONE-TEST-001', created_at: '2025-04-15 11:22:45.951', updated_at: '2025-04-15 12:29:43.868247' },
    { id: 6, name: 'Wipster', description: 'lk', price: 999.99, category_id: 8, image: 'https://www.wipstertechnologies.com/logo.png', sku: 'SKU-1744799279067', created_at: '2025-04-16 10:27:57.439147', updated_at: '2025-04-16 10:27:57.439147' },
    { id: 7, name: 'technology', description: 'wwwwwwwwwwww', price: 999.99, category_id: 7, image: 'https://www.wipstertechnologies.com/logo.png', sku: 'SKU-1744803227947', created_at: '2025-04-16 11:33:46.539314', updated_at: '2025-04-16 11:33:46.539314' },
    { id: 9, name: 'Test Product via Script', description: 'This is a test product added via script', price: 99.99, category_id: 11, image: 'https://via.placeholder.com/300x200?text=Test+Product', sku: 'SKU-1744806098078', created_at: '2025-04-16 12:21:37.308642', updated_at: '2025-04-16 12:21:37.308642' },
    { id: 10, name: 'Test Product via Script', description: 'This is a test product added via script', price: 99.99, category_id: 11, image: 'https://via.placeholder.com/300x200?text=Test+Product', sku: 'SKU-1744806209520', created_at: '2025-04-16 12:23:28.736725', updated_at: '2025-04-16 12:23:28.736725' }
  ];
};

// Function to get demo categories
export const getDemoCategories = () => {
  console.log('Getting demo categories from data file');
  // Check if we have categories in the imported data
  if (demoData && demoData.categories && Array.isArray(demoData.categories) && demoData.categories.length > 0) {
    console.log(`Returning ${demoData.categories.length} categories from demo data`);
    return demoData.categories;
  }

  // Fallback to hardcoded categories if the imported data is empty
  console.log('No categories in demo data, using hardcoded fallback');
  return [
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
};

// Function to get a demo product by ID
export const getDemoProductById = (id) => {
  if (demoData && demoData.products && Array.isArray(demoData.products)) {
    return demoData.products.find(p => p.id === id) || null;
  }
  return null;
};

// Export the demo data
export default demoData;
