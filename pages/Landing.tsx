
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Code2, Layers, Palette, TrendingUp,
  Zap, Globe, CheckCircle, ArrowLeft,
} from 'lucide-react';
import { CountUp, LogoLoop, ProjectLoop } from '../components/ui/ReactBits';
import SoftAurora from '../components/ui/SoftAurora';
import { api } from '../services/api';
import { MarketplaceItem, User } from '../types';
import { formatPrice } from '../constants';
import BentoGrid from '../components/ui/BentoGrid';
import { servicesData } from '../constants/services';

// ── Inview fade-up wrapper ─────────────────────────────────────
const FadeUp: React.FC<{
  children: React.ReactNode;
  delay?: number;
  className?: string;
}> = ({ children, delay = 0, className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-8%' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.4, 0, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ── Tech logos ─────────────────────────────────────────────────
const techLogos = [
  { id: 'react',  name: 'React',       logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg',        url: 'https://react.dev' },
  { id: 'ts',     name: 'TypeScript',  logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg', url: 'https://www.typescriptlang.org' },
  { id: 'next',   name: 'Next.js',     logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg',       url: 'https://nextjs.org' },
  { id: 'tw',     name: 'Tailwind',    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg', url: 'https://tailwindcss.com' },
  { id: 'node',   name: 'Node.js',     logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg',       url: 'https://nodejs.org' },
  { id: 'py',     name: 'Python',      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg',      url: 'https://www.python.org' },
  { id: 'docker', name: 'Docker',      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg',      url: 'https://www.docker.com' },
  { id: 'aws',    name: 'AWS',         logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-original-wordmark.svg', url: 'https://aws.amazon.com' },
  { id: 'mongo',  name: 'MongoDB',     logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original.svg',    url: 'https://www.mongodb.com' },
  { id: 'git',    name: 'Git',         logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg',            url: 'https://git-scm.com' },
];

// ── Services data ──────────────────────────────────────────────
const SERVICES = [
  {
    icon: <Code2 size={26} />,
    title: 'Website Development',
    desc: 'Scalable, performant web applications built with precision engineering, modern architectures, and pixel-perfect delivery.',
    featured: true,
  },
  {
    icon: <Layers size={22} />,
    title: 'UI/UX Design',
    desc: 'Interfaces that feel premium, convert effectively, and leave a lasting impression.',
    featured: false,
  },
  {
    icon: <Palette size={22} />,
    title: 'Branding',
    desc: 'Identity systems designed to endure market cycles and define categories.',
    featured: false,
  },
  {
    icon: <TrendingUp size={22} />,
    title: 'Social Media Marketing',
    desc: 'Strategic growth and content at the scale modern brands demand.',
    featured: false,
  },
  {
    icon: <Zap size={22} />,
    title: 'Performance Optimization',
    desc: 'Lighthouse 100. Core Web Vitals mastery. Every time.',
    featured: false,
  },
  {
    icon: <Globe size={22} />,
    title: 'SEO',
    desc: 'Organic visibility that compounds and drives qualified growth.',
    featured: false,
  },
];

// ── Process steps ──────────────────────────────────────────────
const PROCESS = [
  { num: '01', title: 'Discover',  desc: 'Deep dive into your vision, audience, and competitive landscape.' },
  { num: '02', title: 'Strategy',  desc: 'Roadmap, architecture, and success metrics defined.' },
  { num: '03', title: 'Design',    desc: 'Precision crafting of every visual element.' },
  { num: '04', title: 'Develop',   desc: 'Engineering with clean code and modern best practices.' },
  { num: '05', title: 'Launch',    desc: 'Careful deployment with zero-downtime confidence.' },
  { num: '06', title: 'Scale',     desc: 'Ongoing optimization and growth post-launch.' },
];

// ── Social Media handling showreel items ───────────────────────
const SOCIAL_MEDIA_SHOWCASE = [
  {
    type: 'video',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-laser-lights-background-loop-41761-large.mp4',
    title: 'Cinematic Motion Graphics Reel',
    stats: 'Reach: +312% · Engagement: 14.8%',
    campaign: 'Driftwood Rebranding Campaign'
  },
  {
    type: 'image',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
    title: 'Hadid-Inspired Architecture Teaser',
    stats: 'CTR: 8.4% · Impressions: 2.1M',
    campaign: 'Aether Launch Poster'
  },
  {
    type: 'video',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-rotating-grid-of-purple-squares-33230-large.mp4',
    title: '3D Product Commercial Loop',
    stats: 'Conversions: +185% · Saves: 42K',
    campaign: 'Cyberware Accessories Drop'
  },
  {
    type: 'image',
    url: 'https://images.unsplash.com/photo-1604871000636-074fa5117945?w=800',
    title: 'Fluid Neon Concept Graphic',
    stats: 'Shares: 12.4K · Engagement: 11.2%',
    campaign: 'Exo Concert Poster'
  },
  {
    type: 'video',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-spheres-and-lines-33223-large.mp4',
    title: 'Network Topologies Promo Video',
    stats: 'Reach: 1.2M · Impressions: 5.6M',
    campaign: 'Loom Keynote Teaser'
  },
  {
    type: 'image',
    url: 'https://images.unsplash.com/photo-1618005198143-d5660b593293?w=800',
    title: 'Minimalist Monolithic Identity',
    stats: 'Likes: 84K · Reach: +410%',
    campaign: 'Vector Rebranding Showcase'
  }
];

// ── Hero showcase items ───────────────────────────────────────
const HERO_PREVIEWS = [
  {
    type: 'video',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-laser-lights-background-loop-41761-large.mp4',
    title: 'Driftwood Rebranding Site',
    category: 'Motion Graphics / WebGL'
  },
  {
    type: 'image',
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
    title: 'Hadid Construct Platform',
    category: 'SaaS / Enterprise'
  },
  {
    type: 'video',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-rotating-grid-of-purple-squares-33230-large.mp4',
    title: 'Cyberware Web3 Dashboard',
    category: 'DeFi / Web3'
  },
  {
    type: 'image',
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    title: 'Aether Nexus Portfolio',
    category: 'Creative / Showcase'
  }
];

// ── COMPONENT ─────────────────────────────────────────────────
const Landing: React.FC<{ user: User | null }> = ({ user }) => {
  const [stats, setStats] = useState<{ totalDelivered: number; averageRating: number }>({
    totalDelivered: 0,
    averageRating: 0,
  });
  const [projects, setProjects]         = useState<MarketplaceItem[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [siteSettings, setSiteSettings]   = useState<any>(null);
  const [activeTab, setActiveTab]         = useState('Websites');
  const [activePreviewIdx, setActivePreviewIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActivePreviewIdx((prev) => (prev + 1) % HERO_PREVIEWS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused]);

  useEffect(() => {
    api.getSiteSettings().then(setSiteSettings);
    api.getPlatformStats().then(setStats);
    api.getMarketplaceItems().then(setProjects);
    api.getRecurringServices().then((subs) =>
      setSubscriptions(subs.filter((s: any) => s.is_active && s.show_on_home))
    );
  }, []);

  const getFilteredProjects = () => {
    let filtered = projects.filter((p) => p.category === activeTab);
    if (filtered.length === 0) filtered = projects;
    return filtered.map((p) => ({
      id:    p.id,
      image: p.image_url!,
      title: p.title,
      url:   `/marketplace/buy/${p.id}`,
    }));
  };

  // ── Derive heading from siteSettings or use default
  const heroHeadingLines = (() => {
    if (siteSettings?.hero_title) {
      const words = siteSettings.hero_title.split(' ');
      const last  = words.pop();
      return { main: words.join(' '), accent: last };
    }
    return { main: 'We Build Digital', accent: 'Futures.' };
  })();

  return (
    <div className="relative min-h-screen bg-background">

      {/* ═══════════════════════════════════════════════
          HERO — fullscreen cinematic
      ═══════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
  <SoftAurora className="absolute inset-0 -z-10" />

        {/* Atmospheric background */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {/* Primary glow — top right */}
          <div
            className="absolute top-[20%] right-[15%] w-[640px] h-[640px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(124,143,161,0.07) 0%, transparent 65%)',
              filter: 'blur(40px)',
            }}
          />
          {/* Secondary glow — bottom left */}
          <div
            className="absolute bottom-[20%] left-[10%] w-[400px] h-[400px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(124,143,161,0.04) 0%, transparent 65%)',
              filter: 'blur(40px)',
            }}
          />
          {/* Subtle architectural grid */}
          <div
            className="absolute inset-0 opacity-[0.018]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(0,0,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,1) 1px, transparent 1px)',
              backgroundSize: '80px 80px',
            }}
          />
        </div>

        {/* Content */}
        <div className="container-vb relative z-10 pt-24 pb-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Text & Actions */}
            <div className="lg:col-span-7 xl:col-span-7 flex flex-col justify-center">
              {/* Eyebrow label */}
              <motion.p
                className="text-label mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
              >
                Digital Agency · Premium Craftsmanship
              </motion.p>

              {/* Main heading — Clash Display, cinematic scale */}
              <motion.h1
                className="text-hero font-display font-bold text-foreground mb-6"
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
              >
                {heroHeadingLines.main}
                <br />
                <span className="text-[#7C8FA1]">
                  {heroHeadingLines.accent}
                </span>
              </motion.h1>

              {/* Subheading */}
              <motion.p
                className="text-[#495057] text-lg md:text-xl max-w-xl mb-10 leading-relaxed font-light"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.25, ease: [0.4, 0, 0.2, 1] }}
              >
                {siteSettings?.hero_subtitle ||
                  'Premium websites, immersive digital experiences, and brand identities for companies that demand excellence.'}
              </motion.p>

              {/* CTAs */}
              <motion.div
                className="flex flex-col sm:flex-row gap-3"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
              >
                <Link to="/services" className="btn-primary group">
                  Start a Project
                  <ArrowRight
                    size={14}
                    className="group-hover:translate-x-1 transition-transform duration-300"
                  />
                </Link>
                <Link to="/marketplace" className="btn-ghost">
                  View Our Work
                </Link>
              </motion.div>
            </div>

            {/* Right Column: Luxury Mock Browser Carousel */}
            <div className="lg:col-span-5 xl:col-span-5 w-full flex flex-col items-center lg:items-end justify-center">
              <motion.div
                className="w-full max-w-[480px] lg:max-w-full aspect-[4/3] glass-card border border-white/12 relative overflow-hidden group shadow-2xl"
                initial={{ opacity: 0, scale: 0.95, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                {/* Browser Top Bar */}
                <div className="h-9 border-b border-white/10 px-4 flex items-center justify-between bg-black/40 backdrop-blur-md relative z-30">
                  {/* Mock Window controls */}
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] opacity-80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] opacity-80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F] opacity-80" />
                  </div>
                  
                  {/* Address/URL bar */}
                  <div className="w-[60%] h-5 bg-white/5 border border-white/8 rounded flex items-center justify-center text-[10px] font-satoshi text-white/50 px-2 select-none overflow-hidden truncate">
                    visionbuilt.in/showcase/{HERO_PREVIEWS[activePreviewIdx].title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
                  </div>
                  
                  {/* Empty spacer for alignment */}
                  <div className="w-[30px]" />
                </div>

                {/* Media Container & Transitions */}
                <div className="absolute inset-0 pt-9 bg-black/20 z-10 flex items-center justify-center overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activePreviewIdx}
                      initial={{ opacity: 0, scale: 1.02 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.5, ease: 'easeInOut' }}
                      className="w-full h-full relative"
                    >
                      {HERO_PREVIEWS[activePreviewIdx].type === 'video' ? (
                        <video
                          src={HERO_PREVIEWS[activePreviewIdx].url}
                          muted
                          loop
                          autoPlay
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={HERO_PREVIEWS[activePreviewIdx].url}
                          alt={HERO_PREVIEWS[activePreviewIdx].title}
                          className="w-full h-full object-cover"
                          loading="eager"
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Gradient Shadow Overlay */}
                <div className="absolute inset-0 pt-9 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none z-20" />

                {/* Floating Project Info Label */}
                <div className="absolute bottom-4 left-4 right-4 z-20">
                  <div className="glass-panel p-3.5 rounded-lg border border-white/12 backdrop-blur-md space-y-1">
                    <span className="text-[9px] font-mono text-[var(--vb-accent)] uppercase tracking-wider block">
                      {HERO_PREVIEWS[activePreviewIdx].category}
                    </span>
                    <h4 className="font-display font-semibold text-white text-sm leading-snug">
                      {HERO_PREVIEWS[activePreviewIdx].title}
                    </h4>
                  </div>
                </div>
              </motion.div>

              {/* Dots indicator controls below card */}
              <div className="flex gap-2.5 mt-5 justify-center lg:pr-4">
                {HERO_PREVIEWS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePreviewIdx(idx)}
                    className="w-2 h-2 rounded-full transition-all duration-300 focus:outline-none"
                    style={{
                      backgroundColor: activePreviewIdx === idx ? '#FFFFFF' : 'rgba(255, 255, 255, 0.24)',
                      transform: activePreviewIdx === idx ? 'scale(1.25)' : 'scale(1)',
                    }}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          aria-hidden="true"
        >
          <div
            className="w-px h-14 mx-auto"
            style={{
              background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.08), transparent)',
            }}
          />
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════
          STATS STRIP
      ═══════════════════════════════════════════════ */}
      <section
        className="border-y py-10 md:py-12"
        style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'var(--vb-bg-alt)' }}
      >
        <div className="container-vb">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4">
            {[
              { value: stats.totalDelivered, suffix: '+',    label: 'Projects Delivered', dec: 0 },
              { value: 50,                   suffix: '+',    label: 'Brands Served',       dec: 0 },
              { value: stats.averageRating || 4.9, suffix: '', after: '/ 5', label: 'Average Rating', dec: 1 },
              { value: 2,                    suffix: '+',    label: 'Years of Excellence', dec: 0 },
            ].map((s, i) => (
              <FadeUp key={s.label} delay={i * 0.08}>
                <div className="text-center md:text-left">
                  <div className="flex items-baseline gap-0.5 justify-center md:justify-start mb-2">
                    <CountUp
                      to={s.value}
                      decimals={s.dec}
                      className="text-3xl md:text-4xl font-display font-bold text-foreground"
                    />
                    <span className="text-2xl font-display font-bold text-foreground">{s.suffix}</span>
                    {s.after && (
                      <span className="text-base font-satoshi ml-1" style={{ color: 'var(--vb-muted)' }}>
                        {s.after}
                      </span>
                    )}
                  </div>
                  <p className="text-label">{s.label}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services Section – powered by BentoGrid ── */}
      <section className="section-y">
        <div className="container-vb">
          <FadeUp className="mb-14 md:mb-20">
            <p className="text-label mb-4">What We Build</p>
            <h2 className="text-display font-display font-bold text-foreground">
              Services
            </h2>
          </FadeUp>

          {/* The new reusable grid */}
          <BentoGrid cards={servicesData} className="mt-8" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          FEATURED WORK / PROJECT SHOWCASE
      ═══════════════════════════════════════════════ */}
      <section
        className="section-y-sm border-y"
        style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'var(--vb-bg-alt)' }}
      >
        <div className="container-vb mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <FadeUp>
              <p className="text-label mb-4">Our Work</p>
              <h2 className="text-display font-display font-bold text-foreground">Featured Projects</h2>
            </FadeUp>

            {/* Tab filters */}
            <FadeUp delay={0.1}>
              <div className="flex gap-2 flex-wrap">
                {['Websites', 'UI/UX Design', 'Free Projects'].map((tab) => (
                  <button
                    key={tab}
                    id={`project-tab-${tab.toLowerCase().replace(/[^a-z]/g, '-')}`}
                    onClick={() => setActiveTab(tab)}
                    className="text-[0.65rem] font-satoshi font-medium tracking-widest uppercase px-4 py-2 border transition-all duration-300"
                    style={{
                      borderColor:
                        activeTab === tab ? 'rgba(255,255,255,0.24)' : 'rgba(255,255,255,0.1)',
                      color:
                        activeTab === tab ? '#FFFFFF' : 'rgba(255,255,255,0.58)',
                      background:
                        activeTab === tab ? 'rgba(255,255,255,0.08)' : 'transparent',
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </FadeUp>
          </div>
        </div>

        <ProjectLoop
          items={
            getFilteredProjects().length > 0
              ? getFilteredProjects()
              : [
                  {
                    id: '1',
                    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
                    title: 'Premium Dashboard',
                    url: '/services',
                  },
                ]
          }
        />
      </section>

      {/* ── 🎬 SOCIAL MEDIA SHOWCASE — CAROUSEL ── */}
      <section className="section-y border-b border-white/8 relative overflow-hidden">
        {/* Background ambient lighting */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          aria-hidden="true"
          style={{
            width: '600px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(184,196,208,0.04) 0%, transparent 70%)',
            filter: 'blur(50px)',
          }}
        />

        <div className="container-vb mb-12 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <FadeUp>
              <p className="text-label mb-4">Handling & Content</p>
              <h2 className="text-display font-display font-bold text-foreground">Social Marketing</h2>
            </FadeUp>
            
            <FadeUp delay={0.1}>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => {
                    const el = document.getElementById('social-carousel');
                    el?.scrollBy({ left: -380, behavior: 'smooth' });
                  }}
                  className="w-10 h-10 rounded-full border border-white/10 hover:border-white/20 bg-white/4 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all active:scale-95"
                  aria-label="Previous slide"
                >
                  <ArrowLeft size={16} />
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById('social-carousel');
                    el?.scrollBy({ left: 380, behavior: 'smooth' });
                  }}
                  className="w-10 h-10 rounded-full border border-white/10 hover:border-white/20 bg-white/4 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all active:scale-95"
                  aria-label="Next slide"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </FadeUp>
          </div>
        </div>

        {/* Carousel Slider Row */}
        <div className="relative z-10 w-full overflow-hidden">
          <div 
            id="social-carousel"
            className="flex gap-6 overflow-x-auto pb-10 px-[max(1.5rem,calc((100vw-88rem)/2))] md:px-[max(2rem,calc((100vw-88rem)/2))] snap-x snap-mandatory scroll-smooth scrollbar-none"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {SOCIAL_MEDIA_SHOWCASE.map((item, idx) => (
              <FadeUp key={idx} delay={idx * 0.05} className="snap-start flex-shrink-0">
                <div 
                  className="w-[280px] sm:w-[340px] h-[440px] sm:h-[500px] glass-card relative overflow-hidden group border border-white/10"
                  style={{ borderRadius: '12px' }}
                >
                  {item.type === 'video' ? (
                    <video
                      src={item.url}
                      muted
                      loop
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  )}

                  {/* Permanent Visual tag */}
                  <div className="absolute bottom-4 left-4 right-4 z-10 p-4 bg-black/55 backdrop-blur-md border border-white/10 rounded-lg group-hover:opacity-0 group-hover:translate-y-2 transition-all duration-300">
                    <span className="text-[8px] font-mono text-[var(--vb-accent)] uppercase tracking-wider block mb-0.5">
                      {item.campaign}
                    </span>
                    <h4 className="font-display font-semibold text-white text-xs truncate">
                      {item.title}
                    </h4>
                  </div>

                  {/* Hover reveal overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-400 flex flex-col justify-end p-4 md:p-6 z-20">
                    <div className="glass-panel p-4 rounded-lg border border-white/14 backdrop-blur-md transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 space-y-2">
                      <span className="text-[8px] font-mono text-[var(--vb-accent)] uppercase tracking-wider block">
                        {item.campaign}
                      </span>
                      <h4 className="font-display font-semibold text-white text-sm leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-[10px] font-satoshi text-white/82 tracking-wide font-medium bg-white/5 py-1.5 px-3 rounded border border-white/8 mt-1">
                        📈 {item.stats}
                      </p>
                    </div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          PROCESS TIMELINE
      ═══════════════════════════════════════════════ */}
      <section className="section-y">
        <div className="container-vb">

          <FadeUp className="mb-16 md:mb-20">
            <p className="text-label mb-4">How We Work</p>
            <h2 className="text-display font-display font-bold text-foreground">Our Process</h2>
          </FadeUp>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 md:gap-6">
            {PROCESS.map((step, i) => (
              <FadeUp key={step.num} delay={i * 0.07}>
                <div className="relative">
                  {/* Connector line (desktop only, not last item) */}
                  {i < PROCESS.length - 1 && (
                    <div
                      className="hidden lg:block absolute top-3 left-full w-full h-px"
                      style={{ background: 'rgba(255,255,255,0.08)' }}
                      aria-hidden="true"
                    />
                  )}

                  <p
                    className="font-satoshi text-xs mb-4 tracking-widest"
                    style={{ color: 'rgba(124,143,161,0.5)' }}
                  >
                    {step.num}
                  </p>
                  <div
                    className="w-6 h-px mb-4"
                    style={{ background: 'rgba(255,255,255,0.08)' }}
                  />
                  <h3 className="font-display font-semibold text-foreground mb-2 text-sm">
                    {step.title}
                  </h3>
                  <p className="text-[#6C757D] text-xs leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          TECH STACK MARQUEE
      ═══════════════════════════════════════════════ */}
      <section
        className="section-y-sm border-y"
        style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'var(--vb-bg-alt)' }}
      >
        <div className="container-vb mb-8 text-center">
          <p className="text-label">Technology Stack</p>
        </div>
        <LogoLoop items={techLogos} />
      </section>

      {/* ═══════════════════════════════════════════════
          SUBSCRIPTION PLANS (conditional)
      ═══════════════════════════════════════════════ */}
      {subscriptions.length > 0 && (
        <section className="section-y border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="container-vb">
            <FadeUp className="mb-14 md:mb-20">
              <p className="text-label mb-4">Recurring Value</p>
              <h2 className="text-display font-display font-bold text-foreground">Monthly Plans</h2>
            </FadeUp>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {subscriptions.map((sub: any, i: number) => (
                <FadeUp key={sub.id} delay={i * 0.1}>
                  <div className="glass-card p-8 md:p-10 flex flex-col h-full">
                    <h3 className="font-display font-bold text-foreground text-xl mb-3">
                      {sub.title}
                    </h3>
                    <div className="flex items-baseline gap-1 mb-5">
                      <span className="text-4xl font-display font-bold text-foreground">
                        {formatPrice(sub.price, user?.country)}
                      </span>
                      <span className="font-satoshi text-sm" style={{ color: 'var(--vb-muted)' }}>
                        /{sub.interval}
                      </span>
                    </div>
                    <p className="text-[#495057] text-sm mb-7 flex-1 leading-relaxed">
                      {sub.description}
                    </p>
                    <ul className="space-y-2.5 mb-8">
                      {sub.features.slice(0, 5).map((f: string, fi: number) => (
                        <li key={fi} className="flex items-start gap-2.5 text-xs text-[#6C757D]">
                          <CheckCircle
                            size={12}
                            className="shrink-0 mt-0.5"
                            style={{ color: 'var(--vb-accent)' }}
                          />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Link to="/services" className="btn-ghost !text-xs text-center justify-center">
                      View Details
                    </Link>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════
          CTA SECTION — immersive, massive typography
      ═══════════════════════════════════════════════ */}
      <section className="relative section-y overflow-hidden border-t" style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'var(--vb-bg-alt)' }}>
        {/* Atmospheric glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          aria-hidden="true"
          style={{
            width: '900px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(124,143,161,0.06) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />

        <div className="container-vb relative z-10 text-center">
          <FadeUp>
            <p className="text-label mb-10">Ready to Begin?</p>
            <h2
              className="font-display font-bold text-foreground mb-8 leading-[0.98]"
              style={{
                fontSize: 'clamp(2.4rem, 6vw, 5.5rem)',
                letterSpacing: '-0.025em',
              }}
            >
              Let&apos;s Build Something
              <br />
              <span className="text-[#7C8FA1]">Extraordinary.</span>
            </h2>
            <p
              className="text-[#495057] text-lg mb-14 max-w-xl mx-auto leading-relaxed font-light"
            >
              Partner with Vision Built to create digital experiences that define your category and outlast trends.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/services" className="btn-primary group">
                Start a Project
                <ArrowRight
                  size={14}
                  className="group-hover:translate-x-1 transition-transform duration-300"
                />
              </Link>
              <a
                href="mailto:vbuilt20@gmail.com"
                className="btn-ghost"
              >
                Say Hello
              </a>
            </div>

            {/* Trust line */}
            <p className="mt-12 text-foreground/20 text-xs font-satoshi tracking-widest uppercase">
              Response within 24 hours · No commitment required
            </p>
          </FadeUp>
        </div>
      </section>

    </div>
  );
};

export default Landing;
