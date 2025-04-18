import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDemoData } from '../../context/DemoDataContext';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  // Get demo data from context
  const { orders, updateOrder } = useDemoData();

  useEffect(() => {
    try {
      setLoading(true);

      // Find the order in the demo data
      const orderData = orders.find(order => order.id === id);

      if (orderData) {
        console.log('Found order in demo data:', orderData);
        setOrder(orderData);
        if (orderData.status) {
          setNewStatus(orderData.status);
        }
      } else {
        console.error('Order not found in demo data');
        setError('Order not found');
      }
    } catch (err) {
      console.error('Error loading order:', err);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  }, [id, orders]);

  const handleUpdateStatus = async () => {
    try {
      // Create updated order object
      const updatedOrder = { ...order, status: newStatus };

      // Update the order in the demo data
      updateOrder(id, updatedOrder);

      // Update the local state
      setOrder(updatedOrder);
      setIsUpdateStatusModalOpen(false);
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusBadgeClass = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2.5"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2.5"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2.5"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        Order not found
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Order Details
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Order ID: {order.id}
          </p>
        </div>
        <div className="flex space-x-3">
          <Link
            to="/admin/orders"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Back to Orders
          </Link>
          <Link
            to={`/admin/orders/edit/${order.id}`}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Edit Order
          </Link>
          {order.status !== 'delivered' && order.status !== 'cancelled' && (
            <button
              type="button"
              onClick={() => setIsUpdateStatusModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              Update Status
            </button>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200">
        <dl>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Customer</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {order.customer?.name || order.customerName || 'Unknown'}
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Contact</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {order.customer?.email || order.customerEmail || 'N/A'} | {order.customer?.phone || order.customerPhone || 'N/A'}
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Order Date</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {order.orderDate ? new Date(order.orderDate).toLocaleString() :
               order.date ? new Date(order.date).toLocaleString() :
               order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Shipping Address</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {order.shippingAddress}
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Payment Status</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusBadgeClass(order.paymentStatus)}`}>
                {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
              </span>
            </dd>
          </div>
        </dl>
      </div>

      <div className="px-4 py-5 sm:px-6">
        <h4 className="text-lg font-medium text-gray-900">Order Items</h4>
      </div>

      <div className="border-t border-gray-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subtotal
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {order.items.map((item, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.productName || `Product ID: ${item.productId}` || 'Unknown Product'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${typeof item.price === 'number' ? item.price.toFixed(2) : '0.00'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.quantity || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${typeof item.price === 'number' && typeof item.quantity === 'number' ?
                    (item.price * item.quantity).toFixed(2) : '0.00'}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <th colSpan="3" className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                Total
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                ${typeof order.total === 'number' ? order.total.toFixed(2) : '0.00'}
              </th>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Update Status Modal */}
      {isUpdateStatusModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Update Order Status
                    </h3>
                    <div className="mt-4">
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <select
                        id="status"
                        name="status"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleUpdateStatus}
                >
                  Update
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setIsUpdateStatusModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
