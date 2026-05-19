import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Button, Input } from '../shared/ui';
import imgLogo from '../assets/43f7673940367781fb7ec14544ebbbad91e6ffee.png';
import { toast } from 'sonner';
import { authenticateUser, registerUser } from '../controllers/authController';
import { getUser, isLoggedIn } from '../lib/auth';
import { getRoleHomePath } from '../shared/navigation';

const digitsOnly = (value) => String(value || '').replace(/\D/g, '').slice(0, 10);
const isValidPhone = (value) => /^\d{10}$/.test(String(value || ''));


function PasswordField({ value, onChange, placeholder, className = 'h-12', required = true }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input
        type={visible ? 'text' : 'password'}
        placeholder={placeholder}
        className={`${className} pr-11`}
        value={value}
        onChange={onChange}
        required={required}
      />
      <button
        type="button"
        onClick={() => setVisible((next) => !next)}
        className="absolute right-3 top-3 text-gray-500 hover:text-[#22C55E]"
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export function RoleLoginPage({ role = 'restaurant_admin' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMode = role === 'restaurant_admin' && searchParams.get('mode') === 'register' ? 'register' : 'login';
  const [mode, setMode] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ full_name: '', email: '', phone: '', password: '', confirm_password: '', restaurant_name: '', restaurant_cuisine: '', restaurant_address: '', restaurant_description: '', price_level: 'Medium' });
  const roleTitle = role === 'super_admin' ? 'Super Admin' : role === 'rider' ? 'Delivery Rider' : 'Restaurant Admin';
  const successPath = role === 'super_admin' ? '/superadmin/dashboard' : role === 'rider' ? '/rider/dashboard' : '/admin/dashboard';

  useEffect(() => {
    const user = getUser();
    if (!isLoggedIn() || !user) return;
    if (user.role === role) navigate(successPath, { replace: true });
    else navigate(getRoleHomePath(user.role), { replace: true });
  }, [navigate, role, successPath]);

  const subTitle = useMemo(() => role === 'super_admin' ? 'Secure access for platform administrators.' : role === 'rider' ? 'Login to manage assigned deliveries and live tracking.' : 'Login or register your restaurant account.', [role]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authenticateUser({ ...loginForm, expected_role: role });
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
    if (!isValidPhone(registerForm.phone)) return toast.error('Mobile number must be exactly 10 digits');
    if (registerForm.password !== registerForm.confirm_password) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await registerUser({ ...registerForm, role: 'restaurant_admin' });
      toast.success('Restaurant admin account created. Please log in.');
      setLoginForm((p) => ({ ...p, email: registerForm.email }));
      switchMode('login');
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
              <PasswordField placeholder="Password" value={loginForm.password} onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))} />
              <Button type="submit" disabled={loading} className="h-12 w-full bg-black text-white hover:bg-gray-800">{loading ? 'Signing in...' : 'Sign in'}</Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="grid gap-4 md:grid-cols-2">
              <Input placeholder="Owner full name" className="h-12" value={registerForm.full_name} onChange={(e) => setRegisterForm((p) => ({ ...p, full_name: e.target.value }))} required />
              <Input type="email" placeholder="Owner email" className="h-12" value={registerForm.email} onChange={(e) => setRegisterForm((p) => ({ ...p, email: e.target.value }))} required />
              <Input placeholder="Phone number" className="h-12" value={registerForm.phone} onChange={(e) => setRegisterForm((p) => ({ ...p, phone: digitsOnly(e.target.value) }))} maxLength={10} inputMode="numeric" pattern="\d{10}" required />
              <Input placeholder="Restaurant name" className="h-12" value={registerForm.restaurant_name} onChange={(e) => setRegisterForm((p) => ({ ...p, restaurant_name: e.target.value }))} required />
              <Input placeholder="Cuisine" className="h-12" value={registerForm.restaurant_cuisine} onChange={(e) => setRegisterForm((p) => ({ ...p, restaurant_cuisine: e.target.value }))} required />
              <Input placeholder="Address" className="h-12" value={registerForm.restaurant_address} onChange={(e) => setRegisterForm((p) => ({ ...p, restaurant_address: e.target.value }))} required />
              <select value={registerForm.price_level} onChange={(e) => setRegisterForm((p) => ({ ...p, price_level: e.target.value }))} className="h-12 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm" required>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
              <PasswordField placeholder="Password" value={registerForm.password} onChange={(e) => setRegisterForm((p) => ({ ...p, password: e.target.value }))} />
              <PasswordField placeholder="Confirm password" value={registerForm.confirm_password} onChange={(e) => setRegisterForm((p) => ({ ...p, confirm_password: e.target.value }))} />
              <textarea placeholder="Restaurant description" className="min-h-[110px] rounded-md border border-gray-300 px-3 py-2 text-sm md:col-span-2" value={registerForm.restaurant_description} onChange={(e) => setRegisterForm((p) => ({ ...p, restaurant_description: e.target.value }))} />
              <Button type="submit" disabled={loading} className="h-12 w-full md:col-span-2">{loading ? 'Creating account...' : 'Create restaurant admin account'}</Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
