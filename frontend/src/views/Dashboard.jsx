import { Navigate } from 'react-router-dom';
import { LandingPage } from './LandingPage';
import { getUser, isLoggedIn } from '../lib/auth';
import { getRoleHomePath } from '../shared/navigation';

export function Dashboard() {
  const user = getUser();
  if (isLoggedIn() && user?.role && user.role !== 'customer') {
    return <Navigate to={getRoleHomePath(user.role)} replace />;
  }
  return <LandingPage />;
}
