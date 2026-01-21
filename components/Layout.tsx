
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Instagram, Mail, ChevronRight, User as UserIcon } from 'lucide-react';
import { User } from '../types';
import { api } from '../services/api';
import { PillNav, Particles } from './ui/ReactBits';
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
  const [particleCount, setParticleCount] = useState(30);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      // Significantly reduced particle count for performance
      setParticleCount(window.innerWidth < 768 ? 15 : 40);
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };
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
    <div className="min-h-screen flex flex-col bg-vision-900 text-gray-100 font-sans selection:bg-vision-primary selection:text-white relative overflow-x-hidden">
      {/* Optimized Particles: Staticity increased to reduce movement noise, lower quantity */}
      <Particles 
        className="fixed inset-0 z-0 pointer-events-none" 
        quantity={particleCount} 
        staticity={80} // Increased staticity = less mouse interaction = higher perf
        ease={80} 
        vx={0.05} // Slower movement
        vy={0.05} 
        refresh 
      />

      <nav className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-xl border-b border-white/10 h-16 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full">
            <Link to="/" className="flex items-center gap-3 group relative z-20">
              <Logo className="w-8 h-8 md:w-9 md:h-9 relative z-10 drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]" />
              <span className="font-display font-bold text-lg md:text-xl tracking-tight text-white group-hover:text-vision-primary transition-colors whitespace-nowrap">
                VISION BUILT
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <PillNav items={getNavItems()} />
               
              {user && (
                  <div className="flex items-center gap-2 pl-4 border-l border-white/10">
                    <Link to="/profile">
                        <Button variant="ghost" size="icon" className="rounded-full text-gray-400 hover:text-white" title="My Profile">
                            <UserIcon size={18} />
                        </Button>
                    </Link>
                    <Button onClick={handleLogout} variant="ghost" size="icon" className="rounded-full text-gray-400 hover:text-red-400" title="Logout">
                      <LogOut size={18} />
                    </Button>
                  </div>
              )}
              {!user && (
                 <Link to="/auth?mode=signup" className="ml-2">
                    <Button variant="primary" size="sm">Get Started</Button>
                 </Link>
              )}
            </div>

            <div className="md:hidden flex items-center z-20">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-gray-300">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        <div className={`md:hidden fixed top-16 left-0 w-full bg-vision-900/95 backdrop-blur-xl border-b border-white/10 transition-all duration-300 overflow-hidden ${isMenuOpen ? 'max-h-[80vh] opacity-100 py-6' : 'max-h-0 opacity-0 py-0'}`}>
            <div className="px-4 space-y-2">
              {getNavItems().map(item => (
                <Link key={item.name} to={item.path} className={`flex items-center justify-between px-4 py-4 rounded-lg text-base font-medium ${location.pathname === item.path ? 'bg-white/10 text-white' : 'text-gray-400'}`} onClick={() => setIsMenuOpen(false)}>
                  <span>{item.name}</span>
                  <ChevronRight size={16} />
                </Link>
              ))}
              <div className="pt-4 mt-4 border-t border-white/10 space-y-2">
                 {user ? (
                   <>
                       <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="w-full flex items-center justify-between px-4 py-4 rounded-lg text-gray-300 hover:bg-white/5">
                          <span>My Profile</span>
                          <UserIcon size={16} />
                       </Link>
                       <button onClick={handleLogout} className="w-full flex items-center justify-between px-4 py-4 rounded-lg text-red-400 hover:bg-white/5">
                          <span>Log Out</span>
                          <LogOut size={16} />
                       </button>
                   </>
                 ) : (
                   <div className="grid grid-cols-2 gap-3 px-1">
                      <Link to="/auth?mode=login" onClick={() => setIsMenuOpen(false)} className="w-full"><Button variant="ghost" className="w-full">Log In</Button></Link>
                      <Link to="/auth?mode=signup" onClick={() => setIsMenuOpen(false)} className="w-full"><Button variant="primary" className="w-full">Sign Up</Button></Link>
                   </div>
                 )}
              </div>
            </div>
        </div>
      </nav>

      <main className="flex-grow pt-16 relative z-10 flex flex-col min-h-[calc(100vh-64px)]">
          {children}
      </main>

      <footer className="border-t border-white/5 bg-vision-900 relative z-10">
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-1">
               <div className="flex items-center space-x-2 mb-4">
                  <Logo className="w-7 h-7" />
                  <span className="font-display font-bold text-lg text-white">VISION BUILT</span>
               </div>
               <p className="text-gray-400 text-sm mb-6 leading-relaxed">Precision digital engineering for modern enterprises.</p>
               <div className="flex space-x-4">
                    <a href={`https://instagram.com/${INITIAL_CONTACT_INFO.instagram}`} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-pink-500 transition-colors"><Instagram size={20} /></a>
                    <a href={`mailto:${INITIAL_CONTACT_INFO.email}`} className="text-gray-400 hover:text-vision-primary transition-colors"><Mail size={20} /></a>
               </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest">Platform</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/services" className="text-gray-400 hover:text-vision-primary">Services</Link></li>
                <li><Link to="/marketplace" className="text-gray-400 hover:text-vision-primary">Marketplace</Link></li>
                <li><Link to="/offers" className="text-gray-400 hover:text-vision-primary">Offers</Link></li>
              </ul>
            </div>
            <div className="space-y-3">
               <h3 className="text-xs font-bold text-white uppercase tracking-widest">Support</h3>
               <ul className="space-y-2 text-sm">
                 <li><Link to="/refund-policy" className="text-gray-400 hover:text-vision-primary">Refund Policy</Link></li>
                 <li><a href={`mailto:${INITIAL_CONTACT_INFO.email}`} className="text-gray-400 hover:text-vision-primary">Email Support</a></li>
               </ul>
            </div>
            <div className="space-y-3">
               <h3 className="text-xs font-bold text-white uppercase tracking-widest">Legal</h3>
               <ul className="space-y-2 text-sm">
                 <li><Link to="/privacy-policy" className="text-gray-400 hover:text-vision-primary">Privacy Policy</Link></li>
                 <li><Link to="/terms-of-service" className="text-gray-400 hover:text-vision-primary">Terms of Service</Link></li>
               </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-white/5 pt-8 text-xs text-gray-500 text-center md:text-left">
            <p>&copy; {new Date().getFullYear()} Vision Built. Precision Digital Craft.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
