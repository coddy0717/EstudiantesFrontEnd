// hooks/useChatbotAuth.ts - Versión mejorada
'use client';

import { useState, useEffect } from 'react';
import { UserContext } from '../app/types/chatbot';

export const useChatbotAuth = () => {
  const [userContext, setUserContext] = useState<UserContext>({
    isLoggedIn: false,
    token: undefined,
    nombre: undefined,
    timestamp: new Date().toISOString()
  });

  useEffect(() => {
    const getAuthData = async () => {
      try {
        // Obtener el token del login principal
        const token = localStorage.getItem('access');
        
        if (token) {
          // Intentar obtener el perfil para tener el nombre real
          try {
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
              // Si falla, usar el nombre guardado
              const nombre = localStorage.getItem('user_nombre');
              setUserContext({
                nombre: nombre || 'Usuario',
                isLoggedIn: true,
                token: token,
                timestamp: new Date().toISOString()
              });
            }
          } catch (error) {
            // Fallback: usar nombre guardado
            const nombre = localStorage.getItem('user_nombre');
            setUserContext({
              nombre: nombre || 'Usuario',
              isLoggedIn: true,
              token: token,
              timestamp: new Date().toISOString()
            });
          }
        }
      } catch (error) {
        console.error('Error obteniendo datos de autenticación:', error);
      }
    };

    getAuthData();
  }, []);

  return userContext;
};