/**
 * Utility function to clear all data from localStorage
 */
export const clearAllLocalStorage = () => {
  try {
    // Clear all Twania-related data from localStorage
    const keys = Object.keys(localStorage);
    const twaniaKeys = keys.filter(key => key.startsWith('twania_'));
    
    console.log('Clearing the following keys from localStorage:', twaniaKeys);
    
    twaniaKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('All Twania data cleared from localStorage');
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
};

export default clearAllLocalStorage;
