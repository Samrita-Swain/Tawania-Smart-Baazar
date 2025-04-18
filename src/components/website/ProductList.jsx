import { Link } from 'react-router-dom';
import { isProductInStock } from '../../utils/stockUtils';

const ProductList = ({ products, loading, categories }) => {
  // Enhanced function to get category name by ID with better error handling
  const getCategoryName = (categoryId) => {
    if (!categoryId) return 'Uncategorized';

    // Convert categoryId to string for consistent comparison
    const categoryIdStr = String(categoryId);

    console.log(`Looking for category with ID: ${categoryIdStr} (type: ${typeof categoryId})`);

    // Safety check for categories array
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      console.warn('Categories array is empty or invalid');
      return 'Uncategorized';
    }

    console.log('Available categories:', categories.map(c => ({ id: c.id, name: c.name })));

    try {
      // Find category by ID, comparing as strings to avoid type mismatches
      const category = categories.find(cat => String(cat.id) === categoryIdStr);

      if (category) {
        console.log(`Found category: ${category.name}`);
        // Make sure we return a string, not an object
        if (category.name === null || category.name === undefined) {
          return 'Uncategorized';
        }
        return typeof category.name === 'object' ? JSON.stringify(category.name) : String(category.name);
      } else {
        console.log(`Category not found for ID: ${categoryIdStr}`);
        // Try to find by numeric comparison if string comparison fails
        const numericCategory = categories.find(cat => cat.id === parseInt(categoryIdStr));
        if (numericCategory) {
          console.log(`Found category by numeric comparison: ${numericCategory.name}`);
          if (numericCategory.name === null || numericCategory.name === undefined) {
            return 'Uncategorized';
          }
          return typeof numericCategory.name === 'object' ? JSON.stringify(numericCategory.name) : String(numericCategory.name);
        }
      }
    } catch (error) {
      console.error('Error in getCategoryName:', error);
    }

    return 'Uncategorized';
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-64 w-full"></div>
            <div className="mt-4 h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="mt-2 h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="mt-2 h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  console.log('ProductList received products:', products);

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Try adjusting your search or filter to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <div key={product.id} className={`group relative ${!isProductInStock(product) ? 'opacity-75' : ''}`}>
          <div className="w-full h-60 bg-gray-200 rounded-lg overflow-hidden group-hover:opacity-75 relative">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-center object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/300x200?text=Product+Image';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                No image
              </div>
            )}
            {!isProductInStock(product) && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                <span className="px-3 py-1 bg-red-500 text-white font-bold rounded-md">
                  OUT OF STOCK
                </span>
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-between">
            <div>
              <h3 className="text-sm text-gray-700">
                <Link to={`/products/${product.id}`}>
                  <span aria-hidden="true" className="absolute inset-0" />
                  {product.name}
                </Link>
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {product.category_name ||
                 (product.category_id && getCategoryName(product.category_id)) ||
                 (product.category_id_str && getCategoryName(product.category_id_str)) ||
                 product.category ||
                 'Uncategorized'}
              </p>
              {/* Debug info */}
              <p className="mt-1 text-xs text-gray-400">
                ID: {product.id} | Cat ID: {product.category_id || 'none'}
              </p>
              <div className="mt-1">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${isProductInStock(product) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {isProductInStock(product) ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-900">${parseFloat(product.price).toFixed(2)}</p>
          </div>

          <div className="mt-2">
            <Link
              to={`/products/${product.id}`}
              className="relative z-10 text-sm font-semibold text-primary-600 hover:text-primary-500"
            >
              View details
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductList;
