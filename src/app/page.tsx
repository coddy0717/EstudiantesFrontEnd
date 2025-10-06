'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/login');
    
    // Ocultar el indicador de Next.js usando JavaScript
    const hideNextIndicator = () => {
      const indicator = document.querySelector('.nextjs-build-indicator');
      if (indicator) {
        indicator.style.display = 'none';
      }
    };

    // Ejecutar inmediatamente y cada segundo por si se vuelve a mostrar
    hideNextIndicator();
    const interval = setInterval(hideNextIndicator, 1000);

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}