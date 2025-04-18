// API Test Script
import axios from 'axios';

async function testAPI() {
  console.log('Starting API tests...');

  // Test direct connection to server
  try {
    console.log('\nTesting direct connection to server...');
    const directResponse = await axios.get('http://localhost:5001/api/products');
    console.log('✅ Direct connection successful!');
    console.log('Status:', directResponse.status);
    console.log('Data count:', directResponse.data.data.length);
  } catch (error) {
    console.error('❌ Direct connection failed!');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }

  // Test server health
  try {
    console.log('\nTesting server health...');
    const healthResponse = await axios.get('http://localhost:5001/health');
    console.log('✅ Server health check successful!');
    console.log('Status:', healthResponse.status);
    console.log('Data:', healthResponse.data);
  } catch (error) {
    console.error('❌ Server health check failed!');
    console.error('Error:', error.message);
  }

  // Test categories endpoint
  try {
    console.log('\nTesting categories endpoint...');
    const categoriesResponse = await axios.get('http://localhost:5001/api/categories');
    console.log('✅ Categories endpoint successful!');
    console.log('Status:', categoriesResponse.status);
    console.log('Data count:', categoriesResponse.data.data.length);
  } catch (error) {
    console.error('❌ Categories endpoint failed!');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testAPI()
  .then(() => console.log('\nAPI tests completed.'))
  .catch(error => console.error('\nAPI tests failed with error:', error.message));
