/**
 * Utility function to clear warehouse inventory from localStorage
 */
export const clearWarehouseInventoryFromStorage = () => {
  try {
    // Clear warehouse inventory from localStorage
    localStorage.removeItem('twania_warehouseInventory');
    console.log('Warehouse inventory cleared from localStorage');
    
    return true;
  } catch (error) {
    console.error('Error clearing warehouse inventory from localStorage:', error);
    return false;
  }
};

export default clearWarehouseInventoryFromStorage;
