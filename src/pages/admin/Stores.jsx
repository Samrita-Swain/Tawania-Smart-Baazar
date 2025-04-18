import { useState, useEffect } from 'react';
import Header from '../../components/admin/Header';
import Sidebar from '../../components/admin/Sidebar';
import { useDemoData } from '../../context/DemoDataContext';

const Stores = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Store form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentStore, setCurrentStore] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    manager: ''
  });

  // Delete confirmation state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState(null);

  // Use demo data from context
  const { stores: demoStores, addStore: addDemoStore, updateStore: updateDemoStore, deleteStore: deleteDemoStore } = useDemoData();

  useEffect(() => {
    try {
      setLoading(true);
      // Use the demo data directly
      console.log('Using demo stores data:', demoStores);
      setStores(demoStores);
    } catch (err) {
      console.error('Error loading demo stores:', err);
      setError('Failed to load stores');
      setStores([]);
    } finally {
      setLoading(false);
    }
  }, [demoStores]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAddStore = () => {
    setIsEditMode(false);
    setFormData({
      name: '',
      address: '',
      phone: '',
      email: '',
      manager: ''
    });
    setIsModalOpen(true);
  };

  const handleEditStore = (store) => {
    setIsEditMode(true);
    setCurrentStore(store);
    setFormData({
      name: store.name,
      address: store.address || '',
      phone: store.phone || '',
      email: store.email || '',
      manager: store.manager || ''
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (store) => {
    setStoreToDelete(store);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isEditMode && currentStore) {
        // Update store using demo data function
        updateDemoStore(currentStore.id, {
          ...currentStore,
          ...formData
        });
      } else {
        // Add new store using demo data function
        addDemoStore({
          id: (demoStores.length + 1).toString(),
          ...formData,
          location: formData.address // Map address to location for demo data structure
        });
      }

      // Close modal and reset form
      setIsModalOpen(false);
      setFormData({
        name: '',
        address: '',
        phone: '',
        email: '',
        manager: ''
      });
    } catch (err) {
      console.error('Error saving store:', err);
      setError(isEditMode ? 'Failed to update store' : 'Failed to create store');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!storeToDelete) return;

    try {
      // Delete store using demo data function
      deleteDemoStore(storeToDelete.id);

      // Close modal
      setIsDeleteModalOpen(false);
      setStoreToDelete(null);
    } catch (err) {
      console.error('Error deleting store:', err);
      setError('Failed to delete store');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

      <div className="flex">
        <Sidebar isMobileMenuOpen={isMobileMenuOpen} />

        <main className="flex-1 p-5">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-5">
              <h1 className="text-2xl font-semibold text-gray-900">Store Management</h1>
              <button
                onClick={handleAddStore}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Add Store
              </button>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
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
              <div className="bg-white shadow rounded-lg">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Store Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Address
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Manager
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Array.isArray(stores) && stores.length > 0 ? (
                        stores.map((store) => (
                          <tr key={store.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {store.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {store.address || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {store.phone && <div>{store.phone}</div>}
                              {store.email && <div className="text-xs">{store.email}</div>}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {store.manager || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => handleEditStore(store)}
                                className="text-primary-600 hover:text-primary-900 mr-4"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteClick(store)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                            No stores found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Store Form Modal */}
      {isModalOpen && (
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
                      {isEditMode ? 'Edit Store' : 'Add New Store'}
                    </h3>

                    <form onSubmit={handleFormSubmit}>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Store Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          required
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address
                        </label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone
                        </label>
                        <input
                          type="text"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Manager
                        </label>
                        <input
                          type="text"
                          name="manager"
                          value={formData.manager}
                          onChange={handleInputChange}
                          className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>

                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                          {isEditMode ? 'Update Store' : 'Add Store'}
                        </button>
                        <button
                          type="button"
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto sm:text-sm"
                          onClick={() => setIsModalOpen(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Delete Store
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete the store "{storeToDelete?.name}"? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleDeleteConfirm}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setIsDeleteModalOpen(false)}
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

export default Stores;
