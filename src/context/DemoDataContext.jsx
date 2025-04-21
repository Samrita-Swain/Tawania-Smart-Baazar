import React, { createContext, useContext, useState, useEffect } from 'react';
import demoData, { getDemoProducts, getDemoCategories } from '../utils/demoDataLoader';
import { productService, categoryService, warehouseService, storeService } from '../services/api';

// Debug the demo data
console.log('Demo data imported:', demoData);
console.log('Demo products from utility:', getDemoProducts().length);
console.log('Demo categories from utility:', getDemoCategories().length);

// Create the context
const DemoDataContext = createContext();

// Custom hook to use the demo data context
export const useDemoData = () => {
  const context = useContext(DemoDataContext);
  if (!context) {
    throw new Error('useDemoData must be used within a DemoDataProvider');
  }
  return context;
};

// Provider component
export const DemoDataProvider = ({ children }) => {
  console.log('DemoDataProvider initializing with data:', demoData);

  // Load data from localStorage or use demo data as fallback
  const loadFromStorage = (key, fallback) => {
    try {
      const storedData = localStorage.getItem(`twania_${key}`);
      if (storedData) {
        return JSON.parse(storedData);
      }
    } catch (err) {
      console.error(`Error loading ${key} from localStorage:`, err);
    }
    return fallback;
  };

  // Initialize with empty arrays, will be populated from API
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouseInventory, setWarehouseInventory] = useState(loadFromStorage('warehouseInventory', demoData.warehouseInventory || []));
  const [stores, setStores] = useState(loadFromStorage('stores', demoData.stores || []));
  const [storeInventory, setStoreInventory] = useState(loadFromStorage('storeInventory', demoData.storeInventory || []));
  const [orders, setOrders] = useState(loadFromStorage('orders', demoData.orders || []));
  const [users, setUsers] = useState(loadFromStorage('users', demoData.users || []));
  const [transfers, setTransfers] = useState(loadFromStorage('transfers', demoData.transfers || []));
  const [reports, setReports] = useState(loadFromStorage('reports', demoData.reports || []));
  const [settings, setSettings] = useState(loadFromStorage('settings', demoData.settings || {}));

  // State to track last sync time
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncInterval, setSyncInterval] = useState(300000); // 5 minutes by default
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);

  // Function to force refresh data from API
  const forceRefreshData = async () => {
    console.log('Force refreshing data from API...');
    // Clear local storage for products and categories
    localStorage.removeItem('twania_products');
    localStorage.removeItem('twania_categories');
    localStorage.removeItem('twania_warehouseInventory');
    localStorage.removeItem('twania_storeInventory');

    // Clear state
    setProducts([]);
    setCategories([]);
    setWarehouseInventory([]);
    setStoreInventory([]);

    // Clear API service caches
    try {
      if (categoryService._categoriesCache) categoryService._categoriesCache = null;
      if (categoryService._categoriesCacheTimestamp) categoryService._categoriesCacheTimestamp = null;
      if (categoryService._frontendCategoriesCache) categoryService._frontendCategoriesCache = null;
      if (categoryService._frontendCategoriesCacheTimestamp) categoryService._frontendCategoriesCacheTimestamp = null;
      if (categoryService._categoriesWithCountsCache) categoryService._categoriesWithCountsCache = null;
      if (categoryService._categoriesWithCountsCacheTimestamp) categoryService._categoriesWithCountsCacheTimestamp = null;
      console.log('Cleared category service caches');
    } catch (error) {
      console.warn('Error clearing category service caches:', error.message);
    }

    // Fetch fresh data from API
    return fetchDataFromAPI(true, true);
  };

  // Function to fetch data from API
  const fetchDataFromAPI = async (showLogs = true, forceRefresh = false) => {
    // Prevent multiple simultaneous syncs unless forced
    if ((isSyncing || fetchInProgress.current) && !forceRefresh) {
      console.log('Sync already in progress, skipping');
      return;
    }

    // Set fetchInProgress to prevent duplicate requests
    fetchInProgress.current = true;

    // Set a timeout to automatically clear the syncing state after 30 seconds
    // This prevents the app from getting stuck in a syncing state
    const syncTimeout = setTimeout(() => {
      if (isSyncing) {
        console.log('Sync timeout reached, resetting sync state');
        setIsSyncing(false);
        setSyncError('Sync timed out');
        fetchInProgress.current = false;
      }
    }, 30000);

    // Clear request cache to ensure fresh data
    try {
      const { clearRequestCache } = await import('../utils/globalRequestLimiter');
      clearRequestCache();
      console.log('Request cache cleared before sync');
    } catch (error) {
      console.warn('Could not clear request cache:', error.message);
    }

    setIsSyncing(true);
    setSyncError(null);

    // Add a timestamp to track when this sync started
    const syncStartTime = new Date().getTime();

    if (forceRefresh) {
      console.log('Forced refresh requested - clearing cached data');
      // Clear any cached data
      setProducts([]);
      localStorage.removeItem('twania_products');
    }

    try {
      if (showLogs) console.log('Syncing data with API...');

      // Helper function to fetch data with fallback to localStorage
      const fetchWithFallback = async (fetchFn, setStateFn, localStorageKey, entityName) => {
        try {
          console.log(`Fetching ${entityName} from API...`);
          console.log(`Using fetch function:`, fetchFn.name || 'anonymous');

          const response = await fetchFn();
          console.log(`${entityName} API response status:`, response?.status);
          console.log(`${entityName} API response:`, response);

          // Check if we have a valid response with data
          if (response && response.data) {
            console.log(`${entityName} response data structure:`, Object.keys(response.data));
            console.log(`${entityName} full response data:`, response.data);

            // Handle different API response formats
            let responseData = [];

            // Format 1: { success: true, data: [...] } (standard format)
            if (response.data.success && Array.isArray(response.data.data)) {
              responseData = response.data.data;
              console.log(`${entityName} data found in standard format`);
            }
            // Format 2: [...] (direct array)
            else if (Array.isArray(response.data)) {
              responseData = response.data;
              console.log(`${entityName} data found as direct array`);
            }
            // Format 3: { data: [...] } (no success flag)
            else if (response.data.data && Array.isArray(response.data.data)) {
              responseData = response.data.data;
              console.log(`${entityName} data found in data property without success flag`);
            }
            // No valid data format found
            else {
              console.error(`${entityName} data not found in any expected format`);
              responseData = [];
            }

            if (Array.isArray(responseData) && responseData.length > 0) {
              console.log(`${entityName} fetched from API: ${responseData.length} items`);
              console.log(`${entityName} first few items:`, responseData.slice(0, 3));

              // Log detailed information about the first item
              const firstItem = responseData[0];
              console.log(`First ${entityName} item details:`, firstItem);
              if (entityName === 'Products') {
                console.log(`Product category_id:`, firstItem.category_id, `(${typeof firstItem.category_id})`);
                console.log(`Product category_name:`, firstItem.category_name);
              }

              // Process the data before setting state
              if (entityName === 'Products') {
                // Ensure all products have consistent category_id format
                const processedData = responseData.map(product => ({
                  ...product,
                  // Ensure category_id is available as both number and string
                  category_id: product.category_id,
                  category_id_str: product.category_id ? String(product.category_id) : null,
                  // Ensure category_name is available
                  category_name: product.category_name || 'Uncategorized'
                }));
                console.log(`Processed ${processedData.length} products with consistent category format`);
                setStateFn(processedData);
              } else {
                setStateFn(responseData);
              }

              // Save to localStorage as backup
              try {
                const dataToSave = entityName === 'Products' ?
                  responseData.map(product => ({
                    ...product,
                    category_id_str: product.category_id ? String(product.category_id) : null,
                    category_name: product.category_name || 'Uncategorized'
                  })) :
                  responseData;

                localStorage.setItem(`twania_${localStorageKey}`, JSON.stringify(dataToSave));
                console.log(`${entityName} saved to localStorage (${dataToSave.length} items)`);
              } catch (storageError) {
                console.warn(`Could not save ${entityName} to localStorage:`, storageError.message);
              }

              return true;
            } else {
              console.error(`${entityName} data is empty or not an array:`, responseData);
            }
          } else {
            console.error(`Invalid ${entityName} response:`, response);
          }

          // If we get here, we didn't get valid data
          console.warn(`Invalid ${entityName} data from API:`, response?.data);
          return false;
        } catch (error) {
          console.error(`Error fetching ${entityName}:`, error);
          console.error(`${entityName} error details:`, error.response?.data || 'No response data');
          console.error(`${entityName} error status:`, error.response?.status);

          // If we're specifically refreshing products, don't fall back to localStorage
          if (entityName === 'Products' && forceRefresh) {
            console.log('Skipping localStorage fallback for products during forced refresh');
            console.log(`Setting empty array for ${entityName}`);
            setStateFn([]);
            return false;
          }

          // Try to load from localStorage as a last resort
          try {
            const savedData = localStorage.getItem(`twania_${localStorageKey}`);
            if (savedData) {
              const parsedData = JSON.parse(savedData);
              if (Array.isArray(parsedData) && parsedData.length > 0) {
                console.log(`Using ${parsedData.length} ${entityName} from localStorage as fallback`);
                setStateFn(parsedData);
                return true;
              }
            }
          } catch (storageError) {
            console.warn(`Error loading ${entityName} from localStorage:`, storageError.message);
          }

          // If we get here, we couldn't get data from API or localStorage
          // Set an empty array to prevent null/undefined errors
          console.log(`Setting empty array for ${entityName}`);
          setStateFn([]);
          return false;
        }
      };

      // Fetch all data sequentially to avoid overwhelming the server
      // This helps prevent the looping behavior
      console.log('Fetching data sequentially to avoid overwhelming the server...');

      // Track which entities we've already tried to fetch to prevent duplicate requests
      const fetchedEntities = new Set();

      // Fetch categories first if not already fetched
      let categoryResult = false;
      if (!fetchedEntities.has('categories')) {
        console.log('Starting categories fetch...');
        // Try to fetch categories with counts first
        try {
          console.log('Fetching categories with counts...');
          const categoriesWithCountsResponse = await categoryService.getCategoriesWithCounts(forceRefresh);
          if (categoriesWithCountsResponse && categoriesWithCountsResponse.data) {
            console.log('Categories with counts fetched successfully:', categoriesWithCountsResponse.data.length || 0, 'categories');
            setCategories(categoriesWithCountsResponse.data);
            categoryResult = true;
          } else {
            console.log('Categories with counts response invalid, trying frontend categories');
            try {
              console.log('Fetching frontend categories...');
              const frontendCategoriesResponse = await categoryService.getFrontendCategories(forceRefresh);
              if (frontendCategoriesResponse && frontendCategoriesResponse.data) {
                console.log('Frontend categories fetched successfully:', frontendCategoriesResponse.data.length || 0, 'categories');
                setCategories(frontendCategoriesResponse.data);
                categoryResult = true;
              } else {
                console.log('Frontend categories response invalid, falling back to regular categories');
                categoryResult = await fetchWithFallback(
                  categoryService.getCategories,
                  setCategories,
                  'categories',
                  'Categories'
                );
              }
            } catch (error) {
              console.error('Error fetching frontend categories:', error.message);
              console.log('Falling back to regular categories endpoint');
              categoryResult = await fetchWithFallback(
                categoryService.getCategories,
                setCategories,
                'categories',
                'Categories'
              );
            }
          }
        } catch (error) {
          console.error('Error fetching categories with counts:', error.message);
          console.log('Falling back to frontend categories endpoint');
          try {
            console.log('Fetching frontend categories...');
            const frontendCategoriesResponse = await categoryService.getFrontendCategories(forceRefresh);
            if (frontendCategoriesResponse && frontendCategoriesResponse.data) {
              console.log('Frontend categories fetched successfully:', frontendCategoriesResponse.data.length || 0, 'categories');
              setCategories(frontendCategoriesResponse.data);
              categoryResult = true;
            } else {
              console.log('Frontend categories response invalid, falling back to regular categories');
              categoryResult = await fetchWithFallback(
                categoryService.getCategories,
                setCategories,
                'categories',
                'Categories'
              );
            }
          } catch (error) {
            console.error('Error fetching frontend categories:', error.message);
            console.log('Falling back to regular categories endpoint');
            categoryResult = await fetchWithFallback(
              categoryService.getCategories,
              setCategories,
              'categories',
              'Categories'
            );
          }
        }
        fetchedEntities.add('categories');
        console.log('Categories fetch complete, result:', categoryResult);
      } else {
        console.log('Categories already fetched, skipping');
      }

      // Wait a moment before fetching products
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Fetch products if not already fetched
      let productResult = false;
      if (!fetchedEntities.has('products')) {
        console.log('Starting products fetch...');
        productResult = await fetchWithFallback(
          productService.getProducts,
          setProducts,
          'products',
          'Products'
        );
        fetchedEntities.add('products');
        console.log('Products fetch complete, result:', productResult);
      } else {
        console.log('Products already fetched, skipping');
      }

      // Wait a moment before fetching warehouse inventory
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Fetch warehouse inventory if not already fetched
      let warehouseResult = false;
      if (!fetchedEntities.has('warehouse')) {
        console.log('Starting warehouse inventory fetch...');
        warehouseResult = await fetchWithFallback(
          warehouseService.getInventory,
          setWarehouseInventory,
          'warehouse',
          'Warehouse inventory'
        );
        fetchedEntities.add('warehouse');
        console.log('Warehouse inventory fetch complete, result:', warehouseResult);
      } else {
        console.log('Warehouse inventory already fetched, skipping');
      }

      // Wait a moment before fetching stores
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Fetch stores if not already fetched
      let storeResult = false;
      if (!fetchedEntities.has('stores')) {
        console.log('Starting stores fetch...');
        storeResult = await fetchWithFallback(
          storeService.getStores,
          setStores,
          'stores',
          'Stores'
        );
        fetchedEntities.add('stores');
        console.log('Stores fetch complete, result:', storeResult);
      } else {
        console.log('Stores already fetched, skipping');
      }

      // Combine results
      const results = [productResult, categoryResult, warehouseResult, storeResult];

      // Update last sync time
      setLastSyncTime(new Date());
      if (showLogs) console.log('Data sync completed at:', new Date().toLocaleTimeString());

      // Check if any fetches failed
      if (results.some(result => !result)) {
        setSyncError('Some data could not be fetched from the server. Using cached data where available.');
      }
    } catch (error) {
      console.error('Error syncing data with API:', error.message);
      setSyncError('Failed to sync with database. Using cached data.');
    } finally {
      // Clear the timeout to prevent memory leaks
      clearTimeout(syncTimeout);
      setIsSyncing(false);
      fetchInProgress.current = false;
      console.log('Sync completed, isSyncing and fetchInProgress set to false');
    }
  };

  // Initial data fetch on component mount - only if localStorage is empty
  // Use a ref to track if we've already done the initial fetch to prevent multiple fetches
  const initialFetchDone = React.useRef(false);
  const fetchInProgress = React.useRef(false);

  useEffect(() => {
    // Skip if we've already done the initial fetch or if a fetch is in progress
    if (initialFetchDone.current || fetchInProgress.current) {
      console.log('Initial fetch already done or in progress, skipping');
      return;
    }

    // Only force refresh if we don't have data in localStorage
    const hasLocalData = localStorage.getItem('twania_products') || localStorage.getItem('twania_categories');
    if (!hasLocalData) {
      console.log('No local data found, fetching from API...');
      // Add a slight delay before initial data fetch to ensure the app is fully loaded
      fetchInProgress.current = true;
      const timer = setTimeout(() => {
        initialFetchDone.current = true;
        forceRefreshData().finally(() => {
          fetchInProgress.current = false;
        });
      }, 2000); // Increased delay to 2 seconds to avoid race conditions

      // Clean up the timer to prevent memory leaks
      return () => clearTimeout(timer);
    } else {
      console.log('Using cached data from localStorage');
      initialFetchDone.current = true;
    }
  }, []); // Empty dependency array ensures this only runs once

  // IMPORTANT: We've disabled automatic polling to prevent excessive API calls
  // Manual refresh can be triggered with the Sync Now button or forceRefreshData()

  // Disable automatic periodic sync with the database to prevent infinite loops
  // Manual refresh can be triggered with forceRefreshData() instead

  // Log initial state and save data to localStorage when it changes
  useEffect(() => {
    console.log('DemoDataProvider initialized with:');
    console.log('- Products:', products.length);
    console.log('- Categories:', categories.length);
    console.log('- Categories data:', categories);
    console.log('- Stores:', stores.length);

    // Save to localStorage
    try {
      localStorage.setItem('twania_products', JSON.stringify(products));
      console.log('Products saved to localStorage');
    } catch (err) {
      console.error('Error saving products to localStorage:', err);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('twania_categories', JSON.stringify(categories));
      console.log('Categories saved to localStorage');
    } catch (err) {
      console.error('Error saving categories to localStorage:', err);
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem('twania_stores', JSON.stringify(stores));
      console.log('Stores saved to localStorage');
    } catch (err) {
      console.error('Error saving stores to localStorage:', err);
    }
  }, [stores]);

  // Function to add a new product
  const addProduct = async (product) => {
    console.log('Adding new product:', product);

    try {
      // Format the product data for API
      const productData = {
        ...product,
        // Ensure these fields are properly formatted
        price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
        // Handle category ID consistently
        category_id: product.category_id || product.category || null,
        // Also store string version for consistent comparison
        category_id_str: product.category_id_str || (product.category_id ? String(product.category_id) : null) || (product.category ? String(product.category) : null),
        image: product.image || 'https://via.placeholder.com/300x200?text=Product+Image',
        // Add stock information if not provided
        stock: product.stock || { warehouse: 0, stores: {} }
      };

      console.log('Category ID being set:', productData.category_id, 'Type:', typeof productData.category_id);
      console.log('Category ID string being set:', productData.category_id_str, 'Type:', typeof productData.category_id_str);

      console.log('Sending product data to API:', productData);

      // Send the product to the API
      const response = await productService.createProduct(productData);
      console.log('API response:', response);

      if (response.data && response.data.success) {
        const newProduct = response.data.data;
        console.log('Product created successfully:', newProduct);

        // Add the product to the state
        setProducts(prevProducts => [...prevProducts, newProduct]);

        // No need to trigger a sync here - the state is already updated

        return newProduct;
      } else {
        console.error('Failed to create product:', response.data?.message || 'Unknown error');

        // Fallback to local state if API fails
        const newId = (products.length + 1).toString();
        const newProduct = {
          ...productData,
          id: newId,
          created_at: new Date().toISOString().split('T')[0],
          // Ensure category IDs are consistent
          category_id: productData.category_id || null,
          category_id_str: productData.category_id_str || (productData.category_id ? String(productData.category_id) : null),
        };
        setProducts(prevProducts => [...prevProducts, newProduct]);
        return newProduct;
      }
    } catch (error) {
      console.error('Error creating product:', error);

      // Fallback to local state if API fails
      const newId = (products.length + 1).toString();
      const newProduct = {
        ...product,
        id: newId,
        created_at: new Date().toISOString().split('T')[0],
        price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
        // Handle category ID consistently
        category_id: product.category_id || product.category || null,
        // Also store string version for consistent comparison
        category_id_str: product.category_id_str || (product.category_id ? String(product.category_id) : null) || (product.category ? String(product.category) : null),
        image: product.image || 'https://via.placeholder.com/300x200?text=Product+Image'
      };

      console.log('Fallback - Category ID being set:', newProduct.category_id, 'Type:', typeof newProduct.category_id);
      console.log('Fallback - Category ID string being set:', newProduct.category_id_str, 'Type:', typeof newProduct.category_id_str);
      setProducts(prevProducts => [...prevProducts, newProduct]);
      return newProduct;
    }
  };

  // Function to update a product
  const updateProduct = async (id, updatedProduct) => {
    console.log('Updating product with ID:', id, updatedProduct);

    try {
      // Format the updated product data
      const formattedUpdate = {
        ...updatedProduct,
        // Ensure these fields are properly formatted
        price: typeof updatedProduct.price === 'string' ? parseFloat(updatedProduct.price) : updatedProduct.price,
        category_id: updatedProduct.category || updatedProduct.category_id
      };

      console.log('Sending updated product data to API:', formattedUpdate);

      // Send the updated product to the API
      const response = await productService.updateProduct(id, formattedUpdate);
      console.log('API response:', response);

      let updatedProductData;

      if (response.data && response.data.success) {
        updatedProductData = response.data.data;
        console.log('Product updated successfully:', updatedProductData);

        // Update the product in the state
        const updatedProducts = products.map(product =>
          product.id === id ? { ...product, ...updatedProductData } : product
        );

        // Update products state
        setProducts(updatedProducts);

        // Return the updated product data
        return updatedProductData;
      } else {
        console.error('Failed to update product:', response.data?.message || 'Unknown error');

        // Fallback to local state if API fails
        const updatedProducts = products.map(product =>
          product.id === id ? { ...product, ...formattedUpdate } : product
        );

        updatedProductData = updatedProducts.find(product => product.id === id);
        console.log('Updated product locally:', updatedProductData);

        // Update products state
        setProducts(updatedProducts);

        // Return the locally updated product data
        return updatedProductData;
      }
    } catch (error) {
      console.error('Error updating product:', error);

      // Fallback to local state if API fails
      const formattedUpdate = {
        ...updatedProduct,
        price: typeof updatedProduct.price === 'string' ? parseFloat(updatedProduct.price) : updatedProduct.price,
        category_id: updatedProduct.category || updatedProduct.category_id
      };

      const updatedProducts = products.map(product =>
        product.id === id ? { ...product, ...formattedUpdate } : product
      );

      const updatedProductData = updatedProducts.find(product => product.id === id);
      console.log('Updated product locally after error:', updatedProductData);

      // Update products state
      setProducts(updatedProducts);

      // Return the locally updated product data
      return updatedProductData;
    }
  };  // End of updateProduct function

  // Function to sync product stock with warehouse inventory
  const syncProductStock = (id, stock) => {
    if (stock && stock.warehouse !== undefined) {
      console.log(`Syncing product ${id} stock with warehouse inventory:`, stock);
      const warehouseStock = stock.warehouse;

      // Check if product exists in warehouse inventory
      const existingItem = warehouseInventory.find(item => item.productId === id);

      if (existingItem) {
        // Update existing warehouse inventory item
        updateWarehouseInventory(id, warehouseStock);
      } else if (warehouseStock > 0) {
        // Create new warehouse inventory item if stock is greater than 0
        const product = products.find(p => p.id === id);
        if (!product) {
          console.error(`Product with ID ${id} not found in products array`);
          return null;
        }
        const newInventoryItem = {
          id: `inv-${Date.now()}`,
          productId: id,
          productName: product.name,
          quantity: warehouseStock,
          location: 'A1', // Default location
          lastUpdated: new Date().toISOString().split('T')[0]
        };

        // Add to warehouse inventory
        setWarehouseInventory([...warehouseInventory, newInventoryItem]);

        // Save to localStorage
        try {
          localStorage.setItem('twania_warehouseInventory', JSON.stringify([...warehouseInventory, newInventoryItem]));
        } catch (err) {
          console.error('Error saving warehouse inventory to localStorage:', err);
        }
      }
    }

    // Save updated products to localStorage
    try {
      localStorage.setItem('twania_products', JSON.stringify(products));
    } catch (err) {
      console.error('Error saving products to localStorage:', err);
    }

    return products.find(product => product.id === id);
  };

  // Function to delete a product
  const deleteProduct = async (id) => {
    console.log('Deleting product with ID:', id);

    try {
      console.log('Sending delete request to API for product ID:', id);

      // Send the delete request to the API
      const response = await productService.deleteProduct(id);
      console.log('API response:', response);

      if (response.data && response.data.success) {
        console.log('Product deleted successfully on the server');

        // Remove the product from the state
        const updatedProducts = products.filter(product => product.id !== id);
        console.log(`Product deleted. Products count: ${updatedProducts.length}`);

        // Update the state
        setProducts(updatedProducts);

        // No need to trigger a sync here - the state is already updated

        return true;
      } else {
        console.error('Failed to delete product:', response.data?.message || 'Unknown error');

        // If the API call fails but it's safe to delete locally, do so
        const updatedProducts = products.filter(product => product.id !== id);
        setProducts(updatedProducts);

        // Persist to localStorage as fallback
        try {
          localStorage.setItem('twania_products', JSON.stringify(updatedProducts));
          console.log('Updated products saved to localStorage (fallback)');
        } catch (err) {
          console.error('Error saving products to localStorage:', err);
        }

        return true;
      }
    } catch (error) {
      console.error('Error deleting product:', error);

      // If the API call fails but it's safe to delete locally, do so
      const updatedProducts = products.filter(product => product.id !== id);
      setProducts(updatedProducts);

      // Persist to localStorage as fallback
      try {
        localStorage.setItem('twania_products', JSON.stringify(updatedProducts));
        console.log('Updated products saved to localStorage (fallback after error)');
      } catch (err) {
        console.error('Error saving products to localStorage:', err);
      }

      return true;
    }
  };

  // Function to reset categories
  const resetCategories = async () => {
    console.log('Resetting categories...');

    try {
      // Show syncing state
      setIsSyncing(true);
      setSyncError(null);

      // Call the API to reset categories
      const response = await categoryService.resetCategories();
      console.log('Reset categories response:', response);

      if (response.data && response.data.success) {
        console.log('Categories reset successfully');

        // Update the local state with the new categories
        if (response.data.data && Array.isArray(response.data.data)) {
          setCategories(response.data.data);
          console.log(`Updated categories with ${response.data.data.length} items`);

          // Save to localStorage
          try {
            localStorage.setItem('twania_categories', JSON.stringify(response.data.data));
            console.log('Categories saved to localStorage');
          } catch (storageError) {
            console.error('Error saving categories to localStorage:', storageError);
          }

          // Refresh products to ensure they have the correct category names
          await fetchWithFallback(productService.getProducts, setProducts, 'products', 'Products');

          setLastSyncTime(new Date());
          return true;
        } else {
          console.error('Invalid categories data in response:', response.data);
          setSyncError('Invalid categories data received');
          return false;
        }
      } else {
        console.error('Failed to reset categories:', response.data?.message || 'Unknown error');
        setSyncError(response.data?.message || 'Failed to reset categories');
        return false;
      }
    } catch (error) {
      console.error('Error resetting categories:', error);
      setSyncError('Error resetting categories: ' + error.message);
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  // Function to add a new category
  const addCategory = async (category) => {
    console.log('Adding new category:', category);

    try {
      // Format the category data for API
      const categoryData = {
        ...category
      };

      console.log('Sending category data to API:', categoryData);

      // Send the category to the API
      const response = await categoryService.createCategory(categoryData);
      console.log('API response:', response);

      if (response.data && response.data.success) {
        const newCategory = response.data.data;
        console.log('Category created successfully:', newCategory);

        // Add the category to the state
        const updatedCategories = [...categories, newCategory];
        setCategories(updatedCategories);

        // Persist to localStorage
        try {
          localStorage.setItem('twania_categories', JSON.stringify(updatedCategories));
          console.log('Updated categories saved to localStorage');
        } catch (err) {
          console.error('Error saving categories to localStorage:', err);
        }

        // No need to trigger a sync here - the state is already updated

        return newCategory;
      } else {
        console.error('Failed to create category:', response.data?.message || 'Unknown error');

        // Fallback to local state if API fails
        const newId = (categories.length + 1).toString();
        const newCategory = {
          ...category,
          id: newId
        };

        const updatedCategories = [...categories, newCategory];
        setCategories(updatedCategories);

        // Persist to localStorage as fallback
        try {
          localStorage.setItem('twania_categories', JSON.stringify(updatedCategories));
          console.log('Updated categories saved to localStorage (fallback)');
        } catch (err) {
          console.error('Error saving categories to localStorage:', err);
        }

        return newCategory;
      }
    } catch (error) {
      console.error('Error creating category:', error);

      // Fallback to local state if API fails
      const newId = (categories.length + 1).toString();
      const newCategory = {
        ...category,
        id: newId
      };

      const updatedCategories = [...categories, newCategory];
      setCategories(updatedCategories);

      // Persist to localStorage as fallback
      try {
        localStorage.setItem('twania_categories', JSON.stringify(updatedCategories));
        console.log('Updated categories saved to localStorage (fallback after error)');
      } catch (err) {
        console.error('Error saving categories to localStorage:', err);
      }

      return newCategory;
    }
  };

  // Function to update a category
  const updateCategory = async (id, updatedCategory) => {
    console.log('Updating category with ID:', id, updatedCategory);

    try {
      // Format the category data for API
      const categoryData = {
        ...updatedCategory
      };

      console.log('Sending updated category data to API:', categoryData);

      // Send the updated category to the API
      const response = await categoryService.updateCategory(id, categoryData);
      console.log('API response:', response);

      if (response.data && response.data.success) {
        const updatedCategoryData = response.data.data;
        console.log('Category updated successfully:', updatedCategoryData);

        // Update the category in the state
        const updatedCategories = categories.map(category =>
          category.id === id ? { ...category, ...updatedCategoryData } : category
        );

        // Update the state
        setCategories(updatedCategories);

        // No need to trigger a sync here - the state is already updated

        return updatedCategories.find(category => category.id === id);
      } else {
        console.error('Failed to update category:', response.data?.message || 'Unknown error');

        // Fallback to local state if API fails
        const updatedCategories = categories.map(category =>
          category.id === id ? { ...category, ...updatedCategory } : category
        );

        console.log('Updated category locally:', updatedCategories.find(category => category.id === id));

        // Update the state
        setCategories(updatedCategories);

        // Persist to localStorage as fallback
        try {
          localStorage.setItem('twania_categories', JSON.stringify(updatedCategories));
          console.log('Updated categories saved to localStorage (fallback)');
        } catch (err) {
          console.error('Error saving categories to localStorage:', err);
        }

        return updatedCategories.find(category => category.id === id);
      }
    } catch (error) {
      console.error('Error updating category:', error);

      // Fallback to local state if API fails
      const updatedCategories = categories.map(category =>
        category.id === id ? { ...category, ...updatedCategory } : category
      );

      console.log('Updated category locally after error:', updatedCategories.find(category => category.id === id));

      // Update the state
      setCategories(updatedCategories);

      // Persist to localStorage as fallback
      try {
        localStorage.setItem('twania_categories', JSON.stringify(updatedCategories));
        console.log('Updated categories saved to localStorage (fallback after error)');
      } catch (err) {
        console.error('Error saving categories to localStorage:', err);
      }

      return updatedCategories.find(category => category.id === id);
    }
  };

  // Function to delete a category
  const deleteCategory = async (id) => {
    console.log('Deleting category with ID:', id);

    // Check if category has subcategories
    const hasSubcategories = categories.some(category => category.parentId === id);

    if (hasSubcategories) {
      console.warn('Cannot delete category with subcategories');
      return false;
    }

    // Check if category is used by any products
    const isUsedByProducts = products.some(product => product.category_id === id);

    if (isUsedByProducts) {
      console.warn('Cannot delete category used by products');
      return false;
    }

    try {
      console.log('Sending delete request to API for category ID:', id);

      // Send the delete request to the API
      const response = await categoryService.deleteCategory(id);
      console.log('API response:', response);

      if (response.data && response.data.success) {
        console.log('Category deleted successfully on the server');

        // Remove the category from the state
        const updatedCategories = categories.filter(category => category.id !== id);
        console.log(`Category deleted. Categories count: ${updatedCategories.length}`);

        // Update the state
        setCategories(updatedCategories);

        // No need to trigger a sync here - the state is already updated

        return true;
      } else {
        console.error('Failed to delete category:', response.data?.message || 'Unknown error');

        // If the API call fails but it's safe to delete locally, do so
        const updatedCategories = categories.filter(category => category.id !== id);
        setCategories(updatedCategories);

        // Persist to localStorage as fallback
        try {
          localStorage.setItem('twania_categories', JSON.stringify(updatedCategories));
          console.log('Updated categories saved to localStorage (fallback)');
        } catch (err) {
          console.error('Error saving categories to localStorage:', err);
        }

        return true;
      }
    } catch (error) {
      console.error('Error deleting category:', error);

      // If the API call fails but it's safe to delete locally, do so
      const updatedCategories = categories.filter(category => category.id !== id);
      setCategories(updatedCategories);

      // Persist to localStorage as fallback
      try {
        localStorage.setItem('twania_categories', JSON.stringify(updatedCategories));
        console.log('Updated categories saved to localStorage (fallback after error)');
      } catch (err) {
        console.error('Error saving categories to localStorage:', err);
      }

      return true;
    }
  };

  // Function to add a new order
  const addOrder = (order) => {
    const newOrder = {
      ...order,
      id: (orders.length + 1).toString(),
      date: new Date().toISOString().split('T')[0]
    };
    setOrders([...orders, newOrder]);
    return newOrder;
  };

  // Function to update an order
  const updateOrder = (id, updatedOrder) => {
    const updatedOrders = orders.map(order =>
      order.id === id ? { ...order, ...updatedOrder } : order
    );
    setOrders(updatedOrders);
    return updatedOrders.find(order => order.id === id);
  };

  // Function to delete an order
  const deleteOrder = (id) => {
    const updatedOrders = orders.filter(order => order.id !== id);
    setOrders(updatedOrders);
    return true;
  };

  // Function to add a new transfer
  const addTransfer = (transfer) => {
    const newTransfer = {
      ...transfer,
      id: (transfers.length + 1).toString(),
      date: new Date().toISOString().split('T')[0]
    };
    setTransfers([...transfers, newTransfer]);

    // Update warehouse inventory
    if (transfer.fromWarehouse) {
      const updatedWarehouseInventory = [...warehouseInventory];
      transfer.items.forEach(item => {
        const inventoryItem = updatedWarehouseInventory.find(i => i.productId === item.productId);
        if (inventoryItem) {
          inventoryItem.quantity -= item.quantity;
        }
      });
      setWarehouseInventory(updatedWarehouseInventory);
    }

    // Update store inventory
    const storeId = transfer.toStoreId;
    if (storeId && storeInventory[storeId]) {
      const updatedStoreInventory = { ...storeInventory };
      transfer.items.forEach(item => {
        const inventoryItem = updatedStoreInventory[storeId].find(i => i.productId === item.productId);
        if (inventoryItem) {
          inventoryItem.quantity += item.quantity;
        } else {
          updatedStoreInventory[storeId].push({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity
          });
        }
      });
      setStoreInventory(updatedStoreInventory);
    }

    return newTransfer;
  };

  // Function to update warehouse inventory
  const updateWarehouseInventory = async (productId, quantity) => {
    console.log(`Updating warehouse inventory for product ${productId} to quantity ${quantity}`);

    try {
      // Prepare data for API
      const inventoryData = {
        productId,
        quantity,
        location: 'Warehouse' // Default location
      };

      console.log('Sending warehouse inventory update to API:', inventoryData);

      // Send update to API
      const response = await warehouseService.updateInventory(productId, inventoryData);
      console.log('API response:', response);

      if (response.data && response.data.success) {
        console.log('Warehouse inventory updated successfully on the server');

        // Update warehouse inventory in state
        const updatedWarehouseInventory = warehouseInventory.map(item =>
          item.productId === productId ? { ...item, quantity } : item
        );
        setWarehouseInventory(updatedWarehouseInventory);

        // Also update the product's stock property to keep them in sync
        const updatedProducts = products.map(product => {
          if (product.id === productId) {
            // Create or update the stock object
            const currentStock = product.stock || {};
            return {
              ...product,
              stock: {
                ...currentStock,
                warehouse: quantity
              }
            };
          }
          return product;
        });

        // Update products state
        setProducts(updatedProducts);
        console.log(`Updated product stock for product ${productId}`);

        // No need to trigger a sync here - the state is already updated

        return updatedWarehouseInventory.find(item => item.productId === productId);
      } else {
        console.error('Failed to update warehouse inventory:', response.data?.message || 'Unknown error');

        // Fallback to local state if API fails
        const updatedWarehouseInventory = warehouseInventory.map(item =>
          item.productId === productId ? { ...item, quantity } : item
        );
        setWarehouseInventory(updatedWarehouseInventory);

        const updatedProducts = products.map(product => {
          if (product.id === productId) {
            const currentStock = product.stock || {};
            return {
              ...product,
              stock: {
                ...currentStock,
                warehouse: quantity
              }
            };
          }
          return product;
        });

        setProducts(updatedProducts);

        // Save to localStorage as fallback
        try {
          localStorage.setItem('twania_products', JSON.stringify(updatedProducts));
          localStorage.setItem('twania_warehouseInventory', JSON.stringify(updatedWarehouseInventory));
          console.log('Updated inventory saved to localStorage (fallback)');
        } catch (err) {
          console.error('Error saving to localStorage:', err);
        }

        return updatedWarehouseInventory.find(item => item.productId === productId);
      }
    } catch (error) {
      console.error('Error updating warehouse inventory:', error);

      // Fallback to local state if API fails
      const updatedWarehouseInventory = warehouseInventory.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      );
      setWarehouseInventory(updatedWarehouseInventory);

      const updatedProducts = products.map(product => {
        if (product.id === productId) {
          const currentStock = product.stock || {};
          return {
            ...product,
            stock: {
              ...currentStock,
              warehouse: quantity
            }
          };
        }
        return product;
      });

      setProducts(updatedProducts);

      // Save to localStorage as fallback
      try {
        localStorage.setItem('twania_products', JSON.stringify(updatedProducts));
        localStorage.setItem('twania_warehouseInventory', JSON.stringify(updatedWarehouseInventory));
        console.log('Updated inventory saved to localStorage (fallback after error)');
      } catch (err) {
        console.error('Error saving to localStorage:', err);
      }

      return updatedWarehouseInventory.find(item => item.productId === productId);
    }
  };

  // Function to update store inventory
  const updateStoreInventory = (storeId, productId, quantity) => {
    if (!storeInventory[storeId]) return null;

    const updatedStoreInventory = { ...storeInventory };
    const inventoryItem = updatedStoreInventory[storeId].find(item => item.productId === productId);

    if (inventoryItem) {
      inventoryItem.quantity = quantity;
    } else {
      const product = products.find(p => p.id === productId);
      if (product) {
        updatedStoreInventory[storeId].push({
          productId,
          productName: product.name,
          quantity
        });
      }
    }

    setStoreInventory(updatedStoreInventory);
    return updatedStoreInventory[storeId].find(item => item.productId === productId);
  };

  // Function to add a new store
  const addStore = (store) => {
    const newStore = {
      ...store,
      id: (stores.length + 1).toString()
    };
    setStores([...stores, newStore]);
    return newStore;
  };

  // Function to update a store
  const updateStore = (id, updatedStore) => {
    const updatedStores = stores.map(store =>
      store.id === id ? { ...store, ...updatedStore } : store
    );
    setStores(updatedStores);
    return updatedStores.find(store => store.id === id);
  };

  // Function to delete a store
  const deleteStore = (id) => {
    const updatedStores = stores.filter(store => store.id !== id);
    setStores(updatedStores);
    return true;
  };

  // Function to add a new user
  const addUser = (user) => {
    const newUser = {
      ...user,
      id: (users.length + 1).toString(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setUsers([...users, newUser]);
    return newUser;
  };

  // Function to update a user
  const updateUser = (id, updatedUser) => {
    const updatedUsers = users.map(user =>
      user.id === id ? { ...user, ...updatedUser } : user
    );
    setUsers(updatedUsers);
    return updatedUsers.find(user => user.id === id);
  };

  // Function to delete a user
  const deleteUser = (id) => {
    const updatedUsers = users.filter(user => user.id !== id);
    setUsers(updatedUsers);
    return true;
  };

  // Function to reset demo data to initial state
  const resetDemoData = () => {
    console.log('Resetting demo data to initial state');

    // Reset all data to initial state
    setProducts(getDemoProducts());
    setCategories(getDemoCategories());
    setWarehouseInventory(demoData.warehouseInventory || []);
    setStores(demoData.stores || []);
    setStoreInventory(demoData.storeInventory || []);
    setOrders(demoData.orders || []);
    setUsers(demoData.users || []);
    setTransfers(demoData.transfers || []);
    setReports(demoData.reports || []);
    setSettings(demoData.settings || {});

    // Clear localStorage
    try {
      localStorage.removeItem('twania_products');
      localStorage.removeItem('twania_categories');
      localStorage.removeItem('twania_stores');
      localStorage.removeItem('twania_warehouseInventory');
      localStorage.removeItem('twania_storeInventory');
      localStorage.removeItem('twania_orders');
      localStorage.removeItem('twania_users');
      localStorage.removeItem('twania_transfers');
      localStorage.removeItem('twania_reports');
      localStorage.removeItem('twania_settings');

      console.log('Demo data reset complete');
    } catch (err) {
      console.error('Error clearing localStorage:', err);
    }

    return true;
  };

  // Note: forceRefreshData is already defined above

  // Value object to be provided to consumers
  const value = {
    // Data
    categories,
    products,
    warehouseInventory,
    stores,
    storeInventory,
    orders,
    users,
    transfers,
    reports,
    settings,

    // Sync status
    lastSyncTime,
    isSyncing,
    syncError,
    syncInterval,
    setSyncInterval,
    fetchDataFromAPI,
    forceRefreshData,

    // Functions
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory,
    resetCategories,
    addOrder,
    updateOrder,
    deleteOrder,
    addTransfer,
    updateWarehouseInventory,
    updateStoreInventory,
    addStore,
    updateStore,
    deleteStore,
    addUser,
    updateUser,
    deleteUser,
    resetDemoData
  };

  return (
    <DemoDataContext.Provider value={value}>
      {children}
    </DemoDataContext.Provider>
  );
};

export default DemoDataContext;
