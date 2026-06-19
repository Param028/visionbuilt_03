
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Logo } from './Logo';

interface PreloaderProps {
  onComplete: () => void;
}

export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        // Organic easing: fast start, slow finish
        const remaining = 100 - prev;
        const increment = Math.max(0.5, Math.random() * (remaining * 0.08));
        return Math.min(prev + increment, 100);
      });
    }, 40);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      const timeout = setTimeout(onComplete, 700);
      return () => clearTimeout(timeout);
    }
  }, [progress, onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: '#212529' }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.03, filter: 'blur(8px)' }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Atmospheric background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(124,143,161,0.06) 0%, transparent 70%)',
        }}
      />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(circle, black 30%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(circle, black 30%, transparent 70%)',
        }}
      />

      {/* ── Center content ── */}
      <div className="relative z-10 flex flex-col items-center gap-0">

        {/* Logo area — replace Logo with actual image when ready */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          className="mb-10 relative"
        >
          {/* Outer accent ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute -inset-6 rounded-full"
            style={{ border: '1px solid rgba(124,143,161,0.12)' }}
          />
          {/* Inner ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
            className="absolute -inset-10 rounded-full"
            style={{ border: '1px solid rgba(255,255,255,0.04)' }}
          />

          {/* Logo icon placeholder — replace with: <img src="/logo.svg" ... /> */}
          <div
            className="relative w-16 h-16 flex items-center justify-center"
            style={{
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.03)',
            }}
          >
            <Logo className="w-9 h-9 text-foreground/50" />
          </div>
        </motion.div>

        {/* Wordmark */}
        <div className="overflow-hidden mb-2">
          <motion.h1
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="font-display font-bold text-foreground tracking-[0.35em] text-lg uppercase"
          >
            Vision Built
          </motion.h1>
        </div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-label mb-12"
          style={{ color: 'rgba(124,143,161,0.6)' }}
        >
          Premium Digital Engineering
        </motion.p>

        {/* Progress bar container */}
        <div className="w-48 relative">
          {/* Track */}
          <div
            className="h-px w-full"
            style={{ background: 'rgba(255,255,255,0.07)' }}
          />
          {/* Fill */}
          <motion.div
            className="absolute top-0 left-0 h-px"
            style={{
              width: `${Math.min(100, progress)}%`,
              background: 'rgba(248,249,250,0.6)',
              boxShadow: '0 0 8px rgba(248,249,250,0.3)',
            }}
            transition={{ duration: 0.1 }}
          />
        </div>

        {/* Progress number */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-4 font-satoshi text-xs tracking-widest"
          style={{ color: 'rgba(248,249,250,0.2)' }}
        >
          {Math.floor(Math.min(100, progress))}
        </motion.p>
      </div>
    </motion.div>
  );
};
