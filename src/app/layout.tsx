'use client';

import { AuthProvider } from './context/AuthContext'

import Header from './components/ui/Header';
import './globals.css'; // ✅ Ruta correcta
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <Header />
          <main className="min-h-screen">{children}</main>

        </AuthProvider>
      </body>
    </html>
  );
}