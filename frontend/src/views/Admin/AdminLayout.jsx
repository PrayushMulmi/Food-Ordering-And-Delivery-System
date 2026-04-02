// v2 update
import { Link, Outlet, useLocation } from 'react-router-dom';
import { User } from "lucide-react";
import { Button } from "../../shared/ui";

export function AdminLayout() {
  const location = useLocation();

  const navLinks = [
    { path: "/admin/dashboard", label: "Dashboard" },
    { path: "/admin/orders", label: "Orders" },
    { path: "/admin/sales-report", label: "Sales Report" },
    { path: "/admin/ratings", label: "Ratings" },
    { path: "/admin/menu", label: "Menu" },
    { path: "/admin/about", label: "About" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-white">
      {/* Header Navigation */}
      <header className="bg-[#D9D9D9] border-b sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-24">
            <nav className="flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-xl font-medium transition-colors ${
                    isActive(link.path)
                      ? "text-black font-semibold"
                      : "text-[#8B8B8B] hover:text-black"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.location.href = '/admin/profile'}
              className="hover:bg-white/50"
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
