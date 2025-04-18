// Test script to directly test the products API
import axios from 'axios';

async function testProductsAPI() {
  console.log('Testing products API...');
  
  try {
    // Test direct API call
    console.log('Testing direct API call to http://localhost:5001/api/products');
    const directResponse = await axios.get('http://localhost:5001/api/products');
    console.log('Direct API call successful!');
    console.log('Status:', directResponse.status);
    console.log('Data:', directResponse.data);
  } catch (error) {
    console.error('Direct API call failed!');
    console.error('Error message:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testProductsAPI()
  .then(() => console.log('Test complete'))
  .catch(err => console.error('Error:', err));
