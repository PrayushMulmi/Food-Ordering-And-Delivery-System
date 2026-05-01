import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getUser, isLoggedIn } from '../lib/auth';

export function RequireLogin() {
  const location = useLocation();
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}

export function RequireRole({ role, loginPath }) {
  const location = useLocation();
  const user = getUser();

  if (!isLoggedIn() || !user) {
    return <Navigate to={loginPath} replace state={{ from: location.pathname }} />;
  }

  if (user.role !== role) {
    if (user.role === 'restaurant_admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'super_admin') return <Navigate to="/superadmin/dashboard" replace />;
    if (user.role === 'rider') return <Navigate to="/rider/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
