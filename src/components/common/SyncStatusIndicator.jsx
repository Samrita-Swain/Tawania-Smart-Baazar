import React from 'react';
import { useDemoData } from '../../context/DemoDataContext';

const SyncStatusIndicator = () => {
  const { lastSyncTime, isSyncing, syncError, fetchDataFromAPI } = useDemoData();

  const handleManualSync = () => {
    fetchDataFromAPI(true);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white shadow-lg rounded-lg p-3 text-sm border border-gray-200">
      <div className="flex items-center space-x-2">
        <div className="flex flex-col">
          <div className="flex items-center">
            <span className="font-medium mr-2">Database Status:</span>
            {isSyncing ? (
              <span className="text-blue-600 flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Syncing...
              </span>
            ) : syncError ? (
              <span className="text-red-600">Error: {syncError}</span>
            ) : (
              <span className="text-green-600">Connected</span>
            )}
          </div>
          {lastSyncTime && (
            <div className="text-xs text-gray-500">
              Last synced: {lastSyncTime.toLocaleTimeString()}
            </div>
          )}
        </div>
        <button
          onClick={handleManualSync}
          disabled={isSyncing}
          className={`ml-2 px-2 py-1 rounded text-xs ${
            isSyncing
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isSyncing ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>
    </div>
  );
};

export default SyncStatusIndicator;
