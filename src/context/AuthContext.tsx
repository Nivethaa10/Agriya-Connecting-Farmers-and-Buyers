import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getErrorMessage } from '../services/api.ts';
import { User, FarmerProfile, BuyerProfile } from '../types/index.ts';

interface AuthContextType {
  user: User | null;
  profile: FarmerProfile | BuyerProfile | null;
  token: string | null;
  isLoading: boolean;
  unreadNotifications: number;
  login: (identifier: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (formData: any) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateProfileState: (updatedProfile: any) => void;
  setUnreadNotifications: React.Dispatch<React.SetStateAction<number>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<FarmerProfile | BuyerProfile | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('agriya_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);

  const refreshUser = async () => {
    const storedToken = localStorage.getItem('agriya_token');
    if (!storedToken) {
      setUser(null);
      setProfile(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        setProfile(res.data.profile);
        setUnreadNotifications(res.data.unreadNotificationsCount || 0);
      }
    } catch (err: any) {
      console.warn('Session verification failed:', err.message);
      localStorage.removeItem('agriya_token');
      localStorage.removeItem('agriya_user');
      setUser(null);
      setProfile(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (identifier: string, password: string) => {
    try {
      const res = await api.post('/auth/login', { identifier, password });
      if (res.data.success) {
        const receivedToken = res.data.token;
        localStorage.setItem('agriya_token', receivedToken);
        setToken(receivedToken);
        setUser(res.data.user);
        setProfile(res.data.profile);
        // fetch fresh notifications count
        try {
          const meRes = await api.get('/auth/me', {
            headers: { Authorization: `Bearer ${receivedToken}` },
          });
          if (meRes.data.unreadNotificationsCount !== undefined) {
            setUnreadNotifications(meRes.data.unreadNotificationsCount);
          }
        } catch {}
        return { success: true };
      }
      return { success: false, message: res.data.message || 'Login failed' };
    } catch (err: any) {
      return { success: false, message: getErrorMessage(err) };
    }
  };

  const register = async (formData: any) => {
    try {
      const res = await api.post('/auth/register', formData);
      if (res.data.success) {
        const receivedToken = res.data.token;
        localStorage.setItem('agriya_token', receivedToken);
        setToken(receivedToken);
        setUser(res.data.user);
        setProfile(res.data.profile);
        return { success: true };
      }
      return { success: false, message: res.data.message || 'Registration failed' };
    } catch (err: any) {
      return { success: false, message: getErrorMessage(err) };
    }
  };

  const logout = () => {
    try {
      api.post('/auth/logout').catch(() => {});
    } catch {}
    localStorage.removeItem('agriya_token');
    localStorage.removeItem('agriya_user');
    setUser(null);
    setProfile(null);
    setToken(null);
    setUnreadNotifications(0);
    // Replace URL to home to prevent backward navigation restoring UI
    window.location.hash = '#/';
  };

  const updateProfileState = (updatedProfile: any) => {
    setProfile(updatedProfile);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        isLoading,
        unreadNotifications,
        login,
        register,
        logout,
        refreshUser,
        updateProfileState,
        setUnreadNotifications,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
