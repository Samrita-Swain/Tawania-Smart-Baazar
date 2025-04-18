#!/bin/bash

# Configuration
API_URL="http://localhost:5001"
AUTH_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNzQ0ODAxMzM1LCJleHAiOjE3NDU0MDYxMzV9.8chnKvKDD8XHmL_S7qaziWOU0Ts-rPiJV6CBFCenUzYo"

echo "Starting product deletion test..."

# Get all products
echo "Fetching all products..."
PRODUCTS_RESPONSE=$(curl -s -H "Authorization: Bearer $AUTH_TOKEN" "$API_URL/api/products")
echo "Products response: $PRODUCTS_RESPONSE"

# Extract the last product ID (this is a simplified approach)
PRODUCT_ID=$(echo $PRODUCTS_RESPONSE | grep -o '"id":[0-9]*' | tail -1 | cut -d':' -f2)

if [ -z "$PRODUCT_ID" ]; then
  echo "No product ID found. Test cannot proceed."
  exit 1
fi

echo "Selected product ID for deletion: $PRODUCT_ID"

# Delete the product
echo "Deleting product..."
DELETE_RESPONSE=$(curl -s -X DELETE -H "Authorization: Bearer $AUTH_TOKEN" "$API_URL/api/products/$PRODUCT_ID")
echo "Delete response: $DELETE_RESPONSE"

# Check if deletion was successful
if echo "$DELETE_RESPONSE" | grep -q '"success":true'; then
  echo "Product deleted successfully!"
else
  echo "Product deletion failed!"
fi

echo "Test completed"
