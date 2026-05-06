import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui';

export function getRoleHomePath(role) {
  if (role === 'restaurant_admin') return '/admin/dashboard';
  if (role === 'super_admin') return '/superadmin/dashboard';
  if (role === 'rider') return '/rider/dashboard';
  return '/dashboard';
}

export function getRoleProfilePath(role) {
  if (role === 'restaurant_admin') return '/admin/profile';
  if (role === 'super_admin') return '/superadmin/profile';
  if (role === 'rider') return '/rider/profile';
  return '/profile';
}

export function BackButton({
  className = '',
  fallbackPath = '/',
  label = 'Back',
  variant = 'ghost',
}) {
  const navigate = useNavigate();

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(fallbackPath, { replace: true });
  };

  return (
    <Button type="button" variant={variant} onClick={goBack} className={className}>
      <ArrowLeft className="h-4 w-4" />
      <span>{label}</span>
    </Button>
  );
}
