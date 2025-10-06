'use client';

import { useRouter } from 'next/navigation';
import { authService } from '../../authServices/authServices';
import { estudianteService } from '../../../services/estudianteService'; // ← Importa el servicio
import { useAuth } from '../../context/AuthContext';
import { 
  Bot, 
  Home, 
  LogOut, 
  LogIn, 
  UserPlus, 
  BookOpen, 
  User,
  ChevronDown,
  Settings
} from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Estudiante } from '../../types/models'; // ← Importa el tipo

const Header = () => {
  const router = useRouter();
  const { isAuthenticated, setAuthenticated } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userName, setUserName] = useState('Estudiante');
  const [userData, setUserData] = useState<Estudiante | null>(null); // ← Estado para datos completos
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const obtenerDatosUsuario = async () => {
      if (isAuthenticated) {
        try {
          setLoading(true);
          // Obtener datos completos del perfil usando el mismo servicio que MiPerfil
          const perfil = await estudianteService.getPerfil();
          setUserData(perfil);
          setUserName(perfil.nombre || 'Estudiante');
          
          // También actualizar localStorage para consistencia
          if (perfil.nombre) {
            localStorage.setItem('nombre', perfil.nombre);
          }
        } catch (error) {
          console.error('Error al obtener perfil:', error);
          // Fallback: intentar obtener del localStorage
          const nombreLocal = localStorage.getItem('nombre') || 'Estudiante';
          setUserName(nombreLocal);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    obtenerDatosUsuario();
  }, [isAuthenticated]); // ← Se ejecuta cuando cambia isAuthenticated

  const handleLogout = () => {
    try {
      console.log('Iniciando logout...');
      
      // 1. Cerrar dropdown primero
      setIsProfileOpen(false);
      
      // 2. Actualizar contexto ANTES del logout service
      setAuthenticated(false);
      
      // 3. Limpiar estados locales
      setUserName('Estudiante');
      setUserData(null);
      
      // 4. Ejecutar logout del servicio
      authService.logout();
      
      console.log('Logout completado, redirigiendo...');
      
      // 5. Redirigir después de actualizar el estado
      setTimeout(() => {
        router.push('/login');
        router.refresh();
      }, 100);
      
    } catch (error) {
      console.error('Error durante logout:', error);
      // Forzar redirección incluso si hay error
      router.push('/login');
    }
  };

  // Mostrar estado de carga
  if (loading && isAuthenticated) {
    return (
      <header className="bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 text-white shadow-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Bot className="w-7 h-7 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold">EstudiBot</span>
                </div>
              </Link>
            </div>
            
            {/* Loading state */}
            <div className="flex items-center space-x-3">
              <div className="animate-pulse flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-white/10">
                <div className="w-8 h-8 bg-white/20 rounded-full"></div>
                <div className="h-4 bg-white/20 rounded w-24"></div>
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 text-white shadow-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo y Título */}
          <div className="flex items-center space-x-3">
            <Link 
              href={isAuthenticated ? "/HomePanel" : "/"} 
              className="flex items-center space-x-3 group"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300">
                <Bot className="w-7 h-7 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold tracking-tight group-hover:text-yellow-300 transition-colors">
                  EstudiBot
                </span>
                <span className="text-sm text-blue-100 font-medium opacity-90">
                  Tu asistente académico
                </span>
              </div>
            </Link>
          </div>

          {/* Navegación */}
          <nav className="flex items-center space-x-2">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {/* Enlaces principales */}
                <Link
                  href="/HomePanel"
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200 hover:scale-105"
                >
                  <Home className="w-4 h-4" />
                  <span>Inicio</span>
                </Link>

                <Link
                  href="/chatbot"
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200 hover:scale-105"
                >
                  <Bot className="w-4 h-4" />
                  <span>Chatbot</span>
                </Link>

                {/* Menú de perfil */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-xs font-bold text-white">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <span className="max-w-32 truncate">{userName}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50">
                      {/* Header del dropdown */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-800">{userName}</p>
                        <p className="text-xs text-gray-500">
                          {userData?.cedula ? `Cédula: ${userData.cedula}` : 'Estudiante'}
                        </p>
                      </div>

                      {/* Opciones del menú */}
                      <Link
                        href="/Perfil"
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        <span>Mi Perfil</span>
                      </Link>

                      <Link
                        href="/"
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        <span>Configuración</span>
                      </Link>

                      {/* Separador */}
                      <div className="border-t border-gray-100 my-1"></div>

                      {/* Cerrar sesión */}
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors rounded-b-xl"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="flex items-center space-x-2 px-6 py-2.5 rounded-lg text-sm font-semibold bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200 hover:scale-105 group"
                >
                  <LogIn className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Iniciar Sesión</span>
                </Link>

                <Link
                  href="/register"
                  className="flex items-center space-x-2 px-6 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl group"
                >
                  <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Registrarse</span>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>

      {/* Overlay para cerrar el dropdown */}
      {isProfileOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsProfileOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;