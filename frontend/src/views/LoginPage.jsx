import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Button, Input } from '../shared/ui';
import imgLogo from '../assets/43f7673940367781fb7ec14544ebbbad91e6ffee.png';
import { toast } from 'sonner';
import { authenticateUser, registerUser } from '../controllers/authController';
import { getRoleHomePath } from '../shared/navigation';
import { getUser, isLoggedIn } from '../lib/auth';
import { api } from '../lib/api';

const digitsOnly = (value) => String(value || '').replace(/\D/g, '').slice(0, 10);
const otpDigitsOnly = (value) => String(value || '').replace(/\D/g, '').slice(0, 6);
const isValidPhone = (value) => /^\d{10}$/.test(String(value || ''));

function PasswordField({ value, onChange, placeholder, disabled, required = true }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input
        type={visible ? 'text' : 'password'}
        placeholder={placeholder}
        className="h-11 pr-11 password-no-native"
        value={value}
        disabled={disabled}
        onChange={onChange}
        required={required}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => setVisible((next) => !next)}
        className="absolute right-3 top-2.5 text-gray-500 disabled:opacity-40"
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function ForgotPasswordPanel({ onClose, onSuccess }) {
  const [step, setStep] = useState('username');
  const [form, setForm] = useState({ username: '', phone: '', code: '', new_password: '', confirm_password: '' });
  const [loading, setLoading] = useState(false);

  const submitUsername = (event) => {
    event.preventDefault();
    if (!form.username.trim()) return toast.error('Username is required', { duration: 5000 });
    setStep('phone');
  };

  const requestCode = async (event) => {
    event.preventDefault();
    if (!isValidPhone(form.phone)) return toast.error('Mobile number must be exactly 10 digits', { duration: 5000 });
    setLoading(true);
    try {
      await api.post('/api/auth/forgot-password/request', { username: form.username.trim(), phone: form.phone });
      setStep('verify');
      toast.success('OTP sent to your registered WhatsApp number', { duration: 5000 });
    } catch (error) {
      toast.error(error.message || 'Could not send OTP', { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/auth/forgot-password/verify', { username: form.username.trim(), phone: form.phone, code: form.code });
      setStep('reset');
      toast.success('OTP verified', { duration: 5000 });
    } catch (error) {
      toast.error(error.message || 'OTP verification failed', { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/auth/forgot-password/reset', { ...form, username: form.username.trim() });
      toast.success('Password reset successfully. Please log in.', { duration: 5000 });
      onSuccess?.();
      onClose?.();
    } catch (error) {
      toast.error(error.message || 'Could not reset password', { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">Forgot password</h2>
            <p className="mt-1 text-sm text-gray-600">Verify your username and registered mobile number before resetting your password.</p>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>

        <div className="mb-4 flex items-center gap-2 text-xs font-semibold text-gray-500">
          <span className={step === 'username' ? 'text-[#16A34A]' : ''}>Username</span>
          <span>→</span>
          <span className={step === 'phone' ? 'text-[#16A34A]' : ''}>Phone</span>
          <span>→</span>
          <span className={step === 'verify' ? 'text-[#16A34A]' : ''}>OTP</span>
          <span>→</span>
          <span className={step === 'reset' ? 'text-[#16A34A]' : ''}>Reset</span>
        </div>

        {step === 'username' && (
          <form onSubmit={submitUsername} className="space-y-4">
            <Input placeholder="Username or email address" value={form.username} onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))} required />
            <Button type="submit" className="w-full">Continue</Button>
          </form>
        )}

        {step === 'phone' && (
          <form onSubmit={requestCode} className="space-y-4">
            <Input placeholder="Registered phone number" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: digitsOnly(e.target.value) }))} maxLength={10} inputMode="numeric" pattern="\d{10}" required />
            <div className="flex gap-2">
              <Button type="button" variant="outline" disabled={loading} onClick={() => setStep('username')}>Back</Button>
              <Button type="submit" disabled={loading} className="flex-1">{loading ? 'Sending...' : 'Send WhatsApp OTP'}</Button>
            </div>
          </form>
        )}

        {step === 'verify' && (
          <form onSubmit={verifyCode} className="space-y-4">
            <Input placeholder="6-digit OTP" value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: otpDigitsOnly(e.target.value) }))} maxLength={6} inputMode="numeric" pattern="\d{6}" required />
            <Button type="submit" disabled={loading} className="w-full">{loading ? 'Checking...' : 'Verify OTP'}</Button>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={resetPassword} className="space-y-4">
            <PasswordField placeholder="New password" value={form.new_password} onChange={(e) => setForm((p) => ({ ...p, new_password: e.target.value }))} />
            <PasswordField placeholder="Confirm new password" value={form.confirm_password} onChange={(e) => setForm((p) => ({ ...p, confirm_password: e.target.value }))} />
            <Button type="submit" disabled={loading} className="w-full">{loading ? 'Resetting...' : 'Reset password'}</Button>
          </form>
        )}
      </div>
    </div>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.pathname === '/signup' ? 'signup' : 'login');
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [signupStep, setSignupStep] = useState('details');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    terms_accepted: false,
    otp_code: '',
  });

  const redirectPath = useMemo(() => location.state?.from || '/dashboard', [location.state]);

  useEffect(() => {
    const user = getUser();
    if (isLoggedIn() && user) {
      navigate(getRoleHomePath(user.role), { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authenticateUser({ ...loginForm, expected_role: 'customer' });
      toast.success('Login successful', { duration: 5000 });
      navigate(redirectPath, { replace: true });
    } catch (error) {
      toast.error(error.message || 'Login failed', { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const requestSignupOtp = async () => {
    if (!isValidPhone(signupForm.phone)) {
      throw new Error('Mobile number must be exactly 10 digits');
    }
    if (signupForm.password !== signupForm.confirm_password) {
      throw new Error('Passwords do not match');
    }
    if (!signupForm.terms_accepted) {
      throw new Error('Please accept the Terms & Conditions before signing up');
    }

    await registerUser({
      full_name: signupForm.full_name,
      email: signupForm.email,
      phone: signupForm.phone,
      password: signupForm.password,
      confirm_password: signupForm.confirm_password,
      terms_accepted: signupForm.terms_accepted,
      role: 'customer',
      food_preferences: [],
    });
  };

  const verifySignupOtp = async () => {
    if (!/^\d{6}$/.test(signupForm.otp_code)) {
      throw new Error('Please enter the 6-digit OTP sent to your WhatsApp');
    }

    await api.post('/api/auth/register/verify', {
      email: signupForm.email,
      phone: signupForm.phone,
      code: signupForm.otp_code,
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (signupStep === 'details') {
        await requestSignupOtp();
        setSignupStep('otp');
        toast.success('OTP sent to your WhatsApp number. Enter it to complete signup.', { duration: 5000 });
        return;
      }

      await verifySignupOtp();
      toast.success('Account verified successfully. Please log in.', { duration: 5000 });
      setLoginForm((p) => ({ ...p, email: signupForm.email }));
      setSignupForm({ full_name: '', email: '', phone: '', password: '', confirm_password: '', terms_accepted: false, otp_code: '' });
      setSignupStep('details');
      setActiveTab('login');
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(error.message || 'Signup failed', { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const signupDisabled = activeTab !== 'signup' || loading;
  const loginDisabled = activeTab !== 'login' || loading;

  return (
    <div className="min-h-screen bg-white px-4 py-3 dark:bg-black">
      <div className="mx-auto max-w-6xl">
        <div className="mb-3 flex items-center justify-end gap-4">
          <Link to="/" className="flex items-center justify-end">
            <img src={imgLogo} alt="Annaya" className="h-16 w-auto" />
          </Link>
        </div>
        <div className="mb-4 flex justify-center">
          <div className="inline-flex rounded-full border-2 border-black bg-gray-100 p-1">
            <button type="button" onClick={() => setActiveTab('signup')} className={`rounded-full px-5 py-2 text-base font-medium ${activeTab === 'signup' ? 'bg-[#22C55E] text-white' : 'bg-white text-black'}`}>Sign up</button>
            <button type="button" onClick={() => setActiveTab('login')} className={`rounded-full px-5 py-2 text-base font-medium ${activeTab === 'login' ? 'bg-[#22C55E] text-white' : 'bg-white text-black'}`}>Login</button>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <fieldset disabled={signupDisabled} className={`rounded-3xl bg-[#22C55E] p-7 transition ${activeTab === 'signup' ? 'opacity-100' : 'pointer-events-none opacity-45 grayscale'}`}>
            <h2 className="mb-1 text-3xl font-bold text-black">Create account</h2>
            <p className="mb-4 text-black/80">Join Annaya and start ordering.</p>
            <form onSubmit={handleSignup} className="space-y-3">
              {signupStep === 'details' ? (
                <>
                  <Input placeholder="Full name" className="h-11 bg-white" value={signupForm.full_name} onChange={(e) => setSignupForm((p) => ({ ...p, full_name: e.target.value }))} required />
                  <Input type="email" placeholder="Email address" className="h-11 bg-white" value={signupForm.email} onChange={(e) => setSignupForm((p) => ({ ...p, email: e.target.value }))} required />
                  <Input type="tel" placeholder="Phone number" className="h-11 bg-white" value={signupForm.phone} onChange={(e) => setSignupForm((p) => ({ ...p, phone: digitsOnly(e.target.value) }))} maxLength={10} inputMode="numeric" pattern="\d{10}" required />
                  <PasswordField placeholder="Password" value={signupForm.password} onChange={(e) => setSignupForm((p) => ({ ...p, password: e.target.value }))} disabled={signupDisabled} />
                  <PasswordField placeholder="Confirm password" value={signupForm.confirm_password} onChange={(e) => setSignupForm((p) => ({ ...p, confirm_password: e.target.value }))} disabled={signupDisabled} />
                  <label className="flex items-start gap-3 rounded-2xl bg-white/90 p-3 text-sm font-medium text-black">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 accent-black"
                      checked={signupForm.terms_accepted}
                      onChange={(e) => setSignupForm((p) => ({ ...p, terms_accepted: e.target.checked }))}
                      required
                    />
                    <span>
                      I accept the{' '}
                      <Link to="/terms-and-conditions" className="font-bold underline underline-offset-2" target="_blank" rel="noreferrer">
                        Terms & Conditions
                      </Link>
                    </span>
                  </label>
                  <Button type="submit" disabled={loading} className="h-11 w-full bg-black text-white hover:bg-gray-800">{loading && activeTab === 'signup' ? 'Sending OTP...' : 'Send WhatsApp OTP'}</Button>
                </>
              ) : (
                <>
                  <div className="rounded-2xl bg-white/90 p-4 text-sm text-black">
                    <p className="font-semibold">Verify your phone number</p>
                    <p className="mt-1">Enter the 6-digit OTP sent to WhatsApp number <strong>{signupForm.phone}</strong>.</p>
                  </div>
                  <Input placeholder="6-digit OTP" className="h-11 bg-white" value={signupForm.otp_code} onChange={(e) => setSignupForm((p) => ({ ...p, otp_code: otpDigitsOnly(e.target.value) }))} maxLength={6} inputMode="numeric" pattern="\d{6}" required />
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" disabled={loading} onClick={() => setSignupStep('details')} className="h-11 bg-white text-black hover:bg-gray-100">Edit details</Button>
                    <Button type="submit" disabled={loading} className="h-11 flex-1 bg-black text-white hover:bg-gray-800">{loading ? 'Verifying...' : 'Verify & create account'}</Button>
                  </div>
                </>
              )}
            </form>
          </fieldset>

          <fieldset disabled={loginDisabled} className={`rounded-3xl border-4 border-[#22C55E] bg-white p-7 transition ${activeTab === 'login' ? 'opacity-100' : 'pointer-events-none opacity-45 grayscale'}`}>
            <h2 className="mb-1 text-3xl font-bold text-black">Welcome back</h2>
            <p className="mb-4 text-gray-600">Login to manage orders and your basket.</p>
            <form onSubmit={handleLogin} className="space-y-3">
              <Input type="email" placeholder="Email address" className="h-11" value={loginForm.email} onChange={(e) => setLoginForm((p) => ({ ...p, email: e.target.value }))} required />
              <PasswordField placeholder="Password" value={loginForm.password} onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))} disabled={loginDisabled} />
              <div className="-mt-1 flex justify-end">
                <button type="button" disabled={loginDisabled} onClick={() => setForgotOpen(true)} className="text-sm font-semibold text-[#16A34A] hover:underline disabled:opacity-50">Forgot Password?</button>
              </div>
              <Button type="submit" disabled={loading} className="h-11 w-full bg-[#22C55E] text-white hover:bg-[#16A34A]">{loading && activeTab === 'login' ? 'Please wait...' : 'Login'}</Button>
            </form>
          </fieldset>
        </div>
      </div>
      {forgotOpen && <ForgotPasswordPanel onClose={() => setForgotOpen(false)} onSuccess={() => setActiveTab('login')} />}
    </div>
  );
}
