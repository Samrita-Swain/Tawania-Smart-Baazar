import { useState } from 'react';
import Header from '../../components/admin/Header';
import Sidebar from '../../components/admin/Sidebar';
import { useAuth } from '../../context/AuthContext';

const Settings = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const { currentUser } = useAuth();
  
  // General settings state
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'Twania Smart Bazaar',
    siteDescription: 'Multi-vendor e-commerce platform',
    contactEmail: 'support@twaniabazaar.com',
    contactPhone: '+1 (555) 123-4567',
    address: '123 Commerce St, Business City, 12345',
    currency: 'USD',
    taxRate: 7.5,
    enableRegistration: true
  });
  
  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    orderConfirmations: true,
    stockAlerts: true,
    marketingEmails: false,
    systemUpdates: true
  });
  
  // Permission settings state
  const [permissionSettings, setPermissionSettings] = useState({
    roles: [
      { id: 1, name: 'superadmin', description: 'Full system access', editable: false },
      { id: 2, name: 'admin', description: 'Administrative access with some restrictions', editable: true },
      { id: 3, name: 'store', description: 'Store management access', editable: true },
      { id: 4, name: 'warehouse', description: 'Warehouse management access', editable: true },
      { id: 5, name: 'customer', description: 'Customer account access', editable: true }
    ],
    permissions: {
      admin: {
        manageUsers: true,
        manageStores: true,
        manageProducts: true,
        manageOrders: true,
        viewReports: true,
        manageSettings: false
      },
      store: {
        manageUsers: false,
        manageStores: false,
        manageProducts: true,
        manageOrders: true,
        viewReports: true,
        manageSettings: false
      },
      warehouse: {
        manageUsers: false,
        manageStores: false,
        manageProducts: false,
        manageOrders: false,
        viewReports: false,
        manageSettings: false,
        manageInventory: true
      }
    }
  });
  
  // Handle general settings changes
  const handleGeneralSettingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGeneralSettings({
      ...generalSettings,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Handle notification settings changes
  const handleNotificationSettingChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings({
      ...notificationSettings,
      [name]: checked
    });
  };
  
  // Handle permission changes
  const handlePermissionChange = (role, permission, checked) => {
    setPermissionSettings({
      ...permissionSettings,
      permissions: {
        ...permissionSettings.permissions,
        [role]: {
          ...permissionSettings.permissions[role],
          [permission]: checked
        }
      }
    });
  };
  
  // Handle form submissions
  const handleGeneralSettingsSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would save these settings to the server
    alert('General settings saved successfully!');
  };
  
  const handleNotificationSettingsSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would save these settings to the server
    alert('Notification settings saved successfully!');
  };
  
  const handlePermissionSettingsSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would save these settings to the server
    alert('Permission settings saved successfully!');
  };
  
  // Check if user has permission to edit settings
  const canEditSettings = currentUser && (currentUser.role === 'superadmin');
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Header isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
      
      <div className="flex">
        <Sidebar isMobileMenuOpen={isMobileMenuOpen} />
        
        <main className="flex-1 p-5">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-semibold text-gray-900 mb-5">System Settings</h1>
            
            {!canEditSettings && (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
                You don't have permission to modify these settings. Contact a superadmin for assistance.
              </div>
            )}
            
            {/* Settings Tabs */}
            <div className="mb-6">
              <div className="sm:hidden">
                <select
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value)}
                  className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="general">General Settings</option>
                  <option value="notifications">Notification Settings</option>
                  <option value="permissions">User Permissions</option>
                </select>
              </div>
              <div className="hidden sm:block">
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                      onClick={() => setActiveTab('general')}
                      className={`${
                        activeTab === 'general'
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                      General Settings
                    </button>
                    <button
                      onClick={() => setActiveTab('notifications')}
                      className={`${
                        activeTab === 'notifications'
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                      Notification Settings
                    </button>
                    <button
                      onClick={() => setActiveTab('permissions')}
                      className={`${
                        activeTab === 'permissions'
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                      User Permissions
                    </button>
                  </nav>
                </div>
              </div>
            </div>
            
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">General Settings</h2>
                <form onSubmit={handleGeneralSettingsSubmit}>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 mb-1">
                        Site Name
                      </label>
                      <input
                        type="text"
                        name="siteName"
                        id="siteName"
                        value={generalSettings.siteName}
                        onChange={handleGeneralSettingChange}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        disabled={!canEditSettings}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700 mb-1">
                        Site Description
                      </label>
                      <input
                        type="text"
                        name="siteDescription"
                        id="siteDescription"
                        value={generalSettings.siteDescription}
                        onChange={handleGeneralSettingChange}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        disabled={!canEditSettings}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        name="contactEmail"
                        id="contactEmail"
                        value={generalSettings.contactEmail}
                        onChange={handleGeneralSettingChange}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        disabled={!canEditSettings}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Phone
                      </label>
                      <input
                        type="text"
                        name="contactPhone"
                        id="contactPhone"
                        value={generalSettings.contactPhone}
                        onChange={handleGeneralSettingChange}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        disabled={!canEditSettings}
                      />
                    </div>
                    
                    <div className="sm:col-span-2">
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                        Business Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        id="address"
                        value={generalSettings.address}
                        onChange={handleGeneralSettingChange}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        disabled={!canEditSettings}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                        Currency
                      </label>
                      <select
                        name="currency"
                        id="currency"
                        value={generalSettings.currency}
                        onChange={handleGeneralSettingChange}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        disabled={!canEditSettings}
                      >
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="INR">INR - Indian Rupee</option>
                        <option value="JPY">JPY - Japanese Yen</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700 mb-1">
                        Tax Rate (%)
                      </label>
                      <input
                        type="number"
                        name="taxRate"
                        id="taxRate"
                        value={generalSettings.taxRate}
                        onChange={handleGeneralSettingChange}
                        step="0.01"
                        min="0"
                        max="100"
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        disabled={!canEditSettings}
                      />
                    </div>
                    
                    <div className="sm:col-span-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="enableRegistration"
                          id="enableRegistration"
                          checked={generalSettings.enableRegistration}
                          onChange={handleGeneralSettingChange}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          disabled={!canEditSettings}
                        />
                        <label htmlFor="enableRegistration" className="ml-2 block text-sm text-gray-700">
                          Enable user registration
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <button
                      type="submit"
                      className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                        canEditSettings
                          ? 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                          : 'bg-gray-400 cursor-not-allowed'
                      }`}
                      disabled={!canEditSettings}
                    >
                      Save Settings
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h2>
                <form onSubmit={handleNotificationSettingsSubmit}>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-700">Email Notifications</h3>
                        <p className="text-sm text-gray-500">Receive system notifications via email</p>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <input
                          type="checkbox"
                          name="emailNotifications"
                          id="emailNotifications"
                          checked={notificationSettings.emailNotifications}
                          onChange={handleNotificationSettingChange}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          disabled={!canEditSettings}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-700">Order Confirmations</h3>
                        <p className="text-sm text-gray-500">Receive notifications for new orders</p>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <input
                          type="checkbox"
                          name="orderConfirmations"
                          id="orderConfirmations"
                          checked={notificationSettings.orderConfirmations}
                          onChange={handleNotificationSettingChange}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          disabled={!canEditSettings}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-700">Stock Alerts</h3>
                        <p className="text-sm text-gray-500">Receive alerts when inventory is low</p>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <input
                          type="checkbox"
                          name="stockAlerts"
                          id="stockAlerts"
                          checked={notificationSettings.stockAlerts}
                          onChange={handleNotificationSettingChange}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          disabled={!canEditSettings}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-700">Marketing Emails</h3>
                        <p className="text-sm text-gray-500">Receive promotional emails and newsletters</p>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <input
                          type="checkbox"
                          name="marketingEmails"
                          id="marketingEmails"
                          checked={notificationSettings.marketingEmails}
                          onChange={handleNotificationSettingChange}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          disabled={!canEditSettings}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-700">System Updates</h3>
                        <p className="text-sm text-gray-500">Receive notifications about system updates</p>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <input
                          type="checkbox"
                          name="systemUpdates"
                          id="systemUpdates"
                          checked={notificationSettings.systemUpdates}
                          onChange={handleNotificationSettingChange}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          disabled={!canEditSettings}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <button
                      type="submit"
                      className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                        canEditSettings
                          ? 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                          : 'bg-gray-400 cursor-not-allowed'
                      }`}
                      disabled={!canEditSettings}
                    >
                      Save Notification Settings
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {/* User Permissions */}
            {activeTab === 'permissions' && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">User Permissions</h2>
                <form onSubmit={handlePermissionSettingsSubmit}>
                  <div className="mb-6">
                    <h3 className="text-md font-medium text-gray-700 mb-2">User Roles</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Role Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Description
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {permissionSettings.roles.map((role) => (
                            <tr key={role.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {role.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {role.description}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {role.editable ? 'Editable' : 'System Role'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-md font-medium text-gray-700 mb-2">Role Permissions</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Permission
                            </th>
                            {Object.keys(permissionSettings.permissions).map((role) => (
                              <th key={role} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {role}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              Manage Users
                            </td>
                            {Object.keys(permissionSettings.permissions).map((role) => (
                              <td key={role} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <input
                                  type="checkbox"
                                  checked={permissionSettings.permissions[role].manageUsers}
                                  onChange={(e) => handlePermissionChange(role, 'manageUsers', e.target.checked)}
                                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                  disabled={!canEditSettings || role === 'superadmin'}
                                />
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              Manage Stores
                            </td>
                            {Object.keys(permissionSettings.permissions).map((role) => (
                              <td key={role} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <input
                                  type="checkbox"
                                  checked={permissionSettings.permissions[role].manageStores}
                                  onChange={(e) => handlePermissionChange(role, 'manageStores', e.target.checked)}
                                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                  disabled={!canEditSettings || role === 'superadmin'}
                                />
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              Manage Products
                            </td>
                            {Object.keys(permissionSettings.permissions).map((role) => (
                              <td key={role} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <input
                                  type="checkbox"
                                  checked={permissionSettings.permissions[role].manageProducts}
                                  onChange={(e) => handlePermissionChange(role, 'manageProducts', e.target.checked)}
                                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                  disabled={!canEditSettings || role === 'superadmin'}
                                />
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              Manage Orders
                            </td>
                            {Object.keys(permissionSettings.permissions).map((role) => (
                              <td key={role} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <input
                                  type="checkbox"
                                  checked={permissionSettings.permissions[role].manageOrders}
                                  onChange={(e) => handlePermissionChange(role, 'manageOrders', e.target.checked)}
                                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                  disabled={!canEditSettings || role === 'superadmin'}
                                />
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              View Reports
                            </td>
                            {Object.keys(permissionSettings.permissions).map((role) => (
                              <td key={role} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <input
                                  type="checkbox"
                                  checked={permissionSettings.permissions[role].viewReports}
                                  onChange={(e) => handlePermissionChange(role, 'viewReports', e.target.checked)}
                                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                  disabled={!canEditSettings || role === 'superadmin'}
                                />
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              Manage Settings
                            </td>
                            {Object.keys(permissionSettings.permissions).map((role) => (
                              <td key={role} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <input
                                  type="checkbox"
                                  checked={permissionSettings.permissions[role].manageSettings}
                                  onChange={(e) => handlePermissionChange(role, 'manageSettings', e.target.checked)}
                                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                  disabled={!canEditSettings || role === 'superadmin'}
                                />
                              </td>
                            ))}
                          </tr>
                          {permissionSettings.permissions.warehouse && (
                            <tr>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                Manage Inventory
                              </td>
                              {Object.keys(permissionSettings.permissions).map((role) => (
                                <td key={role} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {role === 'warehouse' ? (
                                    <input
                                      type="checkbox"
                                      checked={permissionSettings.permissions[role].manageInventory}
                                      onChange={(e) => handlePermissionChange(role, 'manageInventory', e.target.checked)}
                                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                      disabled={!canEditSettings || role === 'superadmin'}
                                    />
                                  ) : (
                                    <span>-</span>
                                  )}
                                </td>
                              ))}
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <button
                      type="submit"
                      className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                        canEditSettings
                          ? 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                          : 'bg-gray-400 cursor-not-allowed'
                      }`}
                      disabled={!canEditSettings}
                    >
                      Save Permission Settings
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
