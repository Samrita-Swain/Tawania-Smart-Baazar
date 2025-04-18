# Configuration
$API_URL = "http://localhost:5001"
$AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNzQ0ODAxMzM1LCJleHAiOjE3NDU0MDYxMzV9.8chnKvKDD8XHmL_S7qaziWOU0Ts-rPiJV6CBFCenUzYo"

Write-Host "Starting product deletion test..."

# Get all products
Write-Host "Fetching all products..."
$headers = @{
    "Authorization" = "Bearer $AUTH_TOKEN"
}

try {
    $productsResponse = Invoke-RestMethod -Uri "$API_URL/api/products" -Headers $headers -Method Get
    
    if ($productsResponse.data.Count -eq 0) {
        Write-Host "No products found. Test cannot proceed."
        exit
    }
    
    Write-Host "Found $($productsResponse.data.Count) products"
    
    # Select the last product to delete
    $productToDelete = $productsResponse.data[$productsResponse.data.Count - 1]
    Write-Host "Selected product to delete: ID $($productToDelete.id) - $($productToDelete.name)"
    
    # Delete the product
    Write-Host "Deleting product..."
    $deleteResponse = Invoke-RestMethod -Uri "$API_URL/api/products/$($productToDelete.id)" -Headers $headers -Method Delete
    
    if ($deleteResponse.success -eq $true) {
        Write-Host "Product deleted successfully: $($deleteResponse.data.name)"
        
        # Verify deletion by getting all products again
        $updatedProductsResponse = Invoke-RestMethod -Uri "$API_URL/api/products" -Headers $headers -Method Get
        $deletedProductExists = $updatedProductsResponse.data | Where-Object { $_.id -eq $productToDelete.id }
        
        if ($null -eq $deletedProductExists) {
            Write-Host "Verification successful: Product no longer exists in the database"
        } else {
            Write-Host "Verification failed: Product still exists in the database"
        }
    } else {
        Write-Host "Product deletion failed: $($deleteResponse.message)"
    }
} catch {
    Write-Host "Error: $_"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)"
    Write-Host "Response: $($_.ErrorDetails.Message)"
}

Write-Host "Test completed"
