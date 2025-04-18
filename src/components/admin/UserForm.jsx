import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { userService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { hasPermission } from '../../utils/permissions';

const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'store',
    storeId: '',
    password: '',
    confirmPassword: ''
  });

  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPermissions, setShowPermissions] = useState(false);
  const [permissions, setPermissions] = useState({
    dashboard: true,
    products: {
      view: true,
      create: false,
      edit: false,
      delete: false
    },
    categories: {
      view: true,
      create: false,
      edit: false,
      delete: false
    },
    orders: {
      view: true,
      update: false,
      cancel: false
    },
    warehouse: {
      view: false,
      manage: false,
      transfer: false,
      audit: false
    },
    stores: {
      view: false,
      create: false,
      edit: false,
      delete: false,
      manage: false
    },
    reports: {
      view: true,
      export: false
    }
  });

  useEffect(() => {
    // Fetch stores for store manager assignment
    const fetchStores = async () => {
      try {
        // In a real app, this would be a call to get stores
        // For now, we'll use mock data
        setStores([
          { id: 'store-1', name: 'Downtown Store' },
          { id: 'store-2', name: 'Uptown Store' }
        ]);
      } catch (err) {
        console.error('Error fetching stores:', err);
      }
    };

    fetchStores();

    // If in edit mode, fetch the user data
    if (isEditMode) {
      const fetchUser = async () => {
        try {
          setLoading(true);
          const response = await userService.getUsers();
          const user = response.data.find(u => u.id === id);
          
          if (user) {
            setFormData({
              name: user.name,
              email: user.email,
              role: user.role,
              storeId: user.storeId || '',
              password: '',
              confirmPassword: ''
            });
            
            // In a real app, you would fetch user permissions
            // For now, we'll use default permissions
          } else {
            setError('User not found');
          }
        } catch (err) {
          console.error('Error fetching user:', err);
          setError('Failed to load user data');
        } finally {
          setLoading(false);
        }
      };

      fetchUser();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'role') {
      // Reset storeId if role is not store
      if (value !== 'store') {
        setFormData({ ...formData, [name]: value, storeId: '' });
      } else {
        setFormData({ ...formData, [name]: value });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handlePermissionChange = (e) => {
    const { name, checked } = e.target;
    
    if (name.includes('.')) {
      // Handle nested permissions (e.g., products.view)
      const [category, action] = name.split('.');
      setPermissions({
        ...permissions,
        [category]: {
          ...permissions[category],
          [action]: checked
        }
      });
    } else {
      // Handle top-level permissions (e.g., dashboard)
      setPermissions({
        ...permissions,
        [name]: checked
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Prepare data for submission
      const userData = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        ...(formData.role === 'store' && { storeId: formData.storeId }),
        ...(formData.password && { password: formData.password })
      };
      
      if (isEditMode) {
        await userService.updateUser(id, userData);
      } else {
        await userService.createUser(userData);
      }
      
      navigate('/admin/users');
    } catch (err) {
      console.error('Error saving user:', err);
      setError(err.message || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  // Check if current user can manage permissions
  const canManagePermissions = hasPermission(userRole, 'users.manage_permissions');

  if (loading && isEditMode) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2.5"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2.5"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2.5"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          {isEditMode ? 'Edit User' : 'Add New User'}
        </h3>
      </div>
      
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
            </div>
            
            <div className="sm:col-span-3">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
            </div>
            
            <div className="sm:col-span-3">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <div className="mt-1">
                <select
                  name="role"
                  id="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  {userRole === 'superadmin' && (
                    <option value="superadmin">Super Admin</option>
                  )}
                  <option value="admin">Admin</option>
                  <option value="store">Store Manager</option>
                  <option value="warehouse">Warehouse Manager</option>
                </select>
              </div>
            </div>
            
            {formData.role === 'store' && (
              <div className="sm:col-span-3">
                <label htmlFor="storeId" className="block text-sm font-medium text-gray-700">
                  Assigned Store
                </label>
                <div className="mt-1">
                  <select
                    name="storeId"
                    id="storeId"
                    value={formData.storeId}
                    onChange={handleChange}
                    className="input"
                    required
                  >
                    <option value="">Select a store</option>
                    {stores.map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            
            <div className="sm:col-span-3">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password {isEditMode && '(Leave blank to keep current)'}
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input"
                  {...(!isEditMode && { required: true })}
                  minLength="6"
                />
              </div>
            </div>
            
            <div className="sm:col-span-3">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input"
                  {...(!isEditMode && { required: true })}
                  minLength="6"
                />
              </div>
            </div>
            
            {canManagePermissions && formData.role !== 'superadmin' && (
              <div className="sm:col-span-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-700">Permissions</h4>
                  <button
                    type="button"
                    className="text-sm text-primary-600 hover:text-primary-500"
                    onClick={() => setShowPermissions(!showPermissions)}
                  >
                    {showPermissions ? 'Hide Permissions' : 'Show Permissions'}
                  </button>
                </div>
                
                {showPermissions && (
                  <div className="mt-4 border border-gray-200 rounded-md p-4">
                    <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 gap-x-6">
                      {/* Dashboard Permission */}
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="dashboard"
                            name="dashboard"
                            type="checkbox"
                            checked={permissions.dashboard}
                            onChange={handlePermissionChange}
                            className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="dashboard" className="font-medium text-gray-700">Dashboard</label>
                          <p className="text-gray-500">Access to view dashboard</p>
                        </div>
                      </div>
                      
                      {/* Products Permissions */}
                      <div className="flex flex-col space-y-2">
                        <div className="text-sm font-medium text-gray-700">Products</div>
                        <div className="ml-2 space-y-2">
                          <div className="flex items-start">
                            <div className="flex items-center h-5">
                              <input
                                id="products.view"
                                name="products.view"
                                type="checkbox"
                                checked={permissions.products.view}
                                onChange={handlePermissionChange}
                                className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor="products.view" className="font-medium text-gray-700">View Products</label>
                            </div>
                          </div>
                          <div className="flex items-start">
                            <div className="flex items-center h-5">
                              <input
                                id="products.create"
                                name="products.create"
                                type="checkbox"
                                checked={permissions.products.create}
                                onChange={handlePermissionChange}
                                className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor="products.create" className="font-medium text-gray-700">Create Products</label>
                            </div>
                          </div>
                          <div className="flex items-start">
                            <div className="flex items-center h-5">
                              <input
                                id="products.edit"
                                name="products.edit"
                                type="checkbox"
                                checked={permissions.products.edit}
                                onChange={handlePermissionChange}
                                className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor="products.edit" className="font-medium text-gray-700">Edit Products</label>
                            </div>
                          </div>
                          <div className="flex items-start">
                            <div className="flex items-center h-5">
                              <input
                                id="products.delete"
                                name="products.delete"
                                type="checkbox"
                                checked={permissions.products.delete}
                                onChange={handlePermissionChange}
                                className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor="products.delete" className="font-medium text-gray-700">Delete Products</label>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* More permissions can be added here */}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/admin/users')}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Saving...' : 'Save User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
