import { useState, useEffect } from 'react';
import Navbar from '../../components/website/Navbar';
import Footer from '../../components/website/Footer';
import ProductList from '../../components/website/ProductList';
import FallbackProducts from '../../components/website/FallbackProducts';
import ProductFilters from '../../components/website/ProductFilters';
import EmptyCategoryMessage from '../../components/website/EmptyCategoryMessage';
import { useDemoData } from '../../context/DemoDataContext';
import { getDemoProducts, getDemoCategories } from '../../utils/demoDataLoader';
import { categoryHasProducts } from '../../utils/categoryUtils';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [sortBy, setSortBy] = useState('featured');
  const [searchQuery, setSearchQuery] = useState('');

  // Get demo data from context
  const { products: demoProducts, categories: demoCategories } = useDemoData();

  // Load data from context when it changes
  useEffect(() => {
    console.log('ProductsPage: Loading data from context...');
    try {
      setLoading(true);
      setError(null);

      console.log('ProductsPage: Data changed in context, refreshing...');
      console.log('Demo products from context:', demoProducts?.length || 0);
      console.log('Demo categories from context:', demoCategories?.length || 0);

      // Use the products and categories from context
      if (demoProducts && demoProducts.length > 0) {
        console.log('Using products from context');
        // Log some sample products to verify data
        if (demoProducts.length > 0) {
          console.log('Sample product from context:', demoProducts[0]);
          console.log('Product category_id:', demoProducts[0].category_id);
          console.log('Product category_name:', demoProducts[0].category_name);
        }
        setProducts(demoProducts);
      } else {
        // Fallback to utility function if context has no products
        console.warn('No products in context, using fallback data');
        setProducts(getDemoProducts());
      }

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

      // We can't log products.length here because the state update is asynchronous
      // and won't be reflected immediately
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [demoProducts, demoCategories]);

  // Log products state after update
  useEffect(() => {
    console.log('Products state updated:', products.length, 'items');
  }, [products]);

  // Function to get all subcategory IDs for a given category
  const getSubcategoryIds = (categoryId) => {
    // Convert categoryId to number for consistent comparison
    const categoryIdNum = typeof categoryId === 'string' ? parseInt(categoryId, 10) : categoryId;

    // Find subcategories where parentId matches the given categoryId
    const subcategories = categories.filter(cat => {
      // Convert parentId to number for consistent comparison
      const parentIdNum = cat.parentId ?
        (typeof cat.parentId === 'string' ? parseInt(cat.parentId, 10) : cat.parentId) :
        null;
      return parentIdNum === categoryIdNum;
    });

    console.log(`Found ${subcategories.length} subcategories for category ${categoryIdNum}:`,
      subcategories.map(cat => `${cat.name} (ID: ${cat.id})`))

    return subcategories.map(cat => cat.id);
  };

  // Filter products based on selected filters
  const filteredProducts = products.filter(product => {
    // Filter by category
    if (selectedCategory !== 'all') {
      console.log(`Filtering product ${product.name} with category_id ${product.category_id} against selected category ${selectedCategory}`);

      // Convert both to numbers for consistent comparison
      const productCategoryId = typeof product.category_id === 'string' ?
        parseInt(product.category_id, 10) : product.category_id;

      const selectedCategoryId = typeof selectedCategory === 'string' ?
        parseInt(selectedCategory, 10) : selectedCategory;

      console.log(`Product category_id (${typeof product.category_id}): ${product.category_id} -> Number: ${productCategoryId}`);
      console.log(`Selected category_id (${typeof selectedCategory}): ${selectedCategory} -> Number: ${selectedCategoryId}`);

      // Get all subcategory IDs for the selected category
      const subcategoryIds = getSubcategoryIds(selectedCategory).map(id => {
        return typeof id === 'string' ? parseInt(id, 10) : id;
      });
      console.log(`Subcategories of ${selectedCategory}:`, subcategoryIds);

      // Check if product's category_id matches the selected category directly
      const directMatch = productCategoryId === selectedCategoryId;

      // Check if product's category_id matches any of the subcategories
      const subcategoryMatch = subcategoryIds.includes(productCategoryId);

      const categoryMatches = directMatch || subcategoryMatch;

      console.log(`Category match result for ${product.name}: ${categoryMatches} (direct: ${directMatch}, subcategory: ${subcategoryMatch})`);

      if (!categoryMatches) {
        return false;
      }
    }

    // Filter by price range
    if (product.price < priceRange.min || product.price > priceRange.max) {
      return false;
    }

    // Filter by search query
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low-high':
        return a.price - b.price;
      case 'price-high-low':
        return b.price - a.price;
      case 'newest':
        return new Date(b.created_at) - new Date(a.created_at);
      case 'name-a-z':
        return a.name.localeCompare(b.name);
      case 'name-z-a':
        return b.name.localeCompare(a.name);
      default: // featured or any other value
        return 0; // Keep original order
    }
  });

  // Handle filter changes
  const handleCategoryChange = (categoryId) => {
    console.log(`Changing category to: ${categoryId}`);
    console.log(`Category has products: ${categoryHasProducts(categoryId, categories, products)}`);

    // If selecting a category, reset other filters to show all products in that category
    if (categoryId !== 'all') {
      // Reset price range to show all products
      setPriceRange({ min: 0, max: 1000 });
      // Reset search query
      setSearchQuery('');
    }

    setSelectedCategory(categoryId);
  };

  const handlePriceRangeChange = (min, max) => {
    setPriceRange({ min, max });
  };

  const handleSortChange = (sortValue) => {
    setSortBy(sortValue);
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  // Log filtered and sorted products
  console.log('Selected category:', selectedCategory);
  console.log('Filtered products count:', filteredProducts.length);
  console.log('Sorted products count:', sortedProducts.length);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-16">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-64 flex-shrink-0">
              <ProductFilters
                categories={categories}
                selectedCategory={selectedCategory}
                priceRange={priceRange}
                sortBy={sortBy}
                searchQuery={searchQuery}
                onCategoryChange={handleCategoryChange}
                onPriceRangeChange={handlePriceRangeChange}
                onSortChange={handleSortChange}
                onSearchChange={handleSearchChange}
              />
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-6">
                {selectedCategory === 'all'
                  ? 'All Products'
                  : (() => {
                      const category = categories.find(cat => {
                        const catId = typeof cat.id === 'string' ? parseInt(cat.id, 10) : cat.id;
                        const selCatId = typeof selectedCategory === 'string' ? parseInt(selectedCategory, 10) : selectedCategory;
                        return catId === selCatId;
                      });
                      if (!category) return 'Category Products';
                      return typeof category.name === 'object' ? JSON.stringify(category.name) : String(category.name);
                    })()
                }
              </h1>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              {sortedProducts.length > 0 ? (
                <ProductList
                  products={sortedProducts}
                  loading={loading}
                  categories={categories}
                />
              ) : (
                <div>
                  {selectedCategory !== 'all' ? (
                    // Check if the category has any products at all (not just filtered ones)
                    categoryHasProducts(selectedCategory, categories, products) ? (
                      // If the category has products but none match the current filters
                      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
                        <p className="font-bold">No Products Match Your Filters</p>
                        <p>Try adjusting your price range or search criteria.</p>
                      </div>
                    ) : (
                      // If the category has no products at all
                      <EmptyCategoryMessage
                        categoryName={
                          (() => {
                            const category = categories.find(cat => {
                              const catId = typeof cat.id === 'string' ? parseInt(cat.id, 10) : cat.id;
                              const selCatId = typeof selectedCategory === 'string' ? parseInt(selectedCategory, 10) : selectedCategory;
                              return catId === selCatId;
                            });
                            if (!category) return 'This Category';
                            return typeof category.name === 'object' ? JSON.stringify(category.name) : String(category.name);
                          })()
                        }
                      />
                    )
                  ) : (
                    // Display the default no products found message for general searches
                    <>
                      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
                        <p className="font-bold">No Products Found</p>
                        <p>We couldn't find any products matching your criteria. Here are some sample products instead.</p>
                      </div>
                      <FallbackProducts />
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductsPage;
