import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/website/Navbar';
import Footer from '../../components/website/Footer';
import { useDemoData } from '../../context/DemoDataContext';
import { getDemoCategories } from '../../utils/demoDataLoader';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get demo data from context
  const { categories: demoCategories } = useDemoData();

  // Load data from context when it changes
  useEffect(() => {
    console.log('CategoriesPage: Loading data from context...');
    try {
      setLoading(true);
      setError(null);

      console.log('CategoriesPage: Data changed in context, refreshing...');
      console.log('Demo categories from context:', demoCategories?.length || 0);

      // Use the categories from context
      if (demoCategories && demoCategories.length > 0) {
        console.log('Using categories from context');
        // Log some sample categories to verify data
        if (demoCategories.length > 0) {
          console.log('Sample category from context:', demoCategories[0]);
          console.log('Category ID:', demoCategories[0].id);
        }
        setCategories(demoCategories);
      } else {
        // Fallback to utility function if context has no categories
        console.warn('No categories in context, using fallback data');
        setCategories(getDemoCategories());
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load categories. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [demoCategories]);

  // Group categories by parent
  const parentCategories = categories.filter(cat => !cat.parent_id);
  
  // Get subcategories for a parent category
  const getSubcategories = (parentId) => {
    return categories.filter(cat => cat.parent_id === parentId);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-16">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-6">
            Product Categories
          </h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {parentCategories.map(category => (
                <div key={category.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      <Link 
                        to={`/products?category=${category.id}`}
                        className="text-[#c69133] hover:text-[#9f7324]"
                      >
                        {category.name}
                      </Link>
                    </h2>
                    <p className="text-gray-600 mb-4">{category.description}</p>
                    
                    {/* Subcategories */}
                    {getSubcategories(category.id).length > 0 && (
                      <div className="mt-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Subcategories:</h3>
                        <div className="flex flex-wrap gap-2">
                          {getSubcategories(category.id).map(subcat => (
                            <Link
                              key={subcat.id}
                              to={`/products?category=${subcat.id}`}
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                            >
                              {subcat.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-4">
                      <Link
                        to={`/products?category=${category.id}`}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#c69133] hover:bg-[#9f7324] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Browse Products
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CategoriesPage;
