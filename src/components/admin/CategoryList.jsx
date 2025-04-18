import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDemoData } from '../../context/DemoDataContext';
import axios from 'axios';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Get categories, products and functions from context
  const {
    categories: demoCategories,
    products: demoProducts,
    deleteCategory: deleteContextCategory,
    resetCategories,
    isSyncing
  } = useDemoData();

  // Get location to detect navigation changes
  const location = useLocation();

  // Function to fetch categories directly from the API
  const fetchCategoriesFromAPI = async () => {
    console.log('Fetching categories directly from API...');

    try {
      // Add a timestamp to prevent caching
      const timestamp = new Date().getTime();
      const response = await axios.get(`http://localhost:5001/api/admin/categories?_=${timestamp}`);
      console.log('API response:', response.data);

      if (Array.isArray(response.data) && response.data.length > 0) {
        console.log(`Success! Fetched ${response.data.length} categories from API`);
        return response.data;
      } else if (response.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
        console.log(`Success! Fetched ${response.data.data.length} categories from API (nested data)`);
        return response.data.data;
      } else {
        console.log('API response is not a valid array:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching categories from API:', error.message);
      return [];
    }
  };

  // Helper function to log categories
  const logCategories = (source, cats) => {
    console.log(`Categories from ${source}:`, cats);
    if (cats && cats.length > 0) {
      console.log(`First category from ${source}:`, cats[0]);
      console.log(`Category count from ${source}:`, cats.length);
    } else {
      console.log(`No categories found from ${source}`);
    }
  };

  // Function to fetch and process categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Starting category fetch process...');

      // Get categories from API
      const apiCategories = await fetchCategoriesFromAPI();

      // Get products from API
      console.log('Fetching products from API...');
      let apiProducts = [];
      try {
        // Add a timestamp to prevent caching
        const timestamp = new Date().getTime();
        const response = await axios.get(`http://localhost:5001/api/admin/products?_=${timestamp}`);
        if (Array.isArray(response.data)) {
          apiProducts = response.data;
          console.log(`Success! Fetched ${apiProducts.length} products from API`);
          if (apiProducts.length > 0) {
            console.log('First product from API:', apiProducts[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching products from API:', error.message);
      }

      // Log what we got
      logCategories('API', apiCategories);
      logCategories('Demo Context', demoCategories);
      console.log(`Products from API: ${apiProducts.length}, from Demo Context: ${demoProducts.length}`);

      // Determine which categories to use
      let categoriesToUse = [];
      if (apiCategories && apiCategories.length > 0) {
        console.log(`Using ${apiCategories.length} categories from API`);
        categoriesToUse = apiCategories;
      } else {
        console.log('API fetch failed, falling back to demo data');
        categoriesToUse = demoCategories;
      }

      // Determine which products to use
      let productsToUse = [];
      if (apiProducts && apiProducts.length > 0) {
        console.log(`Using ${apiProducts.length} products from API`);
        productsToUse = apiProducts;
      } else {
        console.log('API products fetch failed, falling back to demo data');
        productsToUse = demoProducts;
      }

      console.log(`Processing ${categoriesToUse.length} categories with ${productsToUse.length} products...`);

      // Calculate product count for each category
      const categoriesWithProductCount = categoriesToUse.map(category => {
        // Check for products with this category
        const matchingProducts = productsToUse.filter(product => {
          // Compare both as strings and as numbers to handle type mismatches
          return String(product.category_id) === String(category.id) ||
                 Number(product.category_id) === Number(category.id);
        });

        console.log(`Category ${category.name} (ID: ${category.id}) has ${matchingProducts.length} products`);

        return {
          ...category,
          productCount: matchingProducts.length
        };
      });

      // Normalize categories to ensure consistent property names
      const normalizedCategories = categoriesWithProductCount.map(normalizeCategory);

      console.log(`Setting ${normalizedCategories.length} normalized categories in state`);
      console.log('First category after normalization:', normalizedCategories[0]);
      setCategories(normalizedCategories);

      console.log('Category fetch process complete');
    } catch (err) {
      console.error('Error processing categories:', err);
      setError('Failed to load categories: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories when the component mounts
  useEffect(() => {
    console.log('CategoryList: Component mounted, fetching categories...');
    fetchCategories();
  }, []);

  // Refresh when location changes
  useEffect(() => {
    console.log('CategoryList: Location changed, fetching categories...');
    fetchCategories();
  }, [location]);

  // Refresh when demo data changes
  useEffect(() => {
    console.log('CategoryList: Demo data changed, fetching categories...');
    fetchCategories();
  }, [demoCategories, demoProducts]);

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!categoryToDelete) return;

    try {
      setLoading(true);
      setError(null);

      // Check if category has subcategories
      const hasSubcategories = demoCategories.some(category => category.parentId === categoryToDelete.id);
      if (hasSubcategories) {
        throw new Error('Cannot delete a category that has subcategories');
      }

      // Check if category is used by products
      const isUsedByProducts = demoProducts.some(product => product.category_id === categoryToDelete.id);
      if (isUsedByProducts) {
        throw new Error('Cannot delete a category that is used by products');
      }

      // Call the context function to delete the category
      const result = deleteContextCategory(categoryToDelete.id);

      if (result) {
        // The state will be updated automatically via the useEffect hook
        setIsDeleteModalOpen(false);
        setCategoryToDelete(null);
      } else {
        throw new Error('Failed to delete category');
      }
    } catch (err) {
      console.error('Error deleting category:', err);
      setError('Failed to delete category: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Function to get parent category name
  const getParentName = (parentId) => {
    if (!parentId) return 'None';
    const parent = categories.find(c => c.id === parentId);
    return parent ? parent.name : 'Unknown';
  };

  // Helper function to normalize category data
  const normalizeCategory = (category) => {
    // Make sure we have consistent property names
    return {
      ...category,
      // Ensure we have both property naming conventions
      parentId: category.parentId || category.parent_id,
      parent_id: category.parent_id || category.parentId
    };
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
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div className="flex items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mr-4">Categories</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                console.log('Manual refresh triggered');
                fetchCategories();
              }}
              className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
              title="Refresh categories"
              disabled={loading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
            </button>

            <button
              onClick={async () => {
                if (window.confirm('Are you sure you want to reset categories? This will restore all default categories.')) {
                  setLoading(true);
                  try {
                    await resetCategories();
                    fetchCategories(); // Refresh the list after reset
                  } catch (error) {
                    setError('Failed to reset categories: ' + error.message);
                  } finally {
                    setLoading(false);
                  }
                }
              }}
              className="inline-flex items-center px-3 py-1 border border-yellow-300 text-sm font-medium rounded-md shadow-sm text-yellow-700 bg-yellow-50 hover:bg-yellow-100"
              title="Reset to default categories"
              disabled={isSyncing || loading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Reset
            </button>
          </div>
        </div>
        <Link
          to="/admin/categories/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Category
        </Link>
      </div>
      <div className="border-t border-gray-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Parent Category
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Products
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>


          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {category.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {category.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getParentName(category.parentId)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {category.productCount > 0 ? (
                    <Link
                      to={`/admin/products?category=${category.id}`}
                      className="text-primary-600 hover:text-primary-900 hover:underline"
                      title={`View ${category.productCount} products in this category`}
                    >
                      {category.productCount} {category.productCount === 1 ? 'product' : 'products'}
                    </Link>
                  ) : (
                    <span>0 products</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    to={`/admin/categories/${category.id}`}
                    className="text-primary-600 hover:text-primary-900 mr-4"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteClick(category)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
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
                      Delete Category
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete the category "{categoryToDelete?.name}"? This action cannot be undone.
                      </p>
                      {categoryToDelete?.productCount > 0 && (
                        <p className="mt-2 text-sm text-red-500">
                          Warning: This category contains {categoryToDelete.productCount} products. Deleting it may affect these products.
                        </p>
                      )}
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

export default CategoryList;
