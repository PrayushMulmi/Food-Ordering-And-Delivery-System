// v7
import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Input } from '../shared/ui';
import imgLogo from '../assets/43f7673940367781fb7ec14544ebbbad91e6ffee.png';
import { toast } from 'sonner';
import { authenticateUser, registerUser } from '../controllers/authController';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.pathname === '/signup' ? 'signup' : 'login');
  const [loading, setLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ full_name: '', email: '', phone: '', password: '', confirm_password: '' });

  const redirectPath = useMemo(() => location.state?.from || '/dashboard', [location.state]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authenticateUser(loginForm);
      toast.success('Login successful');
      navigate(redirectPath, { replace: true });
    } catch (error) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (signupForm.password !== signupForm.confirm_password) {
      return toast.error('Passwords do not match');
    }
    setLoading(true);
    try {
      await registerUser({ ...signupForm, role: 'customer', food_preferences: [] });
      toast.success('Account created successfully');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      toast.error(error.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-start justify-start"><img src={imgLogo} alt="Annaya" className="h-20 w-auto" /></div>
        <div className="mb-8 flex justify-center">
          <div className="inline-flex rounded-full border-2 border-black bg-gray-100 p-1">
            <button onClick={() => setActiveTab('signup')} className={`rounded-full px-6 py-2 text-base font-medium ${activeTab === 'signup' ? 'bg-[#22C55E] text-white' : 'bg-white text-black'}`}>Sign up</button>
            <button onClick={() => setActiveTab('login')} className={`rounded-full px-6 py-2 text-base font-medium ${activeTab === 'login' ? 'bg-[#22C55E] text-white' : 'bg-white text-black'}`}>Login</button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className={`rounded-3xl bg-[#22C55E] p-8 transition ${activeTab === 'signup' ? 'opacity-100' : 'opacity-60'}`}>
            <h2 className="mb-2 text-3xl font-bold text-black">Create account</h2>
            <p className="mb-6 text-black/80">Join Annaya and start ordering.</p>
            <form onSubmit={handleSignup} className="space-y-4">
              <Input placeholder="Full name" className="h-12 bg-white" value={signupForm.full_name} onChange={(e) => setSignupForm((p) => ({ ...p, full_name: e.target.value }))} required />
              <Input type="email" placeholder="Email address" className="h-12 bg-white" value={signupForm.email} onChange={(e) => setSignupForm((p) => ({ ...p, email: e.target.value }))} required />
              <Input type="tel" placeholder="Phone number" className="h-12 bg-white" value={signupForm.phone} onChange={(e) => setSignupForm((p) => ({ ...p, phone: e.target.value }))} required />
              <Input type="password" placeholder="Password" className="h-12 bg-white" value={signupForm.password} onChange={(e) => setSignupForm((p) => ({ ...p, password: e.target.value }))} required />
              <Input type="password" placeholder="Confirm password" className="h-12 bg-white" value={signupForm.confirm_password} onChange={(e) => setSignupForm((p) => ({ ...p, confirm_password: e.target.value }))} required />
              <Button type="submit" disabled={loading} className="h-12 w-full bg-black text-white hover:bg-gray-800">{loading ? 'Please wait...' : 'Create account'}</Button>
            </form>
          </div>

          <div className={`rounded-3xl border-4 border-[#22C55E] bg-white p-8 transition ${activeTab === 'login' ? 'opacity-100' : 'opacity-60'}`}>
            <h2 className="mb-2 text-3xl font-bold text-black">Welcome back</h2>
            <p className="mb-6 text-gray-600">Login to manage orders and your basket.</p>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input type="email" placeholder="Email address" className="h-12" value={loginForm.email} onChange={(e) => setLoginForm((p) => ({ ...p, email: e.target.value }))} required />
              <Input type="password" placeholder="Password" className="h-12" value={loginForm.password} onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))} required />
              <Button type="submit" disabled={loading} className="h-12 w-full bg-[#22C55E] text-white hover:bg-[#16A34A]">{loading ? 'Please wait...' : 'Login'}</Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
