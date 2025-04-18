import { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from '../../components/admin/Header';
import Sidebar from '../../components/admin/Sidebar';
import ProductList from '../../components/admin/ProductList';
import ProductForm from '../../components/admin/ProductForm';

const Products = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  // Determine if we're on the list view or form view
  const isListView = location.pathname === '/admin/products';
  
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header setIsMobileMenuOpen={setIsMobileMenuOpen} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<ProductList />} />
              <Route path="/new" element={<ProductForm />} />
              <Route path="/:id" element={<ProductForm />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Products;
