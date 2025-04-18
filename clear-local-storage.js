// Script to clear localStorage in the browser
console.log('Clearing localStorage...');

// Function to clear localStorage
function clearLocalStorage() {
  try {
    // Get all keys in localStorage
    const keys = Object.keys(localStorage);
    
    // Filter keys that start with 'twania_'
    const twaniaKeys = keys.filter(key => key.startsWith('twania_'));
    
    console.log('Found Twania keys in localStorage:', twaniaKeys);
    
    // Remove each key
    twaniaKeys.forEach(key => {
      localStorage.removeItem(key);
      console.log(`Removed key: ${key}`);
    });
    
    console.log('All Twania data cleared from localStorage');
    
    // Reload the page to apply changes
    window.location.reload();
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}

// Execute the function
clearLocalStorage();
