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
          <motion.div key={svc.title} whileHover={{ y: -4 }} className={`relative ${colSpan}`}>
            <Card
              className="glass-card h-full rounded-xl border border-white/10 bg-white/10 p-8 backdrop-blur-2xl transition-all duration-300"
            >
              <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-300">
                <svc.icon size={26} />
              </div>
              <h3 className="text-display-sm font-display font-bold text-foreground mb-4">{svc.title}</h3>
              <p className="text-[#495057] leading-relaxed max-w-md">{svc.desc}</p>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
};
