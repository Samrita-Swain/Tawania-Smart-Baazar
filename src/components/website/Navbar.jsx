import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { getCartCount } = useCart();

  // Get the number of items in the cart
  const cartCount = getCartCount();

  // Add scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  // Function to determine if a link is active
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className={`bg-white fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'shadow-md py-1' : 'shadow-sm py-2'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <img
                  src="/logo-1.png"
                  alt="Twania Smart Bazaar"
                  className="h-16 w-auto object-contain"
                />
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className={`${isActive('/') ? 'border-[#c69133] text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Home
              </Link>
              <Link
                to="/products"
                className={`${isActive('/products') ? 'border-[#c69133] text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Products
              </Link>
              <Link
                to="/categories"
                className={`${isActive('/categories') ? 'border-[#c69133] text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Categories
              </Link>
              <Link
                to="/about"
                className={`${isActive('/about') ? 'border-[#c69133] text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                About
              </Link>
              <Link
                to="/contact"
              className={`${isActive('/contact') ? 'border-[#c69133] text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Contact
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            {/* Cart Icon */}
            <Link
              to="/cart"
              className={`relative inline-flex items-center p-2 text-gray-500 hover:text-gray-700 ${isActive('/cart') ? 'text-[#9f7324]' : ''}`}
            >
              <span className="sr-only">Shopping Cart</span>
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#c69133] text-xs font-medium text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Login Button */}
            <Link
              to="/login"
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${isActive('/login') ? 'bg-[#9f7324]' : 'bg-[#c69133] hover:bg-[#9f7324]'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
            >
              Login
            </Link>
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link
            to="/"
            className={`${isActive('/') ? 'bg-primary-50 border-primary-500 text-primary-700' : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/products"
            className={`${isActive('/products') ? 'bg-primary-50 border-primary-500 text-primary-700' : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Products
          </Link>
          <Link
            to="/categories"
            className={`${isActive('/categories') ? 'bg-primary-50 border-primary-500 text-primary-700' : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Categories
          </Link>
          <Link
            to="/about"
            className={`${isActive('/about') ? 'bg-primary-50 border-primary-500 text-primary-700' : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            About
          </Link>
          <Link
            to="/contact"
            className={`${isActive('/contact') ? 'bg-primary-50 border-primary-500 text-primary-700' : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Contact
          </Link>
          <Link
            to="/cart"
            className={`${isActive('/cart') ? 'bg-primary-50 border-primary-500 text-primary-700' : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'} pl-3 pr-4 py-2 border-l-4 text-base font-medium flex items-center`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                {cartCount}
              </span>
            )}
          </Link>
          <Link
            to="/login"
            className={`${isActive('/login') ? 'bg-primary-50 border-primary-500 text-primary-700' : 'border-transparent text-primary-600 hover:bg-gray-50 hover:border-gray-300'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
