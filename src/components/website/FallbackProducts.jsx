import { Link } from 'react-router-dom';

const FallbackProducts = () => {
  // Hardcoded fallback products
  const fallbackProducts = [
    {
      id: 'fallback-1',
      name: 'Smartphone X',
      description: 'Latest smartphone with advanced features',
      price: 999.99,
      category_id: '1',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'fallback-2',
      name: 'Laptop Pro',
      description: 'High-performance laptop for professionals',
      price: 1499.99,
      category_id: '1',
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'fallback-3',
      name: 'Wireless Headphones',
      description: 'Premium noise-cancelling headphones',
      price: 299.99,
      category_id: '1',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'fallback-4',
      name: 'Smart Watch',
      description: 'Feature-packed smartwatch with health tracking',
      price: 249.99,
      category_id: '1',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    },
  ];
  
  return (
    <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
      {fallbackProducts.map((product) => (
        <div key={product.id} className="group relative">
          <div className="w-full h-60 bg-gray-200 rounded-lg overflow-hidden group-hover:opacity-75">
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
          </div>

          <div className="mt-4 flex justify-between">
            <div>
              <h3 className="text-sm text-gray-700">
                <Link to={`/products/${product.id}`}>
                  <span aria-hidden="true" className="absolute inset-0" />
                  {product.name}
                </Link>
              </h3>
              <p className="mt-1 text-sm text-gray-500">Electronics</p>
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

export default FallbackProducts;
