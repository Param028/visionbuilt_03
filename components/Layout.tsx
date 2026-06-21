
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Instagram, Mail, ChevronRight, User as UserIcon } from 'lucide-react';
import { User } from '../types';
import { api } from '../services/api';
import { Particles } from './ui/ReactBits';
import { INITIAL_CONTACT_INFO } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  setUser: (u: User | null) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, setUser }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // ── Dark mode: permanently enforced ──────────────────────────
  useEffect(() => {
    document.documentElement.className = 'dark';
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  }, []);

  // ── Scroll detection ──────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Close menu on route change ────────────────────────────────
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // ── Close menu on resize ──────────────────────────────────────
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsMenuOpen(false);
    };
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
      { name: 'Home',        path: '/' },
      { name: 'Services',    path: '/services' },
      { name: 'Marketplace', path: '/marketplace' },
      { name: 'Offers',      path: '/offers' },
    ];
    if (user) {
      if (['admin', 'super_admin', 'developer'].includes(user.role)) {
        items.push({ name: 'Admin', path: '/admin' });
      } else {
        items.push({ name: 'Dashboard', path: '/dashboard' });
      }
    } else {
      items.push({ name: 'Login', path: '/auth' });
    }
    return items;
  };

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans relative overflow-x-hidden">

      {/* ── Ambient particle field ── */}
      <Particles
        className="fixed inset-0 z-0 pointer-events-none"
        quantity={window.innerWidth < 768 ? 12 : 25}
        staticity={90}
        ease={100}
        vx={0.015}
        vy={0.015}
        color="#7c8fa1"
        refresh
      />

      {/* ── NAVBAR ── */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrolled
            ? 'glass-nav shadow-xl shadow-black/20'
            : 'bg-transparent border-b border-transparent'
        }`}
        aria-label="Primary navigation"
      >
        <div className="container-vb h-20 md:h-24 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center group z-20" aria-label="Vision Built home">
            <img src="/logo.png" alt="Vision Built Logo" className="h-16 md:h-20 object-contain" />
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-7">
            {getNavItems().map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`relative text-xs font-satoshi font-medium tracking-widest uppercase transition-colors duration-300 group ${
                  isActive(item.path)
                    ? 'text-foreground'
                    : 'text-foreground/45 hover:text-foreground'
                }`}
              >
                {item.name}
                <span
                  className={`absolute -bottom-0.5 left-0 h-px bg-foreground transition-all duration-300 ${
                    isActive(item.path) ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link to="/profile" title="My Profile">
                  <button className="w-8 h-8 flex items-center justify-center border border-black/10 text-foreground/40 hover:text-foreground hover:border-black/20 transition-all duration-300">
                    <UserIcon size={13} />
                  </button>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Log out"
                  className="w-8 h-8 flex items-center justify-center border border-black/10 text-foreground/40 hover:text-red-400 hover:border-red-500/30 transition-all duration-300"
                >
                  <LogOut size={13} />
                </button>
              </>
            ) : (
              <Link to="/auth?mode=signup">
                <button className="btn-primary !py-2 !px-5 !text-xs">
                  Get Started
                </button>
              </Link>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-foreground/60 hover:text-foreground transition-colors z-20"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* ── Mobile Menu Drawer ── */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-400 ease-in-out ${
            isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="glass-nav border-t vb-divider px-6 py-6 space-y-1">
            {getNavItems().map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-3.5 text-sm font-satoshi font-medium tracking-wide uppercase transition-all duration-200 ${
                  isActive(item.path)
                    ? 'text-foreground bg-white/5 rounded-md'
                    : 'text-foreground/50 hover:text-foreground'
                }`}
              >
                <span>{item.name}</span>
                <ChevronRight size={13} className="text-foreground/20" />
              </Link>
            ))}

            <div className="pt-4 mt-4 border-t vb-divider">
              {user ? (
                <div className="flex gap-2">
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex-1"
                  >
                    <button className="w-full btn-ghost !py-3 text-center justify-center !text-xs">
                      Profile
                    </button>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex-1 px-4 py-3 border border-black/10 text-red-400/80 text-xs font-satoshi tracking-widest uppercase hover:bg-red-500/5 transition-all"
                  >
                    Log Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/auth?mode=login"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <button className="w-full btn-ghost !py-3 text-center justify-center !text-xs">
                      Log In
                    </button>
                  </Link>
                  <Link
                    to="/auth?mode=signup"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <button className="w-full btn-primary !py-3 text-center justify-center !text-xs">
                      Sign Up
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-grow pt-20 md:pt-24 relative z-10 flex flex-col min-h-[calc(100vh-80px)] md:min-h-[calc(100vh-96px)]">
        {children}
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t vb-divider bg-background relative z-10">
        <div className="container-vb py-16 md:py-20">

          {/* Top grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 md:gap-8 mb-16">

            {/* Brand column */}
            <div className="col-span-2 space-y-6">
              <div className="flex items-center">
                <Link to="/" className="flex items-center">
                  <img src="/logo.png" alt="Vision Built Logo" className="h-6 object-contain" />
                </Link>
              </div>
              <p className="text-foreground/35 text-sm leading-relaxed max-w-xs font-light">
                Precision digital engineering for modern enterprises. We build immersive digital experiences that endure.
              </p>
              <div className="flex items-center gap-5">
                <a
                  href={`https://instagram.com/${INITIAL_CONTACT_INFO.instagram}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-foreground/25 hover:text-foreground transition-colors duration-300"
                  aria-label="Instagram"
                >
                  <Instagram size={17} />
                </a>
                <a
                  href={`mailto:${INITIAL_CONTACT_INFO.email}`}
                  className="text-foreground/25 hover:text-foreground transition-colors duration-300"
                  aria-label="Email us"
                >
                  <Mail size={17} />
                </a>
              </div>
            </div>

            {/* Platform column */}
            <div className="space-y-5">
              <h4 className="text-label" style={{ color: 'var(--vb-muted)' }}>Platform</h4>
              <ul className="space-y-3.5">
                {[
                  { name: 'Services',    path: '/services' },
                  { name: 'Marketplace', path: '/marketplace' },
                  { name: 'Offers',      path: '/offers' },
                ].map(link => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-foreground/40 hover:text-foreground text-sm transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support column */}
            <div className="space-y-5">
              <h4 className="text-label" style={{ color: 'var(--vb-muted)' }}>Support</h4>
              <ul className="space-y-3.5">
                <li>
                  <Link
                    to="/refund-policy"
                    className="text-foreground/40 hover:text-foreground text-sm transition-colors duration-200"
                  >
                    Refund Policy
                  </Link>
                </li>
                <li>
                  <a
                    href={`mailto:${INITIAL_CONTACT_INFO.email}`}
                    className="text-foreground/40 hover:text-foreground text-sm transition-colors duration-200"
                  >
                    Email Support
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal column */}
            <div className="space-y-5">
              <h4 className="text-label" style={{ color: 'var(--vb-muted)' }}>Legal</h4>
              <ul className="space-y-3.5">
                {[
                  { name: 'Privacy Policy',   path: '/privacy-policy' },
                  { name: 'Terms of Service', path: '/terms-of-service' },
                ].map(link => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-foreground/40 hover:text-foreground text-sm transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t vb-divider flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-foreground/20 text-xs font-light">
              © {new Date().getFullYear()} Vision Built. All rights reserved.
            </p>
            <p className="text-foreground/15 text-xs font-satoshi tracking-[0.25em] uppercase">
              Precision Digital Craft
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Layout;
