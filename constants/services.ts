import { ComponentType } from 'react';
import { Code2, Layers, Palette, TrendingUp, Zap, Globe } from 'lucide-react';

/** Shape of a service item */
export interface ServiceItem {
  /** Icon component reference (e.g. Code2) */
  icon: ComponentType<{ size?: number }>;
  title: string;
  desc: string;
  featured?: boolean;
}

/** Centralised list of services used by the BentoGrid */
export const servicesData: ServiceItem[] = [
  {
    icon: Code2,
    title: 'Website Development',
    desc: 'Scalable, performant web applications built with precision engineering, modern architectures, and pixel‑perfect delivery.',
    featured: true,
  },
  {
    icon: Layers,
    title: 'UI/UX Design',
    desc: 'Interfaces that feel premium, convert effectively, and leave a lasting impression.',
  },
  {
    icon: Palette,
    title: 'Branding',
    desc: 'Identity systems designed to endure market cycles and define categories.',
  },
  {
    icon: TrendingUp,
    title: 'Social Media Marketing',
    desc: 'Strategic growth and content at the scale modern brands demand.',
  },
  {
    icon: Zap,
    title: 'Performance Optimization',
    desc: 'Lighthouse 100. Core Web Vitals mastery. Every time.',
  },
  {
    icon: Globe,
    title: 'SEO',
    desc: 'Organic visibility that compounds and drives qualified growth.',
  },
];
