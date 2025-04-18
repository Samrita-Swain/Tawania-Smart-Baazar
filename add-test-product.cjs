// Script to add a test product
require('dotenv').config();
const axios = require('axios');

async function addTestProduct() {
  console.log('Adding test product...');
  
  try {
    // Create a test product
    const testProduct = {
      name: 'Test Product via Script',
      description: 'This is a test product added via script',
      price: 99.99,
      category: 'wipster', // Use an existing category
      image: 'https://via.placeholder.com/300x200?text=Test+Product',
      sku: 'TEST-SCRIPT-001',
      stock: {
        warehouse: 50,
        stores: {
          "1": 25 // Store ID 1
        }
      }
    };
    
    console.log('Sending product data:', testProduct);
    
    // Send the product to the API
    const response = await axios.post('http://localhost:5001/api/products', testProduct);
    
    console.log('API response status:', response.status);
    console.log('API response data:', response.data);
    
    if (response.data && response.data.success) {
      console.log('Product created successfully with ID:', response.data.data.id);
    } else {
      console.error('Failed to create product:', response.data?.message || 'Unknown error');
    }
  } catch (error) {
    console.error('Error creating product:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

addTestProduct()
  .then(() => console.log('Test complete'))
  .catch(err => console.error('Error:', err));
