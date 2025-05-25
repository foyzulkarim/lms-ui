import { ReactNode, useEffect } from 'react';
import { useLocation, Route } from 'wouter';
import { useAuth } from '../context/AuthContext';
import { shouldBypassAuth } from '@/lib/environment';

interface ProtectedRouteProps {
  children: ReactNode;
  path: string;
}

export function ProtectedRoute({ children, path }: ProtectedRouteProps) {
  const { isLoggedIn, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const bypassAuth = shouldBypassAuth();

  useEffect(() => {
    // Skip authentication check if bypass is enabled
    if (!isLoading && !isLoggedIn && !bypassAuth) {
      // Redirect to login if not authenticated and bypass not enabled
      navigate('/login');
    }
  }, [isLoggedIn, isLoading, navigate, bypassAuth]);

  if (isLoading && !bypassAuth) {
    // Show loading indicator while checking auth status (skip if bypass enabled)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  // Render the route if authenticated or bypass is enabled
  return isLoggedIn || bypassAuth ? <Route path={path}>{children}</Route> : null;
}
