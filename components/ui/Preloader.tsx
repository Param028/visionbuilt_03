
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
        // Random increment for organic feel
        return prev + Math.random() * 5;
      });
    }, 50);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      setTimeout(onComplete, 800);
    }
  }, [progress, onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#090A0B] text-white overflow-hidden h-[100dvh] w-full"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      {/* Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.03),transparent)] opacity-60" />
      
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
      <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)', backgroundSize: '50px 50px', maskImage: 'radial-gradient(circle, black 30%, transparent 70%)' }}></div>

      <div className="relative z-10 flex flex-col items-center p-4">
        {/* Animated Logo Container */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="relative mb-8"
        >
          {/* Spinning Rings */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-8 rounded-full border border-white/10 border-t-white border-l-transparent"
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-12 rounded-full border border-white/5 border-b-white/40 border-r-transparent"
          />

          <Logo className="w-24 h-24 drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]" />
        </motion.div>

        {/* Text Reveal */}
        <div className="overflow-hidden mb-2">
            <motion.h1 
                initial={{ y: 50 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-3xl font-display font-bold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-white"
            >
                VISION BUILT
            </motion.h1>
        </div>

        {/* Loading Bar */}
        <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden mt-8 relative">
            <motion.div 
                className="h-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                style={{ width: `${Math.min(100, progress)}%` }}
            />
        </div>
        
        <div className="mt-2 font-mono text-xs text-white/50 flex justify-between w-64">
            <span>INITIALIZING SYSTEM...</span>
            <span>{Math.floor(progress)}%</span>
        </div>
      </div>
    </motion.div>
  );
};
