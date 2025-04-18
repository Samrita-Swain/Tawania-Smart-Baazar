import { useState, useEffect } from 'react';
import { useDemoData } from '../../context/DemoDataContext';
import ApiTester from './ApiTester';

const DataDebugger = () => {
  const {
    products,
    categories,
    stores,
    orders,
    users
  } = useDemoData();

  useEffect(() => {
    console.log('=== DATA DEBUGGER ===');
    console.log('Products count:', products.length);
    console.log('Categories count:', categories.length);
    console.log('Stores count:', stores.length);
    console.log('Orders count:', orders.length);
    console.log('Users count:', users.length);

    if (products.length > 0) {
      console.log('Sample product:', products[0]);
    } else {
      console.warn('No products available in demo data!');
    }

    console.log('=== END DATA DEBUGGER ===');
  }, [products, categories, stores, orders, users]);

  const [showDebugger, setShowDebugger] = useState(false);

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={() => setShowDebugger(!showDebugger)}
        className="bg-gray-800 text-white px-3 py-1 rounded-md text-sm"
      >
        {showDebugger ? 'Hide' : 'Show'} Debug Tools
      </button>

      {showDebugger && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Debug Tools</h2>
              <button
                onClick={() => setShowDebugger(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <ApiTester />

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Data Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-blue-500">Products</div>
                  <div className="text-2xl font-bold">{products.length}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-green-500">Categories</div>
                  <div className="text-2xl font-bold">{categories.length}</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm text-purple-500">Stores</div>
                  <div className="text-2xl font-bold">{stores.length}</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-sm text-yellow-500">Orders</div>
                  <div className="text-2xl font-bold">{orders.length}</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-sm text-red-500">Users</div>
                  <div className="text-2xl font-bold">{users.length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
};

export default DataDebugger;
