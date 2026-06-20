
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  ArrowRight, Code2, Layers, Palette, TrendingUp,
  Zap, Globe, CheckCircle,
} from 'lucide-react';
import { CountUp, LogoLoop, ProjectLoop } from '../components/ui/ReactBits';
import { api } from '../services/api';
import { MarketplaceItem } from '../types';

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

// ── COMPONENT ─────────────────────────────────────────────────
const Landing: React.FC = () => {
  const [stats, setStats] = useState<{ totalDelivered: number; averageRating: number }>({
    totalDelivered: 0,
    averageRating: 0,
  });
  const [projects, setProjects]         = useState<MarketplaceItem[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [siteSettings, setSiteSettings]   = useState<any>(null);
  const [activeTab, setActiveTab]         = useState('Websites');

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
                'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
              backgroundSize: '80px 80px',
            }}
          />
        </div>

        {/* Content */}
        <div className="container-vb relative z-10 pt-24 pb-20">
          <div className="max-w-5xl">

            {/* Eyebrow label */}
            <motion.p
              className="text-label mb-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              Digital Agency · Premium Craftsmanship
            </motion.p>

            {/* Main heading — Clash Display, cinematic scale */}
            <motion.h1
              className="text-hero font-display font-bold text-foreground mb-10"
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
            >
              {heroHeadingLines.main}
              <br />
              <span className="text-[#B8C4D0]">
                {heroHeadingLines.accent}
              </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              className="text-[rgba(255,255,255,0.82)] text-lg md:text-xl max-w-lg mb-14 leading-relaxed font-light"
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
              background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.18), transparent)',
            }}
          />
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════
          STATS STRIP
      ═══════════════════════════════════════════════ */}
      <section
        className="border-y py-10 md:py-12"
        style={{ borderColor: 'rgba(255,255,255,0.10)', background: '#2A2F35' }}
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
                      <span className="text-base font-satoshi ml-1" style={{ color: 'rgba(248,249,250,0.3)' }}>
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

      {/* ═══════════════════════════════════════════════
          SERVICES BENTO GRID
      ═══════════════════════════════════════════════ */}
      <section className="section-y">
        <div className="container-vb">

          {/* Section header */}
          <FadeUp className="mb-14 md:mb-20">
            <p className="text-label mb-4">What We Build</p>
            <h2 className="text-display font-display font-bold text-foreground">Services</h2>
          </FadeUp>

          {/* Bento grid — 2-col top, 3-col bottom */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Featured card: Website Development — spans 2 columns */}
            <FadeUp delay={0.05} className="md:col-span-2">
              <div className="glass-card p-10 md:p-12 h-full group">
                <div className="mb-8" style={{ color: 'var(--vb-accent)' }}>
                  {SERVICES[0].icon}
                </div>
                <h3 className="text-display-sm font-display font-bold text-foreground mb-4">
                  {SERVICES[0].title}
                </h3>
                <p className="text-[rgba(255,255,255,0.82)] leading-relaxed max-w-md">
                  {SERVICES[0].desc}
                </p>
                <Link
                  to="/services"
                  className="inline-flex items-center gap-2 mt-10 text-xs font-satoshi tracking-widest uppercase transition-all duration-300"
                  style={{ color: 'var(--vb-accent)' }}
                >
                  <span className="group-hover:tracking-[0.22em] transition-all duration-300">
                    Explore Services
                  </span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            </FadeUp>

            {/* UI/UX Design — single card */}
            <FadeUp delay={0.12}>
              <div className="glass-card p-8 md:p-10 h-full">
                <div className="mb-6" style={{ color: 'var(--vb-accent)' }}>
                  {SERVICES[1].icon}
                </div>
                <h3 className="font-display font-bold text-foreground text-xl mb-3">
                  {SERVICES[1].title}
                </h3>
                <p className="text-[rgba(255,255,255,0.82)] text-sm leading-relaxed">
                  {SERVICES[1].desc}
                </p>
              </div>
            </FadeUp>

            {/* Bottom row — 3 equal cards */}
            {SERVICES.slice(2).map((svc, i) => (
              <FadeUp key={svc.title} delay={0.08 * (i + 3)}>
                <div className="glass-card p-8 group h-full">
                  <div className="mb-5" style={{ color: 'var(--vb-accent)' }}>
                    {svc.icon}
                  </div>
                  <h3 className="font-display font-semibold text-foreground mb-2">
                    {svc.title}
                  </h3>
                  <p className="text-[rgba(255,255,255,0.58)] text-sm leading-relaxed">
                    {svc.desc}
                  </p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          FEATURED WORK / PROJECT SHOWCASE
      ═══════════════════════════════════════════════ */}
      <section
        className="section-y-sm border-y"
        style={{ borderColor: 'rgba(255,255,255,0.10)', background: '#2A2F35' }}
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
                        activeTab === tab ? 'rgba(248,249,250,0.6)' : 'rgba(255,255,255,0.1)',
                      color:
                        activeTab === tab ? '#F8F9FA' : 'rgba(248,249,250,0.4)',
                      background:
                        activeTab === tab ? 'rgba(255,255,255,0.05)' : 'transparent',
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
                      style={{ background: 'rgba(255,255,255,0.05)' }}
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
                    style={{ background: 'rgba(255,255,255,0.1)' }}
                  />
                  <h3 className="font-display font-semibold text-foreground mb-2 text-sm">
                    {step.title}
                  </h3>
                  <p className="text-[rgba(255,255,255,0.58)] text-xs leading-relaxed">
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
        style={{ borderColor: 'rgba(255,255,255,0.10)', background: '#2A2F35' }}
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
        <section className="section-y border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
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
                        ₹{sub.price}
                      </span>
                      <span className="font-satoshi text-sm" style={{ color: 'rgba(248,249,250,0.3)' }}>
                        /{sub.interval}
                      </span>
                    </div>
                    <p className="text-[rgba(255,255,255,0.82)] text-sm mb-7 flex-1 leading-relaxed">
                      {sub.description}
                    </p>
                    <ul className="space-y-2.5 mb-8">
                      {sub.features.slice(0, 5).map((f: string, fi: number) => (
                        <li key={fi} className="flex items-start gap-2.5 text-xs text-[rgba(255,255,255,0.58)]">
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
      <section className="relative section-y overflow-hidden border-t" style={{ borderColor: 'rgba(255,255,255,0.10)', background: '#2A2F35' }}>
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
              <span className="text-[#B8C4D0]">Extraordinary.</span>
            </h2>
            <p
              className="text-[rgba(255,255,255,0.82)] text-lg mb-14 max-w-xl mx-auto leading-relaxed font-light"
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
