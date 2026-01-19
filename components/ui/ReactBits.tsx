
import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence, Variants } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Tag, Check, ChevronLeft, ChevronRight } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper to check if we are on a mobile device for performance optimization
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
};

// --- 0. ScrollFloat ---
export const ScrollFloat: React.FC<{
  children: React.ReactNode;
  className?: string;
  animationDuration?: number;
  delay?: number;
  stagger?: number;
}> = ({ 
  children,
  className, 
  animationDuration = 0.5, 
  delay = 0, 
  stagger = 0.02 
}) => {
  const isMobile = useIsMobile();
  const text = typeof children === 'string' ? children : String(children || '');
  
  // If mobile, don't split by characters to save DOM nodes and CPU
  if (isMobile) {
    return (
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay }}
        className={cn("inline-flex flex-wrap", className)}
      >
        {text}
      </motion.h2>
    );
  }

  const chars = text.split('');

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      }
    }
  };

  const charVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      rotateX: -90,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      rotateX: 0,
      scale: 1,
      transition: { 
        type: "spring",
        damping: 20,
        stiffness: 100,
        duration: animationDuration 
      }
    }
  };

  return (
    <motion.h2
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10%" }}
      variants={containerVariants}
      className={cn("inline-flex flex-wrap", className)}
    >
      {chars.map((char, i) => (
        <motion.span
          key={i}
          variants={charVariants}
          style={{ 
            display: "inline-block",
            whiteSpace: char === ' ' ? 'pre' : 'normal',
            transformStyle: "preserve-3d"
          }}
        >
          {char}
        </motion.span>
      ))}
    </motion.h2>
  );
};

// --- 0.2 CountUp ---
export const CountUp: React.FC<{
  to: number;
  from?: number;
  direction?: "up" | "down";
  delay?: number;
  duration?: number;
  className?: string;
  startWhen?: boolean;
  separator?: string;
  decimals?: number;
}> = ({
  to,
  from = 0,
  direction = "up",
  delay = 0,
  duration: _duration = 2,
  className = "",
  startWhen = true,
  separator = "",
  decimals = 0,
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(direction === "down" ? to : from);

  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  });

  useEffect(() => {
    if (startWhen) {
      setTimeout(() => {
        motionValue.set(direction === "down" ? from : to);
      }, delay * 1000);
    }
  }, [motionValue, startWhen, to, from, direction, delay]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Intl.NumberFormat("en-US", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })
          .format(latest)
          .replace(/,/g, separator);
      }
    });

    return () => unsubscribe();
  }, [springValue, separator, decimals]);

  return <span className={className} ref={ref} />;
};

// --- 0.5 Carousel ---
interface CarouselItem {
  id: string;
  content: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const Carousel: React.FC<{ items: CarouselItem[] }> = ({ items }) => {
  const [active, setActive] = useState(0);
  const count = items.length;

  const handleNext = () => {
    setActive((prev) => (prev + 1) % count);
  };

  const handlePrev = () => {
    setActive((prev) => (prev - 1 + count) % count);
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto h-[400px] flex items-center justify-center perspective-1000">
      <div className="relative w-full h-full flex items-center justify-center transform-style-3d">
        <AnimatePresence mode='popLayout'>
          {items.map((item, index) => {
            let offset = (index - active + count) % count;
            if (offset > count / 2) offset -= count;
            if (Math.abs(offset) > 2) return null;

            const isActive = offset === 0;

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: isActive ? 1 : 0.5,
                  scale: isActive ? 1 : 0.8,
                  zIndex: isActive ? 10 : 10 - Math.abs(offset),
                  x: `${offset * 60}%`,
                  rotateY: `${-offset * 15}deg`,
                  filter: isActive ? 'blur(0px)' : 'blur(2px)',
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                }}
                className={cn(
                  "absolute w-[300px] md:w-[400px] h-[300px] bg-black/40 border border-white/10 backdrop-blur-xl rounded-2xl p-6 flex flex-col items-center justify-center shadow-2xl cursor-pointer",
                  isActive ? "border-vision-primary/50 shadow-[0_0_30px_rgba(6,182,212,0.2)]" : "hover:bg-white/5",
                  item.className
                )}
                onClick={() => {
                   if (isActive && item.onClick) item.onClick();
                   else if (!isActive) setActive(index);
                }}
              >
                {item.content}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <button 
        onClick={handlePrev} 
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md transition-all z-20 text-white hover:text-vision-primary"
      >
        <ChevronLeft size={24} />
      </button>
      <button 
        onClick={handleNext} 
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md transition-all z-20 text-white hover:text-vision-primary"
      >
        <ChevronRight size={24} />
      </button>
      
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
         {items.map((_, i) => (
            <button 
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300", 
                  i === active ? "bg-vision-primary w-6" : "bg-gray-600 hover:bg-gray-400"
              )}
            />
         ))}
      </div>
    </div>
  );
};

// --- 0.7 LogoLoop ---
interface LogoLoopItem {
  id: string;
  logo: string;
  name: string;
  url?: string;
}

export const LogoLoop: React.FC<{ items: LogoLoopItem[] }> = ({ items }) => {
  return (
    <div className="relative w-full overflow-hidden py-10">
      <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-vision-900 to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-vision-900 to-transparent pointer-events-none" />
      
      <style>{`
        @keyframes logo-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .logo-loop-track {
          display: flex;
          width: max-content;
          animation: logo-scroll 40s linear infinite;
        }
        @media (hover: hover) {
          .logo-loop-track:hover {
            animation-play-state: paused;
          }
        }
      `}</style>

      <div className="logo-loop-track">
        {[...items, ...items].map((item, idx) => (
          <a 
            key={`${item.id}-${idx}`} 
            href={item.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center group pr-16"
          >
             <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center opacity-40 group-hover:opacity-100 filter grayscale group-hover:grayscale-0 transition-all duration-300 ease-out transform group-hover:scale-110">
                <img 
                  src={item.logo} 
                  alt={item.name} 
                  className="max-w-full max-h-full object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] group-hover:drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]" 
                />
             </div>
          </a>
        ))}
      </div>
    </div>
  );
};

// --- 0.75 ProjectLoop (Project Previews) ---
interface ProjectLoopItem {
  id: string;
  image: string;
  title: string;
  url?: string;
}

export const ProjectLoop: React.FC<{ items: ProjectLoopItem[] }> = ({ items }) => {
   return (
    <div className="relative w-full overflow-hidden py-10 bg-black/20">
      <div className="absolute left-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-r from-vision-900 to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-l from-vision-900 to-transparent pointer-events-none" />
      
      <style>{`
        @keyframes project-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .project-loop-track {
          display: flex;
          width: max-content;
          animation: project-scroll 60s linear infinite;
        }
        @media (hover: hover) {
          .project-loop-track:hover {
            animation-play-state: paused;
          }
        }
      `}</style>

      <div className="project-loop-track">
        {[...items, ...items, ...items].map((item, idx) => (
          <Link 
            key={`${item.id}-${idx}`} 
            to={item.url || '#'}
            className="flex flex-col items-center justify-center group px-4"
          >
             <div className="w-[280px] h-[160px] md:w-[400px] md:h-[225px] rounded-xl overflow-hidden border border-white/10 relative shadow-lg bg-vision-900 group-hover:border-vision-primary/50 transition-all duration-300">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 filter grayscale group-hover:grayscale-0" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                     <span className="text-white font-bold truncate w-full">{item.title}</span>
                </div>
             </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

// --- 0.8 GlareCard ---
export const GlareCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  const isMobile = useIsMobile();
  const refElement = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  // Disable expensive tilt on mobile
  if (isMobile) {
    return (
      <div className={cn("rounded-xl border border-white/10 bg-black/40 shadow-xl overflow-hidden", className)}>
        {children}
      </div>
    );
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!refElement.current) return;
    const rect = refElement.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    const x = (offsetX / rect.width) * 100;
    const y = (offsetY / rect.height) * 100;

    const rotateX = ((offsetY / rect.height) - 0.5) * 20;
    const rotateY = ((offsetX / rect.width) - 0.5) * -20;

    setRotate({ x: rotateX, y: rotateY });
    setGlare({ x, y, opacity: 1 });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setGlare(prev => ({ ...prev, opacity: 0 }));
  };

  return (
    <div 
        ref={refElement}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={cn("relative isolate [perspective:600px] transition-transform duration-300 ease-out will-change-transform", className)}
    >
        <motion.div 
            className="w-full h-full relative preserve-3d"
            animate={{ rotateX: rotate.x, rotateY: rotate.y }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
            <div className="w-full h-full overflow-hidden rounded-xl border border-white/10 bg-black/40 shadow-xl backdrop-blur-sm">
                 {children}
            </div>
            <div 
                className="absolute inset-0 rounded-xl pointer-events-none overflow-hidden mix-blend-overlay"
                style={{
                    background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.6), transparent 50%)`,
                    opacity: glare.opacity,
                    transition: 'opacity 0.3s ease'
                }}
            />
             <div 
                className="absolute inset-0 rounded-xl pointer-events-none border border-white/20"
                style={{
                    opacity: glare.opacity,
                    transition: 'opacity 0.3s ease'
                }}
            />
        </motion.div>
    </div>
  );
};


// --- 1. Particles ---
interface ParticlesProps {
  className?: string;
  quantity?: number;
  staticity?: number;
  ease?: number;
  refresh?: boolean;
  vx?: number;
  vy?: number;
}

export const Particles: React.FC<ParticlesProps> = ({
  className = "",
  quantity = 30,
  staticity = 50,
  ease = 50,
  refresh = false,
  vx = 0.1,
  vy = 0.1,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const circles = useRef<any[]>([]);
  const mouse = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasSize = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
  const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio, 1.5) : 1; // Limit DPR for performance
  const rafID = useRef<number | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      context.current = canvasRef.current.getContext("2d");
    }
    initCanvas();
    animate();
    window.addEventListener("resize", initCanvas);

    return () => {
      window.removeEventListener("resize", initCanvas);
      if (rafID.current) {
        window.cancelAnimationFrame(rafID.current);
      }
    };
  }, [refresh, quantity]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const { w, h } = canvasSize.current;
        const x = e.clientX - rect.left - w / 2;
        const y = e.clientY - rect.top - h / 2;
        const inside = x < w / 2 && x > -w / 2 && y < h / 2 && y > -h / 2;
        if (inside) {
          mouse.current.x = x;
          mouse.current.y = y;
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const initCanvas = () => {
    resizeCanvas();
    drawParticles();
  };

  const resizeCanvas = () => {
    if (canvasContainerRef.current && canvasRef.current && context.current) {
      circles.current.length = 0;
      canvasSize.current.w = canvasContainerRef.current.offsetWidth;
      canvasSize.current.h = canvasContainerRef.current.offsetHeight;
      canvasRef.current.width = canvasSize.current.w * dpr;
      canvasRef.current.height = canvasSize.current.h * dpr;
      canvasRef.current.style.width = `${canvasSize.current.w}px`;
      canvasRef.current.style.height = `${canvasSize.current.h}px`;
      context.current.scale(dpr, dpr);
    }
  };

  const circleParams = () => {
    const x = Math.floor(Math.random() * canvasSize.current.w);
    const y = Math.floor(Math.random() * canvasSize.current.h);
    const translateX = 0;
    const translateY = 0;
    const size = Math.floor(Math.random() * 2) + 0.5;
    const alpha = 0;
    const targetAlpha = parseFloat((Math.random() * 0.4 + 0.1).toFixed(1)); // Lower opacity
    const dx = (Math.random() - 0.5) * vx;
    const dy = (Math.random() - 0.5) * vy;
    const magnetism = 0.1 + Math.random() * 4;
    return {
      x,
      y,
      translateX,
      translateY,
      size,
      alpha,
      targetAlpha,
      dx,
      dy,
      magnetism,
    };
  };

  const drawParticles = () => {
    clearContext();
    const particleCount = quantity;
    for (let i = 0; i < particleCount; i++) {
      const circle = circleParams();
      drawCircle(circle);
    }
  };

  const drawCircle = (circle: any, update = false) => {
    if (context.current) {
      const { x, y, translateX, translateY, size, alpha } = circle;
      context.current.translate(translateX, translateY);
      context.current.beginPath();
      context.current.arc(x, y, size, 0, 2 * Math.PI);
      context.current.fillStyle = `rgba(6, 182, 212, ${alpha})`;
      context.current.fill();
      context.current.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (!update) {
        circles.current.push(circle);
      }
    }
  };

  const clearContext = () => {
    if (context.current) {
      context.current.clearRect(
        0,
        0,
        canvasSize.current.w,
        canvasSize.current.h,
      );
    }
  };

  const animate = () => {
    clearContext();
    circles.current.forEach((circle: any, i: number) => {
      const edge = [
        circle.x + circle.translateX - circle.size,
        canvasSize.current.w - circle.x - circle.translateX - circle.size,
        circle.y + circle.translateY - circle.size,
        canvasSize.current.h - circle.y - circle.translateY - circle.size,
      ];
      const closestEdge = edge.reduce((a, b) => Math.min(a, b));
      const remapClosestEdge = parseFloat(
        remapValue(closestEdge, 0, 20, 0, 1).toFixed(2),
      );
      if (remapClosestEdge > 1) {
        circle.alpha += 0.02;
        if (circle.alpha > circle.targetAlpha) {
          circle.alpha = circle.targetAlpha;
        }
      } else {
        circle.alpha = circle.targetAlpha * remapClosestEdge;
      }
      circle.x += circle.dx;
      circle.y += circle.dy;
      circle.translateX +=
        (mouse.current.x / (staticity / circle.magnetism) - circle.translateX) /
        ease;
      circle.translateY +=
        (mouse.current.y / (staticity / circle.magnetism) - circle.translateY) /
        ease;

      if (
        circle.x < -circle.size ||
        circle.x > canvasSize.current.w + circle.size ||
        circle.y < -circle.size ||
        circle.y > canvasSize.current.h + circle.size
      ) {
        circles.current.splice(i, 1);
        const newCircle = circleParams();
        drawCircle(newCircle);
      } else {
        drawCircle(circle, true);
      }
    });
    rafID.current = window.requestAnimationFrame(animate);
  };

  const remapValue = (
    value: number,
    start1: number,
    end1: number,
    start2: number,
    end2: number,
  ) => {
    const remapped =
      ((value - start1) * (end2 - start2)) / (end1 - start1) + start2;
    return remapped > 0 ? remapped : 0;
  };

  return (
    <div className={cn("pointer-events-none", className)} ref={canvasContainerRef} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
};

// --- 2. Gradient Text ---
export const GradientText: React.FC<{
  children: React.ReactNode;
  className?: string;
  colors?: string[];
  animationSpeed?: number;
}> = ({
  children,
  className,
  colors = ["#06b6d4", "#8b5cf6", "#3b82f6", "#06b6d4"],
  animationSpeed: _animationSpeed = 8,
}) => {
  const gradientStyle = {
    backgroundImage: `linear-gradient(to right, ${colors.join(", ")})`,
    backgroundSize: "200% auto",
  } as React.CSSProperties;

  return (
    <div
      className={cn("relative mx-auto flex max-w-fit flex-row items-center justify-center font-display font-bold", className)}
    >
      <div
        className={cn(
          "bg-clip-text text-transparent animate-gradient-x",
          className
        )}
        style={{
          ...gradientStyle,
        }}
      >
        {children}
      </div>
    </div>
  );
};

// --- 3. Shiny Text ---
export const ShinyText: React.FC<{
  children: React.ReactNode;
  className?: string;
  shimmerColor?: string;
}> = ({ children, className, shimmerColor = "rgba(255, 255, 255, 0.8)" }) => {
  return (
    <span
      className={cn(
        "inline-block bg-clip-text text-transparent bg-[linear-gradient(110deg,#a1a1aa,45%,var(--shimmer),55%,#a1a1aa)] bg-[length:200%_100%] animate-shine",
        className
      )}
      style={{
        "--shimmer": shimmerColor,
      } as React.CSSProperties}
    >
      {children}
    </span>
  );
};

// --- 4. Pill Nav ---
interface PillNavItem {
  name: string;
  path: string;
  onClick?: () => void;
}

export const PillNav: React.FC<{ items: PillNavItem[], className?: string }> = ({ items, className }) => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(items.find(i => location.pathname === i.path)?.name || items[0].name);

  useEffect(() => {
    const current = items.find(i => location.pathname.startsWith(i.path) && i.path !== '/') || items.find(i => i.path === location.pathname);
    if(current) setActiveTab(current.name);
  }, [location.pathname, items]);

  return (
    <div className={cn("flex space-x-1 p-1 bg-white/5 backdrop-blur-sm rounded-full border border-white/10", className)}>
      {items.map((item) => (
        <Link
          key={item.name}
          to={item.path}
          onClick={() => {
            setActiveTab(item.name);
            item.onClick && item.onClick();
          }}
          className={cn(
            "relative cursor-pointer px-4 py-1.5 text-sm font-medium rounded-full outline-sky-400 transition focus-visible:outline-2",
            "text-gray-400 hover:text-white"
          )}
          style={{
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {activeTab === item.name && (
            <motion.div
              layoutId="pill-nav-indicator"
              className="absolute inset-0 z-10 bg-white/10 rounded-full border border-white/10 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
              }}
            />
          )}
          <span className={cn("relative z-20 transition-colors", activeTab === item.name ? "text-white" : "")}>
            {item.name}
          </span>
        </Link>
      ))}
    </div>
  );
};

// --- 5. Magic Bento ---
export const MagicBento: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[minmax(180px,auto)]", className)}>
      {children}
    </div>
  );
};

export const MagicBentoItem: React.FC<{
  children: React.ReactNode;
  className?: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  colSpan?: number;
}> = ({ children, className, title, description, icon, colSpan = 1 }) => {
  const isMobile = useIsMobile();
  return (
    <motion.div
      whileHover={isMobile ? {} : { scale: 1.02 }}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-white/10 bg-black/40 p-6 shadow-2xl backdrop-blur-sm hover:border-vision-primary/30 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all duration-300",
        colSpan === 2 ? "md:col-span-2" : "md:col-span-1",
        className
      )}
    >
      {!isMobile && <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-vision-primary/20 to-vision-secondary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />}
      
      <div className="relative z-10 h-full flex flex-col justify-between">
        <div>
           <div className="mb-4 w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-vision-primary group-hover:scale-110 transition-transform duration-300">
             {icon}
           </div>
           <h3 className="text-lg font-display font-bold text-white mb-2 group-hover:text-vision-primary transition-colors">
             <ScrollFloat animationDuration={0.4} delay={0.1}>{title}</ScrollFloat>
           </h3>
           <p className="text-sm text-gray-400 leading-relaxed">
             {description}
           </p>
        </div>
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center text-xs text-gray-500 font-medium group-hover:text-vision-primary transition-colors">
            {children}
        </div>
      </div>
    </motion.div>
  );
};

// --- 6. CardNav ---
export const TiltedCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  const isMobile = useIsMobile();
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x);
  const mouseY = useSpring(y);

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-12deg", "12deg"]);

  if (isMobile) {
    return <div className={className}>{children}</div>;
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXFromCenter = e.clientX - rect.left - width / 2;
    const mouseYFromCenter = e.clientY - rect.top - height / 2;
    x.set(mouseXFromCenter / width);
    y.set(mouseYFromCenter / height);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn("relative transform-gpu", className)}
    >
      <div
        style={{
          transform: "translateZ(50px)",
        }}
        className="h-full w-full"
      >
        {children}
      </div>
    </motion.div>
  );
};

// --- 7. StaggeredMenu ---
export const StaggeredMenu: React.FC<{
  items: { id: string; title: string; subtitle?: string; onClick?: () => void }[];
  triggerLabel?: string;
}> = ({ items, triggerLabel = "Offers" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);

  const menuVariants: Variants = {
    open: {
      clipPath: "inset(0% 0% 0% 0% round 10px)",
      transition: {
        type: "spring",
        bounce: 0,
        duration: 0.7,
        delayChildren: 0.3,
        staggerChildren: 0.05
      }
    },
    closed: {
      clipPath: "inset(10% 50% 90% 50% round 10px)",
      transition: {
        type: "spring",
        bounce: 0,
        duration: 0.3
      }
    }
  };

  const itemVariants: Variants = {
    open: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    },
    closed: { opacity: 0, y: 20, transition: { duration: 0.2 } }
  };

  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={toggleMenu}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-vision-primary to-vision-secondary text-white rounded-lg font-medium shadow-lg hover:shadow-cyan-500/20 transition-all border border-white/10"
      >
        <Tag size={16} />
        {triggerLabel}
        <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
        >
            <ChevronDown size={16} />
        </motion.div>
      </motion.button>
      
      <motion.ul
        initial={false}
        animate={isOpen ? "open" : "closed"}
        variants={menuVariants}
        className="absolute top-full mt-2 right-0 w-72 bg-vision-900/95 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl z-50 origin-top-right flex flex-col gap-2"
        style={{ pointerEvents: isOpen ? "auto" : "none" }}
      >
        {items.length === 0 && (
             <motion.li variants={itemVariants} className="text-gray-400 text-center text-sm py-2">
                 No active offers at the moment.
             </motion.li>
        )}
        {items.map((item) => (
          <motion.li
            key={item.id}
            variants={itemVariants}
            className="p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer border border-white/5 hover:border-vision-primary/30 transition-colors"
            onClick={item.onClick}
          >
             <div className="font-bold text-vision-primary flex justify-between items-center">
                 <ScrollFloat animationDuration={0.3} delay={0.1}>{item.title}</ScrollFloat>
             </div>
             {item.subtitle && <div className="text-xs text-gray-400 mt-1">{item.subtitle}</div>}
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
};

// --- 8. Stepper ---
export const Stepper: React.FC<{
  steps: { id: number; label: string }[];
  currentStep: number;
}> = ({ steps, currentStep }) => {
  return (
    <div className="w-full flex flex-col items-center py-6">
      <div className="relative w-full flex justify-between items-center z-0">
        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/10 -translate-y-1/2 rounded-full" />
        <motion.div 
            className="absolute top-1/2 left-0 h-[2px] bg-vision-primary -translate-y-1/2 rounded-full origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: Math.max(0, Math.min(1, (currentStep - 1) / (steps.length - 1))) }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{ width: "100%" }}
        />
        
        {steps.map((step) => {
           const isActive = currentStep === step.id;
           const isCompleted = currentStep > step.id;
           
           return (
             <div key={step.id} className="relative z-10 flex flex-col items-center">
                <motion.div
                   className={cn(
                     "w-10 h-10 rounded-full border-2 flex items-center justify-center bg-vision-900 transition-colors duration-300",
                     isActive || isCompleted ? "border-vision-primary text-vision-primary shadow-[0_0_15px_rgba(6,182,212,0.5)]" : "border-white/10 text-gray-500",
                     isCompleted ? "bg-vision-primary text-vision-900" : ""
                   )}
                   animate={{
                      scale: isActive ? 1.2 : 1,
                      backgroundColor: isCompleted ? "#06b6d4" : "#020617",
                   }}
                >
                   {isCompleted ? <Check size={20} /> : <span className="text-sm font-bold">{step.id}</span>}
                </motion.div>
                <div className="absolute top-14 left-1/2 -translate-x-1/2 w-20 md:w-32 text-center">
                    <span className={cn(
                        "text-[10px] md:text-xs font-semibold uppercase tracking-wider transition-colors duration-300 block",
                        isActive ? "text-vision-primary" : isCompleted ? "text-white" : "text-gray-600"
                    )}>
                        <ScrollFloat>{step.label}</ScrollFloat>
                    </span>
                </div>
             </div>
           );
        })}
      </div>
    </div>
  );
};
