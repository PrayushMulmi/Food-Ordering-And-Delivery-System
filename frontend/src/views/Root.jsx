import { Outlet, useLocation } from 'react-router-dom';
import { Header, Footer } from "../shared/layout";

export function Root() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {!isAuthPage && <Header />}
      <main className="flex-1">
        <Outlet />
      </main>
      {!isAuthPage && <Footer />}
    </div>
  );
}
