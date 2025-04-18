/**
 * Utility functions for working with product stock
 */

/**
 * Calculate the total stock for a product across warehouse and stores
 * @param {Object} product - The product object
 * @returns {number} - The total stock
 */
export const calculateTotalStock = (product) => {
  if (!product) return 0;

  // Handle simple stock property (number)
  if (typeof product.stock === 'number') {
    return product.stock;
  }

  // Handle complex stock object
  if (product.stock && typeof product.stock === 'object') {
    // Calculate warehouse stock
    const warehouseStock = product.stock.warehouse || 0;

    // Calculate total store stock
    let storeStock = 0;
    if (product.stock.stores) {
      storeStock = Object.values(product.stock.stores).reduce((sum, qty) => sum + (qty || 0), 0);
    }

    // Calculate total stock
    return warehouseStock + storeStock;
  }

  // Default to 10 if no stock information is available
  return 10;
};

/**
 * Check if a product is in stock
 * @param {Object} product - The product object
 * @returns {boolean} - True if the product is in stock, false otherwise
 */
export const isProductInStock = (product) => {
  return calculateTotalStock(product) > 0;
};

/**
 * Format stock display text
 * @param {Object} product - The product object
 * @returns {string} - The formatted stock text
 */
export const formatStockText = (product) => {
  const totalStock = calculateTotalStock(product);

  if (totalStock > 0) {
    return `In Stock (${totalStock} available)`;
  } else {
    return 'Out of Stock';
  }
};

export default {
  calculateTotalStock,
  isProductInStock,
  formatStockText
};
