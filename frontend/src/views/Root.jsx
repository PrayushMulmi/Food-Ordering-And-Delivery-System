import { Outlet, useLocation } from 'react-router-dom';
import { Header, Footer } from "../shared/layout";
import { BackButton } from '../shared/navigation';

export function Root() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const showBackButton = !isAuthPage && location.pathname !== '/';

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {!isAuthPage && <Header />}
      {showBackButton && (
        <div className="container mx-auto px-4 pt-4">
          <BackButton fallbackPath="/" />
        </div>
      )}
      <main className="flex-1">
        <Outlet />
      </main>
      {!isAuthPage && <Footer />}
    </div>
  );
}
