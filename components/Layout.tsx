
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Instagram, Mail, ChevronRight, User as UserIcon, Sun, Moon } from 'lucide-react';
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

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
  });

  useEffect(() => {
    document.documentElement.className = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

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
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground relative overflow-x-hidden">
      {/* Optimized Particles: Staticity increased to reduce movement noise, lower quantity */}
      <Particles 
        className="fixed inset-0 z-0 pointer-events-none" 
        quantity={particleCount} 
        staticity={80} // Increased staticity = less mouse interaction = higher perf
        ease={80} 
        vx={0.05} // Slower movement
        vy={0.05} 
        color={theme === 'dark' ? '#ffffff' : '#000000'}
        refresh 
      />

      <nav className="fixed top-0 w-full z-50 bg-background/70 backdrop-blur-xl border-b border-divider h-16 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full">
            <Link to="/" className="flex items-center gap-3 group relative z-20">
              <Logo className="w-8 h-8 md:w-9 md:h-9 relative z-10" />
              <span className="font-display font-bold text-lg md:text-xl tracking-tight text-foreground transition-colors whitespace-nowrap">
                VISION BUILT
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <PillNav items={getNavItems()} />

              {/* Theme Switcher Toggle */}
              <Button onClick={toggleTheme} variant="ghost" size="icon" className="rounded-full text-foreground/75 hover:text-foreground" title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}>
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </Button>
               
              {user && (
                  <div className="flex items-center gap-2 pl-4 border-l border-divider">
                    <Link to="/profile">
                        <Button variant="ghost" size="icon" className="rounded-full text-foreground/60 hover:text-foreground" title="My Profile">
                            <UserIcon size={18} />
                        </Button>
                    </Link>
                    <Button onClick={handleLogout} variant="ghost" size="icon" className="rounded-full text-foreground/60 hover:text-red-500" title="Logout">
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
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-foreground/85">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
 
        <div className={`md:hidden fixed top-16 left-0 w-full bg-background/95 backdrop-blur-xl border-b border-divider transition-all duration-300 overflow-hidden ${isMenuOpen ? 'max-h-[90vh] opacity-100 py-6' : 'max-h-0 opacity-0 py-0'}`}>
            <div className="px-4 space-y-2">
              {getNavItems().map(item => (
                <Link key={item.name} to={item.path} className={`flex items-center justify-between px-4 py-4 rounded-lg text-base font-medium ${location.pathname === item.path ? 'bg-content1 text-foreground border border-divider' : 'text-foreground/70'}`} onClick={() => setIsMenuOpen(false)}>
                  <span>{item.name}</span>
                  <ChevronRight size={16} />
                </Link>
              ))}
              <div className="pt-4 mt-4 border-t border-divider space-y-2">
                 {user ? (
                   <>
                       <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="w-full flex items-center justify-between px-4 py-4 rounded-lg text-foreground/75 hover:bg-content1">
                          <span>My Profile</span>
                          <UserIcon size={16} />
                       </Link>
                       <button onClick={handleLogout} className="w-full flex items-center justify-between px-4 py-4 rounded-lg text-red-500 hover:bg-content1">
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
                 {/* Mobile Theme Toggle */}
                 <div className="flex justify-between items-center px-4 py-4 border-t border-divider mt-2">
                   <span className="text-sm font-medium text-foreground/75">Theme</span>
                   <button onClick={toggleTheme} className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary text-foreground border border-divider">
                     {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                   </button>
                 </div>
              </div>
            </div>
        </div>
      </nav>

      <main className="flex-grow pt-16 relative z-10 flex flex-col min-h-[calc(100vh-64px)]">
          {children}
      </main>

      <footer className="border-t border-divider bg-content1 relative z-10">
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-1">
               <div className="flex items-center space-x-2 mb-4">
                  <Logo className="w-7 h-7" />
                  <span className="font-display font-bold text-lg text-foreground">VISION BUILT</span>
               </div>
               <p className="text-foreground/70 text-sm mb-6 leading-relaxed">Precision digital engineering for modern enterprises.</p>
               <div className="flex space-x-4">
                    <a href={`https://instagram.com/${INITIAL_CONTACT_INFO.instagram}`} target="_blank" rel="noreferrer" className="text-foreground/60 hover:text-foreground transition-colors"><Instagram size={20} /></a>
                    <a href={`mailto:${INITIAL_CONTACT_INFO.email}`} className="text-foreground/60 hover:text-foreground transition-colors"><Mail size={20} /></a>
               </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">Platform</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/services" className="text-foreground/60 hover:text-foreground">Services</Link></li>
                <li><Link to="/marketplace" className="text-foreground/60 hover:text-foreground">Marketplace</Link></li>
                <li><Link to="/offers" className="text-foreground/60 hover:text-foreground">Offers</Link></li>
              </ul>
            </div>
            <div className="space-y-3">
               <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">Support</h3>
               <ul className="space-y-2 text-sm">
                 <li><Link to="/refund-policy" className="text-foreground/60 hover:text-foreground">Refund Policy</Link></li>
                 <li><a href={`mailto:${INITIAL_CONTACT_INFO.email}`} className="text-foreground/60 hover:text-foreground">Email Support</a></li>
               </ul>
            </div>
            <div className="space-y-3">
               <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">Legal</h3>
               <ul className="space-y-2 text-sm">
                 <li><Link to="/privacy-policy" className="text-foreground/60 hover:text-foreground">Privacy Policy</Link></li>
                 <li><Link to="/terms-of-service" className="text-foreground/60 hover:text-foreground">Terms of Service</Link></li>
               </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-divider pt-8 text-xs text-foreground/50 text-center md:text-left">
            <p>&copy; {new Date().getFullYear()} Vision Built. Precision Digital Craft.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
