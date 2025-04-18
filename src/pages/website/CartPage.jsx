import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/website/Navbar';
import Footer from '../../components/website/Footer';
import { useCart } from '../../context/CartContext';

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);

  // Handle quantity change
  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity >= 1) {
      updateQuantity(productId, newQuantity);
    }
  };

  // Handle remove item
  const handleRemoveItem = (productId) => {
    removeFromCart(productId);
  };

  // Handle apply coupon
  const handleApplyCoupon = (e) => {
    e.preventDefault();

    // Simple coupon logic - in a real app, this would validate against a database
    if (couponCode.toUpperCase() === 'DISCOUNT10') {
      setCouponApplied(true);
      setDiscount(getCartTotal() * 0.1); // 10% discount
    } else {
      alert('Invalid coupon code');
    }
  };

  // Calculate subtotal
  const subtotal = getCartTotal();

  // Calculate tax (assuming 7% tax rate)
  const taxRate = 0.07;
  const tax = subtotal * taxRate;

  // Calculate shipping (free shipping over $50, otherwise $5.99)
  const shipping = subtotal > 50 ? 0 : 5.99;

  // Calculate total
  const total = subtotal + tax + shipping - discount;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-16">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-6">Shopping Cart</h1>

          {cartItems.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Your cart is empty</h3>
              <p className="mt-1 text-sm text-gray-500">
                Looks like you haven't added any products to your cart yet.
              </p>
              <div className="mt-6">
                <Link
                  to="/products"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#c69133] hover:bg-[#9f7324]"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          ) : (
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-8">
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <ul className="divide-y divide-gray-200">
                    {cartItems.map((item) => (
                      <li key={item.id} className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row">
                          <div className="flex-shrink-0 w-full sm:w-32 h-32 bg-gray-200 rounded-lg overflow-hidden">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-center object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-500">
                                No image
                              </div>
                            )}
                          </div>
                          <div className="mt-4 sm:mt-0 sm:ml-6 flex-1">
                            <div className="flex justify-between">
                              <div>
                                <h3 className="text-lg font-medium text-gray-900">
                                  <Link to={`/products/${item.id}`} className="hover:text-[#c69133]">
                                    {item.name}
                                  </Link>
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">${item.price.toFixed(2)}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-medium text-gray-900">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </p>
                              </div>
                            </div>
                            <div className="mt-4 flex justify-between items-center">
                              <div className="flex items-center border border-gray-300 rounded">
                                <button
                                  type="button"
                                  className="p-2 text-gray-600 hover:text-gray-700"
                                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                >
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                  </svg>
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value, 10))}
                                  className="w-12 text-center border-transparent focus:ring-[#9f7324] focus:border-[#9f7324]"
                                />
                                <button
                                  type="button"
                                  className="p-2 text-gray-600 hover:text-gray-700"
                                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                >
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                </button>
                              </div>
                              <button
                                type="button"
                                className="text-sm text-red-600 hover:text-red-500"
                                onClick={() => handleRemoveItem(item.id)}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                    <div className="flex justify-between">
                      <button
                        type="button"
                        className="text-sm text-[#c69133] hover:text-[#9f7324]"
                        onClick={() => clearCart()}
                      >
                        Clear Cart
                      </button>
                      <Link
                        to="/products"
                        className="text-sm text-[#c69133] hover:text-[#9f7324]"
                      >
                        Continue Shopping
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 lg:mt-0 lg:col-span-4">
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="px-4 py-5 sm:p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>

                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <div className="text-sm text-gray-600">Subtotal</div>
                        <div className="text-sm font-medium text-gray-900">${subtotal.toFixed(2)}</div>
                      </div>

                      <div className="flex justify-between">
                        <div className="text-sm text-gray-600">Tax (7%)</div>
                        <div className="text-sm font-medium text-gray-900">${tax.toFixed(2)}</div>
                      </div>

                      <div className="flex justify-between">
                        <div className="text-sm text-gray-600">Shipping</div>
                        <div className="text-sm font-medium text-gray-900">
                          {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                        </div>
                      </div>

                      {couponApplied && (
                        <div className="flex justify-between text-green-600">
                          <div className="text-sm">Discount</div>
                          <div className="text-sm font-medium">-${discount.toFixed(2)}</div>
                        </div>
                      )}

                      <div className="border-t border-gray-200 pt-4 flex justify-between">
                        <div className="text-base font-medium text-gray-900">Order Total</div>
                        <div className="text-base font-medium text-gray-900">${total.toFixed(2)}</div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <form onSubmit={handleApplyCoupon} className="flex">
                        <input
                          type="text"
                          name="coupon"
                          id="coupon"
                          className="shadow-sm focus:ring-[#9f7324] focus:border-[#9f7324] block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="Coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          disabled={couponApplied}
                        />
                        <button
                          type="submit"
                          className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#c69133] hover:bg-[#9f7324] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9f7324]"
                          disabled={couponApplied || !couponCode}
                        >
                          Apply
                        </button>
                      </form>
                      {couponApplied && (
                        <p className="mt-2 text-sm text-green-600">Coupon applied successfully!</p>
                      )}
                    </div>

                    <div className="mt-6">
                      <button
                        type="button"
                        className="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#c69133] hover:bg-[#9f7324] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9f7324]"
                        onClick={() => alert('Checkout functionality would be implemented here')}
                      >
                        Proceed to Checkout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CartPage;
