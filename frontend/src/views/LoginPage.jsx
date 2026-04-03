import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Input } from '../shared/ui';
import imgLogo from '../assets/43f7673940367781fb7ec14544ebbbad91e6ffee.png';
import { toast } from 'sonner';
import { authenticateUser, registerUser } from '../controllers/authController';

export function LoginPage({ initialTab }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(initialTab || (location.pathname === '/signup' ? 'signup' : 'login'));
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ full_name: '', email: '', phone: '', location: '', terms: false });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await authenticateUser(loginForm);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!signupForm.terms) {
      toast.error('Please agree to terms & conditions.');
      return;
    }
    try {
      setLoading(true);
      await registerUser({
        full_name: signupForm.full_name,
        email: signupForm.email,
        phone: signupForm.phone,
        password: signupForm.phone,
      });
      toast.success('Account created successfully! Use your contact number as password next time.');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="flex justify-center mb-8">
          <button type="button" onClick={() => navigate('/')} className="cursor-pointer">
            <img src={imgLogo} alt="Annaya" className="h-28 w-auto" />
          </button>
        </div>

        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-gray-100 rounded-full p-1 border-4 border-black">
            <button onClick={() => setActiveTab('signup')} className={`px-8 py-2 rounded-full text-lg font-medium transition-colors ${activeTab === 'signup' ? 'bg-[#22C55E] text-black' : 'bg-white text-black'}`}>SignUp</button>
            <button onClick={() => setActiveTab('login')} className={`px-8 py-2 rounded-full text-lg font-medium transition-colors ${activeTab === 'login' ? 'bg-[#22C55E] text-black' : 'bg-white text-black'}`}>Login</button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <div className={`bg-[#22C55E] rounded-3xl p-12 transition-all duration-300 ${activeTab === 'signup' ? 'opacity-100 scale-100' : 'opacity-50 scale-95'}`}>
            <h2 className="text-5xl font-bold text-black mb-4">Signup</h2>
            <p className="text-3xl text-black mb-8">Create an Account!</p>
            <form onSubmit={handleSignup} className="space-y-5">
              <Input placeholder="Full Name" className="bg-white/90 h-14 text-base" required value={signupForm.full_name} onChange={(e) => setSignupForm({ ...signupForm, full_name: e.target.value })} />
              <Input type="email" placeholder="Email Address" className="bg-white/90 h-14 text-base" required value={signupForm.email} onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })} />
              <Input type="tel" placeholder="Contact Number" className="bg-white/90 h-14 text-base" required value={signupForm.phone} onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })} />
              <Input placeholder="Location" className="bg-white/90 h-14 text-base" required value={signupForm.location} onChange={(e) => setSignupForm({ ...signupForm, location: e.target.value })} />
              <div className="flex items-center gap-3 py-2">
                <input type="checkbox" id="terms" className="w-5 h-5 border-2 border-black" checked={signupForm.terms} onChange={(e) => setSignupForm({ ...signupForm, terms: e.target.checked })} required />
                <label htmlFor="terms" className="text-black text-base">I agree terms & conditions</label>
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-black hover:bg-gray-800 text-white h-14 text-xl font-semibold">Sign up</Button>
            </form>
          </div>

          <div className={`bg-white border-4 border-[#22C55E] rounded-3xl p-12 transition-all duration-300 ${activeTab === 'login' ? 'opacity-100 scale-100' : 'opacity-50 scale-95'}`}>
            <h2 className="text-5xl font-bold text-black mb-4">Login</h2>
            <p className="text-3xl text-black mb-8">Welcome Back!</p>
            <form onSubmit={handleLogin} className="space-y-6">
              <Input type="email" placeholder="Username" className="bg-white h-14 text-base border-gray-300" required value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} />
              <Input type="password" placeholder="Password" className="bg-white h-14 text-base border-gray-300" required value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} />
              <div className="pt-4">
                <Button type="submit" disabled={loading} className="w-full bg-black hover:bg-gray-800 text-white h-14 text-xl font-semibold">Sign In</Button>
              </div>
              <div className="text-center">
                <a href="#" className="text-sm text-gray-600 hover:text-[#22C55E]">Forgot password?</a>
              </div>
            </form>
          </div>
        </div>

        <div className="text-center mt-8 text-gray-600">
          <p>
            {activeTab === 'login' ? (
              <>Don't have an account? <button onClick={() => setActiveTab('signup')} className="text-[#22C55E] font-semibold hover:underline">Sign up</button></>
            ) : (
              <>Already have an account? <button onClick={() => setActiveTab('login')} className="text-[#22C55E] font-semibold hover:underline">Log in</button></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
