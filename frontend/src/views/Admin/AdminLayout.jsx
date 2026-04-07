import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, User } from "lucide-react";
import { Button } from "../../shared/ui";
import { clearSession } from '../../lib/auth';

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const navLinks = [
    { path: "/admin/dashboard", label: "Dashboard" },
    { path: "/admin/orders", label: "Orders" },
    { path: "/admin/sales-report", label: "Sales Report" },
    { path: "/admin/ratings", label: "Ratings" },
    { path: "/admin/menu", label: "Menu" },
    { path: "/admin/about", label: "About" },
  ];
  const isActive = (path) => location.pathname === path;
  const logout = () => { if (window.confirm('Are you sure you want to logout?')) { clearSession(); navigate('/admin'); } };
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 border-b bg-[#dcfce7] shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-24 items-center justify-between">
            <nav className="flex items-center gap-8">{navLinks.map((link) => <Link key={link.path} to={link.path} className={`text-xl font-medium transition-colors ${isActive(link.path) ? 'font-semibold text-black' : 'text-[#5b5b5b] hover:text-black'}`}>{link.label}</Link>)}</nav>
            <div className="flex items-center gap-2"><Button variant="ghost" size="icon" onClick={() => navigate('/admin/about')} className="hover:bg-white/50"><User className="h-6 w-6" /></Button><Button variant="ghost" size="icon" onClick={logout} className="hover:bg-white/50"><LogOut className="h-6 w-6" /></Button></div>
          </div>
        </div>
      </header>
      <main><Outlet /></main>
    </div>
  );
}
