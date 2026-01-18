
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { User } from '../types';
import { SUPPORTED_COUNTRIES } from '../constants';
import { Button, Card, Input } from '../components/ui/Components';
import { Stepper, ScrollFloat } from '../components/ui/ReactBits';
import { ArrowLeft, Mail, KeyRound, Lock, Globe, Github } from 'lucide-react';
import { useToast } from '../components/ui/Toast';

type AuthMode = 'login' | 'signup' | 'forgot_email' | 'forgot_otp' | 'reset_password';

// Simple Google Icon SVG
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.83z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.83c.87-2.6 3.3-4.51 6.16-4.51z" fill="#EA4335"/>
  </svg>
);

const Auth: React.FC<{ setUser: (u: User) => void }> = ({ setUser }) => {
  const [searchParams] = useSearchParams();
  // Initialize authMode based on URL 'mode' parameter to support deep linking (e.g., reset_password)
  const [authMode, setAuthMode] = useState<AuthMode>(() => {
    const mode = searchParams.get('mode');
    if (mode === 'signup' || mode === 'forgot_email' || mode === 'forgot_otp' || mode === 'reset_password') {
      return mode as AuthMode;
    }
    return 'login';
  });

  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [country, setCountry] = useState('India');
  
  // Reset Password States
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const simulateLoading = async (steps = [1, 2, 3, 4]) => {
      for (const step of steps) {
          setLoadingStep(step);
          await new Promise(r => setTimeout(r, 600));
      }
  };

  const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
          await simulateLoading();
          const user = await api.signInWithPassword(email, password);
          setUser(user);
          toast.success("Successfully logged in!");
      } catch (err: any) {
          toast.error(err.message || "Login failed");
      } finally {
          setLoading(false);
      }
  };

  const handleAuthError = (err: any, provider: string) => {
    console.error(`${provider} Login Error:`, err);
    let msg = err.message || `${provider} login failed`;

    // Try to parse JSON error if Supabase returns raw JSON string
    // Example: {"code":400,"error_code":"validation_failed","msg":"Unsupported provider: provider is not enabled"}
    if (typeof msg === 'string' && msg.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(msg);
        if (parsed.msg) msg = parsed.msg;
        else if (parsed.error_description) msg = parsed.error_description;
      } catch (e) {
        // failed to parse, use original
      }
    }

    if (msg.includes("provider is not enabled") || msg.includes("Unsupported provider")) {
      msg = `${provider} Login is currently disabled. Please enable it in your Supabase Dashboard under Authentication > Providers.`;
    }

    toast.error(msg);
  };

  const handleGithubLogin = async () => {
    try {
      await api.signInWithGithub();
    } catch (err: any) {
      handleAuthError(err, 'GitHub');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await api.signInWithGoogle();
    } catch (err: any) {
      handleAuthError(err, 'Google');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
          await simulateLoading();
          await api.signUp(email, password, fullName, country);
          toast.success("Account created! Please verify your email.");
      } catch (err: any) {
          toast.error(err.message || "Signup failed");
      } finally {
          setLoading(false);
      }
  };

  const handleForgotEmail = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
          await api.sendPasswordResetOtp(email);
          setAuthMode('forgot_otp');
          toast.success("Reset code sent to your email.");
      } catch (err: any) {
          toast.error(err.message);
      } finally {
          setLoading(false);
      }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
          await api.verifyRecoveryOtp(email, otp);
          setAuthMode('reset_password');
          toast.success("Code verified. Please set a new password.");
      } catch (err: any) {
          toast.error("Invalid code. Please try again.");
      } finally {
          setLoading(false);
      }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
          await api.updateUserPassword(newPassword);
          // Get fresh user to trigger login
          const user = await api.getCurrentUser();
          if (user) {
              setUser(user);
              toast.success("Password updated successfully!");
          }
      } catch (err: any) {
          toast.error(err.message);
      } finally {
          setLoading(false);
      }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-6 sm:p-12 flex flex-col items-center justify-center min-h-[400px]">
          <h2 className="text-2xl font-display font-bold text-white mb-8 animate-pulse text-center">
             <ScrollFloat>Processing...</ScrollFloat>
          </h2>
          <div className="w-full px-2 sm:px-4 mb-8">
            <Stepper 
              currentStep={loadingStep}
              steps={[
                { id: 1, label: "Verifying" },
                { id: 2, label: "Encrypting" },
                { id: 3, label: "Connecting" },
                { id: 4, label: "Success" }
              ]}
            />
          </div>
          <p className="text-gray-400 text-sm mt-8 animate-pulse">Establishing secure handshake protocol...</p>
        </Card>
      </div>
    );
  }

  // Common Header Logic
  const renderHeader = () => {
      switch(authMode) {
          case 'signup': return { title: 'Create Account', sub: 'Join Vision Built to start your project.' };
          case 'forgot_email': return { title: 'Reset Password', sub: 'Enter your email to receive a secure code.' };
          case 'forgot_otp': return { title: 'Verify Code', sub: `Enter the code sent to ${email}` };
          case 'reset_password': return { title: 'New Password', sub: 'Set a secure password for your account.' };
          default: return { title: 'Welcome Back', sub: 'Sign in to manage your orders.' };
      }
  };

  const { title, sub } = renderHeader();

  const SocialAuth = () => (
    <div className="space-y-6 mt-8">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-vision-900 px-2 text-gray-500 font-medium tracking-widest">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" className="gap-2 h-11 border-white/10 hover:border-vision-primary/50 group" onClick={handleGithubLogin}>
          <Github size={18} className="group-hover:text-vision-primary transition-colors" />
          <span className="text-xs font-bold uppercase tracking-wider">GitHub</span>
        </Button>
        <Button variant="outline" className="gap-2 h-11 border-white/10 hover:border-vision-primary/50 group" onClick={handleGoogleLogin}>
          <GoogleIcon />
          <span className="text-xs font-bold uppercase tracking-wider">Google</span>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8 relative">
        {(authMode === 'forgot_email' || authMode === 'forgot_otp' || authMode === 'reset_password') && (
            <button onClick={() => setAuthMode('login')} className="absolute top-8 left-8 text-gray-400 hover:text-white transition-colors">
                <ArrowLeft size={20} />
            </button>
        )}

        <div className="text-center mb-8">
          <h2 className="text-3xl font-display font-bold text-white mb-2">
              <ScrollFloat>{title}</ScrollFloat>
          </h2>
          <div className="text-gray-400 text-sm">
            <ScrollFloat className="justify-center" animationDuration={0.4}>{sub}</ScrollFloat>
          </div>
        </div>

        {authMode === 'login' && (
            <>
                <form onSubmit={handleLogin} className="space-y-5">
                    <Input 
                        type="email" 
                        placeholder="Email Address" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />
                    <div className="relative">
                        <Input 
                            type="password" 
                            placeholder="Password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                        <button 
                            type="button"
                            onClick={() => setAuthMode('forgot_email')}
                            className="absolute right-0 -bottom-6 text-xs text-gray-500 hover:text-vision-primary transition-colors"
                        >
                            Forgot Password?
                        </button>
                    </div>
                    <div className="pt-2"></div>
                    <Button type="submit" className="w-full">Log In</Button>
                </form>
                <SocialAuth />
            </>
        )}

        {authMode === 'signup' && (
            <>
                <form onSubmit={handleSignup} className="space-y-5">
                    <Input 
                        placeholder="Full Name" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required 
                    />
                    <Input 
                        type="email" 
                        placeholder="Email Address" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />
                    <Input 
                        type="password" 
                        placeholder="Password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                    
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider flex items-center gap-1">
                            <Globe size={12} /> Country / Currency
                        </label>
                        <select
                            className="flex h-10 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-vision-primary/50"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            required
                        >
                            {SUPPORTED_COUNTRIES.map((c) => (
                                <option key={c} value={c} className="bg-vision-900 text-white">
                                    {c}
                                </option>
                            ))}
                        </select>
                    </div>

                    <Button type="submit" className="w-full">Sign Up</Button>
                </form>
                <SocialAuth />
            </>
        )}

        {authMode === 'forgot_email' && (
            <form onSubmit={handleForgotEmail} className="space-y-5">
                <div className="bg-white/5 p-4 rounded-lg flex items-center justify-center mb-4">
                    <Mail size={48} className="text-vision-primary opacity-80" />
                </div>
                <Input 
                    type="email" 
                    placeholder="Enter your email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                />
                <Button type="submit" className="w-full">Send Reset Code</Button>
            </form>
        )}

        {authMode === 'forgot_otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="bg-white/5 p-4 rounded-lg flex items-center justify-center mb-4">
                    <KeyRound size={48} className="text-vision-primary opacity-80" />
                </div>
                <Input 
                    type="text" 
                    placeholder="Enter 6-digit Code" 
                    value={otp} 
                    onChange={(e) => setOtp(e.target.value)} 
                    required 
                    className="text-center tracking-widest text-lg"
                />
                <Button type="submit" className="w-full">Verify Code</Button>
                <div className="text-center text-xs">
                    <button type="button" onClick={handleForgotEmail} className="text-gray-500 hover:text-white">Resend Code</button>
                </div>
            </form>
        )}

        {authMode === 'reset_password' && (
            <form onSubmit={handleResetPassword} className="space-y-5">
                <div className="bg-white/5 p-4 rounded-lg flex items-center justify-center mb-4">
                    <Lock size={48} className="text-vision-primary opacity-80" />
                </div>
                <Input 
                    type="password" 
                    placeholder="New Password" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    required 
                    minLength={6}
                />
                <Button type="submit" className="w-full">Update Password</Button>
            </form>
        )}

        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          {authMode === 'login' && (
            <p className="text-sm text-gray-400">
              Don't have an account?{' '}
              <button 
                onClick={() => setAuthMode('signup')}
                className="text-vision-primary hover:underline font-bold"
              >
                Sign Up
              </button>
            </p>
          )}
          {authMode === 'signup' && (
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <button 
                onClick={() => setAuthMode('login')}
                className="text-vision-primary hover:underline font-bold"
              >
                Log In
              </button>
            </p>
          )}
          {(authMode === 'forgot_email' || authMode === 'forgot_otp' || authMode === 'reset_password') && (
            <button 
              onClick={() => setAuthMode('login')}
              className="text-sm text-vision-primary hover:underline font-bold"
            >
              Back to Login
            </button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Auth;
