'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../authServices/authServices';

interface AuthContextType {
  isAuthenticated: boolean;
  setAuthenticated: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Verificar autenticación al cargar
    setAuthenticated(authService.isAuthenticated());
  }, []);

  // Escuchar cambios en el localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      setAuthenticated(authService.isAuthenticated());
    };

    // Escuchar eventos de storage
    window.addEventListener('storage', handleStorageChange);
    
    // Escuchar eventos personalizados (opcional)
    window.addEventListener('authChange', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleStorageChange);
    };
  }, []);

  const value = {
    isAuthenticated,
    setAuthenticated: (value: boolean) => {
      setAuthenticated(value);
      // Si se establece como false, forzar limpieza
      if (!value) {
        authService.logout();
      }
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};