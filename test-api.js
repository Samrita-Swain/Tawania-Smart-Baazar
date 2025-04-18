// Simple script to test API connectivity
import axios from 'axios';

async function testApi() {
  try {
    console.log('Testing API connection...');

    // Test the API test endpoint
    console.log('\n1. Testing /api/test endpoint:');
    const testResponse = await axios.get('http://localhost:5001/api/test');
    console.log('Test endpoint response:', testResponse.data);

    // Test the categories endpoint
    console.log('\n2. Testing /api/categories endpoint:');
    const categoriesResponse = await axios.get('http://localhost:5001/api/categories');
    console.log('Categories count:', categoriesResponse.data.data.length);

    // Test the products endpoint
    console.log('\n3. Testing /api/products endpoint:');
    const productsResponse = await axios.get('http://localhost:5001/api/products');
    console.log('Products count:', productsResponse.data.data.length);

    console.log('\nAll tests passed!');
  } catch (error) {
    console.error('API test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received. Server might be down or unreachable.');
    } else {
      console.error('Error details:', error);
    }
  }
}

testApi()
  .then(() => console.log('Test completed successfully'))
  .catch(err => console.error('Test failed'));
