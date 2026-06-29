import React from 'react';
import { Card } from '@heroui/react'; // Updated import from correct package
import { motion } from 'framer-motion';
import { ServiceItem } from '../../constants/services';

interface BentoGridProps {
  cards: ServiceItem[];
  className?: string;
}

/**
 * Premium BentoGrid – renders a glass‑styled card for each service.
 * - First item (featured) spans two columns on desktop.
 * - Other items occupy a single column.
 */
export const BentoGrid: React.FC<BentoGridProps> = ({ cards, className = '' }) => {
  return (
    <motion.div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
      {cards.map((svc, i) => {
        const isFeatured = svc.featured ?? i === 0; // fallback to first item
        const colSpan = isFeatured ? 'md:col-span-2' : '';
        return (
          <motion.div key={svc.title} whileHover={{ scale: 1.02 }} className={colSpan}>
            <Card
              className="bg-cyberCard border border-white/5 rounded-2xl backdrop-blur-[12px] transition-all duration-300"
              style={{ borderColor: 'rgba(255,255,255,0.05)' }}
            >
              <div className="mb-8" style={{ color: 'var(--vb-accent)' }}><svc.icon size={26} /></div>
              <h3 className="text-display-sm font-display font-bold text-foreground mb-4">{svc.title}</h3>
              <p className="text-[#495057] leading-relaxed max-w-md">{svc.desc}</p>
            </Card>
            {/* Neon accent border on hover */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl border border-cyberAccent/30 opacity-0 hover:opacity-100 transition-opacity duration-300" />
          </motion.div>
        );
      })}
    </motion.div>
  );
};
