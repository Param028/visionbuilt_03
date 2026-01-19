
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
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#020617] text-white overflow-hidden h-[100dvh] w-full"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      {/* Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(6,182,212,0.1),transparent)] opacity-50" />
      
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
      <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)', backgroundSize: '50px 50px', maskImage: 'radial-gradient(circle, black 30%, transparent 70%)' }}></div>

      <div className="relative z-10 flex flex-col items-center p-4">
        {/* Animated Logo Container */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, type: "spring" }}
          className="relative mb-8"
        >
          {/* Spinning Rings */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-8 rounded-full border border-vision-primary/30 border-t-vision-primary border-l-transparent"
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-12 rounded-full border border-vision-secondary/20 border-b-vision-secondary border-r-transparent"
          />

          <Logo className="w-24 h-24 drop-shadow-[0_0_25px_rgba(6,182,212,0.6)]" />
        </motion.div>

        {/* Text Reveal */}
        <div className="overflow-hidden mb-2">
            <motion.h1 
                initial={{ y: 50 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="text-3xl font-display font-bold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-white via-vision-primary to-white"
            >
                VISION BUILT
            </motion.h1>
        </div>

        {/* Loading Bar */}
        <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden mt-8 relative">
            <motion.div 
                className="h-full bg-vision-primary shadow-[0_0_10px_#06b6d4]"
                style={{ width: `${Math.min(100, progress)}%` }}
            />
        </div>
        
        <div className="mt-2 font-mono text-xs text-vision-primary/70 flex justify-between w-64">
            <span>INITIALIZING SYSTEM...</span>
            <span>{Math.floor(progress)}%</span>
        </div>
      </div>
    </motion.div>
  );
};
