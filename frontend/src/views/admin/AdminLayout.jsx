import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, User } from "lucide-react";
import { Button, ConfirmDialog } from "../../shared/ui";
import { clearSession } from '../../lib/auth';
import { useState } from 'react';
import imgLogo from '../../assets/43f7673940367781fb7ec14544ebbbad91e6ffee.png';
import { ThemeToggle } from '../../shared/layout';
//
export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const navLinks = [
    { path: "/admin/dashboard", label: "Dashboard" },
    { path: "/admin/orders", label: "Orders" },
    { path: "/admin/sales-report", label: "Sales Report" },
    { path: "/admin/ratings", label: "Ratings" },
    { path: "/admin/menu", label: "Menu" },
    { path: "/admin/about", label: "About" },
  ];

  const isActive = (path) => location.pathname === path;
  const navCls = (path) => `cursor-pointer text-[15px] font-medium transition-colors hover:text-[#22C55E] dark:hover:text-[#22C55E] ${isActive(path) ? 'font-semibold text-[#22C55E]' : 'text-gray-700 dark:text-gray-100'}`;

  const logout = () => {
    clearSession();
    setLogoutDialogOpen(false);
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black dark:text-white">
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur dark:bg-black/95 dark:text-white">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between gap-4">
            <Link to="/admin/dashboard" className="flex items-center gap-2">
              <img src={imgLogo} alt="Annaya" className="h-14 w-auto" />
            </Link>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="ghost" size="icon" onClick={() => navigate('/admin/profile')}><User className="h-5 w-5" /></Button>
              <Button variant="ghost" size="icon" onClick={() => setLogoutDialogOpen(true)}><LogOut className="h-5 w-5" /></Button>
            </div>
          </div>
          <nav className="flex h-12 items-center justify-center gap-6 border-t dark:border-white/10">
            {navLinks.map((link) => <Link key={link.path} to={link.path} className={navCls(link.path)}>{link.label}</Link>)}
          </nav>
        </div>
      </header>
      <main><Outlet /></main>
      <ConfirmDialog
        open={logoutDialogOpen}
        title="Log out of admin?"
        description="You will return to the admin login page and the current session will end."
        confirmText="Logout"
        confirmVariant="destructive"
        onCancel={() => setLogoutDialogOpen(false)}
        onConfirm={logout}
      />
    </div>
  );
}
