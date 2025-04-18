import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../../components/admin/Header';
import Sidebar from '../../components/admin/Sidebar';
import OrderForm from '../../components/admin/OrderForm';
import { orderService } from '../../services/api';

const EditOrder = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await orderService.getOrder(id);

        // Handle different response formats
        let orderData = null;
        if (response.data && response.data.data) {
          orderData = response.data.data;
        } else if (response.data) {
          orderData = response.data;
        }

        setOrder(orderData);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const handleUpdateSuccess = () => {
    // Navigate back to the order detail page with a refresh flag
    navigate(`/admin/orders/${id}`, { state: { refresh: true } });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

      <div className="flex">
        <Sidebar isMobileMenuOpen={isMobileMenuOpen} />

        <main className="flex-1 p-5">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-5">
              <h1 className="text-2xl font-semibold text-gray-900">Edit Order</h1>
              <Link
                to={`/admin/orders/${id}`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </Link>
            </div>

            {loading ? (
              <div className="bg-white shadow rounded-lg p-6">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2.5"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2.5"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2.5"></div>
                </div>
              </div>
            ) : error ? (
              <div className="bg-white shadow rounded-lg p-6">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              </div>
            ) : (
              <div className="bg-white shadow rounded-lg p-6">
                <OrderForm
                  orderId={id}
                  initialData={order}
                  isEditing={true}
                  onUpdateSuccess={handleUpdateSuccess}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default EditOrder;
