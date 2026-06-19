
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { User } from '../types';
import { SUPPORTED_COUNTRIES } from '../constants';
import { Stepper } from '../components/ui/ReactBits';
import {
  ArrowLeft, Mail, KeyRound, Lock, Globe, CheckCircle2, XCircle,
  Eye, EyeOff,
} from 'lucide-react';
import { useToast } from '../components/ui/Toast';

type AuthMode =
  | 'login'
  | 'signup'
  | 'forgot_email'
  | 'forgot_otp'
  | 'reset_password'
  | 'verification_sent';

// ── Input component (dark-themed) ─────────────────────────────
const DarkInput: React.FC<{
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  minLength?: number;
  className?: string;
  autoComplete?: string;
  showToggle?: boolean;
}> = ({ type = 'text', placeholder, value, onChange, required, minLength, className = '', autoComplete, showToggle }) => {
  const [show, setShow] = useState(false);
  const inputType = showToggle ? (show ? 'text' : 'password') : type;

  return (
    <div className="relative">
      <input
        type={inputType}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        className={`vb-input ${className}`}
        style={{ height: '2.875rem' }}
      />
      {showToggle && (
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground/60 transition-colors"
          tabIndex={-1}
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      )}
    </div>
  );
};

// ── Form field wrapper ─────────────────────────────────────────
const Field: React.FC<{ label?: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="space-y-1.5">
    {label && (
      <label className="text-xs font-satoshi tracking-widest uppercase" style={{ color: 'rgba(248,249,250,0.3)' }}>
        {label}
      </label>
    )}
    {children}
  </div>
);

// ── Main Component ─────────────────────────────────────────────
const Auth: React.FC<{ setUser: (u: User) => void; isRecovery?: boolean }> = ({
  setUser,
  isRecovery,
}) => {
  const [searchParams] = useSearchParams();
  const [authMode, setAuthMode] = useState<AuthMode>(() => {
    if (isRecovery) return 'reset_password';
    const mode = searchParams.get('mode');
    if (['signup', 'forgot_email', 'forgot_otp', 'reset_password'].includes(mode ?? '')) {
      return mode as AuthMode;
    }
    return 'login';
  });

  const toast = useToast();

  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName]         = useState('');
  const [country, setCountry]           = useState('India');
  const [otp, setOtp]                   = useState('');
  const [newPassword, setNewPassword]   = useState('');
  const [loading, setLoading]           = useState(false);
  const [loadingStep, setLoadingStep]   = useState(0);

  const startLoadingAnimation = () => {
    let step = 1;
    setLoadingStep(1);
    const interval = setInterval(() => {
      step++;
      if (step > 4) clearInterval(interval);
      else setLoadingStep(step);
    }, 400);
    return interval;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const anim = startLoadingAnimation();
    try {
      const user = await api.signInWithPassword(email, password);
      if (user) {
        clearInterval(anim);
        setLoadingStep(4);
        setTimeout(() => { setUser(user); toast.success('Successfully logged in!'); }, 500);
      }
    } catch (err: any) {
      clearInterval(anim);
      toast.error(err.message || 'Login failed');
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) { toast.error('Passwords do not match!'); return; }
    setLoading(true);
    const anim = startLoadingAnimation();
    try {
      const { session, user } = await api.signUp(email, password, fullName, country);
      clearInterval(anim);
      setLoadingStep(4);
      setTimeout(async () => {
        if (!session && user) {
          setAuthMode('verification_sent');
          toast.success('Confirmation email sent!');
          setLoading(false);
        } else if (session) {
          const fullUser = await api.getCurrentUser();
          if (fullUser) { setUser(fullUser); toast.success('Account created!'); }
          else setLoading(false);
        } else setLoading(false);
      }, 500);
    } catch (err: any) {
      clearInterval(anim);
      toast.error(err.message || 'Signup failed');
      setLoading(false);
    }
  };

  const handleForgotEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.sendPasswordResetOtp(email);
      setAuthMode('verification_sent');
      toast.success('Reset link sent.');
    } catch (err: any) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.verifyRecoveryOtp(email, otp);
      setAuthMode('reset_password');
      toast.success('Code verified.');
    } catch { toast.error('Invalid code.'); }
    finally { setLoading(false); }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.updateUserPassword(newPassword);
      const user = await api.getCurrentUser();
      if (user) { setUser(user); toast.success('Password updated!'); }
    } catch (err: any) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const handleResendConfirmation = async () => {
    try {
      await api.resendConfirmationEmail(email);
      toast.success('Confirmation link resent!');
    } catch (e: any) { toast.error(e.message); }
  };

  // Header copy
  const getHeader = () => {
    switch (authMode) {
      case 'signup':              return { title: 'Create Account',   sub: 'Join Vision Built to start your project.' };
      case 'forgot_email':        return { title: 'Reset Password',   sub: 'Enter your email to receive a secure code.' };
      case 'forgot_otp':          return { title: 'Verify Code',      sub: `Enter the code sent to ${email}` };
      case 'reset_password':      return { title: 'New Password',     sub: 'Set a secure password for your account.' };
      case 'verification_sent':   return { title: 'Check Your Inbox', sub: 'Verification required to continue.' };
      default:                    return { title: 'Welcome Back',     sub: 'Sign in to manage your orders.' };
    }
  };

  const { title, sub } = getHeader();

  // ── Loading state ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="glass-card w-full max-w-md p-10 flex flex-col items-center justify-center min-h-[380px] relative">
          <button
            onClick={() => setLoading(false)}
            className="absolute top-5 right-5 text-foreground/30 hover:text-foreground transition-colors"
            title="Cancel"
          >
            <XCircle size={18} />
          </button>
          <h2 className="font-display font-bold text-foreground text-2xl mb-10">Processing…</h2>
          <div className="w-full mb-8">
            <Stepper
              currentStep={loadingStep}
              steps={[
                { id: 1, label: 'Verifying' },
                { id: 2, label: 'Encrypting' },
                { id: 3, label: 'Connecting' },
                { id: 4, label: 'Success' },
              ]}
            />
          </div>
          <p className="text-foreground/30 text-xs font-satoshi tracking-widest uppercase mt-4">
            Establishing secure handshake…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">

      {/* Atmospheric glow */}
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none w-[600px] h-[400px]"
        aria-hidden="true"
        style={{
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(124,143,161,0.05) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="glass-card w-full max-w-md p-8 md:p-10 relative"
      >
        {/* Back button */}
        {['forgot_email', 'forgot_otp', 'reset_password'].includes(authMode) && (
          <button
            onClick={() => setAuthMode('login')}
            className="absolute top-8 left-8 text-foreground/30 hover:text-foreground transition-colors"
            aria-label="Back to login"
          >
            <ArrowLeft size={18} />
          </button>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <motion.h2
            key={title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display font-bold text-foreground text-2xl mb-2"
          >
            {title}
          </motion.h2>
          <p className="text-foreground/40 text-sm">{sub}</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={authMode}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >

            {/* ── LOGIN ── */}
            {authMode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <Field>
                  <DarkInput
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </Field>
                <Field>
                  <DarkInput
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    showToggle
                    autoComplete="current-password"
                  />
                </Field>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setAuthMode('forgot_email')}
                    className="text-xs font-satoshi tracking-wide"
                    style={{ color: 'rgba(124,143,161,0.7)' }}
                  >
                    Forgot password?
                  </button>
                </div>
                <button type="submit" className="btn-primary w-full justify-center mt-2">
                  Log In
                </button>
              </form>
            )}

            {/* ── SIGNUP ── */}
            {authMode === 'signup' && (
              <form onSubmit={handleSignup} className="space-y-4">
                <Field>
                  <DarkInput
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    autoComplete="name"
                  />
                </Field>
                <Field>
                  <DarkInput
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </Field>
                <Field>
                  <DarkInput
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    showToggle
                    autoComplete="new-password"
                  />
                </Field>
                <Field>
                  <DarkInput
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    showToggle
                    autoComplete="new-password"
                  />
                </Field>

                <Field label="Country / Currency">
                  <div className="relative">
                    <Globe
                      size={13}
                      className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ color: 'rgba(248,249,250,0.3)' }}
                    />
                    <select
                      className="vb-input pl-8"
                      style={{ height: '2.875rem' }}
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      required
                    >
                      {SUPPORTED_COUNTRIES.map((c) => (
                        <option key={c} value={c} className="bg-[#2C3137] text-foreground">
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </Field>

                <button type="submit" className="btn-primary w-full justify-center mt-2">
                  Create Account
                </button>
              </form>
            )}

            {/* ── VERIFICATION SENT ── */}
            {authMode === 'verification_sent' && (
              <div className="text-center space-y-6">
                <div
                  className="w-16 h-16 mx-auto flex items-center justify-center border"
                  style={{
                    borderColor: 'rgba(124,143,161,0.3)',
                    background: 'rgba(124,143,161,0.06)',
                  }}
                >
                  <CheckCircle2 size={28} style={{ color: 'var(--vb-accent)' }} />
                </div>
                <div className="glass-panel p-4 rounded-lg text-sm">
                  <p className="text-foreground/60">
                    {isRecovery ? 'Password reset link sent to:' : 'Verification link sent to:'}
                  </p>
                  <p className="text-foreground font-semibold mt-1">{email}</p>
                </div>
                <p className="text-foreground/30 text-xs">
                  Check your inbox (and spam folder) and click the link to{' '}
                  {isRecovery ? 'reset your password' : 'activate your account'}.
                </p>
                <div className="flex flex-col gap-3">
                  <button onClick={() => setAuthMode('login')} className="btn-ghost w-full justify-center !text-xs">
                    Return to Login
                  </button>
                  {isRecovery ? (
                    <button
                      onClick={() => setAuthMode('forgot_otp')}
                      className="text-xs font-satoshi"
                      style={{ color: 'rgba(124,143,161,0.6)' }}
                    >
                      I received a code instead of a link
                    </button>
                  ) : (
                    <button
                      onClick={handleResendConfirmation}
                      className="text-xs font-satoshi"
                      style={{ color: 'rgba(124,143,161,0.7)' }}
                    >
                      Resend Confirmation Link
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ── FORGOT EMAIL ── */}
            {authMode === 'forgot_email' && (
              <form onSubmit={handleForgotEmail} className="space-y-5">
                <div
                  className="flex items-center justify-center p-8 border"
                  style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(124,143,161,0.04)' }}
                >
                  <Mail size={36} style={{ color: 'rgba(248,249,250,0.2)' }} />
                </div>
                <Field>
                  <DarkInput
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Field>
                <button type="submit" className="btn-primary w-full justify-center">
                  Send Reset Code
                </button>
              </form>
            )}

            {/* ── OTP VERIFY ── */}
            {authMode === 'forgot_otp' && (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div
                  className="flex items-center justify-center p-8 border"
                  style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(124,143,161,0.04)' }}
                >
                  <KeyRound size={36} style={{ color: 'rgba(248,249,250,0.2)' }} />
                </div>
                <Field>
                  <DarkInput
                    type="text"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    className="text-center tracking-[0.5em] text-lg font-display"
                  />
                </Field>
                <button type="submit" className="btn-primary w-full justify-center">
                  Verify Code
                </button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleForgotEmail}
                    className="text-xs font-satoshi"
                    style={{ color: 'rgba(124,143,161,0.6)' }}
                  >
                    Resend Code
                  </button>
                </div>
              </form>
            )}

            {/* ── RESET PASSWORD ── */}
            {authMode === 'reset_password' && (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div
                  className="flex items-center justify-center p-8 border"
                  style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(124,143,161,0.04)' }}
                >
                  <Lock size={36} style={{ color: 'rgba(248,249,250,0.2)' }} />
                </div>
                <Field>
                  <DarkInput
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    showToggle
                  />
                </Field>
                <button type="submit" className="btn-primary w-full justify-center">
                  Update Password
                </button>
              </form>
            )}

          </motion.div>
        </AnimatePresence>

        {/* ── Mode switcher ── */}
        {authMode !== 'verification_sent' && (
          <div
            className="mt-8 pt-6 border-t text-center text-sm"
            style={{ borderColor: 'rgba(255,255,255,0.06)' }}
          >
            {authMode === 'login' && (
              <p className="text-foreground/40">
                No account?{' '}
                <button
                  onClick={() => setAuthMode('signup')}
                  className="text-foreground hover:opacity-70 font-medium transition-opacity"
                >
                  Sign Up
                </button>
              </p>
            )}
            {authMode === 'signup' && (
              <p className="text-foreground/40">
                Already have an account?{' '}
                <button
                  onClick={() => setAuthMode('login')}
                  className="text-foreground hover:opacity-70 font-medium transition-opacity"
                >
                  Log In
                </button>
              </p>
            )}
            {['forgot_email', 'forgot_otp', 'reset_password'].includes(authMode) && (
              <button
                onClick={() => setAuthMode('login')}
                className="text-foreground/40 hover:text-foreground font-medium transition-colors"
              >
                Back to Login
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Auth;
