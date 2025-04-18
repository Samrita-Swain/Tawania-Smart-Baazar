// Simple script to test API connectivity
import axios from 'axios';

async function testApi() {
  try {
    console.log('Testing API connectivity...');

    // Test with direct URL
    console.log('Testing with direct URL...');
    const directResponse = await axios.get('http://localhost:5001/api/products');
    console.log('Direct API test successful!');
    console.log('Status:', directResponse.status);
    console.log('Data count:', directResponse.data.data.length);

    // Test with axios instance
    console.log('\nTesting with axios instance...');
    const api = axios.create({
      baseURL: 'http://localhost:5001',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const instanceResponse = await api.get('/api/products');
    console.log('Axios instance test successful!');
    console.log('Status:', instanceResponse.status);
    console.log('Data count:', instanceResponse.data.data.length);

  } catch (error) {
    console.error('API test failed!');
    console.error('Error message:', error.message);

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received. Request details:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', error.message);
    }

    console.error('Error config:', error.config);
  }
}

testApi();
