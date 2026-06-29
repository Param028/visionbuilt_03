import { Code2, Layers, Palette, TrendingUp, Zap, Globe } from 'lucide-react';

export interface ServiceItem {
  icon: JSX.Element;
  title: string;
  desc: string;
  featured?: boolean;
}

/**
 * Centralised list of services used by the BentoGrid.
 * Icons come from lucide-react – the same icons that were inline‑coded before.
 */
export const servicesData: ServiceItem[] = [
  {
    icon: <Code2 size={26} />,
    title: 'Website Development',
    desc: 'Scalable, performant web applications built with precision engineering, modern architectures, and pixel‑perfect delivery.',
    featured: true,
  },
  {
    icon: <Layers size={22} />,
    title: 'UI/UX Design',
    desc: 'Interfaces that feel premium, convert effectively, and leave a lasting impression.',
  },
  {
    icon: <Palette size={22} />,
    title: 'Branding',
    desc: 'Identity systems designed to endure market cycles and define categories.',
  },
  {
    icon: <TrendingUp size={22} />,
    title: 'Social Media Marketing',
    desc: 'Strategic growth and content at the scale modern brands demand.',
  },
  {
    icon: <Zap size={22} />,
    title: 'Performance Optimization',
    desc: 'Lighthouse 100. Core Web Vitals mastery. Every time.',
  },
  {
    icon: <Globe size={22} />,
    title: 'SEO',
    desc: 'Organic visibility that compounds and drives qualified growth.',
  },
];
