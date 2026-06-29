import React from 'react';
import { Card } from '@heroui/ui'; // Assuming Hero UI Card component
import { motion } from 'framer-motion';

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * BentoGrid wraps Hero UI Card with premium styling:
 * - Background: cyberCard (#161820)
 * - Subtle border with low opacity white
 * - Rounded corners (2xl)
 * - Backdrop blur (12px)
 * - Hover scaling and neon accent border glow
 */
export const BentoGrid: React.FC<BentoGridProps> = ({ children, className = '' }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`relative ${className}`}
    >
      <Card
        className="bg-cyberCard border border-white/5 rounded-2xl backdrop-blur-[12px] transition-all duration-300"
        style={{ borderColor: 'rgba(255,255,255,0.05)' }}
      >
        {children}
      </Card>
      {/* Neon accent border on hover */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl border border-cyberAccent/30 opacity-0 hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  );
};
