// v6
import { Link, Outlet, useLocation } from 'react-router-dom';
import { User } from "lucide-react";
import { Button } from "../../shared/ui";

export function SuperAdminLayout() {
  const location = useLocation();

  const navLinks = [
    { path: "/superadmin/dashboard", label: "Dashboard" },
    { path: "/superadmin/restaurants", label: "Restaurants" },
    { path: "/superadmin/users", label: "Users" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-white">
      {/* Header Navigation */}
      <header className="bg-gradient-to-r from-[#22C55E] to-[#16A34A] border-b sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-24">
            <div className="flex items-center gap-4">
              <div className="text-white">
                <h1 className="text-2xl font-bold">Super Admin</h1>
                <p className="text-sm opacity-90">Platform Management</p>
              </div>
            </div>

            <nav className="flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-xl font-medium transition-colors ${
                    isActive(link.path)
                      ? "text-white font-bold border-b-4 border-white pb-1"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.location.href = '/superadmin/profile'}
              className="hover:bg-white/20 text-white"
            >
              <User className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
