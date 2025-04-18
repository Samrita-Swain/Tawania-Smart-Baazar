// Test script for product deletion endpoint
import axios from 'axios';

// Configuration
const API_URL = 'http://localhost:5001';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNzQ0ODAxMzM1LCJleHAiOjE3NDU0MDYxMzV9.8chnKvKDD8XHmL_S7qaziWOU0Ts-rPiJV6CBFCenUzYo'; // Replace with your actual token

// Helper function to make authenticated requests
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${AUTH_TOKEN}`
  }
});

// Function to get all products
async function getAllProducts() {
  try {
    const response = await api.get('/api/products');
    return response.data.data;
  } catch (error) {
    console.error('Error getting products:', error.message);
    return [];
  }
}

// Function to delete a product
async function deleteProduct(productId) {
  try {
    console.log(`Attempting to delete product with ID: ${productId}`);
    const response = await api.delete(`/api/products/${productId}`);
    console.log('Delete response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting product:', error.response ? error.response.data : error.message);
    return null;
  }
}

// Main function to run the test
async function runTest() {
  console.log('Starting product deletion test...');

  // Get all products
  const products = await getAllProducts();
  console.log(`Found ${products.length} products`);

  if (products.length === 0) {
    console.log('No products found to delete. Test cannot proceed.');
    return;
  }

  // Display all products
  console.log('Available products:');
  products.forEach(product => {
    console.log(`- ID: ${product.id}, Name: ${product.name}`);
  });

  // Select the last product to delete
  const productToDelete = products[products.length - 1];
  console.log(`\nSelected product to delete: ID ${productToDelete.id} - ${productToDelete.name}`);

  // Delete the product
  const deleteResult = await deleteProduct(productToDelete.id);

  if (deleteResult && deleteResult.success) {
    console.log(`\nProduct deleted successfully: ${deleteResult.data.name}`);

    // Verify deletion by getting all products again
    const updatedProducts = await getAllProducts();
    const deletedProductExists = updatedProducts.some(p => p.id === productToDelete.id);

    if (!deletedProductExists) {
      console.log('Verification successful: Product no longer exists in the database');
    } else {
      console.log('Verification failed: Product still exists in the database');
    }
  } else {
    console.log('\nProduct deletion failed');
  }

  console.log('\nTest completed');
}

// Run the test
runTest().catch(error => {
  console.error('Test failed with error:', error);
});
