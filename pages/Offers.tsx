
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag, Sparkles, Copy, Check, Calendar, AlertCircle, Percent } from 'lucide-react';
import { api } from '../services/api';
import { Offer, User } from '../types';
import { Button } from '../components/ui/Components';
import { Carousel, ScrollFloat, ShinyText } from '../components/ui/ReactBits';

const Offers: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOffers = async () => {
      const data = await api.getOffers();
      const currentUser = await api.getCurrentUser();
      setOffers(data);
      setUser(currentUser);
      setLoading(false);
    };
    fetchOffers();
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
      className: isExpired ? "grayscale opacity-75 border-red-500/20 bg-red-950/10" : "",
      content: (
        <div className="text-center h-full flex flex-col items-center justify-between relative w-full">
           <div className={`mt-4 p-4 rounded-full ${isExpired ? 'bg-gray-800 text-gray-500' : 'bg-vision-primary/10 text-vision-primary'}`}>
              <Sparkles size={32} />
           </div>
           
           {isExpired && (
               <div className="absolute top-0 right-0 z-20">
                    <div className="bg-red-500/20 border border-red-500/50 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-md">
                        Expired
                    </div>
               </div>
           )}

            {/* Percentage Badge */}
            {!isExpired && (
                <div className="absolute top-0 left-0 z-20">
                    <div className="flex items-center gap-1 bg-green-500/20 border border-green-500/50 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-md">
                        <Percent size={10} /> {offer.discountPercentage}% OFF
                    </div>
                </div>
            )}

           <div>
              <h3 className="text-2xl font-display font-bold text-white mb-2">{offer.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2">{offer.description}</p>
           </div>
           
           <div className={`w-full rounded-lg p-3 border flex items-center justify-between mb-2 ${isExpired ? 'bg-black/20 border-white/5' : 'bg-black/40 border-white/10'}`}>
               <code className={`font-mono text-lg font-bold tracking-wider ${isExpired ? 'text-gray-500' : 'text-vision-primary'}`}>{offer.code}</code>
               <button 
                 onClick={(e) => { e.stopPropagation(); if (!isExpired) handleCopy(offer.code, offer.id); }}
                 className={`transition-colors ${isExpired ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:text-white'}`}
                 disabled={isExpired}
               >
                  {copiedId === offer.id ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
               </button>
           </div>
  
           {offer.validUntil && (
               <div className={`flex items-center text-xs mb-4 px-3 py-1 rounded-full border ${isExpired ? 'text-gray-500 border-gray-700 bg-gray-800/20' : 'text-yellow-500/80 bg-yellow-500/5 border-yellow-500/20'}`}>
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
        <div className="w-8 h-8 border-4 border-vision-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-4 relative overflow-hidden">
      <div className="text-center mb-12 relative z-10">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            <ScrollFloat>Exclusive Offers</ScrollFloat>
        </h1>
        <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 backdrop-blur-md">
            <ShinyText className="text-sm font-medium tracking-wide" shimmerColor="#38bdf8">
                Limited Time Deals
            </ShinyText>
        </div>
      </div>

      <div className="relative z-10 mt-10">
         {offers.length > 0 ? (
             <Carousel items={carouselItems} />
         ) : (
             <div className="text-center py-20">
                 <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-8 h-8 text-gray-500" />
                 </div>
                 <h3 className="text-xl font-bold text-white mb-2">No Active Offers</h3>
                 <p className="text-gray-400">Check back later for new deals and discounts.</p>
             </div>
         )}
      </div>
      
      {offers.length > 0 && (
          <div className="text-center mt-12 text-sm text-gray-500 max-w-lg mx-auto">
             <p>Swipe or click arrows to explore offers. Click on a card to view details or copy the code to apply discount at checkout.</p>
          </div>
      )}
    </div>
  );
};

export default Offers;
