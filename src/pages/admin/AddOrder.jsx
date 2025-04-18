import { useState } from 'react';
import Header from '../../components/admin/Header';
import Sidebar from '../../components/admin/Sidebar';
import OrderForm from '../../components/admin/OrderForm';

const AddOrder = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Header isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
      
      <div className="flex">
        <Sidebar isMobileMenuOpen={isMobileMenuOpen} />
        
        <main className="flex-1 p-5">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-5">
              <h1 className="text-2xl font-semibold text-gray-900">Create New Order</h1>
            </div>
            
            <OrderForm />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AddOrder;
