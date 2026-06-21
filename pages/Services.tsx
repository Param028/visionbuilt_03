
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Check, MessageSquare, Code, Layout, GraduationCap, Bot,
  Sparkles, Server, Database, Globe, AlertCircle, ArrowRight,
} from 'lucide-react';
import { api } from '../services/api';
import { Service, User } from '../types';
import { Tooltip } from '../components/ui/Components';
import { formatPrice } from '../constants';

// ── Feature tooltips ──────────────────────────────────────────
const FEATURE_DESCRIPTIONS: Record<string, string> = {
  "responsive":   "Ensures the interface adapts perfectly to mobile, tablet, and desktop screens.",
  "seo":          "Optimized meta tags, sitemaps, and structure to improve search engine visibility.",
  "payment":      "Secure integration with Stripe, Razorpay, or PayPal.",
  "database":     "Robust data schema design using SQL or NoSQL databases.",
  "authentication": "Secure user signup, login, password recovery, and session management.",
  "auth":         "Secure user signup, login, and session management.",
  "admin":        "Comprehensive dashboard for managing users, content, and settings.",
  "api":          "REST/GraphQL API development or integration.",
  "hosting":      "Deployment to AWS, Vercel, or DigitalOcean.",
  "deployment":   "CI/CD pipelines and production server environments.",
  "ssl":          "SSL certificate implementation for secure HTTPS connections.",
  "support":      "Dedicated technical support for bug fixes and inquiries.",
  "design":       "Custom UI/UX design tailored to your brand identity.",
  "ui/ux":        "Custom UI/UX design tailored to your brand identity.",
  "cms":          "Content Management System integration for easy updates.",
  "analytics":    "Tracking tools to monitor user behavior and traffic.",
  "revisions":    "Number of allowed design or code iterations.",
  "source code":  "Full ownership and access to the repository.",
  "domain":       "Domain registration and DNS configuration assistance.",
  "email":        "Professional business email account setup.",
  "performance":  "Fast loading times and Core Web Vitals optimization.",
  "chat":         "Real-time chat for user support or community.",
  "security":     "Best practices to protect against vulnerabilities.",
  "mockup":       "High-fidelity visual representations before coding.",
  "wireframe":    "Structural blueprints of the application layout.",
  "testing":      "Rigorous QA testing for bug-free functionality.",
  "maintenance":  "Scheduled updates and health checks.",
};

const getFeatureDescription = (feature: string) => {
  const lower = feature.toLowerCase();
  const match = Object.keys(FEATURE_DESCRIPTIONS).find(key => lower.includes(key));
  return match ? FEATURE_DESCRIPTIONS[match] : null;
};

const getIcon = (iconName: string) => {
  const icons: Record<string, React.ReactNode> = {
    'Code':          <Code className="w-5 h-5" />,
    'Layout':        <Layout className="w-5 h-5" />,
    'GraduationCap': <GraduationCap className="w-5 h-5" />,
    'Bot':           <Bot className="w-5 h-5" />,
    'Server':        <Server className="w-5 h-5" />,
    'Database':      <Database className="w-5 h-5" />,
    'Globe':         <Globe className="w-5 h-5" />,
  };
  return icons[iconName] || <Sparkles className="w-5 h-5" />;
};

// ── Loading skeleton ──────────────────────────────────────────
const ServiceSkeleton = () => (
  <div className="glass-card p-8 flex flex-col gap-4 animate-pulse">
    <div className="w-10 h-10 rounded-lg bg-black/5" />
    <div className="h-5 w-2/3 bg-black/5 rounded" />
    <div className="h-4 w-full bg-black/5 rounded" />
    <div className="h-4 w-5/6 bg-black/5 rounded" />
    <div className="mt-4 space-y-2">
      {[1, 2, 3].map(i => <div key={i} className="h-3 w-3/4 bg-black/3 rounded" />)}
    </div>
    <div className="mt-auto h-10 bg-black/5 rounded" />
  </div>
);

// ── COMPONENT ─────────────────────────────────────────────────
const Services: React.FC<{ user: User | null }> = ({ user }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [recurringServices, setRecurringServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const timeoutId = setTimeout(() => {
      if (isMounted && loading) setLoading(false);
    }, 15000);

    const fetchData = async () => {
      try {
        const [data, recurring] = await Promise.all([
          api.getServices(),
          api.getRecurringServices(),
        ]);
        if (isMounted) {
          setServices(data.filter((s: Service) => s.is_enabled));
          setRecurringServices(recurring.filter((s: any) => s.is_active));
        }
      } catch (error) {
        console.error('Failed to load services', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => { isMounted = false; clearTimeout(timeoutId); };
  }, []);

  const handleOrder = (serviceId: string) => navigate(`/order/new?serviceId=${serviceId}`);

  return (
    <div className="min-h-screen">

      {/* ── PAGE HEADER ── */}
      <div
        className="relative border-b pt-20 pb-16 overflow-hidden"
        style={{ borderColor: 'rgba(0,0,0,0.08)' }}
      >
        {/* Atmospheric glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse, rgba(124,143,161,0.06) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <div className="container-vb relative z-10 text-center">
          <motion.p
            className="text-label mb-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            What We Offer
          </motion.p>
          <motion.h1
            className="text-display font-display font-bold text-foreground mb-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Our Services
          </motion.h1>
          <motion.p
            className="text-[#495057] text-lg max-w-xl mx-auto leading-relaxed font-light"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Choose from our premium catalog of digital solutions. Every project is delivered with precision and craftsmanship.
          </motion.p>
        </div>
      </div>

      {/* ── SERVICE CARDS ── */}
      <div className="container-vb section-y">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map(i => <ServiceSkeleton key={i} />)}
          </div>
        ) : services.length === 0 ? (
          <div className="glass-card flex flex-col items-center justify-center text-center p-16 max-w-lg mx-auto">
            <AlertCircle className="w-10 h-10 mb-5" style={{ color: 'rgba(248,249,250,0.25)' }} />
            <h3 className="font-display font-bold text-foreground text-xl mb-3">Service Catalog Unavailable</h3>
            <p className="text-[#495057] text-sm leading-relaxed mb-8">
              Unable to load services at this moment. Please check your connection or contact support.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-ghost !text-xs"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.07, duration: 0.5 }}
                className="h-full"
              >
                <div className="glass-card p-8 h-full flex flex-col group">
                  {/* Icon */}
                  <div
                    className="mb-7 flex items-center justify-between"
                  >
                    <div
                      className="p-2.5 border transition-all duration-300"
                      style={{
                        borderColor: 'rgba(0,0,0,0.08)',
                        color: 'var(--vb-accent)',
                        background: 'rgba(124,143,161,0.10)',
                      }}
                    >
                      {getIcon(service.icon)}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-display font-bold text-foreground text-lg mb-3">
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p className="text-[#495057] text-sm leading-relaxed mb-1 line-clamp-2">
                    {service.description}
                  </p>

                  {/* Quote label */}
                  <p className="text-label mb-6 mt-4">Custom Quote</p>

                  {/* Feature list */}
                  <div
                    className="flex-grow space-y-2.5 mb-7 pt-6 border-t"
                    style={{ borderColor: 'rgba(0,0,0,0.08)' }}
                  >
                    {service.features.slice(0, 6).map((feature, i) => {
                      const desc = getFeatureDescription(feature);
                      return (
                        <div key={i} className="flex items-start text-xs gap-2.5">
                          <Check
                            className="shrink-0 mt-0.5"
                            size={12}
                            style={{ color: 'var(--vb-accent)' }}
                          />
                          {desc ? (
                            <Tooltip content={desc} className="cursor-help">
                              <span
                                className="text-[#6C757D] border-b border-dashed transition-colors"
                                style={{ borderColor: 'rgba(0,0,0,0.08)' }}
                              >
                                {feature}
                              </span>
                            </Tooltip>
                          ) : (
                            <span className="text-[#6C757D]">{feature}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* CTA */}
                  <div className="mt-auto">
                    {(!user || user.role === 'client') ? (
                      <button
                        onClick={() => handleOrder(service.id)}
                        className="btn-primary w-full justify-center group/btn !py-3"
                      >
                        Get Quote
                        <MessageSquare
                          size={12}
                          className="group-hover/btn:translate-x-1 transition-transform"
                        />
                      </button>
                    ) : (
                      <div
                        className="w-full py-3 text-center text-xs font-satoshi tracking-widest uppercase border"
                        style={{
                          borderColor: 'rgba(0,0,0,0.08)',
                          color: '#6C757D',
                        }}
                      >
                        Admin Mode
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* ── RECURRING PLANS ── */}
        {recurringServices.length > 0 && (
          <div className="mt-24">
            <div className="mb-16">
              <p className="text-label mb-4">Ongoing Value</p>
              <h2 className="text-display font-display font-bold text-foreground">
                Monthly Subscriptions
              </h2>
              <p className="text-[#495057] max-w-xl mt-4 leading-relaxed font-light">
                Ongoing support and development packages to keep your business running smoothly.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {recurringServices.map((plan: any, index: number) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08, duration: 0.5 }}
                >
                  <div className="glass-card p-8 h-full flex flex-col group">
                    <h3 className="font-display font-bold text-foreground text-xl mb-4">
                      {plan.title}
                    </h3>
                    <div className="flex items-baseline gap-1 mb-5">
                      <span className="text-4xl font-display font-bold text-foreground">
                        {formatPrice(plan.price, user?.country)}
                      </span>
                      <span
                        className="text-sm font-satoshi"
                        style={{ color: 'var(--vb-muted)' }}
                      >
                        /{plan.interval}
                      </span>
                    </div>
                    <p className="text-[#495057] text-sm leading-relaxed mb-7 min-h-[44px]">
                      {plan.description}
                    </p>

                    <button
                      onClick={() => handleOrder(plan.id)}
                      className="btn-ghost w-full justify-center !text-xs mb-7"
                    >
                      Subscribe Now
                    </button>

                    <div
                      className="flex-grow space-y-2.5 pt-6 border-t"
                      style={{ borderColor: 'rgba(0,0,0,0.08)' }}
                    >
                      {plan.features?.map((feature: string, i: number) => (
                        <div key={i} className="flex items-start text-xs gap-2.5">
                          <Check
                            size={12}
                            className="shrink-0 mt-0.5"
                            style={{ color: 'var(--vb-accent)' }}
                          />
                          <span className="text-[#6C757D]">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ── CTA STRIP ── */}
        <div
          className="mt-24 glass-card p-10 md:p-14 text-center border"
          style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}
        >
          <p className="text-label mb-5">Need Something Custom?</p>
          <h2 className="text-display-sm font-display font-bold text-foreground mb-5">
            Let's Discuss Your Project
          </h2>
          <p className="text-[#495057] max-w-md mx-auto text-sm leading-relaxed mb-10">
            Every project is unique. Tell us what you need and we'll craft a tailored solution.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="mailto:vbuilt20@gmail.com" className="btn-primary group">
              Contact Us
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
