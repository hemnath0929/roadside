// AuthContext.jsx — Global auth state: user, token, role
import { createContext, useState, useEffect, useContext } from 'react';
import { loginUser, registerUser } from '../services/authService';
import * as socketService from '../services/socketService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]   = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('rsa_token');
    const storedUser  = localStorage.getItem('rsa_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      // Reconnect socket
      socketService.connect(storedToken);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await loginUser({ email, password });
    // Backend returns { token, user: { _id, name, email, role } }
    localStorage.setItem('rsa_token', data.token);
    localStorage.setItem('rsa_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    socketService.connect(data.token);
    return data.user;
  };

  const register = async (formData) => {
    const data = await registerUser(formData);
    localStorage.setItem('rsa_token', data.token);
    localStorage.setItem('rsa_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    socketService.connect(data.token);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('rsa_token');
    localStorage.removeItem('rsa_user');
    setToken(null);
    setUser(null);
    socketService.disconnect();
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
