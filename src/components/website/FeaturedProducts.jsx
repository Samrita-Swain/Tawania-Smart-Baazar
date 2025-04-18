import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDemoData } from '../../context/DemoDataContext';
import { getDemoProducts } from '../../utils/demoDataLoader';
import FallbackProducts from './FallbackProducts';

const FeaturedProducts = () => {
  const { products: allProducts } = useDemoData();
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    console.log('FeaturedProducts: allProducts from context:', allProducts?.length || 0);

    // Get 4 random products from context
    if (allProducts && allProducts.length > 0) {
      const randomProducts = [...allProducts]
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);

      setFeaturedProducts(randomProducts);
      console.log('Featured products set from context:', randomProducts.length);
    } else {
      // Fallback to utility function if context has no products
      console.warn('No products in context, using fallback data');
      const fallbackProducts = getDemoProducts();

      if (fallbackProducts.length > 0) {
        const randomFallbackProducts = [...fallbackProducts]
          .sort(() => 0.5 - Math.random())
          .slice(0, 4);

        setFeaturedProducts(randomFallbackProducts);
        console.log('Featured products set from fallback:', randomFallbackProducts.length);
      } else {
        console.warn('No products available for featured products');
        setFeaturedProducts([]);
      }
    }
  }, [allProducts]);

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">Featured Products</h2>
          <Link to="/products" className="hidden text-sm font-semibold text-primary-600 hover:text-primary-500 sm:block">
            All products<span aria-hidden="true"> &rarr;</span>
          </Link>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
            {featuredProducts.map((product) => (
              <div key={product.id} className="group relative">
                <div className="relative w-full h-72 rounded-lg overflow-hidden group-hover:opacity-75 sm:aspect-w-2 sm:aspect-h-3 sm:h-72">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-center object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/300x200?text=Product+Image';
                    }}
                  />
                </div>
                <h3 className="mt-4 text-base font-semibold text-gray-900">
                  <Link to={`/products/${product.id}`}>
                    <span className="absolute inset-0" />
                    {product.name}
                  </Link>
                </h3>
                <p className="mt-1 text-sm text-gray-500">{product.description}</p>
                <p className="mt-1 text-lg font-medium text-gray-900">${parseFloat(product.price).toFixed(2)}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-8">
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
              <p className="font-bold">Demo Products</p>
              <p>Here are some sample products from our catalog.</p>
            </div>
            <FallbackProducts />
          </div>
        )}

        <div className="mt-12 text-sm font-semibold text-primary-600 hover:text-primary-500 sm:hidden">
          <Link to="/products">
            Browse all products<span aria-hidden="true"> &rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FeaturedProducts;
