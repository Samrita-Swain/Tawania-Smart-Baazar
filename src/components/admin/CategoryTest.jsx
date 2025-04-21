import { useState, useEffect } from 'react';
import { getApiUrl } from '../../utils/apiConfig';
import axios from 'axios';

const CategoryTest = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        console.log('CategoryTest: Fetching categories directly from API...');

        // Try multiple endpoints
        let apiCategories = [];

        try {
          console.log('Trying /api/admin/categories endpoint...');
          const response = await axios.get(getApiUrl('admin/categories'));
          console.log('Response:', response);

          if (Array.isArray(response.data) && response.data.length > 0) {
            console.log(`Got ${response.data.length} categories from /api/admin/categories`);
            apiCategories = response.data;
          }
        } catch (error) {
          console.error('Error fetching from /api/admin/categories:', error.message);
        }

        if (apiCategories.length === 0) {
          try {
            console.log('Trying /api/categories/direct endpoint...');
            const response = await axios.get(getApiUrl('categories/direct'));
            console.log('Response:', response);

            if (Array.isArray(response.data) && response.data.length > 0) {
              console.log(`Got ${response.data.length} categories from /api/categories/direct`);
              apiCategories = response.data;
            }
          } catch (error) {
            console.error('Error fetching from /api/categories/direct:', error.message);
          }
        }

        if (apiCategories.length === 0) {
          try {
            console.log('Trying /api/debug/tables endpoint...');
            const response = await axios.get(getApiUrl('debug/tables'));
            console.log('Response:', response);

            if (response.data && Array.isArray(response.data.categories) && response.data.categories.length > 0) {
              console.log(`Got ${response.data.categories.length} categories from /api/debug/tables`);
              apiCategories = response.data.categories;
            }
          } catch (error) {
            console.error('Error fetching from /api/debug/tables:', error.message);
          }
        }

        setCategories(apiCategories);
      } catch (err) {
        console.error('Error in CategoryTest:', err);
        setError('Failed to load categories: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) return <div className="p-4">Loading categories...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Category Test Component</h2>
      <p className="mb-2">Found {categories.length} categories directly from API</p>

      {categories.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map(category => (
                <tr key={category.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-red-500">No categories found</p>
      )}

      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Raw Category Data:</h3>
        <pre className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96">
          {JSON.stringify(categories, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default CategoryTest;
