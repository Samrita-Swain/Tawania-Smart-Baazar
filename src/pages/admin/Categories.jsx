import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/admin/Header';
import Sidebar from '../../components/admin/Sidebar';
import CategoryList from '../../components/admin/CategoryList';
import CategoryForm from '../../components/admin/CategoryForm';
import { useDemoData } from '../../context/DemoDataContext';
import axios from 'axios';

const Categories = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [testMessage, setTestMessage] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  // Get categories from context
  const { categories, resetCategories } = useDemoData();

  // Test function to directly call the reset-categories endpoint
  const testResetCategories = async () => {
    setTestMessage('Testing reset categories...');
    try {
      const response = await axios.post('/api/reset-categories');
      console.log('Reset categories response:', response);
      setTestMessage(`Success! ${response.data.message || 'Categories reset successfully'}`);
      // Refresh the component
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error resetting categories:', error);
      setTestMessage(`Error: ${error.message}`);
    }
  };

  // Force refresh when categories change
  useEffect(() => {
    console.log('Categories changed in context, refreshing component');
    setRefreshKey(prevKey => prevKey + 1);
  }, [categories]);

  // Determine if we're on the list view or form view
  const isListView = location.pathname === '/admin/categories';

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header setIsMobileMenuOpen={setIsMobileMenuOpen} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* Test button for direct API call */}
          {isListView && (
            <div className="mb-4 p-4 bg-white rounded-lg shadow">
              <h3 className="text-lg font-medium mb-2">API Test</h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={testResetCategories}
                  className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Test Reset Categories API
                </button>
                <button
                  onClick={() => resetCategories()}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Reset Categories (Context)
                </button>
                {testMessage && (
                  <div className="text-sm font-medium">{testMessage}</div>
                )}
              </div>
            </div>
          )}

          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<CategoryList key={`list-${refreshKey}`} />} />
              <Route path="/new" element={<CategoryForm key={`new-${refreshKey}`} />} />
              <Route path="/:id" element={<CategoryForm key={`edit-${refreshKey}`} />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Categories;
