// Script to fix product deletion issues
require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Create a new pool using the connection string from .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('localhost') ? false : {
    rejectUnauthorized: false // Required for Neon PostgreSQL
  }
});

async function fixProductDeletion() {
  const client = await pool.connect();
  try {
    console.log('Connected to PostgreSQL database');
    
    // Check if the DELETE endpoint for products exists in server.cjs
    const serverJsPath = path.join(process.cwd(), 'server.cjs');
    
    if (fs.existsSync(serverJsPath)) {
      console.log('Checking server.cjs for DELETE endpoint...');
      
      const serverJsContent = fs.readFileSync(serverJsPath, 'utf8');
      
      // Check if the DELETE endpoint exists
      if (serverJsContent.includes("app.delete('/api/products/:id'")) {
        console.log('DELETE endpoint for products exists in server.cjs');
      } else {
        console.log('DELETE endpoint for products does not exist in server.cjs');
        console.log('Please add the DELETE endpoint for products to server.cjs');
        
        // Add the DELETE endpoint
        const deleteEndpoint = `
// Delete a product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(\`DELETE /api/products/\${id} received\`);
    
    // Start a transaction
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Check if product exists
      const productCheck = await client.query(
        'SELECT id, name FROM products WHERE id = $1',
        [id]
      );
      
      if (productCheck.rows.length === 0) {
        console.log(\`Product with ID \${id} not found\`);
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      
      const productName = productCheck.rows[0].name;
      console.log(\`Deleting product \${id}: \${productName}\`);
      
      // Delete warehouse inventory first (foreign key constraint)
      console.log(\`Deleting warehouse inventory for product \${id}\`);
      await client.query('DELETE FROM warehouse_inventory WHERE product_id = $1', [id]);
      
      // Delete store inventory (foreign key constraint)
      console.log(\`Deleting store inventory for product \${id}\`);
      await client.query('DELETE FROM store_inventory WHERE product_id = $1', [id]);
      
      // Finally delete the product
      console.log(\`Deleting product record for \${id}\`);
      await client.query('DELETE FROM products WHERE id = $1', [id]);
      
      // Commit the transaction
      await client.query('COMMIT');
      console.log(\`Product \${id} deleted successfully\`);
      
      res.status(200).json({
        success: true,
        message: 'Product deleted successfully',
        data: {
          id: id,
          name: productName
        }
      });
    } catch (err) {
      // Rollback the transaction on error
      await client.query('ROLLBACK');
      console.error('Transaction rolled back due to error:', err);
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Delete product error:', err.message);
    console.error('Error stack:', err.stack);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + err.message,
      error: err.toString(),
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});`;
        
        // Find the position to insert the DELETE endpoint
        const updateEndpointPosition = serverJsContent.indexOf("// Update a product");
        
        if (updateEndpointPosition !== -1) {
          // Find the end of the update endpoint
          const updateEndpointEnd = serverJsContent.indexOf("});", updateEndpointPosition);
          
          if (updateEndpointEnd !== -1) {
            // Insert the DELETE endpoint after the update endpoint
            const newServerJsContent = 
              serverJsContent.substring(0, updateEndpointEnd + 3) + 
              deleteEndpoint + 
              serverJsContent.substring(updateEndpointEnd + 3);
            
            // Write the updated content to server.cjs
            fs.writeFileSync(serverJsPath, newServerJsContent, 'utf8');
            console.log('Added DELETE endpoint for products to server.cjs');
          }
        }
      }
    } else {
      console.log('server.cjs not found');
    }
    
    // Check CORS configuration
    if (fs.existsSync(serverJsPath)) {
      console.log('Checking CORS configuration in server.cjs...');
      
      const serverJsContent = fs.readFileSync(serverJsPath, 'utf8');
      
      // Check if CORS is configured to allow all origins
      if (serverJsContent.includes("origin: '*'")) {
        console.log('CORS is configured to allow all origins');
      } else {
        console.log('CORS is not configured to allow all origins');
        console.log('Updating CORS configuration...');
        
        // Find the CORS configuration
        const corsPosition = serverJsContent.indexOf("app.use(cors(");
        
        if (corsPosition !== -1) {
          // Find the end of the CORS configuration
          const corsEnd = serverJsContent.indexOf("}));", corsPosition);
          
          if (corsEnd !== -1) {
            // Replace the CORS configuration
            const newCorsConfig = `app.use(cors({
  origin: '*', // Allow all origins for testing
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));`;
            
            // Find the start and end of the CORS configuration
            const corsStart = serverJsContent.indexOf("app.use(cors(", corsPosition);
            const corsEndComplete = serverJsContent.indexOf("));", corsEnd) + 2;
            
            // Replace the CORS configuration
            const newServerJsContent = 
              serverJsContent.substring(0, corsStart) + 
              newCorsConfig + 
              serverJsContent.substring(corsEndComplete);
            
            // Write the updated content to server.cjs
            fs.writeFileSync(serverJsPath, newServerJsContent, 'utf8');
            console.log('Updated CORS configuration in server.cjs');
          }
        }
      }
    }
    
    // Check for orphaned records in warehouse_inventory
    console.log('\nChecking for orphaned records in warehouse_inventory...');
    const orphanedWarehouseResult = await client.query(`
      SELECT wi.id, wi.product_id
      FROM warehouse_inventory wi
      LEFT JOIN products p ON wi.product_id = p.id
      WHERE p.id IS NULL
    `);
    
    if (orphanedWarehouseResult.rows.length > 0) {
      console.log(`Found ${orphanedWarehouseResult.rows.length} orphaned warehouse inventory records`);
      
      // Fix orphaned records
      console.log('Deleting orphaned warehouse inventory records...');
      for (const record of orphanedWarehouseResult.rows) {
        await client.query('DELETE FROM warehouse_inventory WHERE id = $1', [record.id]);
        console.log(`- Deleted warehouse inventory ID: ${record.id}`);
      }
    } else {
      console.log('No orphaned warehouse inventory records found');
    }
    
    // Check for orphaned records in store_inventory
    console.log('\nChecking for orphaned records in store_inventory...');
    const orphanedStoreResult = await client.query(`
      SELECT si.id, si.product_id, si.store_id
      FROM store_inventory si
      LEFT JOIN products p ON si.product_id = p.id
      WHERE p.id IS NULL
    `);
    
    if (orphanedStoreResult.rows.length > 0) {
      console.log(`Found ${orphanedStoreResult.rows.length} orphaned store inventory records`);
      
      // Fix orphaned records
      console.log('Deleting orphaned store inventory records...');
      for (const record of orphanedStoreResult.rows) {
        await client.query('DELETE FROM store_inventory WHERE id = $1', [record.id]);
        console.log(`- Deleted store inventory ID: ${record.id}`);
      }
    } else {
      console.log('No orphaned store inventory records found');
    }
    
    console.log('\nProduct deletion fix completed successfully');
    console.log('\nTo complete the fix:');
    console.log('1. Restart the server by running: node server.cjs');
    console.log('2. Clear browser localStorage by running these commands in the browser console:');
    console.log('   localStorage.removeItem("twania_products");');
    console.log('   localStorage.removeItem("twania_categories");');
    console.log('   localStorage.removeItem("twania_warehouseInventory");');
    console.log('   localStorage.removeItem("twania_storeInventory");');
    console.log('3. Refresh the admin panel page');
  } catch (error) {
    console.error('Error fixing product deletion:', error);
  } finally {
    client.release();
    pool.end();
  }
}

// Run the fix
fixProductDeletion().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
