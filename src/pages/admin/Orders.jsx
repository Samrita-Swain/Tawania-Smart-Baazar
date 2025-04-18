import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate, useParams } from 'react-router-dom';
import Header from '../../components/admin/Header';
import Sidebar from '../../components/admin/Sidebar';
import OrderList from '../../components/admin/OrderList';
import OrderDetail from '../../components/admin/OrderDetail';

// Helper component to redirect to the edit order page
const EditOrderRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/admin/orders/edit/${id}`} replace />;
};

const Orders = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [shouldRefresh, setShouldRefresh] = useState(false);
  const location = useLocation();

  // Check if we should refresh the order list
  useEffect(() => {
    if (location.state?.refresh) {
      setShouldRefresh(true);
    }
  }, [location]);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header setIsMobileMenuOpen={setIsMobileMenuOpen} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<OrderList refresh={shouldRefresh} onRefreshed={() => setShouldRefresh(false)} />} />
              <Route path="/:id" element={<OrderDetail />} />
              <Route path="/:id/edit" element={<EditOrderRedirect />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Orders;
