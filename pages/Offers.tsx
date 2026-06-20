
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Copy, Check, Calendar, Percent, Tag } from 'lucide-react';
import { api } from '../services/api';
import { Offer, User } from '../types';
import { Carousel } from '../components/ui/ReactBits';

const Offers: React.FC<{ user: User | null }> = ({ user }) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const timeoutId = setTimeout(() => {
      if (isMounted && loading) setLoading(false);
    }, 15000);

    const fetchOffers = async () => {
      try {
        const data = await api.getOffers();
        if (isMounted) setOffers(data);
      } catch (error) {
        console.error('Failed to fetch offers', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchOffers();
    return () => { isMounted = false; clearTimeout(timeoutId); };
  }, []);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const carouselItems = offers.map((offer) => {
    const today = new Date();
    let isExpired = false;
    if (offer.validUntil) {
      const expiryDate = new Date(offer.validUntil);
      expiryDate.setHours(23, 59, 59, 999);
      isExpired = expiryDate < today;
    }

    return {
      id: offer.id,
      className: isExpired ? 'opacity-60' : '',
      content: (
        <div className="relative h-full flex flex-col items-center text-center px-2 py-2 w-full">

          {/* Status badges */}
          {isExpired && (
            <div className="absolute top-0 right-0 z-20">
              <span
                className="text-[10px] font-satoshi font-bold px-2.5 py-0.5 tracking-widest uppercase border"
                style={{
                  color: 'rgba(239,68,68,0.7)',
                  borderColor: 'rgba(239,68,68,0.2)',
                  background: 'rgba(239,68,68,0.05)',
                }}
              >
                Expired
              </span>
            </div>
          )}

          {!isExpired && (
            <div className="absolute top-0 left-0 z-20">
              <span
                className="flex items-center gap-1 text-[10px] font-satoshi font-bold px-2.5 py-0.5 tracking-widest uppercase border"
                style={{
                  color: 'rgba(52,211,153,0.8)',
                  borderColor: 'rgba(52,211,153,0.2)',
                  background: 'rgba(52,211,153,0.05)',
                }}
              >
                <Percent size={9} /> {offer.discountPercentage}% OFF
              </span>
            </div>
          )}

          {/* Icon */}
          {/* Icon */}
          <div
            className="mt-4 mb-6 p-4 border"
            style={{
              borderColor: isExpired ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.10)',
              background: isExpired ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)',
              color: isExpired ? 'rgba(248,249,250,0.2)' : '#AAB7C4',
            }}
          >
            <Sparkles size={28} />
          </div>

          {/* Title + Description */}
          <h3 className="font-display font-bold text-foreground text-xl mb-2">{offer.title}</h3>
          <p className="text-[rgba(255,255,255,0.82)] text-sm leading-relaxed mb-5 line-clamp-2">
            {offer.description}
          </p>

          {/* Coupon code */}
          <div
            className="w-full flex items-center justify-between px-4 py-3 border mb-3"
            style={{
              borderColor: isExpired ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.10)',
              background: isExpired ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)',
            }}
          >
            <code
              className="font-mono text-base font-bold tracking-[0.15em]"
              style={{ color: isExpired ? 'rgba(248,249,250,0.25)' : '#F8F9FA' }}
            >
              {offer.code}
            </code>
            <button
              onClick={(e) => { e.stopPropagation(); if (!isExpired) handleCopy(offer.code, offer.id); }}
              className="transition-colors"
              disabled={isExpired}
              style={{ color: isExpired ? 'rgba(248,249,250,0.2)' : '#B8C4D0' }}
              aria-label={`Copy code ${offer.code}`}
            >
              <AnimatePresence mode="wait">
                {copiedId === offer.id ? (
                  <motion.div key="check" initial={{ scale: 0.7 }} animate={{ scale: 1 }} exit={{ scale: 0.7 }}>
                    <Check size={16} style={{ color: 'rgba(52,211,153,0.8)' }} />
                  </motion.div>
                ) : (
                  <motion.div key="copy" initial={{ scale: 0.7 }} animate={{ scale: 1 }} exit={{ scale: 0.7 }}>
                    <Copy size={16} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>

          {/* Expiry */}
          {offer.validUntil && (
            <div
              className="flex items-center text-[11px] font-satoshi gap-1.5 mb-5 px-3 py-1 border"
              style={{
                borderColor: isExpired ? 'rgba(255,255,255,0.05)' : 'rgba(251,191,36,0.2)',
                color: isExpired ? 'rgba(248,249,250,0.25)' : 'rgba(251,191,36,0.7)',
                background: isExpired ? 'transparent' : 'rgba(251,191,36,0.04)',
              }}
            >
              <Calendar size={10} />
              <span>
                {isExpired ? 'Expired' : 'Valid until'}{' '}
                {new Date(offer.validUntil).toLocaleDateString()}
              </span>
            </div>
          )}

          {/* CTA */}
          {(!user || user.role === 'client') && (
            <button
              onClick={(e) => { e.stopPropagation(); if (!isExpired) navigate('/services'); }}
              disabled={isExpired}
              className={isExpired ? 'btn-ghost !opacity-30 w-full justify-center !text-xs' : 'btn-primary w-full justify-center !text-xs'}
            >
              {isExpired ? 'Offer Expired' : 'Use This Offer'}
            </button>
          )}
        </div>
      ),
    };
  });

  return (
    <div className="min-h-screen">

      {/* ── PAGE HEADER ── */}
      <div
        className="relative border-b pt-20 pb-16 overflow-hidden"
        style={{ borderColor: 'rgba(255,255,255,0.10)' }}
      >
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[280px] pointer-events-none"
          aria-hidden="true"
          style={{
            background: 'radial-gradient(ellipse, rgba(124,143,161,0.06) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <div className="container-vb relative z-10 text-center">
          <motion.p
            className="text-label mb-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Limited Time
          </motion.p>
          <motion.h1
            className="text-display font-display font-bold text-foreground mb-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Exclusive Offers
          </motion.h1>
          <motion.p
            className="text-[rgba(255,255,255,0.82)] text-lg max-w-xl mx-auto leading-relaxed font-light"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Curated deals and limited-time discounts on our premium services.
          </motion.p>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="section-y">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div
              className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: 'rgba(124,143,161,0.3)', borderTopColor: 'var(--vb-accent)' }}
            />
          </div>
        ) : offers.length > 0 ? (
          <>
            <Carousel items={carouselItems} />
            <p className="text-center mt-10 text-foreground/20 text-xs font-satoshi tracking-wider">
              Swipe or use arrows to explore · Copy code to apply discount at checkout
            </p>
          </>
        ) : (
          <div className="container-vb">
            <div className="glass-card flex flex-col items-center justify-center text-center p-16 max-w-md mx-auto">
              <div
                className="mb-6 p-5 border"
                style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}
              >
                <Tag size={28} style={{ color: 'rgba(248,249,250,0.2)' }} />
              </div>
              <h3 className="font-display font-bold text-foreground text-xl mb-3">
                No Active Offers
              </h3>
              <p className="text-foreground/35 text-sm leading-relaxed">
                Check back later for new deals and discounts on our services.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Offers;
