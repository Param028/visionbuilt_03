
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ShoppingCart, Code, Layout, GraduationCap, Bot, Sparkles, Server, Database, Globe, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { Service, User } from '../types';
import { formatPrice } from '../constants';
import { Button, Card, Tooltip } from '../components/ui/Components';
import { ScrollFloat } from '../components/ui/ReactBits';

// Feature descriptions map for tooltips
const FEATURE_DESCRIPTIONS: Record<string, string> = {
  "responsive": "Ensures the interface adapts perfectly to mobile, tablet, and desktop screens.",
  "seo": "Optimized meta tags, sitemaps, and structure to improve search engine visibility.",
  "payment": "Secure integration with Stripe, Razorpay, or PayPal for processing transactions.",
  "database": "Robust data schema design and setup using SQL or NoSQL databases.",
  "authentication": "Secure user signup, login, password recovery, and session management.",
  "auth": "Secure user signup, login, password recovery, and session management.",
  "admin": "Comprehensive dashboard to manage users, content, and application settings.",
  "api": "Development or integration of REST/GraphQL APIs for data exchange.",
  "hosting": "Deployment to high-performance cloud providers like AWS, Vercel, or DigitalOcean.",
  "deployment": "Setting up CI/CD pipelines and production server environments.",
  "ssl": "Implementation of SSL certificates for encrypted, secure connections (HTTPS).",
  "support": "Dedicated technical support period for bug fixes and inquiries.",
  "design": "Custom UI/UX design tailored to your specific brand identity.",
  "ui/ux": "Custom UI/UX design tailored to your specific brand identity.",
  "cms": "Integration of a Content Management System for easy content updates.",
  "analytics": "Setup of tracking tools to monitor user behavior and traffic sources.",
  "revisions": "Number of allowed iterations to refine the design or code.",
  "source code": "Full ownership and access to the underlying repository and codebase.",
  "domain": "Assistance with domain name registration and DNS configuration.",
  "email": "Setup of professional business email accounts (e.g., name@yourbusiness.com).",
  "performance": "Optimization for fast loading times and Core Web Vitals compliance.",
  "chat": "Real-time chat functionality for user support or community interaction.",
  "security": "Implementation of best practices to protect against common vulnerabilities.",
  "mockup": "High-fidelity visual representations of the final product before coding.",
  "wireframe": "Structural blueprints of the application layout.",
  "testing": "Rigorous QA testing to ensure bug-free functionality.",
  "maintenance": "Scheduled updates and health checks for your application.",
  "features": "Specific functional requirements tailored to your business needs."
};

const getFeatureDescription = (feature: string) => {
  const lowerFeature = feature.toLowerCase();
  const match = Object.keys(FEATURE_DESCRIPTIONS).find(key => lowerFeature.includes(key));
  return match ? FEATURE_DESCRIPTIONS[match] : null;
};

const Services: React.FC<{ user: User | null }> = ({ user }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    // Failsafe: Force stop loading after 15 seconds if DB hangs (Updated from 5s)
    const timeoutId = setTimeout(() => {
        if (isMounted && loading) {
            console.warn("Services fetch timed out - forcing UI render");
            setLoading(false);
        }
    }, 15000);

    const fetchData = async () => {
      try {
        const data = await api.getServices();
        if (isMounted) {
            setServices(data.filter(s => s.is_enabled));
        }
      } catch (error) {
        console.error("Failed to load services", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchData();

    return () => {
        isMounted = false;
        clearTimeout(timeoutId);
    };
  }, []);

  const handleOrder = (serviceId: string) => {
    navigate(`/order/new?serviceId=${serviceId}`);
  };

  // Map string icon names to Lucide components
  const getIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      'Code': <Code className="w-6 h-6" />,
      'Layout': <Layout className="w-6 h-6" />,
      'GraduationCap': <GraduationCap className="w-6 h-6" />,
      'Bot': <Bot className="w-6 h-6" />,
      'Server': <Server className="w-6 h-6" />,
      'Database': <Database className="w-6 h-6" />,
      'Globe': <Globe className="w-6 h-6" />,
    };
    return icons[iconName] || <Sparkles className="w-6 h-6" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-vision-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            <ScrollFloat>Our Services</ScrollFloat>
        </h1>
        <div className="text-gray-400 max-w-2xl mx-auto">
          <ScrollFloat animationDuration={0.4} stagger={0.01} className="justify-center">
            Choose from our premium catalog of digital solutions. Prices are estimated in your local currency.
          </ScrollFloat>
        </div>
      </div>

      {services.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 border border-white/10 rounded-2xl bg-white/5">
              <AlertCircle className="w-12 h-12 text-vision-primary mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-white mb-2">Service Catalog Unavailable</h3>
              <p className="text-gray-400 text-center max-w-md">
                  Unable to load services at this moment. Please check your connection or contact support for a custom quote.
              </p>
              <Button onClick={() => window.location.reload()} variant="outline" className="mt-6">
                  Retry Connection
              </Button>
          </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
            <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
            >
                <Card className="h-full flex flex-col hover:border-vision-primary/50 transition-all duration-300 group">
                <div className="mb-6">
                    <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-lg bg-white/5 text-vision-primary border border-white/10 group-hover:bg-vision-primary group-hover:text-black transition-colors duration-300 shadow-[0_0_15px_rgba(6,182,212,0.1)] group-hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                        {getIcon(service.icon)}
                    </div>
                    </div>
                    
                    <h3 className="text-xl font-bold font-display text-white mb-2 group-hover:text-vision-primary transition-colors">
                        {service.title}
                    </h3>
                    
                    <p className="text-gray-400 text-sm h-12 mb-4 line-clamp-2">{service.description}</p>
                    
                    <div className="text-3xl font-bold text-white font-sora">
                    {formatPrice(service.base_price, user?.country)} <span className="text-sm font-normal text-gray-500">/ starting</span>
                    </div>
                </div>

                <div className="flex-grow space-y-3 mb-8 border-t border-white/5 pt-6">
                    {service.features.map((feature, i) => {
                    const description = getFeatureDescription(feature);
                    return (
                        <div key={i} className="flex items-center text-sm text-gray-300 group/feature w-fit">
                        <Check className="w-4 h-4 text-vision-secondary mr-2 flex-shrink-0" />
                        {description ? (
                            <Tooltip content={description} className="cursor-help">
                            <span className="border-b border-dashed border-gray-600 group-hover/feature:border-vision-primary transition-colors">
                                {feature}
                            </span>
                            </Tooltip>
                        ) : (
                            <span>{feature}</span>
                        )}
                        </div>
                    );
                    })}
                </div>

                {(!user || user.role === 'client') ? (
                    <Button onClick={() => handleOrder(service.id)} className="w-full group/btn">
                        Select Service <ShoppingCart className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                ) : (
                    <div className="w-full py-2 text-center text-xs text-gray-500 border border-white/5 rounded-lg bg-white/5 uppercase tracking-wider">
                        Admin Mode: Purchasing Disabled
                    </div>
                )}
                </Card>
            </motion.div>
            ))}
        </div>
      )}
    </div>
  );
};

export default Services;
