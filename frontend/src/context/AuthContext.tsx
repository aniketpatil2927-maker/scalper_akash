import React, { createContext, useContext, useState, useEffect } from 'react';

const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return 'http://localhost:5000/api';
  const trimmed = envUrl.trim().replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

export const API_BASE_URL = getApiBaseUrl();

interface User {
  id: number;
  fullName: string;
  email: string;
  mobile: string;
  roles: string[];
  referralCode?: string | null;
}

interface ActiveSubscription {
  id: number;
  planName: string;
  allowedTrades: number;
  remainingTrades: number;
  expiryDate: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  subscription: ActiveSubscription | null;
  notifications: any[];
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  markNotificationAsRead: (id: number) => Promise<void>;
  apiGet: (endpoint: string) => Promise<any>;
  apiPost: (endpoint: string, body: any) => Promise<any>;
  apiPut: (endpoint: string, body: any) => Promise<any>;
  apiPatch: (endpoint: string, body: any) => Promise<any>;
  apiDelete: (endpoint: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [subscription, setSubscription] = useState<ActiveSubscription | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      fetchProfile();
      fetchNotifications();
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setSubscription(null);
      setIsLoading(false);
    }
  }, [token]);

  const login = (jwtToken: string, userData: User) => {
    setToken(jwtToken);
    setUser(userData);
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setSubscription(null);
    setNotifications([]);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // HTTP Helper: GET
  const apiGet = async (endpoint: string) => {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}${endpoint}`, { headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  };

  // HTTP Helper: POST
  const apiPost = async (endpoint: string, body: any) => {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  };

  // HTTP Helper: PUT
  const apiPut = async (endpoint: string, body: any) => {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  };

  // HTTP Helper: PATCH
  const apiPatch = async (endpoint: string, body: any) => {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  };

  // HTTP Helper: DELETE
  const apiDelete = async (endpoint: string) => {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  };

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const data = await apiGet('/profile');
      const updatedUser: User = {
        id: data.id,
        fullName: data.fullName,
        email: data.email,
        mobile: data.mobile,
        roles: (data.roles && data.roles.length > 0) ? data.roles : (user?.roles || []),
        referralCode: data.referralCode,
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // If user has active subscription, set it
      if (data.Subscriptions && data.Subscriptions.length > 0) {
        const sub = data.Subscriptions[0];
        setSubscription({
          id: sub.id,
          planName: sub.Plan.name,
          allowedTrades: sub.allowedTrades,
          remainingTrades: sub.remainingTrades,
          expiryDate: sub.expiryDate,
        });
      } else {
        setSubscription(null);
      }
    } catch (err) {
      console.error('Fetch profile failed:', err);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      if (!token) return;
      const data = await apiGet('/notifications');
      setNotifications(data);
    } catch (err) {
      console.error('Fetch notifications failed:', err);
    }
  };

  const markNotificationAsRead = async (id: number) => {
    try {
      await apiPut(`/notifications/${id}/read`, {});
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch (err) {
      console.error('Mark notification read failed:', err);
    }
  };

  return (
    <AuthContext.Provider value={{
      token, user, subscription, notifications, isLoading,
      login, logout, fetchProfile, fetchNotifications, markNotificationAsRead,
      apiGet, apiPost, apiPut, apiPatch, apiDelete
    }}>

      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
