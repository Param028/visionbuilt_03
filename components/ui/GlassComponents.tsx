import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Link } from 'react-router-dom';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Strands (WebGL Background) ---
export const Strands: React.FC<{
  colors?: string[];
  count?: number;
  speed?: number;
  amplitude?: number;
  waviness?: number;
  thickness?: number;
  glow?: number;
  spread?: number;
  intensity?: number;
  saturation?: number;
  opacity?: number;
  glass?: boolean;
  className?: string;
}> = ({
  colors = ["#FFFFFF", "#CCCCCC", "#8A8A8A", "#4A4A4A", "#1C1C1C"],
  count = 4,
  speed = 0.2,
  amplitude = 1.2,
  waviness = 0.8,
  thickness = 0.8,
  glow = 2.0,
  spread = 1.5,
  intensity = 0.4,
  saturation = 0,
  opacity = 0.6,
  glass = false,
  className = ""
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    let time = 0;
    const strands = Array.from({ length: count }, (_, idx) => ({
      x: (canvas.width / count) * idx + canvas.width / count / 2,
      y: canvas.height / 2,
      phase: (idx / count) * Math.PI * 2,
      color: colors[idx % colors.length]
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += speed * 0.01;

      strands.forEach((strand) => {
        ctx.beginPath();
        ctx.strokeStyle = strand.color;
        ctx.lineWidth = thickness;
        ctx.globalAlpha = opacity;
        ctx.shadowBlur = glow * 10;
        ctx.shadowColor = strand.color;

        for (let y = 0; y < canvas.height; y += 5) {
          const waveX = Math.sin((y * waviness * 0.01) + time + strand.phase) * amplitude * 50;
          const x = strand.x + waveX;
          
          if (y === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [colors, count, speed, amplitude, waviness, thickness, glow, spread, intensity, saturation, opacity, glass]);

  return (
    <div ref={containerRef} className={cn("fixed inset-0 z-0 pointer-events-none", className)}>
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

// --- PillNav (Header Navigation) ---
interface PillNavItem {
  label: string;
  href: string;
}

export const PillNav: React.FC<{
  items: PillNavItem[];
  className?: string;
}> = ({
  items,
  className = ""
}) => {
  const location = window.location;
  const [activeTab, setActiveTab] = useState(items[0]?.label || '');

  useEffect(() => {
    const current = items.find(item => location.hash === item.href || (item.href === '/' && location.hash === ''));
    if (current) setActiveTab(current.label);
  }, [location, items]);

  return (
    <header className={cn("fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-7xl flex justify-center", className)}>
      <nav className="flex items-center gap-2 px-2 py-2 bg-white/5 backdrop-blur-xl rounded-full border border-white/10">
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mr-2">
          <span className="text-white font-bold text-sm">VB</span>
        </div>
        {items.map((item) => (
          <Link
            key={item.label}
            to={item.href}
            onClick={() => setActiveTab(item.label)}
            className={cn(
              "relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
              activeTab === item.label
                ? "bg-white text-[#1C1C1C]"
                : "text-white/60 hover:text-white hover:bg-white/5"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
};

// --- BorderGlow (Interactive Card Wrapper) ---
export const BorderGlow: React.FC<{
  children: React.ReactNode;
  glowColor?: string;
  colors?: string[];
  backgroundColor?: string;
  edgeSensitivity?: number;
  glowRadius?: number;
  className?: string;
}> = ({
  children,
  glowColor = "0 0 100",
  colors = ['#FFFFFF', '#CCCCCC', '#8A8A8A'],
  backgroundColor = "transparent",
  edgeSensitivity = 30,
  glowRadius = 40,
  className = ""
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [glowStyle, setGlowStyle] = useState<React.CSSProperties>({});

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const distanceX = (x - centerX) / centerX;
    const distanceY = (y - centerY) / centerY;
    
    const glowX = x - glowRadius;
    const glowY = y - glowRadius;

    setGlowStyle({
      background: `radial-gradient(circle at ${glowX}px ${glowY}px, ${colors[0]}33 0%, transparent ${glowRadius * 2}px)`,
      boxShadow: `${distanceX * edgeSensitivity}px ${distanceY * edgeSensitivity}px ${glowColor}px ${colors[0]}22`,
    });
  };

  const handleMouseLeave = () => {
    setGlowStyle({});
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn("relative rounded-3xl transition-all duration-300", className)}
      style={{ backgroundColor, ...glowStyle }}
    >
      {children}
    </div>
  );
};

// --- RotatingText (Hero Dynamic Text) ---
export const RotatingText: React.FC<{
  texts: string[];
  mainClassName?: string;
  staggerFrom?: 'first' | 'last';
  transition?: any;
  rotationInterval?: number;
  className?: string;
}> = ({
  texts,
  mainClassName = "",
  staggerFrom = 'last',
  transition = { type: "spring", damping: 30, stiffness: 400 },
  rotationInterval = 2500,
  className = ""
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % texts.length);
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [texts.length, rotationInterval]);

  return (
    <div className={cn("inline-flex", className)}>
      <AnimatePresence mode="wait">
        <motion.span
          key={currentIndex}
          initial={{ opacity: 0, y: staggerFrom === 'last' ? 20 : -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: staggerFrom === 'last' ? -20 : 20 }}
          transition={transition}
          className={mainClassName}
        >
          {texts[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

// --- ShinyText (Highlight Typography) ---
export const ShinyText: React.FC<{
  text?: string;
  children?: React.ReactNode;
  color?: string;
  shineColor?: string;
  speed?: number;
  spread?: number;
  className?: string;
}> = ({
  text,
  children,
  color = "#b5b5b5",
  shineColor = "#ffffff",
  speed = 3,
  spread = 120,
  className = ""
}) => {
  const content = text || children;

  return (
    <span
      className={cn(
        "inline-block bg-clip-text text-transparent bg-[length:200%_100%]",
        className
      )}
      style={{
        backgroundImage: `linear-gradient(110deg, ${color} 45%, ${shineColor} 50%, ${color} 55%)`,
        backgroundSize: `${spread}% 100%`,
        animation: `shine ${speed}s linear infinite`,
        WebkitBackgroundClip: 'text',
      }}
    >
      {content}
    </span>
  );
};
