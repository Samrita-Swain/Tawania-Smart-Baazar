import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoginForm = () => {
  const [email, setEmail] = useState('newadmin@twania.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    console.log('Login attempt with:', { email, password });

    try {
      console.log('Calling login function...');
      const result = await login(email, password);
      console.log('Login result:', result);

      if (result.success) {
        // Redirect based on user role
        const { userData } = result;
        console.log('Login successful, user data:', userData);

        if (userData.role === 'superadmin' || userData.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (userData.role === 'warehouse') {
          navigate('/warehouse/dashboard');
        } else if (userData.role === 'store') {
          navigate('/store/dashboard');
        } else {
          navigate('/');
        }
      } else {
        console.error('Login failed:', result.error);
        setError(result.error || 'Failed to login');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login to Twania Smart Bazaar</h2>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            className="input"
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <input
            className="input"
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            className="btn bg-[#c69133] text-white hover:bg-[#9f7324] w-full"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </div>

        {/* <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Demo Accounts:
          </p>
          <div className="mt-2 text-xs text-gray-500 space-y-1">
            <p>Admin: admin@twania.com / admin123</p>
            <p>Store: store@twania.com / store123</p>
            <p>Warehouse: warehouse@twania.com / warehouse123</p>
          </div>
        </div> */}
      </form>
    </div>
  );
};

export default LoginForm;
