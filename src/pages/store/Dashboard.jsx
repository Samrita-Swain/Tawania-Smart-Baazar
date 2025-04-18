import { useState } from 'react';
import Header from '../../components/store/Header';
import Sidebar from '../../components/store/Sidebar';
import StoreInventory from '../../components/store/StoreInventory';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { currentUser } = useAuth();
  
  // In a real app, these would be fetched from an API
  const stats = [
    {
      name: 'Today\'s Sales',
      value: '$1,280',
      change: '+12.5%',
      changeType: 'increase',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      name: 'Today\'s Orders',
      value: '12',
      change: '+5.2%',
      changeType: 'increase',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
    },
    {
      name: 'Low Stock Items',
      value: '5',
      change: '+2',
      changeType: 'increase',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      name: 'Pending Transfers',
      value: '2',
      change: '-1',
      changeType: 'decrease',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
    },
  ];
  
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header setIsMobileMenuOpen={setIsMobileMenuOpen} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Store Dashboard</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Welcome back, {currentUser?.name || 'Store Manager'}
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <span className="inline-flex rounded-md shadow-sm">
                  <button
                    type="button"
                    className="btn btn-primary"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z" clipRule="evenodd" />
                    </svg>
                    New Order
                  </button>
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className={`p-3 rounded-md ${
                          stat.changeType === 'increase' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {stat.icon}
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                          <dd>
                            <div className="text-lg font-medium text-gray-900">{stat.value}</div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-5 py-3">
                    <div className="text-sm">
                      <span
                        className={`font-medium ${
                          stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {stat.change}
                      </span>{' '}
                      <span className="text-gray-500">from yesterday</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8">
              <StoreInventory />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
