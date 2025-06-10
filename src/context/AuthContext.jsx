import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import { loginUser as apiLogin } from '../services/apiService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      // Aquí normalmente decodificarías el token para obtener datos del usuario
      // o harías una llamada a un endpoint /profile para validar el token
      // Por ahora, asumiremos que si hay token, el usuario está "logueado".
      setToken(storedToken);
      const decodedUser = jwtDecode(storedToken);
      setUser(decodedUser); 
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const data = await apiLogin(credentials);
    localStorage.setItem('token', data.token);
    setToken(data.token);
    const decodedUser = jwtDecode(data.token);
    setUser(decodedUser);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    login,
    logout,
    loading,
  };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};


