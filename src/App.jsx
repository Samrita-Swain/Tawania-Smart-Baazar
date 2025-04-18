import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { DemoDataProvider } from './context/DemoDataContext';
import DataDebugger from './components/debug/DataDebugger';
import SyncStatusIndicator from './components/common/SyncStatusIndicator';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import Warehouse from './pages/admin/Warehouse';
import Products from './pages/admin/Products';
import Categories from './pages/admin/Categories';
import Users from './pages/admin/Users';
import Orders from './pages/admin/Orders';
import AddOrder from './pages/admin/AddOrder';
import EditOrder from './pages/admin/EditOrder';
import Stores from './pages/admin/Stores';
import Reports from './pages/admin/Reports';
import Settings from './pages/admin/Settings';

// Store Pages
import StoreDashboard from './pages/store/Dashboard';

// Website Pages
import HomePage from './pages/website/HomePage';
import ProductsPage from './pages/website/ProductsPage';
import ProductDetailPage from './pages/website/ProductDetailPage';
import CartPage from './pages/website/CartPage';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redirect to the appropriate dashboard based on user role
    if (userRole === 'superadmin' || userRole === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (userRole === 'store') {
      return <Navigate to="/store/dashboard" replace />;
    } else if (userRole === 'warehouse') {
      return <Navigate to="/warehouse/dashboard" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

// App Routes
const AppRoutes = () => {
  const { userRole } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/home" element={<HomePage />} />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/warehouse"
        element={
          <ProtectedRoute allowedRoles={['superadmin', 'admin', 'warehouse']}>
            <Warehouse />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/products/*"
        element={
          <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
            <Products />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/categories/*"
        element={
          <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
            <Categories />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users/*"
        element={
          <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
            <Users />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/orders/new"
        element={
          <ProtectedRoute allowedRoles={['superadmin', 'admin', 'store']}>
            <AddOrder />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/orders/edit/:id"
        element={
          <ProtectedRoute allowedRoles={['superadmin', 'admin', 'store']}>
            <EditOrder />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/orders/*"
        element={
          <ProtectedRoute allowedRoles={['superadmin', 'admin', 'store']}>
            <Orders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/stores/*"
        element={
          <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
            <Stores />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
            <Reports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* Store Routes */}
      <Route
        path="/store/dashboard"
        element={
          <ProtectedRoute allowedRoles={['store']}>
            <StoreDashboard />
          </ProtectedRoute>
        }
      />

      {/* Website Routes */}
      <Route
        path="/"
        element={<HomePage />}
      />
      <Route
        path="/products"
        element={<ProductsPage />}
      />
      <Route
        path="/products/:id"
        element={<ProductDetailPage />}
      />
      <Route
        path="/cart"
        element={<CartPage />}
      />

      {/* Catch all - redirect to appropriate dashboard or login */}
      <Route
        path="*"
        element={
          userRole ? (
            userRole === 'superadmin' || userRole === 'admin' ? (
              <Navigate to="/admin/dashboard" replace />
            ) : userRole === 'store' ? (
              <Navigate to="/store/dashboard" replace />
            ) : userRole === 'warehouse' ? (
              <Navigate to="/warehouse/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <DemoDataProvider>
          <CartProvider>
            <DataDebugger />
            <SyncStatusIndicator />
            <AppRoutes />
          </CartProvider>
        </DemoDataProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
