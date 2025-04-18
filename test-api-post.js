import axios from 'axios';

const testApi = async () => {
  try {
    console.log('Testing API...');

    // Test data
    const productData = {
      name: 'Test Product',
      description: 'Test Description',
      price: 10.99,
      category: 'Test Category',
      image: 'https://example.com/image.jpg'
    };

    // Test POST /api/products
    console.log('Testing POST /api/products...');
    const response = await axios.post('http://localhost:5001/api/products', productData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Response:', response.status, response.data);
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
};

testApi();
