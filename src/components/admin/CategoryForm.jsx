import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDemoData } from '../../context/DemoDataContext';

const CategoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentId: ''
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get categories, products and functions from context
  const {
    categories: demoCategories,
    products: demoProducts,
    addCategory: addContextCategory,
    updateCategory: updateContextCategory
  } = useDemoData();

  // Count products in this category
  const productCount = isEditMode ?
    demoProducts.filter(product =>
      product.category_id === id ||
      product.category_id === parseInt(id)
    ).length : 0;

  useEffect(() => {
    try {
      console.log('Using categories from context:', demoCategories);
      setCategories(demoCategories);
    } catch (err) {
      console.error('Error processing categories:', err);
      setError('Failed to load categories');
    }

    // If in edit mode, fetch the category data from context
    if (isEditMode) {
      try {
        setLoading(true);
        setError(null);

        // Find the category in the context
        const categoryData = demoCategories.find(cat => cat.id === id);
        console.log('Category from context:', categoryData);

        if (categoryData) {
          setFormData(categoryData);
        } else {
          setError('Category not found');
        }
      } catch (err) {
        console.error('Error finding category:', err);
        setError('Failed to load category data');
      } finally {
        setLoading(false);
      }
    }
  }, [id, isEditMode, demoCategories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value === '' ? null : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);

    // Validate form data
    if (!formData.name || formData.name.trim() === '') {
      setError('Category name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Make sure parentId is null if it's an empty string
      const categoryData = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description ? formData.description.trim() : '',
        parentId: formData.parentId === '' ? null : formData.parentId
      };

      console.log('Sending category data:', categoryData);

      let result;
      if (isEditMode) {
        // Update existing category using context function
        result = updateContextCategory(id, categoryData);
        console.log('Category updated:', result);
      } else {
        // Create new category using context function
        result = addContextCategory(categoryData);
        console.log('Category created:', result);
      }

      // Check if the operation was successful
      if (!result) {
        throw new Error('Operation failed');
      }

      // Redirect back to the categories list
      navigate('/admin/categories');
    } catch (err) {
      console.error('Error saving category:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save category');

      // Log detailed error information
      if (err.response) {
        console.error('Response status:', err.response.status);
        console.error('Response data:', err.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter out the current category and its children to prevent circular references
  // Only show main categories as parent options
  const getAvailableParentCategories = () => {
    // Get only main categories (parentId === null)
    const mainCategories = categories.filter(c => c.parentId === null);

    if (!isEditMode) return mainCategories;

    // Function to get all child category IDs
    const getChildIds = (parentId) => {
      const children = categories.filter(c => c.parentId === parentId);
      return children.reduce((ids, child) => {
        return [...ids, child.id, ...getChildIds(child.id)];
      }, []);
    };

    const childIds = getChildIds(id);
    return mainCategories.filter(c => c.id !== id && !childIds.includes(c.id));
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
          {isEditMode ? 'Edit Category' : 'Add New Category'}
        </h3>
      </div>

      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Category Name
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
              <label htmlFor="parentId" className="block text-sm font-medium text-gray-700">
                Parent Category
              </label>
              <div className="mt-1">
                <select
                  name="parentId"
                  id="parentId"
                  value={formData.parentId || ''}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="">None (Top Level)</option>
                  {getAvailableParentCategories().map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
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
          </div>

          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center">
            {isEditMode && (
              <div className="mb-4 sm:mb-0">
                <button
                  type="button"
                  onClick={() => navigate(`/admin/products?category=${id}`)}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm ${productCount > 0 ? 'text-white bg-primary-600 hover:bg-primary-700' : 'text-gray-700 bg-gray-200 hover:bg-gray-300'}`}
                  disabled={productCount === 0}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                  </svg>
                  {productCount > 0 ? `View ${productCount} Products` : 'No Products'}
                </button>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => navigate('/admin/categories')}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Saving...' : 'Save Category'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;
