import { useState } from 'react';
import Header from '../../components/admin/Header';
import Sidebar from '../../components/admin/Sidebar';
import DashboardStats from '../../components/admin/DashboardStats';
import RecentOrders from '../../components/admin/RecentOrders';
import WarehouseInventory from '../../components/admin/WarehouseInventory';
import { useDemoData } from '../../context/DemoDataContext';
import { resetCategoriesToMain } from '../../utils/resetCategories';
import { addDemoProductsForCategories } from '../../utils/addDemoProducts';
import { resetProductsWithCategorizedData } from '../../utils/resetProducts';

const Dashboard = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { resetDemoData } = useDemoData();
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetCategoriesSuccess, setResetCategoriesSuccess] = useState(false);
  const [addProductsSuccess, setAddProductsSuccess] = useState(false);
  const [resetProductsSuccess, setResetProductsSuccess] = useState(false);

  const handleResetDemoData = () => {
    if (window.confirm('Are you sure you want to reset all demo data? This will remove all changes you have made.')) {
      resetDemoData();
      setResetSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setResetSuccess(false);
      }, 3000);
    }
  };

  const handleResetCategories = () => {
    if (window.confirm('Are you sure you want to reset categories to only show the main categories? This will remove any custom categories you have added.')) {
      const result = resetCategoriesToMain();
      if (result) {
        setResetCategoriesSuccess(true);

        // Hide success message after 3 seconds
        setTimeout(() => {
          setResetCategoriesSuccess(false);
        }, 3000);

        // Reload the page to reflect the changes
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    }
  };

  const handleAddDemoProducts = () => {
    if (window.confirm('Are you sure you want to add demo products for all categories?')) {
      try {
        const count = addDemoProductsForCategories();
        setAddProductsSuccess(true);

        // Hide success message after 3 seconds
        setTimeout(() => {
          setAddProductsSuccess(false);
        }, 3000);

        // Reload the page to reflect the changes
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (err) {
        console.error('Error adding demo products:', err);
        alert('Failed to add demo products. See console for details.');
      }
    }
  };

  const handleResetProducts = () => {
    if (window.confirm('Are you sure you want to reset all products with properly categorized demo data? This will remove all existing products.')) {
      try {
        const count = resetProductsWithCategorizedData();
        setResetProductsSuccess(true);

        // Hide success message after 3 seconds
        setTimeout(() => {
          setResetProductsSuccess(false);
        }, 3000);

        // Reload the page to reflect the changes
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (err) {
        console.error('Error resetting products:', err);
        alert('Failed to reset products. See console for details.');
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header setIsMobileMenuOpen={setIsMobileMenuOpen} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleResetCategories}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Reset Categories
                </button>
                <button
                  onClick={handleResetProducts}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Reset Products
                </button>
                <button
                  onClick={handleAddDemoProducts}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Add Demo Products
                </button>
                <button
                  onClick={handleResetDemoData}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Reset All Demo Data
                </button>
              </div>
            </div>

            {resetSuccess && (
              <div className="mb-6 bg-green-100 border-l-4 border-green-500 text-green-700 p-4" role="alert">
                <p className="font-bold">Success!</p>
                <p>Demo data has been reset to its initial state.</p>
              </div>
            )}

            {resetCategoriesSuccess && (
              <div className="mb-6 bg-green-100 border-l-4 border-green-500 text-green-700 p-4" role="alert">
                <p className="font-bold">Success!</p>
                <p>Categories have been reset to show only the main categories.</p>
              </div>
            )}

            {addProductsSuccess && (
              <div className="mb-6 bg-green-100 border-l-4 border-green-500 text-green-700 p-4" role="alert">
                <p className="font-bold">Success!</p>
                <p>Demo products have been added for all categories.</p>
              </div>
            )}

            {resetProductsSuccess && (
              <div className="mb-6 bg-green-100 border-l-4 border-green-500 text-green-700 p-4" role="alert">
                <p className="font-bold">Success!</p>
                <p>All products have been reset with properly categorized demo data.</p>
              </div>
            )}

            <DashboardStats />

            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
              <RecentOrders />
              <WarehouseInventory />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
