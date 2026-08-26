'use client';
import { AuthProvider } from '@/lib/AuthContext';
import { ToastProvider } from '@/lib/ToastContext';
import NavBar from '@/components/NavBar/NavBar';
import MobileNav from '@/components/MobileNav/MobileNav';

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <NavBar />
        {children}
        <MobileNav />
      </ToastProvider>
    </AuthProvider>
  );
}
