import { useState, useEffect } from 'react';
import Header from '../../components/admin/Header';
import Sidebar from '../../components/admin/Sidebar';
import { orderService, productService, userService } from '../../services/api';

const Reports = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('sales');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Report data
  const [salesData, setSalesData] = useState({
    totalSales: 0,
    monthlySales: [],
    topProducts: [],
    salesByStore: []
  });
  
  const [inventoryData, setInventoryData] = useState({
    totalProducts: 0,
    lowStockItems: [],
    productCategories: []
  });
  
  const [userActivityData, setUserActivityData] = useState({
    totalUsers: 0,
    newUsers: 0,
    activeUsers: []
  });
  
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        
        // Fetch sales data
        const ordersResponse = await orderService.getOrders();
        let orders = [];
        
        if (ordersResponse.data && Array.isArray(ordersResponse.data)) {
          orders = ordersResponse.data;
        } else if (ordersResponse.data && ordersResponse.data.data && Array.isArray(ordersResponse.data.data)) {
          orders = ordersResponse.data.data;
        } else if (Array.isArray(ordersResponse)) {
          orders = ordersResponse;
        }
        
        // Calculate total sales
        const totalSales = orders.reduce((sum, order) => sum + (order.total || 0), 0);
        
        // Group sales by month
        const monthlySales = groupOrdersByMonth(orders);
        
        // Get top selling products
        const topProducts = getTopSellingProducts(orders);
        
        // Group sales by store
        const salesByStore = groupSalesByStore(orders);
        
        setSalesData({
          totalSales,
          monthlySales,
          topProducts,
          salesByStore
        });
        
        // Fetch inventory data
        const productsResponse = await productService.getProducts();
        let products = [];
        
        if (productsResponse.data && Array.isArray(productsResponse.data)) {
          products = productsResponse.data;
        } else if (productsResponse.data && productsResponse.data.data && Array.isArray(productsResponse.data.data)) {
          products = productsResponse.data.data;
        } else if (Array.isArray(productsResponse)) {
          products = productsResponse;
        }
        
        // Get low stock items
        const lowStockItems = products.filter(product => (product.stock || 0) < 10);
        
        // Group products by category
        const productCategories = groupProductsByCategory(products);
        
        setInventoryData({
          totalProducts: products.length,
          lowStockItems,
          productCategories
        });
        
        // Fetch user data
        const usersResponse = await userService.getUsers();
        let users = [];
        
        if (usersResponse.data && Array.isArray(usersResponse.data)) {
          users = usersResponse.data;
        } else if (usersResponse.data && usersResponse.data.data && Array.isArray(usersResponse.data.data)) {
          users = usersResponse.data.data;
        } else if (Array.isArray(usersResponse)) {
          users = usersResponse;
        }
        
        // Calculate new users (registered in the last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const newUsers = users.filter(user => {
          const createdAt = new Date(user.createdAt);
          return createdAt >= thirtyDaysAgo;
        }).length;
        
        // Get most active users (placeholder - would need login/activity tracking)
        const activeUsers = users.slice(0, 5);
        
        setUserActivityData({
          totalUsers: users.length,
          newUsers,
          activeUsers
        });
      } catch (err) {
        console.error('Error fetching report data:', err);
        setError('Failed to load report data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReportData();
  }, []);
  
  // Helper functions for data processing
  const groupOrdersByMonth = (orders) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlySales = Array(12).fill(0);
    
    orders.forEach(order => {
      if (order.createdAt) {
        const date = new Date(order.createdAt);
        const month = date.getMonth();
        monthlySales[month] += (order.total || 0);
      }
    });
    
    return months.map((month, index) => ({
      month,
      amount: monthlySales[index]
    }));
  };
  
  const getTopSellingProducts = (orders) => {
    // This is a placeholder - in a real app, you'd need to analyze order items
    // For now, return mock data
    return [
      { name: 'Product A', sales: 1200 },
      { name: 'Product B', sales: 950 },
      { name: 'Product C', sales: 740 },
      { name: 'Product D', sales: 510 },
      { name: 'Product E', sales: 350 }
    ];
  };
  
  const groupSalesByStore = (orders) => {
    const storeMap = {};
    
    orders.forEach(order => {
      if (order.storeName) {
        if (!storeMap[order.storeName]) {
          storeMap[order.storeName] = 0;
        }
        storeMap[order.storeName] += (order.total || 0);
      }
    });
    
    return Object.entries(storeMap).map(([store, amount]) => ({
      store,
      amount
    }));
  };
  
  const groupProductsByCategory = (products) => {
    const categoryMap = {};
    
    products.forEach(product => {
      if (product.category) {
        if (!categoryMap[product.category]) {
          categoryMap[product.category] = 0;
        }
        categoryMap[product.category]++;
      }
    });
    
    return Object.entries(categoryMap).map(([category, count]) => ({
      category,
      count
    }));
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Header isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
      
      <div className="flex">
        <Sidebar isMobileMenuOpen={isMobileMenuOpen} />
        
        <main className="flex-1 p-5">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-semibold text-gray-900 mb-5">Reports & Analytics</h1>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            {/* Report Tabs */}
            <div className="mb-6">
              <div className="sm:hidden">
                <select
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value)}
                  className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="sales">Sales Reports</option>
                  <option value="inventory">Inventory Reports</option>
                  <option value="users">User Activity</option>
                </select>
              </div>
              <div className="hidden sm:block">
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                      onClick={() => setActiveTab('sales')}
                      className={`${
                        activeTab === 'sales'
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                      Sales Reports
                    </button>
                    <button
                      onClick={() => setActiveTab('inventory')}
                      className={`${
                        activeTab === 'inventory'
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                      Inventory Reports
                    </button>
                    <button
                      onClick={() => setActiveTab('users')}
                      className={`${
                        activeTab === 'users'
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                      User Activity
                    </button>
                  </nav>
                </div>
              </div>
            </div>
            
            {loading ? (
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2.5"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2.5"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2.5"></div>
              </div>
            ) : (
              <>
                {/* Sales Reports */}
                {activeTab === 'sales' && (
                  <div>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-6">
                      <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Total Sales
                          </dt>
                          <dd className="mt-1 text-3xl font-semibold text-gray-900">
                            ${salesData.totalSales.toFixed(2)}
                          </dd>
                        </div>
                      </div>
                      <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Average Order Value
                          </dt>
                          <dd className="mt-1 text-3xl font-semibold text-gray-900">
                            ${salesData.totalSales > 0 && salesData.monthlySales.length > 0
                              ? (salesData.totalSales / salesData.monthlySales.reduce((sum, month) => sum + (month.amount > 0 ? 1 : 0), 0)).toFixed(2)
                              : '0.00'}
                          </dd>
                        </div>
                      </div>
                      <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Total Orders
                          </dt>
                          <dd className="mt-1 text-3xl font-semibold text-gray-900">
                            {salesData.monthlySales.reduce((sum, month) => sum + (month.amount > 0 ? 1 : 0), 0)}
                          </dd>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                      <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Sales</h3>
                        <div className="h-64 flex items-end space-x-2">
                          {salesData.monthlySales.map((item, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center">
                              <div 
                                className="w-full bg-primary-500 rounded-t"
                                style={{ 
                                  height: `${Math.max(
                                    4,
                                    (item.amount / Math.max(...salesData.monthlySales.map(m => m.amount))) * 200
                                  )}px` 
                                }}
                              ></div>
                              <div className="text-xs text-gray-500 mt-1">{item.month}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Top Selling Products</h3>
                        <div className="space-y-4">
                          {salesData.topProducts.map((product, index) => (
                            <div key={index} className="flex items-center">
                              <div className="w-full">
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm font-medium text-gray-700">{product.name}</span>
                                  <span className="text-sm font-medium text-gray-700">${product.sales}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-primary-500 h-2 rounded-full" 
                                    style={{ 
                                      width: `${(product.sales / salesData.topProducts[0].sales) * 100}%` 
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="bg-white shadow rounded-lg p-6 lg:col-span-2">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Sales by Store</h3>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Store
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Sales Amount
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Percentage
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {salesData.salesByStore.length > 0 ? (
                                salesData.salesByStore.map((item, index) => (
                                  <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                      {item.store}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      ${item.amount.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {salesData.totalSales > 0 
                                        ? `${((item.amount / salesData.totalSales) * 100).toFixed(1)}%` 
                                        : '0%'}
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                                    No store sales data available.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Inventory Reports */}
                {activeTab === 'inventory' && (
                  <div>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-6">
                      <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Total Products
                          </dt>
                          <dd className="mt-1 text-3xl font-semibold text-gray-900">
                            {inventoryData.totalProducts}
                          </dd>
                        </div>
                      </div>
                      <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Low Stock Items
                          </dt>
                          <dd className="mt-1 text-3xl font-semibold text-gray-900">
                            {inventoryData.lowStockItems.length}
                          </dd>
                        </div>
                      </div>
                      <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Categories
                          </dt>
                          <dd className="mt-1 text-3xl font-semibold text-gray-900">
                            {inventoryData.productCategories.length}
                          </dd>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                      <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Low Stock Items</h3>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Product
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Current Stock
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Status
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {inventoryData.lowStockItems.length > 0 ? (
                                inventoryData.lowStockItems.map((item, index) => (
                                  <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                      {item.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {item.stock || 0}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        (item.stock || 0) === 0
                                          ? 'bg-red-100 text-red-800'
                                          : (item.stock || 0) < 5
                                          ? 'bg-yellow-100 text-yellow-800'
                                          : 'bg-yellow-50 text-yellow-600'
                                      }`}>
                                        {(item.stock || 0) === 0 ? 'Out of Stock' : 'Low Stock'}
                                      </span>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                                    No low stock items.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      
                      <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Products by Category</h3>
                        <div className="space-y-4">
                          {inventoryData.productCategories.length > 0 ? (
                            inventoryData.productCategories.map((category, index) => (
                              <div key={index} className="flex items-center">
                                <div className="w-full">
                                  <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium text-gray-700">{category.category}</span>
                                    <span className="text-sm font-medium text-gray-700">{category.count} products</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-primary-500 h-2 rounded-full" 
                                      style={{ 
                                        width: `${(category.count / Math.max(...inventoryData.productCategories.map(c => c.count))) * 100}%` 
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500">No category data available.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* User Activity */}
                {activeTab === 'users' && (
                  <div>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-6">
                      <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Total Users
                          </dt>
                          <dd className="mt-1 text-3xl font-semibold text-gray-900">
                            {userActivityData.totalUsers}
                          </dd>
                        </div>
                      </div>
                      <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            New Users (30 days)
                          </dt>
                          <dd className="mt-1 text-3xl font-semibold text-gray-900">
                            {userActivityData.newUsers}
                          </dd>
                        </div>
                      </div>
                      <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Active Users
                          </dt>
                          <dd className="mt-1 text-3xl font-semibold text-gray-900">
                            {userActivityData.activeUsers.length}
                          </dd>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white shadow rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Most Active Users</h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                User
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Role
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Last Activity
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {userActivityData.activeUsers.length > 0 ? (
                              userActivityData.activeUsers.map((user, index) => (
                                <tr key={index}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {user.name}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {user.email}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {user.role}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(user.updatedAt || user.createdAt).toLocaleDateString()}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                                  No user activity data available.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Reports;
