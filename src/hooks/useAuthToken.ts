// hooks/useAuthToken.ts - Versión mejorada con nombre real
'use client';

import { useState, useEffect } from 'react';
import { UserContext } from '../app/types/chatbot';

export const useAuthToken = (): UserContext => {
  const [userContext, setUserContext] = useState<UserContext>({
    isLoggedIn: false,
    token: undefined,
    nombre: undefined,
    timestamp: new Date().toISOString()
  });

  useEffect(() => {
    const getAuthData = async () => {
      const token = localStorage.getItem('access');
      
      if (token) {
        try {
          // Intentar obtener el perfil para tener el nombre real
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/perfil/`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (response.ok) {
            const perfil = await response.json();
            setUserContext({
              nombre: perfil.nombre,
              isLoggedIn: true,
              token: token,
              timestamp: new Date().toISOString()
            });
          } else {
            // Si falla, marcar como logueado pero sin nombre específico
            setUserContext({
              nombre: 'Estudiante',
              isLoggedIn: true,
              token: token,
              timestamp: new Date().toISOString()
            });
          }
        } catch (error) {
          // Si hay error, igual marcar como logueado
          setUserContext({
            nombre: 'Estudiante',
            isLoggedIn: true,
            token: token,
            timestamp: new Date().toISOString()
          });
        }
      } else {
        setUserContext({
          isLoggedIn: false,
          token: undefined,
          nombre: undefined,
          timestamp: new Date().toISOString()
        });
      }
    };

    getAuthData();

    // Escuchar cambios en el localStorage
    const handleStorageChange = () => {
      getAuthData();
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return userContext;
};