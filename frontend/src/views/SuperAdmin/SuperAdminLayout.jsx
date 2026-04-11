import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { Button, ConfirmDialog } from '../../shared/ui';
import { clearSession } from '../../lib/auth';
import { BackButton } from '../../shared/navigation';
import { useState } from 'react';

export function SuperAdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const navLinks = [
    { path: '/superadmin/dashboard', label: 'Dashboard' },
    { path: '/superadmin/restaurants', label: 'Restaurants' },
    { path: '/superadmin/users', label: 'Users' },
  ];

  const isActive = (path) => location.pathname === path;
  const fallbackPath = location.pathname === '/superadmin/dashboard' ? '/superadmin' : '/superadmin/dashboard';

  const logout = () => {
    clearSession();
    setLogoutDialogOpen(false);
    navigate('/superadmin');
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 border-b bg-[#dcfce7] shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-24 items-center justify-between gap-6">
            <nav className="flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-xl font-medium transition-colors ${
                    isActive(link.path)
                      ? 'font-semibold text-black'
                      : 'text-[#5b5b5b] hover:text-black'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => navigate('/superadmin/profile')} className="hover:bg-white/50">
                <User className="h-6 w-6" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setLogoutDialogOpen(true)} className="hover:bg-white/50">
                <LogOut className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 pt-4">
        <BackButton fallbackPath={fallbackPath} />
      </div>

      <main>
        <Outlet />
      </main>

      <ConfirmDialog
        open={logoutDialogOpen}
        title="Log out of super admin?"
        description="You will return to the super admin login page and end this session."
        confirmText="Logout"
        confirmVariant="destructive"
        onCancel={() => setLogoutDialogOpen(false)}
        onConfirm={logout}
      />
    </div>
  );
}
