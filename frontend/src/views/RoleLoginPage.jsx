import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Input } from '../shared/ui';
import imgLogo from '../assets/43f7673940367781fb7ec14544ebbbad91e6ffee.png';
import { toast } from 'sonner';
import { authenticateUser, registerUser } from '../controllers/authController';
import { getUser, isLoggedIn } from '../lib/auth';
import { BackButton } from '../shared/navigation';

export function RoleLoginPage({ role = 'restaurant_admin' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMode = role === 'restaurant_admin' && searchParams.get('mode') === 'register' ? 'register' : 'login';
  const [mode, setMode] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ full_name: '', email: '', phone: '', password: '', confirm_password: '', restaurant_name: '', restaurant_cuisine: '', restaurant_address: '', restaurant_description: '', price_level: '$$' });
  const roleTitle = role === 'super_admin' ? 'Super Admin' : role === 'rider' ? 'Delivery Rider' : 'Restaurant Admin';
  const successPath = role === 'super_admin' ? '/superadmin/dashboard' : role === 'rider' ? '/rider/dashboard' : '/admin/dashboard';

  useEffect(() => {
    const user = getUser();
    if (!isLoggedIn() || !user) return;
    if (user.role === role) navigate(successPath, { replace: true });
  }, [navigate, role, successPath]);

  const subTitle = useMemo(() => role === 'super_admin' ? 'Secure access for platform administrators.' : role === 'rider' ? 'Login to manage assigned deliveries and live tracking.' : 'Login or register your restaurant account.', [role]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authenticateUser(loginForm);
      if (response?.data?.user?.role !== role) throw new Error(`This page is only for ${roleTitle.toLowerCase()} users.`);
      toast.success(`${roleTitle} login successful`);
      navigate(location.state?.from || successPath, { replace: true });
    } catch (error) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (role !== 'restaurant_admin') return toast.error('Self-registration is only enabled for restaurant admins.');
    if (registerForm.password !== registerForm.confirm_password) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await registerUser({ ...registerForm, role: 'restaurant_admin' });
      toast.success('Restaurant admin account created');
      navigate('/admin/dashboard', { replace: true });
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (next) => {
    setMode(next);
    setSearchParams(next === 'register' ? { mode: 'register' } : {});
  };

  return (
    <div className="min-h-screen bg-white px-4 py-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <BackButton fallbackPath="/" variant="outline" />
          <Link to="/" className="flex items-center justify-end">
            <img src={imgLogo} alt="Annaya" className="h-20 w-auto" />
          </Link>
        </div>
        <div className="rounded-3xl border-4 border-[#22C55E] bg-white p-8 shadow-sm">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">{roleTitle}</h1>
              <p className="text-gray-600">{subTitle}</p>
            </div>
            {role === 'restaurant_admin' && (
              <div className="inline-flex rounded-full border bg-gray-100 p-1">
                <button onClick={() => switchMode('login')} className={`rounded-full px-4 py-2 text-sm ${mode === 'login' ? 'bg-[#22C55E] text-white' : 'bg-white'}`}>Login</button>
                <button onClick={() => switchMode('register')} className={`rounded-full px-4 py-2 text-sm ${mode === 'register' ? 'bg-[#22C55E] text-white' : 'bg-white'}`}>Register</button>
              </div>
            )}
          </div>

          {mode === 'login' || role === 'super_admin' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <Input type="email" placeholder="Email" className="h-12" value={loginForm.email} onChange={(e) => setLoginForm((p) => ({ ...p, email: e.target.value }))} required />
              <Input type="password" placeholder="Password" className="h-12" value={loginForm.password} onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))} required />
              <Button type="submit" disabled={loading} className="h-12 w-full bg-black text-white hover:bg-gray-800">{loading ? 'Signing in...' : 'Sign in'}</Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="grid gap-4 md:grid-cols-2">
              <Input placeholder="Owner full name" className="h-12" value={registerForm.full_name} onChange={(e) => setRegisterForm((p) => ({ ...p, full_name: e.target.value }))} required />
              <Input type="email" placeholder="Owner email" className="h-12" value={registerForm.email} onChange={(e) => setRegisterForm((p) => ({ ...p, email: e.target.value }))} required />
              <Input placeholder="Phone number" className="h-12" value={registerForm.phone} onChange={(e) => setRegisterForm((p) => ({ ...p, phone: e.target.value }))} required />
              <Input placeholder="Restaurant name" className="h-12" value={registerForm.restaurant_name} onChange={(e) => setRegisterForm((p) => ({ ...p, restaurant_name: e.target.value }))} required />
              <Input placeholder="Cuisine" className="h-12" value={registerForm.restaurant_cuisine} onChange={(e) => setRegisterForm((p) => ({ ...p, restaurant_cuisine: e.target.value }))} required />
              <Input placeholder="Address" className="h-12" value={registerForm.restaurant_address} onChange={(e) => setRegisterForm((p) => ({ ...p, restaurant_address: e.target.value }))} required />
              <Input type="password" placeholder="Password" className="h-12" value={registerForm.password} onChange={(e) => setRegisterForm((p) => ({ ...p, password: e.target.value }))} required />
              <Input type="password" placeholder="Confirm password" className="h-12" value={registerForm.confirm_password} onChange={(e) => setRegisterForm((p) => ({ ...p, confirm_password: e.target.value }))} required />
              <textarea placeholder="Restaurant description" className="min-h-[110px] rounded-md border border-gray-300 px-3 py-2 text-sm md:col-span-2" value={registerForm.restaurant_description} onChange={(e) => setRegisterForm((p) => ({ ...p, restaurant_description: e.target.value }))} />
              <Button type="submit" disabled={loading} className="h-12 w-full md:col-span-2">{loading ? 'Creating account...' : 'Create restaurant admin account'}</Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
