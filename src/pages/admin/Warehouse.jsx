import { useState, useEffect } from 'react';
import Header from '../../components/admin/Header';
import Sidebar from '../../components/admin/Sidebar';
import { useDemoData } from '../../context/DemoDataContext';
import { clearWarehouseInventoryFromStorage } from '../../utils/clearWarehouseInventory';

const Warehouse = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [stores, setStores] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [clearSuccess, setClearSuccess] = useState(false);

  // Transfer form state
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedStore, setSelectedStore] = useState('');
  const [transferQuantity, setTransferQuantity] = useState(1);

  // Get data from DemoDataContext
  const {
    warehouseInventory: demoWarehouseInventory,
    stores: demoStores,
    transfers: demoTransfers = [],
    updateWarehouseInventory,
    products: demoProducts,
    forceRefreshData
  } = useDemoData();

  useEffect(() => {
    try {
      setLoading(true);
      setError(null);

      console.log('Using data from DemoDataContext');

      // Set warehouse inventory from context
      if (demoWarehouseInventory && demoWarehouseInventory.length > 0) {
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

      // Set stores from context
      if (demoStores && demoStores.length > 0) {
        console.log(`Found ${demoStores.length} stores`);
        setStores(demoStores);
      } else {
        // Fallback to mock data if context data is empty
        console.warn('No stores found in context, using mock data');
        const mockStores = [
          { id: '1', name: 'Main Store', location: 'Downtown', manager: 'John Manager' },
          { id: '2', name: 'North Branch', location: 'North City', manager: 'Sarah Manager' },
          { id: '3', name: 'East Branch', location: 'East City', manager: 'Mike Manager' }
        ];
        setStores(mockStores);
      }

      // Set transfers from context or use mock data
      if (demoTransfers && demoTransfers.length > 0) {
        console.log(`Found ${demoTransfers.length} transfers`);
        setTransfers(demoTransfers);
      } else {
        // Use mock transfers data
        console.log('No transfers found in context, using mock data');
        const mockTransfers = [
          { id: '1', productId: '1', productName: 'Smartphone X', fromLocation: 'Warehouse', toLocation: 'Main Store', quantity: 10, date: '2023-04-01', status: 'completed' },
          { id: '2', productId: '2', productName: 'Laptop Pro', fromLocation: 'Warehouse', toLocation: 'North Branch', quantity: 5, date: '2023-04-02', status: 'in-transit' },
          { id: '3', productId: '3', productName: 'Wireless Headphones', fromLocation: 'Warehouse', toLocation: 'East Branch', quantity: 15, date: '2023-04-03', status: 'pending' }
        ];
        setTransfers(mockTransfers);
      }
    } catch (err) {
      console.error('Error setting warehouse data:', err);
      setError('Failed to load warehouse data');
      setInventory([]);
      setStores([]);
      setTransfers([]);
    } finally {
      setLoading(false);
    }
  }, [demoWarehouseInventory, demoStores, demoTransfers]);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'in-transit':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to clear warehouse inventory
  const handleClearWarehouseInventory = async () => {
    try {
      setLoading(true);

      // Clear warehouse inventory from localStorage
      const success = clearWarehouseInventoryFromStorage();

      if (success) {
        setClearSuccess(true);
        // Show success message briefly
        setTimeout(() => setClearSuccess(false), 3000);

        // Force refresh data from API
        await forceRefreshData();

        // Clear local inventory state
        setInventory([]);
      }
    } catch (err) {
      console.error('Error clearing warehouse inventory:', err);
      setError('Failed to clear warehouse inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleTransferClick = (product) => {
    setSelectedProduct(product);
    setTransferQuantity(1);
    setSelectedStore(stores.length > 0 ? stores[0].id : '');
    setIsTransferModalOpen(true);
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();

    if (!selectedProduct || !selectedStore || transferQuantity <= 0) {
      setError('Please select a product, store, and valid quantity');
      return;
    }

    try {
      // Since we're using demo data, we'll simulate a transfer by updating our local state
      console.log('Simulating transfer of inventory:', {
        productId: selectedProduct.productId,
        productName: selectedProduct.productName,
        toStoreId: selectedStore,
        quantity: transferQuantity
      });

      // Create a new transfer record
      const newTransfer = {
        id: `transfer-${Date.now()}`,
        productId: selectedProduct.productId,
        productName: selectedProduct.productName,
        fromLocation: 'Warehouse',
        toLocation: stores.find(store => store.id === selectedStore)?.name || 'Unknown Store',
        quantity: transferQuantity,
        date: new Date().toISOString().split('T')[0],
        status: 'completed'
      };

      // Update transfers list
      const updatedTransfers = [newTransfer, ...transfers];
      setTransfers(updatedTransfers);

      // Update inventory (reduce quantity)
      const newQuantity = Math.max(0, selectedProduct.quantity - transferQuantity);

      // Update warehouse inventory using the context function
      // This will also update the product's stock property
      updateWarehouseInventory(selectedProduct.productId, newQuantity);

      // Update local state for immediate UI update
      const updatedInventory = inventory.map(item => {
        if (item.productId === selectedProduct.productId) {
          return {
            ...item,
            quantity: newQuantity
          };
        }
        return item;
      });
      setInventory(updatedInventory);

      // Show success message
      alert(`Successfully transferred ${transferQuantity} units of ${selectedProduct.productName} to ${stores.find(store => store.id === selectedStore)?.name}`);

      // Close modal
      setIsTransferModalOpen(false);
      setSelectedProduct(null);
      setSelectedStore('');
      setTransferQuantity(1);
    } catch (err) {
      console.error('Error transferring inventory:', err);
      setError('Failed to transfer inventory');
    }
  };

  // Filter inventory based on search term
  const filteredInventory = searchTerm
    ? inventory.filter(item =>
        item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : inventory;

  return (
    <div className="min-h-screen bg-gray-100">
      <Header isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

      <div className="flex">
        <Sidebar isMobileMenuOpen={isMobileMenuOpen} />

        <main className="flex-1 p-5">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">Warehouse Management</h1>
              <p className="mt-2 text-gray-600">Manage your warehouse inventory and transfer products to stores.</p>
            </div>

            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
                <p className="font-bold">Error</p>
                <p>{error}</p>
              </div>
            )}

            {clearSuccess && (
              <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
                <p className="font-bold">Success</p>
                <p>Warehouse inventory has been cleared successfully!</p>
              </div>
            )}

            {loading ? (
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2.5"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2.5"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2.5"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Dashboard Summary Cards */}
                <div className="bg-white shadow rounded-lg p-6 border-t-4 border-blue-500">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Total Products</h3>
                    <span className="text-2xl font-bold text-blue-600">{inventory.length}</span>
                  </div>
                  <p className="text-gray-600 text-sm">Total unique products in warehouse inventory</p>
                </div>

                <div className="bg-white shadow rounded-lg p-6 border-t-4 border-green-500">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Total Quantity</h3>
                    <span className="text-2xl font-bold text-green-600">
                      {inventory.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">Total items across all products in warehouse</p>
                </div>

                <div className="bg-white shadow rounded-lg p-6 border-t-4 border-purple-500">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Recent Transfers</h3>
                    <span className="text-2xl font-bold text-purple-600">{transfers.length}</span>
                  </div>
                  <p className="text-gray-600 text-sm">Total product transfers to stores</p>
                </div>

                {/* Inventory Section */}
                <div className="bg-white shadow rounded-lg col-span-1 lg:col-span-3 mb-6">
                  <div className="px-6 py-5 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">Warehouse Inventory</h3>
                        <p className="mt-1 text-sm text-gray-500">Manage your product inventory and transfer items to stores.</p>
                      </div>
                      <div className="mt-3 md:mt-0 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                        <input
                          type="text"
                          placeholder="Search products..."
                          className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button
                          onClick={handleClearWarehouseInventory}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          title="Clear all warehouse inventory data"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Clear Inventory
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
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
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {Array.isArray(filteredInventory) && filteredInventory.length > 0 ? (
                          filteredInventory.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                                    <span className="text-gray-500 font-medium">{item.productName.charAt(0)}</span>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                                    <div className="text-sm text-gray-500">ID: {item.productId}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{item.quantity}</div>
                                <div className="text-xs text-gray-500">
                                  {item.quantity > 50 ? (
                                    <span className="text-green-600">In Stock</span>
                                  ) : item.quantity > 10 ? (
                                    <span className="text-yellow-600">Medium Stock</span>
                                  ) : (
                                    <span className="text-red-600">Low Stock</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{item.location}</div>
                                <div className="text-xs text-gray-500">Warehouse Section</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(item.lastUpdated).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => handleTransferClick(item)}
                                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                  </svg>
                                  Transfer
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                              {searchTerm ? 'No matching inventory items found' : 'No inventory items found'}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Transfer History Section */}
                <div className="bg-white shadow rounded-lg col-span-1 lg:col-span-3">
                  <div className="px-6 py-5 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">Transfer History</h3>
                        <p className="mt-1 text-sm text-gray-500">Recent product transfers from warehouse to stores.</p>
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Destination
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {Array.isArray(transfers) && transfers.length > 0 ? (
                          transfers.map((transfer) => (
                            <tr key={transfer.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{transfer.productName}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{transfer.toLocation}</div>
                                <div className="text-xs text-gray-500">From: {transfer.fromLocation}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{transfer.quantity} units</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{transfer.date}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(transfer.status)}`}>
                                  {transfer.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                              No transfer history found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Transfer Modal */}
      {isTransferModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Transfer Inventory to Store
                    </h3>

                    <form onSubmit={handleTransferSubmit}>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Product
                        </label>
                        <div className="flex items-center p-2 border border-gray-300 rounded-md bg-gray-50">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                            <span className="text-gray-500 font-medium">{selectedProduct?.productName.charAt(0)}</span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{selectedProduct?.productName}</div>
                            <div className="text-xs text-gray-500">Available: {selectedProduct?.quantity} units</div>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <label htmlFor="store" className="block text-sm font-medium text-gray-700 mb-2">
                          Destination Store
                        </label>
                        <select
                          id="store"
                          className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          value={selectedStore}
                          onChange={(e) => setSelectedStore(e.target.value)}
                          required
                        >
                          <option value="">Select a store</option>
                          {stores.map((store) => (
                            <option key={store.id} value={store.id}>
                              {store.name} ({store.location})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="mb-4">
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                          Quantity to Transfer
                        </label>
                        <input
                          type="number"
                          id="quantity"
                          className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          min="1"
                          max={selectedProduct?.quantity || 1}
                          value={transferQuantity}
                          onChange={(e) => setTransferQuantity(parseInt(e.target.value) || 1)}
                          required
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Maximum: {selectedProduct?.quantity || 0} units available
                        </p>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleTransferSubmit}
                >
                  Transfer
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setIsTransferModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Warehouse;
