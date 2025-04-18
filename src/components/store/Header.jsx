import { useAuth } from '../../context/AuthContext';

const Header = ({ setIsMobileMenuOpen }) => {
  const { currentUser } = useAuth();
  
  return (
    <header className="bg-white shadow-sm z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              >
                <span className="sr-only">Open sidebar</span>
                <svg
                  className="h-6 w-6"
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
              </button>
              <h1 className="ml-2 text-xl font-bold text-primary-600">Twania</h1>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="hidden md:ml-4 md:flex md:items-center">
              <div className="relative">
                <button
                  type="button"
                  className="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  id="user-menu-button"
                  aria-expanded="false"
                  aria-haspopup="true"
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                    {currentUser?.name?.charAt(0) || 'U'}
                  </div>
                </button>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">{currentUser?.name || 'Store Manager'}</div>
                <div className="text-sm font-medium text-gray-500">{currentUser?.email || ''}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
