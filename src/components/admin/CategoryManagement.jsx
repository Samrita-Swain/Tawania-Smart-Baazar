import { useState, useEffect } from 'react';
import { useDemoData } from '../../context/DemoDataContext';

const CategoryManagement = () => {
  const { categories, addCategory, updateCategory, deleteCategory, products } = useDemoData();
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState({});
  const [newCategory, setNewCategory] = useState({ name: '', description: '', parentId: null });
  const [editingCategory, setEditingCategory] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Organize categories into main categories and subcategories
  useEffect(() => {
    const main = categories.filter(cat => cat.parentId === null);
    const sub = {};

    main.forEach(mainCat => {
      sub[mainCat.id] = categories.filter(cat => cat.parentId === mainCat.id);
    });

    setMainCategories(main);
    setSubCategories(sub);
  }, [categories]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingCategory) {
      setEditingCategory({ ...editingCategory, [name]: value });
    } else {
      setNewCategory({ ...newCategory, [name]: value });
    }
  };

  // Handle parent category selection
  const handleParentChange = (e) => {
    const value = e.target.value === 'none' ? null : e.target.value;
    if (editingCategory) {
      setEditingCategory({ ...editingCategory, parentId: value });
    } else {
      setNewCategory({ ...newCategory, parentId: value });
    }
  };

  // Add a new category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newCategory.name.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      const result = await addCategory(newCategory);
      console.log('Category add result:', result);

      if (result) {
        setSuccess(`Category "${newCategory.name}" added successfully`);
        setNewCategory({ name: '', description: '', parentId: null });

        // Hide success message after 3 seconds
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      }
    } catch (err) {
      console.error('Error adding category:', err);
      setError(`Failed to add category: ${err.message || 'Unknown error'}`);
    }
  };

  // Start editing a category
  const handleEditClick = (category) => {
    setEditingCategory({ ...category });
    setError('');
    setSuccess('');
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingCategory(null);
  };

  // Save edited category
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!editingCategory.name.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      const result = await updateCategory(editingCategory.id, editingCategory);
      console.log('Category update result:', result);

      if (result) {
        setSuccess(`Category "${editingCategory.name}" updated successfully`);
        setEditingCategory(null);

        // Hide success message after 3 seconds
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      }
    } catch (err) {
      console.error('Error updating category:', err);
      setError(`Failed to update category: ${err.message || 'Unknown error'}`);
    }
  };

  // Delete a category
  const handleDeleteClick = async (category) => {
    setError('');
    setSuccess('');

    // Check if category has subcategories
    const hasSubcategories = categories.some(cat => cat.parentId === category.id);
    if (hasSubcategories) {
      setError(`Cannot delete "${category.name}" because it has subcategories`);
      return;
    }

    // Check if category is used by products
    const isUsedByProducts = products.some(product => product.category_id === category.id);
    if (isUsedByProducts) {
      setError(`Cannot delete "${category.name}" because it is used by products`);
      return;
    }

    if (window.confirm(`Are you sure you want to delete the category "${category.name}"?`)) {
      try {
        const result = await deleteCategory(category.id);
        console.log('Category delete result:', result);

        if (result) {
          setSuccess(`Category "${category.name}" deleted successfully`);

          // Hide success message after 3 seconds
          setTimeout(() => {
            setSuccess('');
          }, 3000);
        } else {
          setError('Failed to delete category');
        }
      } catch (err) {
        console.error('Error deleting category:', err);
        setError(`Failed to delete category: ${err.message || 'Unknown error'}`);
      }
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Category Management</h2>

      {/* Error and Success Messages */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">
          <p>{success}</p>
        </div>
      )}

      {/* Add/Edit Category Form */}
      <div className="mb-8 bg-gray-50 p-4 rounded-md">
        <h3 className="text-lg font-medium text-gray-700 mb-4">
          {editingCategory ? 'Edit Category' : 'Add New Category'}
        </h3>

        <form onSubmit={editingCategory ? handleSaveEdit : handleAddCategory}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Category Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={editingCategory ? editingCategory.name : newCategory.name}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label htmlFor="parentId" className="block text-sm font-medium text-gray-700">
                Parent Category
              </label>
              <select
                id="parentId"
                name="parentId"
                value={editingCategory ? (editingCategory.parentId || 'none') : (newCategory.parentId || 'none')}
                onChange={handleParentChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="none">None (Main Category)</option>
                {mainCategories.map(cat => (
                  <option
                    key={cat.id}
                    value={cat.id}
                    disabled={editingCategory && editingCategory.id === cat.id}
                  >
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={editingCategory ? editingCategory.description : newCategory.description}
                onChange={handleInputChange}
                rows="3"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              ></textarea>
            </div>
          </div>

          <div className="mt-4 flex justify-end space-x-3">
            {editingCategory && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {editingCategory ? 'Save Changes' : 'Add Category'}
            </button>
          </div>
        </form>
      </div>

      {/* Categories List */}
      <div>
        <h3 className="text-lg font-medium text-gray-700 mb-4">Categories</h3>

        {mainCategories.length === 0 ? (
          <p className="text-gray-500">No categories found.</p>
        ) : (
          <div className="space-y-6">
            {mainCategories.map(mainCat => (
              <div key={mainCat.id} className="border rounded-md overflow-hidden">
                <div className="flex items-center justify-between bg-gray-100 px-4 py-3">
                  <div>
                    <h4 className="font-medium text-gray-800">{mainCat.name}</h4>
                    {mainCat.description && (
                      <p className="text-sm text-gray-600">{mainCat.description}</p>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditClick(mainCat)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(mainCat)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {subCategories[mainCat.id] && subCategories[mainCat.id].length > 0 && (
                  <div className="divide-y">
                    {subCategories[mainCat.id].map(subCat => (
                      <div key={subCat.id} className="flex items-center justify-between px-4 py-2 pl-8 bg-white">
                        <div>
                          <h5 className="font-medium text-gray-700">{subCat.name}</h5>
                          {subCat.description && (
                            <p className="text-sm text-gray-600">{subCat.description}</p>
                          )}
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditClick(subCat)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(subCat)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryManagement;
