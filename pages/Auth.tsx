
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { User } from '../types';
import { SUPPORTED_COUNTRIES } from '../constants';
import { Button, Card, Input } from '../components/ui/Components';
import { Stepper, ScrollFloat } from '../components/ui/ReactBits';
import { ArrowLeft, Mail, KeyRound, Lock, Globe, CheckCircle2 } from 'lucide-react';
import { useToast } from '../components/ui/Toast';

type AuthMode = 'login' | 'signup' | 'forgot_email' | 'forgot_otp' | 'reset_password' | 'verification_sent';

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

  const handleSignup = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
          await simulateLoading();
          const { session, user } = await api.signUp(email, password, fullName, country);
          
          if (!session && user) {
              // Email verification required
              setAuthMode('verification_sent');
              toast.success("Confirmation email sent!");
          } else if (session) {
              // Auto-login (if verification was disabled)
              const fullUser = await api.getCurrentUser();
              if (fullUser) {
                  setUser(fullUser);
                  toast.success("Account created!");
              }
          }
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
          case 'verification_sent': return { title: 'Check Your Inbox', sub: 'Verification required to continue.' };
          default: return { title: 'Welcome Back', sub: 'Sign in to manage your orders.' };
      }
  };

  const { title, sub } = renderHeader();

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
        )}

        {authMode === 'signup' && (
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
        )}

        {authMode === 'verification_sent' && (
            <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-vision-primary/10 rounded-full flex items-center justify-center mx-auto text-vision-primary animate-pulse">
                    <CheckCircle2 size={40} />
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-sm text-gray-300">
                        We have sent a secure verification link to:
                        <br/>
                        <span className="text-white font-bold">{email}</span>
                    </p>
                </div>
                <p className="text-xs text-gray-500">
                    Please check your inbox (and spam folder) and click the link to activate your dashboard.
                </p>
                <Button onClick={() => setAuthMode('login')} variant="outline" className="w-full">
                    Return to Login
                </Button>
            </div>
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

        {authMode !== 'verification_sent' && (
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
        )}
      </Card>
    </div>
  );
};

export default Auth;
