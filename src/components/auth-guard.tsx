'use client';

import { useAuth } from '@/firebase/client-provider';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

const protectedRoutes = ['/dashboard', '/booking', '/profile'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && protectedRoutes.some(path => pathname.startsWith(path))) {
      router.push('/login');
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return <p>Loading...</p>; // Or a proper loading spinner
  }

  return <>{children}</>;
}
