import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ApiTester = () => {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [serverUrl, setServerUrl] = useState('http://localhost:5002');

  const testApi = async () => {
    setLoading(true);
    setError(null);
    setTestResult(null);

    try {
      const response = await axios.get(`${serverUrl}/api/test`);
      console.log('API test response:', response);
      setTestResult(response.data);
    } catch (err) {
      console.error('API test error:', err);
      setError(err.message || 'Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">API Connection Tester</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Server URL
        </label>
        <div className="flex">
          <input
            type="text"
            value={serverUrl}
            onChange={(e) => setServerUrl(e.target.value)}
            className="flex-1 shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md mr-2"
          />
          <button
            onClick={testApi}
            disabled={loading}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
              loading ? 'bg-gray-400' : 'bg-primary-600 hover:bg-primary-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
          >
            {loading ? 'Testing...' : 'Test Connection'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <div className="mt-2 text-sm">
            <p>Possible reasons:</p>
            <ul className="list-disc pl-5 mt-1">
              <li>Server is not running</li>
              <li>Server is running on a different port</li>
              <li>CORS is not configured correctly</li>
              <li>Network connectivity issues</li>
            </ul>
          </div>
        </div>
      )}

      {testResult && (
        <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Success! </strong>
          <span className="block sm:inline">Connected to the server successfully.</span>
          <div className="mt-2">
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiTester;
