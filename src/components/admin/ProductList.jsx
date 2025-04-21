import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDemoData } from '../../context/DemoDataContext';
import { clearProductsFromStorage } from '../../utils/clearProducts';
import { getApiUrl } from '../../utils/apiConfig';
import axios from 'axios';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [clearSuccess, setClearSuccess] = useState(false);

  // Get location to access URL query parameters
  const location = useLocation();
  const navigate = useNavigate();

  // Get demo data from context
  const { products: demoProducts, categories: demoCategories, deleteProduct, forceRefreshData } = useDemoData();

  // Function to fetch products directly from the API
  const fetchProductsFromAPI = async () => {
    // If a fetch is already in progress, return an empty array
    if (fetchInProgress.current) {
      console.log('Fetch already in progress, skipping fetchProductsFromAPI');
      return [];
    }

    try {
      console.log('Fetching products directly from API...');
      // Set fetchInProgress to true to prevent duplicate requests
      fetchInProgress.current = true;

      // Add a timestamp to prevent caching
      const timestamp = new Date().getTime();
      console.log('API URL:', getApiUrl('admin/products'));
      const response = await axios.get(`${getApiUrl('admin/products')}?_=${timestamp}`);
      console.log('API response:', response.data);

      if (Array.isArray(response.data)) {
        console.log(`Fetched ${response.data.length} products from API`);
        return response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        console.log(`Fetched ${response.data.data.length} products from API (nested data)`);
        return response.data.data;
      } else {
        console.error('API response is not an array:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching products from API:', error.message);
      // Log more details about the error
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Error request:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
      }
      return [];
    } finally {
      // Set a timeout to clear the fetchInProgress flag after 1 second
      // This prevents the app from getting stuck if there's an error
      setTimeout(() => {
        fetchInProgress.current = false;
      }, 1000);
    }
  };

  // Function to fetch categories directly from the API
  const fetchCategoriesFromAPI = async () => {
    // If a fetch is already in progress, return an empty array
    if (fetchInProgress.current) {
      console.log('Fetch already in progress, skipping fetchCategoriesFromAPI');
      return [];
    }

    try {
      console.log('Fetching categories directly from API...');
      // We don't set fetchInProgress here because it's already set in fetchProductsFromAPI
      // and we want to allow both to run in parallel

      // Add a timestamp to prevent caching
      const timestamp = new Date().getTime();
      console.log('Categories API URL:', getApiUrl('admin/categories'));
      const response = await axios.get(`${getApiUrl('admin/categories')}?_=${timestamp}`);
      console.log('Categories API response:', response.data);

      if (Array.isArray(response.data)) {
        console.log(`Fetched ${response.data.length} categories from API`);
        return response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        console.log(`Fetched ${response.data.data.length} categories from API (nested data)`);
        return response.data.data;
      } else {
        console.error('Categories API response is not an array:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching categories from API:', error.message);
      // Log more details about the error
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Error request:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
      }
      return [];
    }
  };

  // State for API categories
  const [apiCategories, setApiCategories] = useState([]);

  // Parse query parameters to get category filter
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const categoryId = queryParams.get('category');

    if (categoryId) {
      setCategoryFilter(categoryId);

      // Find category name for display - first try API categories, then fall back to demo categories
      const category = apiCategories.find(cat => cat.id === categoryId || cat.id === parseInt(categoryId)) ||
                      demoCategories.find(cat => cat.id === categoryId || cat.id === parseInt(categoryId));
      setCategoryName(category ? category.name : 'Unknown Category');
    } else {
      setCategoryFilter(null);
      setCategoryName('');
    }
  }, [location.search, demoCategories, apiCategories]);

  // We don't need this effect anymore as it's causing duplicate API calls
  // The initial data fetch in the mount effect is sufficient

  // Use a ref to track if we've already fetched data
  const initialFetchDone = useRef(false);
  const fetchInProgress = useRef(false);

  // Fetch data on component mount only - with proper controls to prevent duplicate fetches
  useEffect(() => {
    // Skip if we've already done the initial fetch or if a fetch is in progress
    if (initialFetchDone.current || fetchInProgress.current) {
      console.log('Initial fetch already done or in progress, skipping');
      return;
    }

    console.log('ProductList component mounted, fetching products and categories from API');

    // Use a flag to prevent multiple fetches
    let isMounted = true;

    const fetchInitialData = async () => {
      // Set fetchInProgress to true to prevent duplicate requests
      fetchInProgress.current = true;

      try {
        // Initial fetch of products
        const apiProducts = await fetchProductsFromAPI();
        if (isMounted && apiProducts && apiProducts.length > 0) {
          console.log(`Setting ${apiProducts.length} products from API on mount`);
          setProducts(apiProducts);
          setLoading(false); // Set loading to false once we have products
          // Mark initial fetch as done
          initialFetchDone.current = true;
        } else if (isMounted) {
          console.log('Initial API fetch failed, forcing refresh from database');
          await forceRefreshData();
          // Try fetching products again after forcing refresh
          const refreshedProducts = await fetchProductsFromAPI();
          if (isMounted && refreshedProducts && refreshedProducts.length > 0) {
            console.log(`Setting ${refreshedProducts.length} products after refresh`);
            setProducts(refreshedProducts);
          } else {
            // If still no products, use demo data as fallback
            console.log('Using demo products as fallback');
            setProducts(demoProducts);
          }
          setLoading(false); // Set loading to false
          // Mark initial fetch as done even if it failed
          initialFetchDone.current = true;
        }

        // Initial fetch of categories
        const categories = await fetchCategoriesFromAPI();
        if (isMounted && categories && categories.length > 0) {
          console.log(`Setting ${categories.length} categories from API on mount`);
          setApiCategories(categories);
        } else if (isMounted) {
          // If no categories from API, use demo categories
          console.log('Using demo categories as fallback');
          setApiCategories(demoCategories);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
        // Use demo data as fallback
        if (isMounted) {
          console.log('Using demo data as fallback due to error');
          setProducts(demoProducts);
          setApiCategories(demoCategories);
          setLoading(false);
        }
        // Mark initial fetch as done even if it failed
        initialFetchDone.current = true;
      } finally {
        // Clear the fetchInProgress flag
        fetchInProgress.current = false;
      }
    };

    // Add a slight delay before initial fetch to prevent race conditions
    const timer = setTimeout(() => {
      fetchInitialData();
    }, 500);

    // Clean up function
    return () => {
      clearTimeout(timer);
      isMounted = false;
    };
  }, [demoProducts, demoCategories]);

  // Filter products by category if needed
  useEffect(() => {
    if (categoryFilter) {

      const filtered = products.filter(product => {
        // Check both string and number types for category_id
        return product.category_id === categoryFilter ||
               product.category_id === parseInt(categoryFilter) ||
               (product.category && (product.category === categoryFilter || product.category === parseInt(categoryFilter)));
      });
      console.log(`Found ${filtered.length} products in category ${categoryName}`);
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [products, categoryFilter, categoryName]);

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      setLoading(true);

      // Delete the product using the API
      console.log(`Deleting product ${productToDelete.id} via API...`);
      const response = await axios.delete(`${getApiUrl(`admin/products/${productToDelete.id}`)}`);
      console.log('Delete product response:', response.data);

      if (response.data && response.data.success) {
        console.log('Product deleted successfully');
        // Refresh the products list
        const apiProducts = await fetchProductsFromAPI();
        if (apiProducts && apiProducts.length > 0) {
          console.log(`Setting ${apiProducts.length} products from API after delete`);
          setProducts(apiProducts);
        } else {
          // Force refresh data from the database if API fetch fails
          await forceRefreshData();
        }

        setIsDeleteModalOpen(false);
        setProductToDelete(null);
      } else {
        throw new Error(response.data?.message || 'Failed to delete product');
      }
      setLoading(false);
    } catch (err) {
      console.error('Error deleting product:', err);
      setError('Failed to delete product: ' + (err.response?.data?.message || err.message || 'Unknown error'));
      setLoading(false);
    }
  };

  // Function to clear all products from localStorage and refresh from database
  const handleClearProducts = async () => {
    try {
      setLoading(true);
      // Clear products from localStorage
      const success = clearProductsFromStorage();

      if (success) {
        setClearSuccess(true);
        // Show success message briefly
        setTimeout(() => setClearSuccess(false), 3000);

        // Force refresh data from API
        await forceRefreshData();

        // Set loading to false
        setLoading(false);
      }
    } catch (err) {
      console.error('Error clearing products:', err);
      setError('Failed to clear products');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2.5"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2.5"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2.5"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <div className="flex flex-col mb-4 sm:mb-0">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {categoryFilter ? (
              <div className="flex items-center">
                <span>Products in category: </span>
                <span className="ml-2 text-primary-600">{categoryName}</span>
                <button
                  onClick={() => navigate('/admin/products')}
                  className="ml-2 text-xs text-gray-500 hover:text-gray-700 flex items-center"
                  title="Clear filter"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="ml-1">Clear filter</span>
                </button>
              </div>
            ) : (
              'All Products'
            )}
          </h3>
          {categoryFilter && (
            <p className="text-sm text-gray-500 mt-1">
              Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
            </p>
          )}
        </div>
        <div className="flex space-x-2">
          <Link
            to="/admin/products/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Product
          </Link>

          <button
            onClick={handleClearProducts}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
            title="Clear all products from cache and refresh from database"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Clear Products
          </button>
        </div>

        {clearSuccess && (
          <div className="mt-2 text-sm text-green-600 bg-green-100 p-2 rounded">
            Products cleared successfully! Refreshing...
          </div>
        )}
      </div>
      <div className="border-t border-gray-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Image
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.isArray(filteredProducts) && filteredProducts.length > 0 ? filteredProducts.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-10 w-10 rounded-md overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                      }}
                    />
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {product.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${typeof product.price === 'number' ? product.price.toFixed(2) : '0.00'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.category_id ? (
                    <Link
                      to={`/admin/categories/${product.category_id}`}
                      className="text-primary-600 hover:text-primary-900 hover:underline"
                      title="Edit this category"
                    >
                      {product.category_name || 'Category ' + product.category_id}
                    </Link>
                  ) : (
                    'Uncategorized'
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex flex-col">
                    <span>Warehouse: {product.stock ? product.stock.warehouse || 0 : 0}</span>
                    <span className="text-xs text-gray-400">
                      Stores: {product.stock && product.stock.stores ?
                        Object.entries(product.stock.stores).map(([id, qty]) => `${id}: ${qty}`).join(', ') :
                        'None'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    to={`/admin/products/${product.id}`}
                    className="text-primary-600 hover:text-primary-900 mr-4"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteClick(product)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  {categoryFilter ? (
                    <div>
                      <p>No products found in category "{categoryName}"</p>
                      <button
                        onClick={() => navigate('/admin/products')}
                        className="mt-2 text-primary-600 hover:text-primary-800 hover:underline"
                      >
                        View all products
                      </button>
                    </div>
                  ) : (
                    "No products found"
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Delete Product
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete the product "{productToDelete?.name}"? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleDeleteConfirm}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
