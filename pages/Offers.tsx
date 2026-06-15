
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Copy, Check, Calendar, AlertCircle, Percent } from 'lucide-react';
import { api } from '../services/api';
import { Offer, User } from '../types';
import { Button } from '../components/ui/Components';
import { Carousel, ScrollFloat, ShinyText } from '../components/ui/ReactBits';

const Offers: React.FC<{ user: User | null }> = ({ user }) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    
    // Failsafe timeout increased to 15s
    const timeoutId = setTimeout(() => {
        if (isMounted && loading) {
            setLoading(false);
        }
    }, 15000);

    const fetchOffers = async () => {
      try {
        const data = await api.getOffers();
        if (isMounted) setOffers(data);
      } catch (error) {
        console.error("Failed to fetch offers", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchOffers();

    return () => {
        isMounted = false;
        clearTimeout(timeoutId);
    };
  }, []);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
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
      className: isExpired ? "grayscale opacity-75 border-rose-500/20 bg-rose-950/10" : "",
      content: (
        <div className="text-center h-full flex flex-col items-center justify-between relative w-full">
           <div className={`mt-4 p-4 rounded-full ${isExpired ? 'bg-secondary text-foreground/40' : 'bg-foreground/10 text-foreground'}`}>
              <Sparkles size={32} />
           </div>
           
           {isExpired && (
               <div className="absolute top-0 right-0 z-20">
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-md">
                        Expired
                    </div>
               </div>
           )}
 
            {/* Percentage Badge */}
            {!isExpired && (
                <div className="absolute top-0 left-0 z-20">
                    <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-md">
                        <Percent size={10} /> {offer.discountPercentage}% OFF
                    </div>
                </div>
            )}
 
            <div>
              <h3 className="text-2xl font-display font-bold text-foreground mb-2">{offer.title}</h3>
              <p className="text-foreground/75 text-sm leading-relaxed mb-4 line-clamp-2">{offer.description}</p>
            </div>
           
            <div className={`w-full rounded-lg p-3 border flex items-center justify-between mb-2 ${isExpired ? 'bg-secondary/40 border-divider' : 'bg-content1 border-divider shadow-sm'}`}>
                <code className={`font-mono text-lg font-bold tracking-wider ${isExpired ? 'text-foreground/40' : 'text-foreground'}`}>{offer.code}</code>
                <button 
                  onClick={(e) => { e.stopPropagation(); if (!isExpired) handleCopy(offer.code, offer.id); }}
                  className={`transition-colors ${isExpired ? 'text-foreground/30 cursor-not-allowed' : 'text-foreground/60 hover:text-foreground'}`}
                  disabled={isExpired}
                >
                   {copiedId === offer.id ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                </button>
            </div>
   
            {offer.validUntil && (
                <div className={`flex items-center text-xs mb-4 px-3 py-1 rounded-full border ${isExpired ? 'text-foreground/40 border-divider bg-secondary/10' : 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20'}`}>
                    <Calendar size={12} className="mr-1.5" />
                    <span>{isExpired ? 'Expired on ' : 'Valid until '}{new Date(offer.validUntil).toLocaleDateString()}</span>
                </div>
            )}
  
           {(!user || user.role === 'client') && (
               <Button 
                  className="w-full" 
                  onClick={(e) => { e.stopPropagation(); if(!isExpired) navigate('/services'); }}
                  disabled={isExpired}
                  variant={isExpired ? 'secondary' : 'primary'}
               >
                  {isExpired ? 'Offer Expired' : 'Use Now'}
               </Button>
           )}
        </div>
      )
    };
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-foreground border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-4 relative overflow-hidden">
      <div className="text-center mb-12 relative z-10">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            <ScrollFloat>Exclusive Offers</ScrollFloat>
        </h1>
        <div className="inline-flex items-center space-x-2 bg-content1 border border-divider rounded-full px-4 py-1.5 backdrop-blur-md shadow-sm">
            <ShinyText className="text-sm font-semibold tracking-wide text-foreground" shimmerColor="#ffffff">
                Limited Time Deals
            </ShinyText>
        </div>
      </div>

      <div className="relative z-10 mt-10">
         {offers.length > 0 ? (
             <Carousel items={carouselItems} />
         ) : (
             <div className="text-center py-20 bg-content1 border border-divider rounded-2xl p-8 max-w-md mx-auto shadow-sm">
                  <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                     <AlertCircle className="w-8 h-8 text-foreground/45" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">No Active Offers</h3>
                  <p className="text-foreground/70 text-sm">Check back later for new deals and discounts.</p>
             </div>
         )}
      </div>
      
      {offers.length > 0 && (
          <div className="text-center mt-12 text-sm text-foreground/50 max-w-lg mx-auto">
             <p>Swipe or click arrows to explore offers. Click on a card to view details or copy the code to apply discount at checkout.</p>
          </div>
      )}
    </div>
  );
};

export default Offers;
