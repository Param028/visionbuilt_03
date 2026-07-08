import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, ExternalLink } from 'lucide-react';
import { CarouselCategory, CarouselItem } from '../../types';
import { formatPrice } from '../../constants';
import BorderGlow from './BorderGlow';

interface ProductCarouselProps {
  category: CarouselCategory;
  items: CarouselItem[];
  userCountry?: string;
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({ category, items, userCountry = 'India' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const visibleItems = 3;
  const maxIndex = Math.max(0, items.length - visibleItems);

  const nextSlide = () => {
    if (currentIndex < maxIndex) {
      setDirection(1);
      setCurrentIndex(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(prev => prev - 1);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0,
      scale: 0.95
    })
  };

  if (items.length === 0) {
    return null;
  }

  const getCategoryIcon = (iconName?: string) => {
    const iconMap: Record<string, any> = {
      'Camera': '📷',
      'Video': '🎬',
      'Code': '💻',
      'Palette': '🎨',
      'Globe': '🌐',
      'Smartphone': '📱',
      'Layers': '📚',
      'Sparkles': '✨',
      'Rocket': '🚀',
      'Layout': '📐'
    };
    return iconMap[iconName || 'Layers'] || '📦';
  };

  return (
    <div className="w-full mb-12">
      {/* Category Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-2xl">
            {getCategoryIcon(category.icon)}
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-foreground">{category.name}</h2>
            {category.description && (
              <p className="text-xs text-foreground/40 font-satoshi mt-0.5">{category.description}</p>
            )}
          </div>
        </div>
        
        {/* Navigation Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className="w-10 h-10 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-center text-foreground/50 hover:text-foreground hover:border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={nextSlide}
            disabled={currentIndex >= maxIndex}
            className="w-10 h-10 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-center text-foreground/50 hover:text-foreground hover:border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative overflow-hidden" ref={containerRef}>
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
              scale: { duration: 0.2 }
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {items.slice(currentIndex, currentIndex + visibleItems).map((item) => (
              <BorderGlow
                key={item.id}
                className="h-full"
                glowColor="220 80 70"
                backgroundColor="#0F0F13"
                colors={['#8B5CF6', '#EC4899', '#3B82F6']}
                glowIntensity={0.8}
              >
                <div className="h-full flex flex-col p-6">
                  {/* Image */}
                  <div className="h-40 w-full rounded-lg overflow-hidden mb-4 bg-white/[0.02] border border-white/5">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-foreground/20">
                        <ExternalLink size={32} />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-lg font-display font-bold text-foreground mb-2">{item.title}</h3>
                    {item.description && (
                      <p className="text-sm text-foreground/50 font-satoshi line-clamp-2 mb-3">
                        {item.description}
                      </p>
                    )}

                    {/* Tags */}
                    {item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {item.tags.slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-satoshi font-medium px-2 py-0.5 tracking-widest uppercase border rounded-full bg-white/[0.02] border-white/5 text-foreground/60"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Features */}
                    {item.features.length > 0 && (
                      <ul className="space-y-1.5 mb-4">
                        {item.features.slice(0, 3).map((feature, i) => (
                          <li key={i} className="text-xs text-foreground/40 font-satoshi flex items-start gap-2">
                            <span className="text-[var(--vb-accent)] mt-0.5">•</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                    {item.price !== undefined && (
                      <div className="text-lg font-display font-bold text-foreground">
                        {formatPrice(item.price, userCountry)}
                      </div>
                    )}
                    {item.link_url && (
                      <a
                        href={item.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs font-satoshi font-semibold text-[var(--vb-accent)] hover:text-foreground transition-colors"
                      >
                        View Details <ArrowRight size={14} />
                      </a>
                    )}
                  </div>
                </div>
              </BorderGlow>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination Dots */}
      {items.length > visibleItems && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > currentIndex ? 1 : -1);
                setCurrentIndex(i);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentIndex
                  ? 'bg-[var(--vb-accent)] w-6'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductCarousel;
