
import React, { useState, useEffect, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { Preloader } from './components/ui/Preloader';
import { ToastProvider } from './components/ui/Toast';
import { Card, Button } from './components/ui/Components';
import { api } from './services/api';
import { User } from './types';
import { isConfigured, supabase } from './lib/supabase';
import { AnimatePresence } from 'framer-motion';
import { WifiOff, RefreshCw, Settings, Key } from 'lucide-react';

// --- Static Imports for Core Pages (Fixes loading spinner freeze) ---
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';

// --- Lazy Load Non-Critical Pages ---
const Services = React.lazy(() => import('./pages/Services'));
const DevLogin = React.lazy(() => import('./pages/DevLogin'));
const OrderDetails = React.lazy(() => import('./pages/OrderDetails'));
const NewOrder = React.lazy(() => import('./pages/NewOrder'));
const Admin = React.lazy(() => import('./pages/Admin'));
const Offers = React.lazy(() => import('./pages/Offers'));
const Marketplace = React.lazy(() => import('./pages/Marketplace'));
const ProjectCheckout = React.lazy(() => import('./pages/ProjectCheckout'));
const PrivacyPolicy = React.lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = React.lazy(() => import('./pages/TermsOfService'));
const RefundPolicy = React.lazy(() => import('./pages/RefundPolicy'));

// Simple loading spinner for page transitions
const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-vision-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [connectionError, setConnectionError] = useState(false);

  useEffect(() => {
    if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
        window.location.href = window.location.href.replace('http:', 'https:');
    }
  }, []);

  useEffect(() => {
    if (!isConfigured) {
        setLoading(false);
        setShowSplash(false);
        return;
    }

    const initSession = async () => {
      try {
        const currentUser = await api.getCurrentUser();
        setUser(currentUser);
        setConnectionError(false);
      } catch (error: any) {
        console.error("Session check failed", error);
        if (isConfigured && error.message && (
            error.message.includes('Failed to fetch') || 
            error.message.includes('NetworkError') ||
            error.message.includes('error connecting')
        )) {
            setConnectionError(true);
        }
      } finally {
        setLoading(false);
      }
    };

    // 1. Initial Fetch with Failsafe Timeout
    const timeoutId = setTimeout(() => {
        // We only force loading to false if it's still true.
        // This handler might run even if initSession finished successfully 
        // (if it finished *just* before and state update hasn't reflected in this closure yet, 
        // though that's unlikely with React's batching).
        // However, checking the *ref* or just dispatching the update is safer.
        // Since setLoading is stable, calling it again with false is harmless.
        setLoading(prev => {
            if (prev) {
                console.warn("Session check timed out - forcing load");
                return false;
            }
            return prev;
        });
    }, 5000);

    initSession().then(() => clearTimeout(timeoutId));

    // 2. Listen for Auth Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            // Re-fetch user on explicit sign-in events
            const currentUser = await api.getCurrentUser();
            setUser(currentUser);
        } else if (event === 'SIGNED_OUT') {
            setUser(null);
        }
    });

    return () => {
        subscription.unsubscribe();
        clearTimeout(timeoutId);
    };
  }, []);

  // --- 1. Setup Required Screen (Missing Env Vars) ---
  if (!isConfigured) {
      return (
          <div className="min-h-screen bg-vision-900 flex items-center justify-center p-4">
              <Card className="max-w-2xl w-full p-8 border-vision-primary/30 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-vision-primary via-vision-secondary to-vision-primary animate-gradient-x"></div>
                  
                  <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-vision-primary border border-white/10">
                          <Settings size={32} className="animate-spin-slow" />
                      </div>
                      <h1 className="text-3xl font-display font-bold text-white mb-2">Setup Required</h1>
                      <p className="text-gray-400">
                          The application is running, but it's not connected to your Supabase backend yet.
                      </p>
                  </div>

                  <div className="space-y-4 bg-black/20 p-6 rounded-xl border border-white/5 mb-8">
                      <div className="flex items-start gap-4">
                          <div className="p-2 bg-red-500/10 rounded-lg text-red-400 mt-1">
                              <Key size={20} />
                          </div>
                          <div>
                              <h3 className="font-bold text-white">Missing Environment Variables</h3>
                              <p className="text-sm text-gray-400 mt-1">
                                  Please create a <code className="text-vision-primary bg-vision-primary/10 px-1 py-0.5 rounded">.env</code> file in your project root with the following keys:
                              </p>
                              <div className="mt-3 bg-black/50 p-4 rounded-lg font-mono text-xs text-gray-300 overflow-x-auto border border-white/10">
                                  VITE_SUPABASE_URL=your_project_url<br/>
                                  VITE_SUPABASE_ANON_KEY=your_anon_key<br/>
                                  VITE_RAZORPAY_KEY_ID=your_razorpay_id
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="text-center">
                      <Button onClick={() => window.location.reload()} className="w-full sm:w-auto">
                          <RefreshCw size={16} className="mr-2" /> Reload Application
                      </Button>
                      <p className="text-xs text-gray-500 mt-4">
                          Need help? Check the deployment guide in the README.
                      </p>
                  </div>
              </Card>
          </div>
      );
  }

  // --- 2. Connection Failed Screen (Network/Config Error) ---
  if (connectionError && isConfigured) {
      return (
          <div className="min-h-screen bg-vision-900 flex items-center justify-center p-4">
              <Card className="max-w-md w-full text-center border-red-500/30">
                  <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                      <WifiOff size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Connection Failed</h2>
                  <p className="text-gray-400 mb-6 text-sm">
                      Could not reach the database. Please check your internet connection and ensure your Supabase project is active.
                  </p>
                  <Button onClick={() => window.location.reload()} className="w-full">
                      <RefreshCw size={16} className="mr-2" /> Retry Connection
                  </Button>
              </Card>
          </div>
      );
  }

  const isInitializing = loading || showSplash;

  return (
    <>
      <AnimatePresence>
        {isInitializing && <Preloader onComplete={() => setShowSplash(false)} />}
      </AnimatePresence>
      
      {!isInitializing && (
        <ToastProvider>
          <HashRouter>
            <Layout user={user} setUser={setUser}>
                <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/auth" element={!user ? <Auth setUser={setUser} /> : <Navigate to={user.role === 'admin' || user.role === 'super_admin' ? '/admin' : '/dashboard'} />} />
                    <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/auth" />} />
                    
                    {/* Lazy Loaded Routes */}
                    <Route path="/protocol/access" element={<Suspense fallback={<PageLoader />}><DevLogin setUser={setUser} /></Suspense>} />
                    <Route path="/services" element={<Suspense fallback={<PageLoader />}><Services user={user} /></Suspense>} />
                    <Route path="/marketplace" element={<Suspense fallback={<PageLoader />}><Marketplace user={user} /></Suspense>} />
                    <Route path="/offers" element={<Suspense fallback={<PageLoader />}><Offers user={user} /></Suspense>} />
                    <Route path="/privacy-policy" element={<Suspense fallback={<PageLoader />}><PrivacyPolicy /></Suspense>} />
                    <Route path="/terms-of-service" element={<Suspense fallback={<PageLoader />}><TermsOfService /></Suspense>} />
                    <Route path="/refund-policy" element={<Suspense fallback={<PageLoader />}><RefundPolicy /></Suspense>} />
                    <Route path="/order/new" element={<Suspense fallback={<PageLoader />}>{user ? <NewOrder user={user} /> : <Navigate to="/auth" />}</Suspense>} />
                    <Route path="/marketplace/buy/:id" element={<Suspense fallback={<PageLoader />}>{user ? <ProjectCheckout user={user} /> : <Navigate to="/auth" />}</Suspense>} />
                    <Route path="/dashboard/order/:id" element={<Suspense fallback={<PageLoader />}>{user ? <OrderDetails user={user} /> : <Navigate to="/auth" />}</Suspense>} />
                    <Route path="/admin/*" element={<Suspense fallback={<PageLoader />}>{user && (user.role === 'admin' || user.role === 'developer' || user.role === 'super_admin') ? <Admin user={user} /> : <Navigate to="/" />}</Suspense>} />
                </Routes>
            </Layout>
          </HashRouter>
        </ToastProvider>
      )}
    </>
  );
};

export default App;
