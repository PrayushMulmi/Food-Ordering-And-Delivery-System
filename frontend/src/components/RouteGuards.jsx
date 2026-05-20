import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AUTH_SESSION_EVENT, getUser, isLoggedIn } from '../lib/auth';

function getRoleDashboard(role) {
  if (role === 'restaurant_admin') return '/admin/dashboard';
  if (role === 'super_admin') return '/superadmin/dashboard';
  if (role === 'rider') return '/rider/dashboard';
  return '/dashboard';
}

export function useSessionUser() {
  const [session, setSession] = useState(() => ({ loggedIn: isLoggedIn(), user: getUser() }));

  useEffect(() => {
    const refresh = () => setSession({ loggedIn: isLoggedIn(), user: getUser() });
    window.addEventListener(AUTH_SESSION_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(AUTH_SESSION_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  return session;
}

export function RequireLogin() {
  const location = useLocation();
  const { loggedIn } = useSessionUser();
  if (!loggedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}

export function RequireRole({ role, loginPath }) {
  const location = useLocation();
  const { loggedIn, user } = useSessionUser();

  if (!loggedIn || !user) {
    return <Navigate to={loginPath} replace state={{ from: location.pathname }} />;
  }

  if (user.role !== role) {
    return <Navigate to={getRoleDashboard(user.role)} replace />;
  }

  return <Outlet />;
}
//