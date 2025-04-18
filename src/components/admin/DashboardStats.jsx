import { useDemoData } from '../../context/DemoDataContext';

const DashboardStats = () => {
  const { products, orders, users, reports } = useDemoData();

  // Calculate total revenue from orders
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);

  // Calculate monthly change with safety checks
  const hasMonthlyData = reports?.sales?.monthly && reports.sales.monthly.length >= 2;
  const currentMonthSales = hasMonthlyData ? reports.sales.monthly[reports.sales.monthly.length - 1].total : 0;
  const previousMonthSales = hasMonthlyData ? reports.sales.monthly[reports.sales.monthly.length - 2].total : 0;
  const revenueChange = previousMonthSales > 0 ? ((currentMonthSales - previousMonthSales) / previousMonthSales * 100).toFixed(1) : '0.0';

  const stats = [
    {
      name: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: `${revenueChange > 0 ? '+' : ''}${revenueChange}%`,
      changeType: revenueChange > 0 ? 'increase' : 'decrease',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      name: 'Total Orders',
      value: orders.length.toString(),
      change: hasMonthlyData ?
        `${(hasMonthlyData && reports.sales.monthly[reports.sales.monthly.length - 1].orders > reports.sales.monthly[reports.sales.monthly.length - 2].orders) ? '+' : '-'}${Math.abs(((hasMonthlyData ? reports.sales.monthly[reports.sales.monthly.length - 1].orders : 0) - (hasMonthlyData ? reports.sales.monthly[reports.sales.monthly.length - 2].orders : 0)) / (hasMonthlyData && reports.sales.monthly[reports.sales.monthly.length - 2].orders > 0 ? reports.sales.monthly[reports.sales.monthly.length - 2].orders : 1) * 100).toFixed(1)}%` :
        '+0.0%',
      changeType: hasMonthlyData && reports.sales.monthly[reports.sales.monthly.length - 1].orders > reports.sales.monthly[reports.sales.monthly.length - 2].orders ? 'increase' : 'decrease',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
    },
    {
      name: 'Total Products',
      value: products.length.toString(),
      change: '+0.0%', // Static value since we don't track product changes over time
      changeType: 'increase',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      name: 'Active Users',
      value: users.length.toString(),
      change: '+0.0%', // Static value since we don't track user changes over time
      changeType: 'increase',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
  ];

  return (
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
              <span className="text-gray-500">from last month</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
