import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDemoData } from '../../context/DemoDataContext';

const WarehouseInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get warehouse inventory from DemoDataContext
  const { warehouseInventory: demoWarehouseInventory } = useDemoData();

  useEffect(() => {
    try {
      setLoading(true);
      setError(null);

      console.log('Using warehouse inventory from DemoDataContext');

      if (demoWarehouseInventory && demoWarehouseInventory.length > 0) {
        // Use warehouse inventory from context
        console.log(`Found ${demoWarehouseInventory.length} items in warehouse inventory`);
        setInventory(demoWarehouseInventory);
      } else {
        // Fallback to mock data if context data is empty
        console.warn('No warehouse inventory found in context, using mock data');
        const mockInventory = [
          { id: '1', productId: '1', productName: 'Smartphone X', quantity: 50, location: 'A1', lastUpdated: new Date().toISOString().split('T')[0] },
          { id: '2', productId: '2', productName: 'Laptop Pro', quantity: 35, location: 'A2', lastUpdated: new Date().toISOString().split('T')[0] },
          { id: '3', productId: '3', productName: 'Wireless Headphones', quantity: 75, location: 'B1', lastUpdated: new Date().toISOString().split('T')[0] },
          { id: '4', productId: '4', productName: 'Organic Face Cream', quantity: 120, location: 'C1', lastUpdated: new Date().toISOString().split('T')[0] },
          { id: '5', productId: '5', productName: 'Coffee Maker', quantity: 45, location: 'D1', lastUpdated: new Date().toISOString().split('T')[0] }
        ];
        setInventory(mockInventory);
      }
    } catch (err) {
      console.error('Error setting warehouse inventory:', err);
      setError('Failed to load inventory data. Using mock data instead.');

      // Use mock data as fallback
      const mockInventory = [
        { id: '1', productId: '1', productName: 'Smartphone X', quantity: 50, location: 'A1', lastUpdated: new Date().toISOString().split('T')[0] },
        { id: '2', productId: '2', productName: 'Laptop Pro', quantity: 35, location: 'A2', lastUpdated: new Date().toISOString().split('T')[0] },
        { id: '3', productId: '3', productName: 'Wireless Headphones', quantity: 75, location: 'B1', lastUpdated: new Date().toISOString().split('T')[0] },
        { id: '4', productId: '4', productName: 'Organic Face Cream', quantity: 120, location: 'C1', lastUpdated: new Date().toISOString().split('T')[0] },
        { id: '5', productId: '5', productName: 'Coffee Maker', quantity: 45, location: 'D1', lastUpdated: new Date().toISOString().split('T')[0] }
      ];
      setInventory(mockInventory);
    } finally {
      setLoading(false);
    }
  }, [demoWarehouseInventory]);

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2.5"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2.5"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2.5"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2.5"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  // Show warning if there was an error but we're using mock data
  const warningMessage = error && inventory.length > 0;


  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Warehouse Inventory</h3>
        <Link to="/admin/warehouse" className="text-sm font-medium text-primary-600 hover:text-primary-500">
          View all
        </Link>
      </div>

      {warningMessage && (
        <div className="mx-4 mb-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                {error} <span className="font-medium">Showing mock data for demonstration.</span>
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="border-t border-gray-200 overflow-x-auto">
        {inventory && inventory.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inventory.map((item) => (
                <tr key={item.id || `item-${item.productId || Math.random()}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600">
                    <Link to={`/admin/products/${item.productId}`}>{item.productName || 'Unknown Product'}</Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.location || 'Not specified'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.lastUpdated ? new Date(item.lastUpdated).toLocaleDateString() : 'Not available'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <p>No inventory items found.</p>
            <p className="mt-2 text-sm">Items will appear here once they are added to the warehouse.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WarehouseInventory;
