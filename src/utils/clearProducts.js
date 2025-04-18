/**
 * Utility function to clear all products from localStorage
 */
export const clearProductsFromStorage = () => {
  try {
    // Clear products from localStorage
    localStorage.removeItem('twania_products');
    console.log('Products cleared from localStorage');
    
    // Clear any other related data
    localStorage.removeItem('twania_warehouseInventory');
    localStorage.removeItem('twania_storeInventory');
    
    return true;
  } catch (error) {
    console.error('Error clearing products from localStorage:', error);
    return false;
  }
};

export default clearProductsFromStorage;
