import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      // Validate token and get user info
      checkAuthStatus().catch(err => {
        console.error('Auth initialization error:', err);
        setError('Failed to initialize authentication');
        // Clear any invalid auth data
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        setCurrentUser(null);
        setUserRole(null);
        setLoading(false);
      });
    } else {
      // For development purposes, auto-login as admin
      console.log('Auto-logging in as admin for development');
      const demoUser = {
        id: '1',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin'
      };
      setCurrentUser(demoUser);
      setUserRole('admin');
      localStorage.setItem('userData', JSON.stringify(demoUser));
      localStorage.setItem('token', 'demo-token');
      setLoading(false);
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found in localStorage');
        setCurrentUser(null);
        setUserRole(null);
        return;
      }

      console.log('Token found in localStorage, checking validity');

      // Check if token is expired by trying to decode it
      try {
        // Simple check for token expiration - this is not a full JWT validation
        // but can help detect obviously expired tokens
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          const expiry = payload.exp * 1000; // Convert to milliseconds
          const now = Date.now();

          if (expiry < now) {
            console.error('Token has expired');
            logout();
            setError('Your session has expired. Please log in again.');
            return;
          }
          console.log('Token appears to be valid');
        }
      } catch (tokenError) {
        console.error('Error checking token expiration:', tokenError);
        // Continue anyway, the API call will fail if the token is invalid
      }

      // Get current user from API
      try {
        console.log('Fetching current user from API');
        const response = await authService.getCurrentUser();
        console.log('Current user API response:', response);

        if (response.data.success) {
          // Handle different response structures
          let userData;

          if (response.data.data && response.data.data.user) {
            // New server response structure
            userData = response.data.data.user;
          } else if (response.data.user) {
            // Original expected structure
            userData = response.data.user;
          } else {
            console.warn('Unexpected API response format:', response.data);
            fallbackToLocalStorage();
            return;
          }

          console.log('User data retrieved successfully:', userData);

          // Update local storage with fresh data
          localStorage.setItem('userData', JSON.stringify(userData));

          setCurrentUser(userData);
          setUserRole(userData.role);
        } else {
          console.warn('API returned success=false:', response.data);
          // If API failed, try to use localStorage data
          fallbackToLocalStorage();
        }
      } catch (apiError) {
        console.error('API error when fetching current user:', apiError);

        // Check if the error is due to an expired or invalid token
        if (apiError.response?.status === 401) {
          console.error('Unauthorized: Token is invalid or expired');
          logout();
          setError('Your session has expired. Please log in again.');
          return;
        }

        // For other errors, try to use localStorage data
        fallbackToLocalStorage();
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError('Failed to authenticate');
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Helper function to use localStorage data as fallback
  const fallbackToLocalStorage = () => {
    console.log('Falling back to localStorage data');
    const storedUserData = localStorage.getItem('userData');

    if (storedUserData) {
      try {
        const userData = JSON.parse(storedUserData);
        console.log('Using user data from localStorage:', userData);
        setCurrentUser(userData);
        setUserRole(userData.role);
      } catch (e) {
        console.error('Failed to parse user data from localStorage');
        logout();
      }
    } else {
      console.error('No user data found in localStorage');
      logout();
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Attempting login with:', { email, password });

      // Call the login API
      const response = await authService.login(email, password);
      console.log('Login API response:', response);

      if (response.data.success) {
        // Handle different response structures
        let token, user;

        if (response.data.data) {
          // New server response structure
          token = response.data.data.token;
          user = response.data.data.user;
        } else {
          // Original expected structure
          token = response.data.token;
          user = response.data.user;
        }

        console.log('Login successful, token and user:', { token, user });

        if (!user || !token) {
          console.error('Invalid response format, missing user or token:', response.data);
          throw new Error('Invalid response format');
        }

        // Save token and user data to local storage
        localStorage.setItem('token', token);
        localStorage.setItem('userData', JSON.stringify(user));

        // Update state
        setCurrentUser(user);
        setUserRole(user.role);

        return { success: true, userData: user };
      } else {
        console.error('Login failed with success=false:', response.data);
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
      });
      const errorMessage = err.response?.data?.message || err.message || 'Failed to login';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call the logout API
      await authService.logout();

      // Clear local storage and state
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      setCurrentUser(null);
      setUserRole(null);

      return { success: true };
    } catch (err) {
      console.error('Logout error:', err);
      return { success: false, error: err.message };
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      // Call the register API
      const response = await authService.register(userData);

      if (response.data.success) {
        // If registration includes automatic login
        if (response.data.token && response.data.user) {
          const { token, user } = response.data;

          // Save token and user data to local storage
          localStorage.setItem('token', token);
          localStorage.setItem('userData', JSON.stringify(user));

          // Update state
          setCurrentUser(user);
          setUserRole(user.role);
        }

        return { success: true };
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to register';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    userRole,
    loading,
    error,
    login,
    logout,
    register,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
