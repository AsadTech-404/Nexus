import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, UserRole, AuthContextType } from '../types';
import toast from 'react-hot-toast';
import axios from 'axios';

// Create Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Local storage keys
const USER_STORAGE_KEY = 'business_nexus_user';
const RESET_TOKEN_KEY = 'business_nexus_reset_token';

// Auth Provider Component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored user on initial load
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem(USER_STORAGE_KEY);
        console.log('Initializing auth context...');
        console.log('Stored user:', storedUser);

        if(storedUser) {
          const parsedUser: User = JSON.parse(storedUser);
          setUser(parsedUser);

          // Get up to date user profile from backend
          const result = await axios.get('http://localhost:8000/api/user/profile', {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
            }
          });
          if(result.data.success) {
            setUser(result.data.user);
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(result.data.user));
            console.log('Session restored successfully');
          } else {
            console.log('Failed to restore session:', result.data.message);
            logout();
          }
        } else {
          console.log('No user found in local storage');
          setUser(null);
        }
      } catch (error) {
        console.error('Error initializing auth context:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    initAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    try {
       const result = await axios.post('http://localhost:8000/api/auth/login', {
        email,
        password,
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if(result.data.success) {
        const loggedInUser: User = result.data.user;
        setUser(loggedInUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedInUser));
        toast.success('Successfully logged in!');
      } else {
        toast.error(result.data.message || 'Login failed');
      }
    } catch (error) {
      toast.error((error as Error).message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register fuction
  const register = async (name: string, email: string, password: string, role: UserRole): Promise<void> => {
    setIsLoading(true);
    try {
      const result = await axios.post('http://localhost:8000/api/auth/register', {
        name,
        email,
        password,
        confirmPassword: password,
        role
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if(result.data.success) {
        const registeredUser: User = result.data.user;
        setUser(registeredUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(registeredUser));
        toast.success('Registration successful!');
      } else {
        toast.error(result.data.message || 'Registration failed');
      }
      } catch (error) {
      toast.error((error as Error).message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot password function
  const forgotPassword = async (email: string): Promise<void> => {
    try {
      const result = await axios.post('http://localhost:8000/api/auth/forgot-password', {
        email
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if(result.data.success) {
        localStorage.setItem(RESET_TOKEN_KEY, result.data.token);
        toast.success('Password reset link sent to your email');
      } else {
        throw new Error(result.data.message || 'Password reset link failed');
      }
    } catch (error) {
      toast.error((error as Error).message);
      throw error;
    }
  };

  // Reset password function
  const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    try {
      const result = await axios.post('http://localhost:8000/api/auth/reset-password', {
        token,
        newPassword
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if(result.data.success) {
        localStorage.removeItem(RESET_TOKEN_KEY);
        toast.success('Password reset successful');
      } else {
        throw new Error(result.data.message || 'Password reset failed');
      } 
    } catch (error) {
      toast.error((error as Error).message);
      throw error;
    }
  };

  // Update password function
  const updatePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      const result = await axios.post('http://localhost:8000/api/auth/update-password', {
        currentPassword,
        newPassword
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if(result.data.success) {
        toast.success('Password updated successfully');
      } else {
        throw new Error(result.data.message || 'Password update failed');
      }
    } catch (error) {
      toast.error((error as Error).message);
      throw error;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      const result = await axios.post('http://localhost:8000/api/auth/logout', {}, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if(result.data.success) {
        setUser(null);
        localStorage.removeItem(USER_STORAGE_KEY);
        toast.success('Logged out successfully');
      } else {
        toast.error(result.data.message || 'Logout failed');
      }
    } catch (error) {
      toast.error((error as Error).message);
      setUser(null);
      localStorage.removeItem(USER_STORAGE_KEY);
      throw error;
    }
  };

  // Update user profile
  const updateProfile = async (userId: string, updates: Partial<User>): Promise<void> => {
    try {
      const result = await axios.put('http://localhost:8000/api/user/update-profile', {
        userId,
        updates
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if(result.data.success) {
        const updatedUser: User = result.data.user;
        setUser(updatedUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
        toast.success('Profile updated successfully');
      } else {
        throw new Error(result.data.message || 'Profile update failed');
      }
    } catch (error) {
      toast.error((error as Error).message);
      throw error;
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updatePassword,
    updateProfile,
    isAuthenticated: !!user,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};