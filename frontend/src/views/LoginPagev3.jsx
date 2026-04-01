import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button, Input } from '../shared/ui';
import imgLogo from '../assets/43f7673940367781fb7ec14544ebbbad91e6ffee.png';
import { authenticateUser, registerUser } from '../controllers/authController';

export function LoginPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ full_name: '', email: '', phone: '', password: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await authenticateUser(loginForm);
      toast.success(response.message || 'Login successful');
      const role = response.data?.user?.role;
      if (role === 'super_admin') navigate('/superadmin');
      else if (role === 'restaurant_admin') navigate('/admin');
      else navigate('/dashboard');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await registerUser(signupForm);
      toast.success(response.message || 'Account created successfully');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <div className="flex justify-center mb-8">
          <img src={imgLogo} alt="Annaya" className="h-24 w-auto" />
        </div>

        <div className="flex justify-center mb-8 gap-2">
          <Button variant={activeTab === 'signup' ? 'default' : 'outline'} onClick={() => setActiveTab('signup')}>Sign up</Button>
          <Button variant={activeTab === 'login' ? 'default' : 'outline'} onClick={() => setActiveTab('login')}>Login</Button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className={`rounded-3xl p-8 ${activeTab === 'signup' ? 'bg-[#22C55E]' : 'bg-gray-100'}`}>
            <h2 className="text-3xl font-bold mb-6">Create account</h2>
            <form onSubmit={handleSignup} className="space-y-4">
              <Input placeholder="Full Name" value={signupForm.full_name} onChange={(e) => setSignupForm({ ...signupForm, full_name: e.target.value })} required />
              <Input type="email" placeholder="Email" value={signupForm.email} onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })} required />
              <Input placeholder="Phone Number" value={signupForm.phone} onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })} />
              <Input type="password" placeholder="Password (minimum 8 characters)" value={signupForm.password} onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })} required />
              <Button type="submit" className="w-full bg-black hover:bg-gray-800 border-black" disabled={loading}>Create Account</Button>
            </form>
          </div>

          <div className={`rounded-3xl p-8 border-2 border-[#22C55E] ${activeTab === 'login' ? 'bg-white' : 'bg-gray-50'}`}>
            <h2 className="text-3xl font-bold mb-6">Welcome back</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input type="email" placeholder="Email" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} required />
              <Input type="password" placeholder="Password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} required />
              <Button type="submit" className="w-full" disabled={loading}>Sign In</Button>
            </form>
            <div className="mt-6 text-sm text-gray-600">
              <p>Demo users after backend starts:</p>
              <p>Super admin: superadmin@example.com</p>
              <p>Restaurant admin: restaurantadmin@example.com</p>
              <p>Password seed may vary. Create a new customer account for ordering.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
