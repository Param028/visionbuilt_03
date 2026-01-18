
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

// --- Lazy Load Pages ---
const Landing = React.lazy(() => import('./pages/Landing'));
const Services = React.lazy(() => import('./pages/Services'));
const Auth = React.lazy(() => import('./pages/Auth'));
const DevLogin = React.lazy(() => import('./pages/DevLogin'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
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
    console.log('App useEffect running');
    console.log('isConfigured:', isConfigured);
    
    if (!isConfigured) {
        console.log('Not configured, showing setup screen');
        setLoading(false);
        setShowSplash(false);
        return;
    }

    const initSession = async () => {
      try {
        console.log('Initializing session...');
        const currentUser = await api.getCurrentUser();
        console.log('Current user:', currentUser);
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
        console.log('Setting loading to false');
        setLoading(false);
      }
    };

    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log('Timeout reached, forcing loading to false');
      setLoading(false);
    }, 10000); // 10 second timeout

    // 1. Initial Fetch
    initSession();

    // 2. Listen for Auth Changes (Sign in, Sign out, Token Refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            // Re-fetch user to ensure we have the latest profile data
            const currentUser = await api.getCurrentUser();
            setUser(currentUser);
        } else if (event === 'SIGNED_OUT') {
            setUser(null);
        }
    });

    return () => {
        clearTimeout(timeoutId);
        subscription.unsubscribe();
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
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/protocol/access" element={<DevLogin setUser={setUser} />} />
                <Route path="*" element={
                  <Layout user={user} setUser={setUser}>
                    <Suspense fallback={<PageLoader />}>
                      <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route path="/services" element={<Services />} />
                        <Route path="/marketplace" element={<Marketplace />} />
                        <Route path="/offers" element={<Offers />} />
                        <Route path="/auth" element={!user ? <Auth setUser={setUser} /> : <Navigate to={user.role === 'admin' || user.role === 'super_admin' ? '/admin' : '/dashboard'} />} />
                        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                        <Route path="/terms-of-service" element={<TermsOfService />} />
                        <Route path="/refund-policy" element={<RefundPolicy />} />
                        <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/auth" />} />
                        <Route path="/order/new" element={user ? <NewOrder user={user} /> : <Navigate to="/auth" />} />
                        <Route path="/marketplace/buy/:id" element={user ? <ProjectCheckout user={user} /> : <Navigate to="/auth" />} />
                        <Route path="/dashboard/order/:id" element={user ? <OrderDetails user={user} /> : <Navigate to="/auth" />} />
                        <Route path="/admin/*" element={user && (user.role === 'admin' || user.role === 'developer' || user.role === 'super_admin') ? <Admin user={user} /> : <Navigate to="/" />} />
                      </Routes>
                    </Suspense>
                  </Layout>
                } />
              </Routes>
            </Suspense>
          </HashRouter>
        </ToastProvider>
      )}
    </>
  );
};

export default App;
