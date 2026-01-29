
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Code, Layout, Shield, Cpu, Globe, Star, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Components';
import { GradientText, ShinyText, MagicBento, MagicBentoItem, ScrollFloat, LogoLoop, CountUp, ProjectLoop } from '../components/ui/ReactBits';
import { api } from '../services/api';
import { MarketplaceItem } from '../types';

const Landing: React.FC = () => {
  const [stats, setStats] = useState<{ totalDelivered: number, averageRating: number }>({ totalDelivered: 0, averageRating: 0 });
  const [projects, setProjects] = useState<MarketplaceItem[]>([]);
  const [activePreviewTab, setActivePreviewTab] = useState('Websites');

  useEffect(() => {
      api.getPlatformStats().then(setStats);
      api.getMarketplaceItems().then(items => {
          setProjects(items);
      });
  }, []);

  const getFilteredProjects = () => {
      let filtered = projects.filter(p => p.category === activePreviewTab);
      // Fallback if no projects in category, just show what we have so section isn't empty
      if (filtered.length === 0) filtered = projects;
      return filtered.map(p => ({
          id: p.id,
          image: p.image_url!,
          title: p.title,
          url: `/marketplace/buy/${p.id}`
      }));
  };

  const techLogos = [
    { id: 'react', name: 'React', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg', url: 'https://react.dev' },
    { id: 'typescript', name: 'TypeScript', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg', url: 'https://www.typescriptlang.org' },
    { id: 'nextjs', name: 'Next.js', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg', url: 'https://nextjs.org' },
    { id: 'tailwind', name: 'Tailwind CSS', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg', url: 'https://tailwindcss.com' },
    { id: 'nodejs', name: 'Node.js', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg', url: 'https://nodejs.org' },
    { id: 'python', name: 'Python', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg', url: 'https://www.python.org' },
    { id: 'docker', name: 'Docker', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg', url: 'https://www.docker.com' },
    { id: 'aws', name: 'AWS', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-original-wordmark.svg', url: 'https://aws.amazon.com' },
    { id: 'mongodb', name: 'MongoDB', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original.svg', url: 'https://www.mongodb.com' },
    { id: 'git', name: 'Git', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg', url: 'https://git-scm.com' }
  ];

  return (
    <div className="relative min-h-screen">
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
             <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 backdrop-blur-md">
                <span className="flex h-2 w-2 rounded-full bg-vision-primary animate-pulse"></span>
                <ShinyText className="text-xs font-medium tracking-wide uppercase" shimmerColor="#ffffff">
                   Next Gen Development
                </ShinyText>
             </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6"
          >
             <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight text-white">
                <ScrollFloat animationDuration={0.8} stagger={0.05}>Build the</ScrollFloat> <br/>
                <GradientText className="text-6xl md:text-8xl mt-2" colors={["#06b6d4", "#8b5cf6", "#ec4899", "#06b6d4"]}>
                   FUTURE
                </GradientText>
             </h1>
          </motion.div>

          <div className="max-w-2xl text-lg md:text-xl text-gray-400 mb-10 leading-relaxed mx-auto">
             <ScrollFloat animationDuration={0.5} stagger={0.01} className="justify-center">
                Vision Built transforms ideas into digital reality. From high-scale software to futuristic web experiences, we engineer success.
             </ScrollFloat>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-16"
          >
            <Link to="/services">
              <Button size="lg" className="w-full sm:w-auto text-base">
                Explore Services <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-base">
                Client Portal
              </Button>
            </Link>
          </motion.div>

          {/* Stats Bar */}
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.6, delay: 0.5 }}
             className="grid grid-cols-2 md:grid-cols-2 gap-8 md:gap-24 p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md max-w-2xl w-full"
          >
              <div className="flex flex-col items-center">
                  <div className="flex items-center text-4xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-vision-primary to-vision-secondary">
                      <CountUp to={stats.totalDelivered} duration={2.5} />
                      <span>+</span>
                  </div>
                  <span className="text-sm text-gray-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                      <CheckCircle size={14} className="text-vision-primary" /> Delivered Projects
                  </span>
              </div>
              
              <div className="flex flex-col items-center">
                  <div className="flex items-center text-4xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                      <CountUp to={stats.averageRating} duration={2} decimals={1} />
                      <span className="ml-2 text-2xl">/ 5</span>
                  </div>
                  <span className="text-sm text-gray-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                      <Star size={14} fill="currentColor" className="text-yellow-500" /> Average Rating
                  </span>
              </div>
          </motion.div>
        </div>
      </section>

      {/* Project Preview Loop Section */}
      <section className="py-20 bg-black/40 border-y border-white/5 relative overflow-hidden z-20">
         <div className="max-w-7xl mx-auto px-4 mb-8 text-center relative z-10">
              <span className="text-xs font-semibold text-vision-primary uppercase tracking-widest mb-2 block">Our Work</span>
              <h2 className="text-2xl font-display font-bold text-white mb-6"><ScrollFloat>Featured Deployments</ScrollFloat></h2>
              
              {/* Category Tabs */}
              <div className="flex justify-center mb-8 gap-4">
                  {['Websites', 'UI/UX Design', 'Free Projects'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActivePreviewTab(tab)}
                        className={`text-sm px-4 py-2 rounded-full border transition-all ${
                            activePreviewTab === tab 
                            ? 'bg-vision-primary/10 border-vision-primary text-vision-primary font-bold' 
                            : 'border-transparent text-gray-500 hover:text-white'
                        }`}
                      >
                          {tab}
                      </button>
                  ))}
              </div>
         </div>
         
         <ProjectLoop items={getFilteredProjects().length > 0 ? getFilteredProjects() : [
             // Fallback if DB empty
             { id: '1', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f', title: 'Example Dashboard', url: '/services' }
         ]} />
      </section>

      {/* Trusted Tech Stack Logo Loop */}
      <section className="py-10 border-b border-white/5 bg-black/20 backdrop-blur-sm relative z-20">
          <div className="max-w-7xl mx-auto px-4 mb-6 text-center">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Powered By Modern Technology</span>
          </div>
          <LogoLoop items={techLogos} />
      </section>

      {/* Magic Bento Features (Unchanged) */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-16">
              <h2 className="text-3xl font-display font-bold text-white mb-4">
                  <ScrollFloat>Why Vision Built?</ScrollFloat>
              </h2>
              <div className="text-gray-400">
                  <ScrollFloat animationDuration={0.6} stagger={0.02} className="justify-center">
                    Engineering excellence meets futuristic design.
                  </ScrollFloat>
              </div>
           </div>

           <MagicBento>
              <MagicBentoItem 
                 title="Custom Software" 
                 description="Scalable backends and powerful tailored applications designed for enterprise growth."
                 icon={<Code className="w-6 h-6" />}
                 colSpan={2}
              >
                 <span>Full Stack Architecture</span>
              </MagicBentoItem>
              
              <MagicBentoItem 
                 title="Futuristic UI/UX" 
                 description="Interfaces that feel like they belong in 2050."
                 icon={<Layout className="w-6 h-6" />}
              >
                 <span>Framer Motion</span>
              </MagicBentoItem>

              <MagicBentoItem 
                 title="Enterprise Security" 
                 description="Bank-grade protection for all your digital assets."
                 icon={<Shield className="w-6 h-6" />}
              >
                 <span>Encrypted</span>
              </MagicBentoItem>

              <MagicBentoItem 
                 title="AI Integration" 
                 description="Leverage machine learning to automate your workflow."
                 icon={<Cpu className="w-6 h-6" />}
              >
                 <span>LLM Support</span>
              </MagicBentoItem>

              <MagicBentoItem 
                 title="Global Delivery" 
                 description="Lightning fast content delivery anywhere on Earth."
                 icon={<Globe className="w-6 h-6" />}
              >
                 <span>Edge Functions</span>
              </MagicBentoItem>
           </MagicBento>
        </div>
      </section>
    </div>
  );
};

export default Landing;
