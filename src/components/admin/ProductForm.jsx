import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDemoData } from '../../context/DemoDataContext';
import { productService } from '../../services/api';
import axios from 'axios';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    sku: '',
    newCategory: '',
    imageValidationMessage: '',
    stock: {
      warehouse: 0,
      stores: {}
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stores, setStores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Function to retry fetching product data
  const handleRetry = () => {
    // If in edit mode, try to fetch the product again
    if (isEditMode) {
      // Use the same approach as in useEffect
      const fetchProduct = async () => {
        // Set loading state once at the beginning
        setLoading(true);
        setError(null);

        try {
          let productData = null;
          let source = '';

          // Try to fetch directly from API first
          try {
            console.log('RETRY: Fetching product directly from API with ID:', id);
            const response = await productService.getProduct(id);

            if (response.data && response.data.success) {
              productData = response.data.data;
              source = 'direct API';
              console.log('RETRY: Product fetched directly from API:', productData);
            }
          } catch (directApiError) {
            console.warn('RETRY: Error fetching product directly from API:', directApiError);
          }

          // If direct API fetch failed, try refreshing all data
          if (!productData) {
            try {
              console.log('RETRY: Refreshing all data from API with force refresh...');
              await forceRefreshData(); // Use force refresh to ensure we get the latest data

              // Find the product in the demo data (which should now be updated from API)
              productData = demoProducts.find(product => product.id === id);

              if (productData) {
                source = 'refreshed API data';
                console.log('RETRY: Product found in refreshed data from API:', productData);
              }
            } catch (refreshApiError) {
              console.warn('RETRY: Error refreshing data from API, falling back to local data:', refreshApiError);
            }
          }

          // If we still don't have product data, throw an error
          if (!productData) {
            throw new Error('Product not found in any data source after retry');
          }

          console.log(`RETRY: Using product data from ${source}:`, productData);

          // Format the data for the form - do this only once
          const formattedData = {
            name: productData.name || '',
            description: productData.description || '',
            price: productData.price ? productData.price.toString() : '',
            category: productData.category_id || '',
            image: productData.image || '',
            sku: productData.sku || '',
            stock: productData.stock ? {
              warehouse: productData.stock.warehouse || 0,
              stores: productData.stock.stores || {}
            } : {
              warehouse: 0,
              stores: {}
            },
            // Add any other fields needed
            newCategory: '',
            imageValidationMessage: ''
          };

          // Set form data once
          setFormData(formattedData);
        } catch (err) {
          console.error('Error in retry:', err);
          setError('Failed to load product data: ' + err.message);
        } finally {
          // Set loading state once at the end
          setLoading(false);
        }
      };

      fetchProduct();
    }
  };

  // Function to fetch categories directly from the API
  const fetchCategoriesFromAPI = async () => {
    try {
      console.log('Fetching categories directly from API...');
      const response = await axios.get('http://localhost:5001/api/admin/categories');
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
      return [];
    }
  };

  // Get demo data from context
  const { products: demoProducts, categories: demoCategories, stores: demoStores, addProduct, updateProduct, addCategory, fetchDataFromAPI, forceRefreshData } = useDemoData();

  useEffect(() => {
    // Use demo stores data
    setStores(demoStores);

    // Fetch categories from API
    const loadCategories = async () => {
      setLoadingCategories(true);
      try {
        // Try to fetch categories directly from the API first
        const apiCategories = await fetchCategoriesFromAPI();

        if (apiCategories && apiCategories.length > 0) {
          console.log(`Setting ${apiCategories.length} categories from API`);
          setCategories(apiCategories);
        } else {
          // Fall back to demo data if API fails
          console.log('API fetch failed, falling back to demo categories data');
          setCategories(demoCategories);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
        // Fall back to demo data if there's an error
        setCategories(demoCategories);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();

    // If in edit mode, fetch the product data
    if (isEditMode) {
      const fetchProduct = async () => {
        // Set loading state once at the beginning
        setLoading(true);
        setError(null);

        try {
          let productData = null;
          let source = '';

          // Try to fetch directly from API first
          try {
            console.log('Fetching product directly from API with ID:', id);
            const response = await productService.getProduct(id);

            if (response.data && response.data.success) {
              productData = response.data.data;
              source = 'direct API';
              console.log('Product fetched directly from API:', productData);
            }
          } catch (directApiError) {
            console.warn('Error fetching product directly from API:', directApiError);
          }

          // If direct API fetch failed, try refreshing all data
          if (!productData) {
            try {
              console.log('Refreshing all data from API with force refresh...');
              await forceRefreshData(); // Use force refresh to ensure we get the latest data

              // Find the product in the demo data (which should now be updated from API)
              productData = demoProducts.find(product => product.id === id);

              if (productData) {
                source = 'refreshed API data';
                console.log('Product found in refreshed data from API:', productData);
              }
            } catch (refreshApiError) {
              console.warn('Error refreshing data from API, falling back to local data:', refreshApiError);
            }
          }

          // If both API methods failed, try local data
          if (!productData) {
            productData = demoProducts.find(product => product.id === id);

            if (productData) {
              source = 'local data';
              console.log('Product found in local data:', productData);
            }
          }

          // If we still don't have product data, throw an error
          if (!productData) {
            throw new Error('Product not found in any data source');
          }

          console.log(`Using product data from ${source}:`, productData);

          // Format the data for the form - do this only once
          const formattedData = {
            name: productData.name || '',
            description: productData.description || '',
            price: productData.price ? productData.price.toString() : '',
            category: productData.category_id || '',
            image: productData.image || '',
            sku: productData.sku || '',
            stock: productData.stock ? {
              warehouse: productData.stock.warehouse || 0,
              stores: productData.stock.stores || {}
            } : {
              warehouse: 0,
              stores: {}
            },
            // Add any other fields needed
            newCategory: '',
            imageValidationMessage: ''
          };

          // Set form data once
          setFormData(formattedData);
        } catch (err) {
          console.error('Error fetching product:', err);
          setError('Failed to load product data: ' + err.message);
        } finally {
          // Set loading state once at the end
          setLoading(false);
        }
      };

      fetchProduct();
    }
  }, [id, isEditMode, demoProducts, demoCategories, demoStores, fetchDataFromAPI]);

  // Helper function to validate image URLs
  const isValidImageUrl = (url) => {
    if (!url) return false;

    // Check if it's a valid URL format
    try {
      new URL(url);
    } catch (e) {
      return false;
    }

    // Check if it's likely an image URL based on extension
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
    const lowercaseUrl = url.toLowerCase();

    // Check for common image extensions
    const hasImageExtension = imageExtensions.some(ext => lowercaseUrl.includes(ext));

    // Check for common image hosting domains
    const commonImageHosts = [
      'unsplash.com', 'imgur.com', 'cloudinary.com', 'images.unsplash.com',
      'img.', 'image.', 'photos.', 'assets.', 'media.', 'cdn.', 'static.'
    ];
    const isLikelyImageHost = commonImageHosts.some(host => lowercaseUrl.includes(host));

    return hasImageExtension || isLikelyImageHost || lowercaseUrl.includes('/images/');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'price') {
      // Ensure price is a valid number
      const numValue = parseFloat(value);
      if (!isNaN(numValue) || value === '') {
        setFormData({ ...formData, [name]: value });
      }
    } else if (name === 'category') {
      // If user selects 'new', we need to clear any existing newCategory value
      if (value === 'new') {
        setFormData({
          ...formData,
          category: value,
          newCategory: ''
        });
      } else {
        // Otherwise, just update the category and remove newCategory if it exists
        const updatedFormData = { ...formData, category: value };
        if ('newCategory' in updatedFormData) {
          delete updatedFormData.newCategory;
        }
        setFormData(updatedFormData);
      }
    } else if (name === 'newCategory') {
      setFormData({ ...formData, newCategory: value });
    } else if (name === 'warehouseStock') {
      setFormData({
        ...formData,
        stock: {
          ...formData.stock,
          warehouse: parseInt(value) || 0
        }
      });
    } else if (name.startsWith('storeStock_')) {
      const storeId = name.replace('storeStock_', '');
      setFormData({
        ...formData,
        stock: {
          ...formData.stock,
          stores: {
            ...(formData.stock && formData.stock.stores ? formData.stock.stores : {}),
            [storeId]: parseInt(value) || 0
          }
        }
      });
    } else if (name === 'image') {
      // For image URLs, provide some basic validation feedback
      const isLikelyValid = isValidImageUrl(value);
      setFormData({
        ...formData,
        [name]: value,
        imageValidationMessage: value && !isLikelyValid ?
          "This URL may not be a valid image. Please ensure it's a direct link to an image file." :
          ""
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted');

    try {
      setLoading(true);
      setError(null);

      // Validate form data
      if (!formData.name || !formData.description || !formData.price || !formData.category || !formData.image) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Validate price is a number
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        setError('Price must be a positive number');
        setLoading(false);
        return;
      }

      // Prepare data for submission
      const productData = {
        ...formData,
        price: price,
        // Add created_at if it's a new product
        created_at: isEditMode ? undefined : new Date().toISOString().split('T')[0],
        // Ensure we have an image
        image: formData.image || 'https://via.placeholder.com/300x200?text=Product+Image'
      };

      console.log('Processing category selection');
      // Handle category selection
      if (formData.category !== 'new' && formData.category) {
        // Existing category selected
        // Convert to string for consistent comparison
        const categoryId = String(formData.category);
        console.log('Looking for category with ID:', categoryId, 'Type:', typeof categoryId);

        // Find category by ID, comparing as strings to avoid type mismatches
        const selectedCategory = demoCategories.find(cat => String(cat.id) === categoryId);

        if (selectedCategory) {
          // Store both string and number versions to ensure compatibility
          productData.category_id = selectedCategory.id;
          productData.category_id_str = String(selectedCategory.id);
          productData.category_name = selectedCategory.name;
          console.log('Using existing category:', selectedCategory);
          console.log('Set category_id:', productData.category_id, 'Type:', typeof productData.category_id);
          console.log('Set category_id_str:', productData.category_id_str, 'Type:', typeof productData.category_id_str);
        } else {
          console.log('Category not found in demoCategories, using ID directly:', formData.category);
          productData.category_id = formData.category;
          productData.category_id_str = String(formData.category);
        }
      } else if (formData.category === 'new' && formData.newCategory) {
        // New category created
        const newCategoryName = formData.newCategory.trim();
        console.log('Creating new category:', newCategoryName);

        try {
          // Create a new category in the context
          const newCategory = await addCategory({
            name: newCategoryName,
            description: `Category for ${formData.name}`,
            parentId: null // Make it a main category
          });

          console.log('Created new category:', newCategory);

          // Update the product data with the new category ID and name
          if (newCategory && newCategory.id) {
            productData.category_id = newCategory.id;
            productData.category_id_str = String(newCategory.id);
            productData.category_name = newCategory.name;
            console.log('Set new category_id:', productData.category_id, 'Type:', typeof productData.category_id);
            console.log('Set new category_id_str:', productData.category_id_str, 'Type:', typeof productData.category_id_str);
          } else {
            // If category creation failed, use the name directly
            productData.category = newCategoryName;
            productData.category_name = newCategoryName;
            // Set a temporary ID if needed
            const tempId = `temp_${Date.now()}`;
            productData.category_id = tempId;
            productData.category_id_str = tempId;
          }
        } catch (categoryError) {
          console.error('Error creating category:', categoryError);
          // If category creation failed, use the name directly
          productData.category = newCategoryName;
          productData.category_name = newCategoryName;
          // Set a temporary ID if needed
          const tempId = `temp_${Date.now()}`;
          productData.category_id = tempId;
          productData.category_id_str = tempId;
        }
      }

      // Remove the newCategory field if it exists
      if ('newCategory' in productData) {
        delete productData.newCategory;
      }

      // Log the final product data
      console.log('Final product data to be submitted:', productData);

      let result;
      if (isEditMode) {
        console.log(`Updating product ${id} with data:`, productData);
        // Update product in demo data and database
        result = await updateProduct(id, productData);
        console.log('Update result:', result);

        // Force refresh to ensure we have the latest data
        await forceRefreshData();
      } else {
        console.log('Adding new product with data:', productData);
        // Add new product to demo data and database
        try {
          console.log('Calling addProduct function...');
          result = await addProduct(productData);
          console.log('Add result:', result);
        } catch (addError) {
          console.error('Error in addProduct function:', addError);
          throw addError;
        }

        // Force refresh to ensure we have the latest data
        await forceRefreshData();
      }

      console.log('Product saved successfully');

      // Show success message without using alert (which can block the UI)
      const successMessage = isEditMode ? 'Product updated successfully!' : 'Product created successfully!';
      console.log(successMessage);

      // Set loading to false before navigation
      setLoading(false);

      // Use setTimeout to ensure state updates are processed before navigation
      setTimeout(() => {
        // Navigate back to products list
        console.log('Navigating to /admin/products');
        navigate('/admin/products');
      }, 100);

      return; // Early return to prevent the finally block from setting loading to false again
    } catch (err) {
      console.error('Error saving product:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save product');
    } finally {
      console.log('Setting loading to false in finally block');
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2.5"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2.5"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2.5"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          {isEditMode ? 'Edit Product' : 'Add New Product'}
        </h3>
      </div>

      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        {loading ? (
          <div className="min-h-[600px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : error ? (
          <div className="min-h-[600px] flex flex-col items-center justify-center">
            <div className="w-full max-w-lg mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
              <div className="mt-3 flex justify-center">
                <button
                  type="button"
                  onClick={handleRetry}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Retry
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/admin/products')}
                  className="ml-2 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Back to Products
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="min-h-[600px]">
            <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Product Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <div className="mt-1">
                <div className="relative">
                  {loadingCategories ? (
                    <div className="animate-pulse h-10 bg-gray-200 rounded w-full"></div>
                  ) : (
                    <>
                      <select
                        name="category"
                        id="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="input pr-10"
                        required
                      >
                        <option value="">Select a category</option>
                        {/* Group categories by parent */}
                        <optgroup label="Main Categories">
                          {categories
                            .filter(category => category.parentId === null)
                            .map((category) => (
                              <option
                                key={category.id}
                                value={category.id}
                                className={formData.category === category.id ? 'font-bold bg-gray-100' : ''}
                              >
                                {category.name}
                                {formData.category === category.id ? ' (Current)' : ''}
                              </option>
                          ))}
                        </optgroup>

                        {/* Subcategories grouped by parent */}
                        {categories
                          .filter(category => category.parentId === null)
                          .map(mainCategory => {
                            const subcategories = categories.filter(sub => sub.parentId === mainCategory.id);
                            if (subcategories.length === 0) return null;

                            return (
                              <optgroup key={`group-${mainCategory.id}`} label={`${mainCategory.name} Subcategories`}>
                                {subcategories.map(sub => (
                                  <option
                                    key={sub.id}
                                    value={sub.id}
                                    className={formData.category === sub.id ? 'font-bold bg-gray-100' : ''}
                                  >
                                    {sub.name}
                                    {formData.category === sub.id ? ' (Current)' : ''}
                                  </option>
                                ))}
                              </optgroup>
                            );
                          })}
                        <option value="new">+ Add new category</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </>
                  )}
                </div>
                {formData.category === 'new' && (
                  <div className="mt-2">
                    <input
                      type="text"
                      name="newCategory"
                      id="newCategory"
                      placeholder="Enter new category name"
                      value={formData.newCategory || ''}
                      onChange={handleChange}
                      className="input"
                      required
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Price ($)
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="price"
                  id="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
                SKU
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="sku"
                  id="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  className="input"
                  placeholder="Leave blank to auto-generate"
                />
              </div>
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                Image URL
              </label>
              <div className="mt-1">
                <input
                  type="url"
                  name="image"
                  id="image"
                  value={formData.image}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
              {formData.imageValidationMessage && (
                <p className="mt-1 text-sm text-yellow-600">{formData.imageValidationMessage}</p>
              )}
              {formData.image && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-1">Image Preview:</p>
                  <div className="h-32 w-32 border border-gray-300 rounded-md overflow-hidden">
                    <img
                      src={formData.image}
                      alt="Product preview"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/150?text=Image+Error';
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">If the image doesn't appear, check the URL.</p>
                  <p className="text-xs text-gray-500">Make sure the URL points directly to an image file (ending with .jpg, .png, etc.)</p>
                </div>
              )}
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <div className="mt-1">
                <textarea
                  name="description"
                  id="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                  className="input"
                  required
                ></textarea>
              </div>
            </div>

            <div className="sm:col-span-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Stock Information</h4>

              <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 gap-x-4">
                <div>
                  <label htmlFor="warehouseStock" className="block text-sm font-medium text-gray-700">
                    Warehouse Stock
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      name="warehouseStock"
                      id="warehouseStock"
                      min="0"
                      value={formData.stock.warehouse}
                      onChange={handleChange}
                      className="input"
                      required
                    />
                  </div>
                </div>

                {stores.map((store) => (
                  <div key={store.id}>
                    <label htmlFor={`storeStock_${store.id}`} className="block text-sm font-medium text-gray-700">
                      {store.name} Stock
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name={`storeStock_${store.id}`}
                        id={`storeStock_${store.id}`}
                        min="0"
                        value={formData.stock && formData.stock.stores && formData.stock.stores[store.id] || 0}
                        onChange={handleChange}
                        className="input"
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductForm;
