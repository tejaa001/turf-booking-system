import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, RegisterData } from '../types';
import { authAPI } from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    // Check for token and ensure user data is valid JSON before parsing
    if (storedToken && storedUser && storedUser !== 'undefined') {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('AuthContext: Failed to parse user from localStorage', e);
        // Clear corrupted data if parsing fails
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, isAdmin = false) => {
    try {
      setLoading(true);
      const response = await authAPI.login(email, password, isAdmin);
      // Handle both 'user' and 'admin' keys from the API response
      const { token: authToken, user: rawUser, admin: rawAdmin } = response.data.data;
      const userData = rawUser || rawAdmin;

      if (authToken && userData) {
        // Augment user data with the isAdmin flag from the login attempt
        const finalUserData = { ...userData, isAdmin };

        setToken(authToken);
        setUser(finalUserData);
        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(finalUserData));
      } else {
        throw new Error('Login failed: Invalid response from server.');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setLoading(true);
      const response = await authAPI.register(userData);
      // Handle both 'user' and 'admin' keys from the API response
      const { token: authToken, user: rawUser, admin: rawAdmin } = response.data.data;
      const newUser = rawUser || rawAdmin;

      if (authToken && newUser) {
        // Augment user data with the isAdmin flag from the registration data
        const finalNewUser = { ...newUser, isAdmin: userData.isAdmin };

        setToken(authToken);
        setUser(finalNewUser);
        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(finalNewUser));
      } else {
        throw new Error('Registration failed: Invalid response from server.');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};