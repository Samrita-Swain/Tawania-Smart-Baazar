import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storeService } from '../../services/api';

const StoreInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        // In a real app, this would use the store ID from the authenticated user
        const storeId = currentUser?.storeId || 'store-1';
        const response = await storeService.getStoreInventory(storeId);
        setInventory(response.data);
      } catch (err) {
        console.error('Error fetching store inventory:', err);
        setError('Failed to load inventory data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInventory();
  }, [currentUser]);
  
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2.5"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2.5"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2.5"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }
  
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Store Inventory</h3>
      </div>
      <div className="border-t border-gray-200 overflow-x-auto">
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
                Last Updated
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {inventory.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.productName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(item.lastUpdated).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    item.quantity > 10
                      ? 'bg-green-100 text-green-800'
                      : item.quantity > 5
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {item.quantity > 10
                      ? 'In Stock'
                      : item.quantity > 5
                      ? 'Low Stock'
                      : 'Critical Stock'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StoreInventory;
