
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User as UserIcon, Shield, LayoutDashboard, Tag, Instagram, Mail, ChevronRight } from 'lucide-react';
import { User, Offer } from '../types';
import { api } from '../services/api';
import { PillNav, ScrollFloat, Particles } from './ui/ReactBits';
import { Button } from './ui/Components';
import { Logo } from './ui/Logo';
import { INITIAL_CONTACT_INFO } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  setUser: (u: User | null) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, setUser }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [particleCount, setParticleCount] = useState(60); // Default low for safety
  const location = useLocation();
  const navigate = useNavigate();

  // Optimization: Reduce particles on mobile to prevent lag
  useEffect(() => {
    const handleResize = () => {
      // < 768px (Mobile) = 40 particles
      // > 768px (Desktop) = 150 particles
      setParticleCount(window.innerWidth < 768 ? 40 : 150);
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };

    // Set initial
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
    navigate('/');
  };

  const getNavItems = () => {
    const items = [
      { name: 'Home', path: '/' },
      { name: 'Services', path: '/services' },
      { name: 'Marketplace', path: '/marketplace' },
      { name: 'Offers', path: '/offers' },
    ];

    if (user) {
      if (['admin', 'super_admin', 'developer'].includes(user.role)) {
        items.push({ name: 'Admin', path: '/admin' });
      } else {
        items.push({ name: 'Dashboard', path: '/dashboard' });
      }
    } else {
      items.push({ name: 'Client Login', path: '/auth' });
    }
    return items;
  };

  return (
    <div className="min-h-screen flex flex-col bg-vision-900 text-gray-100 font-sans selection:bg-vision-primary selection:text-white overflow-x-hidden relative">
      {/* Global Particles Background - Optimized Quantity */}
      <Particles className="absolute inset-0 z-0 pointer-events-none" quantity={particleCount} ease={80} vx={0.06} vy={0.06} refresh />

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-vision-900/80 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group relative z-20">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-vision-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <Logo className="w-8 h-8 md:w-10 md:h-10 relative z-10 drop-shadow-[0_0_5px_rgba(6,182,212,0.5)] transition-all duration-500 ease-out group-hover:scale-110 group-hover:rotate-12 group-hover:drop-shadow-[0_0_20px_rgba(6,182,212,0.8)]" />
              </div>
              <span className="font-display font-bold text-lg md:text-xl tracking-tight text-white group-hover:text-vision-primary transition-colors whitespace-nowrap">
                VISION BUILT
              </span>
            </Link>

            {/* Desktop Links (PillNav) */}
            <div className="hidden md:flex items-center gap-6">
              <PillNav items={getNavItems()} />
              
              {/* Offers Button (Highlighted) */}
               <Link 
                  to="/offers" 
                  className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-vision-primary/20 to-vision-secondary/20 border border-vision-primary/30 text-vision-primary hover:text-white hover:border-vision-primary rounded-full font-medium transition-all shadow-[0_0_10px_rgba(6,182,212,0.1)] hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] text-sm"
               >
                  <Tag size={14} />
                  <span>Offers</span>
               </Link>

              {user && (
                  <div className="flex items-center gap-4 pl-4 border-l border-white/10">
                    <span className="text-xs text-gray-400 font-mono hidden lg:block truncate max-w-[150px]">{user.email}</span>
                    <Button onClick={handleLogout} variant="ghost" size="icon" className="rounded-full text-gray-400 hover:text-red-400">
                      <LogOut size={18} />
                    </Button>
                  </div>
              )}
              {!user && (
                 <Link to="/auth?mode=signup" className="ml-2">
                    <Button variant="primary" size="sm" className="bg-vision-primary text-vision-900 hover:bg-cyan-400 font-bold">
                        Get Started
                    </Button>
                 </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center z-20">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                className="p-2 -mr-2 text-gray-300 hover:text-white transition-colors focus:outline-none"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <div 
          className={`md:hidden absolute top-16 left-0 w-full bg-vision-900/95 backdrop-blur-2xl border-b border-white/10 shadow-2xl transition-all duration-300 ease-in-out origin-top overflow-hidden ${isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}
        >
            <div className="px-4 py-6 space-y-2">
              {getNavItems().map(item => (
                <Link 
                  key={item.name}
                  to={item.path} 
                  className={`flex items-center justify-between px-4 py-3 rounded-lg text-base font-medium transition-all ${location.pathname === item.path ? 'bg-white/10 text-white border border-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>{item.name}</span>
                  {location.pathname === item.path && <ChevronRight size={16} className="text-vision-primary" />}
                </Link>
              ))}
              
              <div className="pt-4 mt-4 border-t border-white/10 space-y-3">
                 {user ? (
                   <>
                     <div className="px-4 text-xs text-gray-500 font-mono break-all">
                       Signed in as <br/> <span className="text-gray-300">{user.email}</span>
                     </div>
                     <button 
                        onClick={() => { handleLogout(); setIsMenuOpen(false); }} 
                        className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-base font-medium text-red-400 hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/20"
                     >
                        <span>Log Out</span>
                        <LogOut size={16} />
                     </button>
                   </>
                 ) : (
                   <div className="grid grid-cols-2 gap-3 px-1">
                      <Link to="/auth?mode=login" onClick={() => setIsMenuOpen(false)}>
                          <Button variant="ghost" className="w-full justify-center">Log In</Button>
                      </Link>
                      <Link to="/auth?mode=signup" onClick={() => setIsMenuOpen(false)}>
                          <Button variant="primary" className="w-full justify-center">Get Started</Button>
                      </Link>
                   </div>
                 )}
              </div>
            </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow pt-16 relative z-10 flex flex-col">
        <div className="relative flex-grow flex flex-col">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-vision-900/50 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <div className="col-span-1 sm:col-span-2 md:col-span-1">
               <div className="flex items-center space-x-2 mb-4">
                  <Logo className="w-8 h-8 opacity-90 grayscale hover:grayscale-0 transition-all duration-300" />
                  <span className="font-display font-bold text-lg text-white">VISION BUILT</span>
               </div>
               <div className="text-gray-400 text-sm mb-6 leading-relaxed">
                 <ScrollFloat animationDuration={0.4} stagger={0.01}>
                    Building the digital future with precision, aesthetics, and advanced technology.
                 </ScrollFloat>
               </div>
               <div className="flex space-x-4">
                    <a href={`https://instagram.com/${INITIAL_CONTACT_INFO.instagram}`} target="_blank" rel="noreferrer" className="p-2 rounded-full bg-white/5 text-gray-400 hover:text-pink-500 hover:bg-white/10 transition-all">
                        <Instagram size={20} />
                    </a>
                    <a href={`mailto:${INITIAL_CONTACT_INFO.email}`} className="p-2 rounded-full bg-white/5 text-gray-400 hover:text-vision-primary hover:bg-white/10 transition-all">
                        <Mail size={20} />
                    </a>
               </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest">Platform</h3>
              <ul className="space-y-3">
                <li><Link to="/services" className="text-gray-400 hover:text-vision-primary transition-colors text-sm block py-1">Services</Link></li>
                <li><Link to="/marketplace" className="text-gray-400 hover:text-vision-primary transition-colors text-sm block py-1">Marketplace</Link></li>
                <li><Link to="/auth" className="text-gray-400 hover:text-vision-primary transition-colors text-sm block py-1">Client Portal</Link></li>
                <li><Link to="/offers" className="text-gray-400 hover:text-vision-primary transition-colors text-sm block py-1">Special Offers</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
               <h3 className="text-xs font-bold text-white uppercase tracking-widest">Support</h3>
               <ul className="space-y-3">
                 <li><Link to="/refund-policy" className="text-gray-400 hover:text-vision-primary transition-colors text-sm block py-1">Refund Policy</Link></li>
                 <li><a href={`mailto:${INITIAL_CONTACT_INFO.email}`} className="text-gray-400 hover:text-vision-primary transition-colors text-sm block py-1">Contact Support</a></li>
               </ul>
            </div>

            <div className="space-y-4">
               <h3 className="text-xs font-bold text-white uppercase tracking-widest">Legal</h3>
               <ul className="space-y-3">
                 <li><Link to="/privacy-policy" className="text-gray-400 hover:text-vision-primary transition-colors text-sm block py-1">Privacy Policy</Link></li>
                 <li><Link to="/terms-of-service" className="text-gray-400 hover:text-vision-primary transition-colors text-sm block py-1">Terms of Service</Link></li>
               </ul>
            </div>
          </div>
          
          <div className="mt-12 border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
            <p className="text-center md:text-left">&copy; {new Date().getFullYear()} Vision Built. All rights reserved.</p>
            <div className="flex flex-col sm:flex-row gap-4 items-center font-mono bg-black/20 px-4 py-2 rounded-full border border-white/5">
                <span className="flex items-center gap-2"><Mail size={12}/> {INITIAL_CONTACT_INFO.email}</span>
                <span className="hidden sm:inline text-gray-700">|</span>
                <span className="flex items-center gap-2"><Instagram size={12}/> @{INITIAL_CONTACT_INFO.instagram}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
