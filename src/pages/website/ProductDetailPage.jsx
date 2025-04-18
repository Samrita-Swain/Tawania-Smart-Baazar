import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/website/Navbar';
import Footer from '../../components/website/Footer';
import { useDemoData } from '../../context/DemoDataContext';
import { getDemoProductById } from '../../utils/demoDataLoader';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { calculateTotalStock, isProductInStock, formatStockText } from '../../utils/stockUtils';
import { productService, categoryService } from '../../services/api';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { currentUser, userRole } = useAuth();
  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  // Check if user is an admin
  const isAdmin = userRole === 'admin' || userRole === 'superadmin';

  // Get demo data from context
  const { products: demoProducts, categories: demoCategories, stores: demoStores } = useDemoData();

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log(`Fetching product with ID: ${id}`);

        // Try to fetch the product from the API first
        try {
          const response = await productService.getProduct(id);
          console.log('API response:', response);

          if (response.data && response.data.success) {
            const productData = response.data.data;
            console.log('Product data from API:', productData);
            setProduct(productData);

            // Fetch the category details if we have a category_id
            if (productData.category && productData.category.id) {
              try {
                const categoryResponse = await categoryService.getCategory(productData.category.id);
                if (categoryResponse.data && categoryResponse.data.success) {
                  const categoryData = categoryResponse.data.data;
                  console.log('Category data from API:', categoryData);
                  setCategory(categoryData);
                } else {
                  // Use the category info from the product response
                  setCategory(productData.category);
                }
              } catch (categoryError) {
                console.error('Error fetching category:', categoryError);
                // Use the category info from the product response as fallback
                setCategory(productData.category);
              }
            } else if (productData.category_id) {
              // If we only have category_id but not the full category object
              try {
                const categoryResponse = await categoryService.getCategory(productData.category_id);
                if (categoryResponse.data && categoryResponse.data.success) {
                  const categoryData = categoryResponse.data.data;
                  console.log('Category data from API:', categoryData);
                  setCategory(categoryData);
                } else {
                  // Create a placeholder category
                  setCategory({
                    id: productData.category_id,
                    name: productData.category_name || 'Uncategorized'
                  });
                }
              } catch (categoryError) {
                console.error('Error fetching category:', categoryError);
                // Create a placeholder category as fallback
                setCategory({
                  id: productData.category_id,
                  name: productData.category_name || 'Uncategorized'
                });
              }
            }

            // Fetch related products in the same category
            try {
              const productsResponse = await productService.getProducts();
              if (productsResponse.data && productsResponse.data.success) {
                const allProducts = productsResponse.data.data;
                console.log('All products from API:', allProducts.length);

                // Filter related products by category
                const categoryId = productData.category?.id || productData.category_id;
                if (categoryId) {
                  const related = allProducts
                    .filter(p => {
                      // Don't include the current product
                      if (p.id === id) return false;

                      // Match by category_id
                      const productCategoryId = p.category?.id || p.category_id;
                      return productCategoryId === categoryId;
                    })
                    .slice(0, 4); // Limit to 4 related products

                  console.log('Related products from API:', related.length);
                  setRelatedProducts(related);
                }
              }
            } catch (productsError) {
              console.error('Error fetching related products:', productsError);
              // Fallback to demo data for related products
              fallbackToLocalData();
            }

            return; // Exit early if API call was successful
          }
        } catch (apiError) {
          console.error('API error:', apiError);
          // Continue to fallback methods
        }

        // Fallback to local data if API fails
        fallbackToLocalData();
      } catch (err) {
        console.error('Error loading product:', err);
        setError(`Failed to load product details: ${err.message}`);

        // If product not found, redirect to products page after a delay
        if (err.message === 'Product not found') {
          setTimeout(() => {
            navigate('/products');
          }, 3000);
        }
      } finally {
        setLoading(false);
      }
    };

    // Fallback function to use local data
    const fallbackToLocalData = () => {
      console.log('Falling back to local data...');

      // First try to find the product in the demo data context
      let productData = demoProducts.find(p => p.id === id);

      if (!productData) {
        console.log('Product not found in context, trying utility function');
        // If not found in context, try the utility function
        productData = getDemoProductById(id);
      }

      if (!productData) {
        throw new Error('Product not found');
      }

      console.log('Found product in local data:', productData);
      setProduct(productData);

      // Find the category in the demo data
      if (productData.category_id) {
        console.log(`Finding category with ID: ${productData.category_id} in demo data`);

        // Try to find by exact match first
        let categoryData = demoCategories.find(category => category.id === productData.category_id);

        // If not found, try string comparison
        if (!categoryData) {
          const categoryIdStr = String(productData.category_id);
          categoryData = demoCategories.find(category => String(category.id) === categoryIdStr);
        }

        if (categoryData) {
          console.log('Found category in local data:', categoryData);
          setCategory(categoryData);
        } else {
          // Create a placeholder category object if not found
          setCategory({
            id: productData.category_id,
            name: productData.category_name || 'Uncategorized'
          });
        }

        // Find related products in the same category
        console.log('Finding related products from local data...');
        if (demoProducts && demoProducts.length > 0) {
          // Use products from context
          const categoryIdStr = String(productData.category_id);
          const related = demoProducts
            .filter(p => {
              // Don't include the current product
              if (p.id === id) return false;

              // Match by category_id (try both direct and string comparison)
              return p.category_id === productData.category_id ||
                     String(p.category_id) === categoryIdStr;
            })
            .slice(0, 4); // Limit to 4 related products

          console.log('Related products from local data:', related.length);
          setRelatedProducts(related);
        } else {
          // Fallback to empty array
          console.warn('No products in context for related products');
          setRelatedProducts([]);
        }
      }
    };

    fetchProductDetails();
  }, [id, navigate, demoProducts, demoCategories]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      // Get total stock using the utility function
      const totalStock = calculateTotalStock(product);

      // Check if the product is in stock
      if (totalStock <= 0) {
        alert('Sorry, this product is out of stock.');
        return;
      }

      // Check if there's enough stock
      if (totalStock < quantity) {
        alert(`Sorry, only ${totalStock} items are available.`);
        return;
      }

      // Add the product to the cart
      addToCart(product, quantity);

      // Show success message
      setAddedToCart(true);

      // Reset the success message after 3 seconds
      setTimeout(() => {
        setAddedToCart(false);
      }, 3000);
    }
  };

  const handleViewCart = () => {
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="md:flex md:items-start">
                <div className="md:w-1/2 h-96 bg-gray-200 rounded"></div>
                <div className="md:w-1/2 md:pl-8 mt-4 md:mt-0">
                  <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-12 bg-gray-200 rounded w-full mb-4"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error || 'Product not found'}
            </div>
            <Link
              to="/products"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
            >
              Back to Products
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-16">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav className="flex mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <Link to="/" className="text-gray-500 hover:text-gray-700">Home</Link>
              </li>
              <li>
                <span className="text-gray-400 mx-2">/</span>
                <Link to="/products" className="text-gray-500 hover:text-gray-700">Products</Link>
              </li>
              {category && (
                <li>
                  <span className="text-gray-400 mx-2">/</span>
                  <Link to={`/products?category=${category.id}`} className="text-gray-500 hover:text-gray-700">
                    {category.name}
                  </Link>
                </li>
              )}
              <li>
                <span className="text-gray-400 mx-2">/</span>
                <span className="text-gray-900">{product.name}</span>
              </li>
            </ol>
          </nav>

          <div className="md:flex md:items-start">
            {/* Product Image */}
            <div className="md:w-1/2 md:pr-8">
              <div className="bg-gray-200 rounded-lg overflow-hidden">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-auto object-center object-cover"
                  />
                ) : (
                  <div className="w-full h-96 flex items-center justify-center text-gray-500">
                    No image available
                  </div>
                )}
              </div>
            </div>

            {/* Product Details */}
            <div className="md:w-1/2 mt-6 md:mt-0">
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{product.name}</h1>

              <div className="mt-3 flex items-center justify-between">
                <p className="text-3xl text-gray-900 font-bold">${parseFloat(product.price).toFixed(2)}</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${isProductInStock(product) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {formatStockText(product)}
                </span>
              </div>

              {/* Display category information */}
              <div className="mt-3 flex items-center">
                <span className="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded">
                  {category ? category.name : (product.category_name || product.category || 'Uncategorized')}
                </span>
                {product.sku && (
                  <span className="text-sm text-gray-500 ml-3">
                    SKU: {product.sku}
                  </span>
                )}
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900">Description</h3>
                <div className="mt-4 text-base text-gray-700 space-y-6">
                  {product.description ? (
                    <div className="prose prose-sm max-w-none">
                      {/* Handle both plain text and HTML descriptions */}
                      {product.description.includes('<') && product.description.includes('>') ? (
                        <div dangerouslySetInnerHTML={{ __html: product.description }} />
                      ) : (
                        <p>{product.description}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No description available for this product.</p>
                  )}
                </div>
              </div>

              {/* Product Features */}
              {product.features && (
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900">Key Features</h3>
                  <div className="mt-4">
                    <ul className="list-disc pl-5 space-y-2">
                      {Array.isArray(product.features) ? (
                        product.features.map((feature, index) => (
                          <li key={index} className="text-base text-gray-700">{feature}</li>
                        ))
                      ) : typeof product.features === 'object' ? (
                        Object.entries(product.features).map(([key, value]) => (
                          <li key={key} className="text-base text-gray-700">
                            <span className="font-medium">{key}:</span> {value}
                          </li>
                        ))
                      ) : (
                        <li className="text-base text-gray-700">{product.features}</li>
                      )}
                    </ul>
                  </div>
                </div>
              )}

              {isProductInStock(product) && (
                <div className="mt-6">
                  <div className="flex items-center">
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mr-4">
                      Quantity
                    </label>
                    <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      min="1"
                      max={calculateTotalStock(product)}
                      value={quantity}
                      onChange={handleQuantityChange}
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm border-gray-300 rounded-md w-20"
                    />
                  </div>

                  <div className="mt-4 space-y-3">
                    {addedToCart ? (
                      <div className="flex flex-col space-y-3">
                        <div className="bg-green-50 border border-green-200 rounded-md p-3 flex items-center">
                          <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-green-700 text-sm font-medium">
                            {quantity} item{quantity > 1 ? 's' : ''} added to your cart
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleViewCart}
                          className="w-full bg-primary-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          View Cart
                        </button>
                        <button
                          type="button"
                          onClick={() => setAddedToCart(false)}
                          className="w-full bg-white border border-gray-300 rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          Continue Shopping
                        </button>
                      </div>
                    ) : isProductInStock(product) ? (
                        <button
                          type="button"
                          onClick={handleAddToCart}
                          className="w-full bg-primary-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          Add to Cart
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="w-full bg-gray-300 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-gray-500 cursor-not-allowed"
                        >
                          Out of Stock
                        </button>
                      )
                    }
                  </div>
                </div>
              )}

              {/* Admin Panel Link (only visible to admins) */}
              {isAdmin && (
                <div className="mt-8 border-t border-gray-200 pt-6">
                  <Link
                    to={`/admin/products/edit/${product.id}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Edit in Admin Panel
                  </Link>
                </div>
              )}

              {/* Additional Details */}
              <div className="mt-8 border-t border-gray-200 pt-6">
                <h3 className="text-sm font-medium text-gray-900">Product Details</h3>
                <div className="mt-2 space-y-2">
                  {category && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-gray-900">Category:</span> {category.name}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-900">SKU:</span> {product.sku || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-900">Product ID:</span> {product.id}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-900">Added On:</span> {product.created_at ? new Date(product.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                  {product.updated_at && product.updated_at !== product.created_at && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-gray-900">Last Updated:</span> {new Date(product.updated_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="mt-8 border-t border-gray-200 pt-6">
                <h3 className="text-sm font-medium text-gray-900">Technical Specifications</h3>
                <div className="mt-2 space-y-2">
                  {/* Display any technical specifications from the product data */}
                  {product.specifications ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <p key={key} className="text-sm text-gray-600">
                          <span className="font-medium text-gray-900">{key}:</span> {value}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No technical specifications available</p>
                  )}
                </div>
              </div>

              {/* Inventory Information */}
              <div className="mt-8 border-t border-gray-200 pt-6">
                <h3 className="text-sm font-medium text-gray-900">Inventory Information</h3>
                <div className="mt-2 space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-900">Warehouse Stock:</span> {product.stock?.warehouse || 0} units
                  </p>

                  {product.stock?.stores && Object.keys(product.stock.stores).length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-900 mt-2">Store Availability:</p>
                      <ul className="mt-1 pl-5 list-disc text-sm text-gray-600">
                        {Object.entries(product.stock.stores).map(([storeId, quantity]) => {
                          // Find store name if available
                          const store = demoStores.find(s => s.id === storeId || s.id === parseInt(storeId));
                          const storeName = store ? store.name : `Store ${storeId}`;

                          return (
                            <li key={storeId}>
                              {storeName}: {quantity} units
                              {store && store.location && (
                                <span className="text-gray-500 ml-1">({store.location})</span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  <p className="text-sm text-gray-600 mt-2">
                    <span className="font-medium text-gray-900">Total Available:</span> {calculateTotalStock(product)} units
                  </p>
                </div>
              </div>

              {/* Shipping Information */}
              <div className="mt-8 border-t border-gray-200 pt-6">
                <h3 className="text-sm font-medium text-gray-900">Shipping Information</h3>
                <div className="mt-2 space-y-2">
                  {product.shipping ? (
                    <>
                      {product.shipping.weight && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium text-gray-900">Weight:</span> {product.shipping.weight} kg
                        </p>
                      )}
                      {product.shipping.dimensions && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium text-gray-900">Dimensions:</span> {product.shipping.dimensions}
                        </p>
                      )}
                      {product.shipping.handling_time && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium text-gray-900">Handling Time:</span> {product.shipping.handling_time}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 italic">Standard shipping applies to this product</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">Related Products</h2>
              <div className="mt-6 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.map((relatedProduct) => (
                  <div key={relatedProduct.id} className="group relative">
                    <div className="w-full h-60 bg-gray-200 rounded-lg overflow-hidden group-hover:opacity-75">
                      {relatedProduct.image ? (
                        <img
                          src={relatedProduct.image}
                          alt={relatedProduct.name}
                          className="w-full h-full object-center object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex justify-between">
                      <div>
                        <h3 className="text-sm text-gray-700">
                          <Link to={`/products/${relatedProduct.id}`}>
                            <span aria-hidden="true" className="absolute inset-0" />
                            {relatedProduct.name}
                          </Link>
                        </h3>
                      </div>
                      <p className="text-sm font-medium text-gray-900">${parseFloat(relatedProduct.price).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetailPage;
