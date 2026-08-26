'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAdmin, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else if (isAdmin) {
        router.replace('/admin');
      } else {
        router.replace('/my-activity');
      }
    }
  }, [user, isAdmin, loading, router]);

  return (
    <div className="page-body container">
      <div className="spinner spinner-lg" />
    </div>
  );
}
