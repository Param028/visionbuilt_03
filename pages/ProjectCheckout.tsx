import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { MarketplaceItem, User, Offer } from '../types';
import { formatPrice } from '../constants';
import { Badge } from '../components/ui/Components';
import { Stepper } from '../components/ui/ReactBits';
import { TicketPercent, X, Loader2, Shield, Eye, ImageIcon, User as UserIcon, Gift, Rocket, ChevronLeft } from 'lucide-react';
import { useToast } from '../components/ui/Toast';
import { motion } from 'framer-motion';

const ProjectCheckout: React.FC<{ user: User }> = ({ user }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [item, setItem] = useState<MarketplaceItem | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedOffer, setAppliedOffer] = useState<Offer | null>(null);
  const [isValidatingOffer, setIsValidatingOffer] = useState(false);
  const [offerError, setOfferError] = useState<string | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);

  useEffect(() => {
    if (id) {
      api.getMarketplaceItemById(id).then(data => {
          setItem(data || null);
          if (data?.image_url) setSelectedImage(data.image_url);
      });
    }
  }, [id]);

  const handleApplyCoupon = async () => {
      if (!couponCode.trim()) return;
      setIsValidatingOffer(true);
      setOfferError(null);
      setAppliedOffer(null);

      const offer = await api.validateOffer(couponCode.toUpperCase());
      if (offer) {
          setAppliedOffer(offer);
          toast.success("Coupon applied!");
      } else {
          setOfferError('Invalid or expired coupon code.');
      }
      setIsValidatingOffer(false);
  };

  const removeCoupon = () => {
      setAppliedOffer(null);
      setCouponCode('');
      setOfferError(null);
  };

  // Logic: Item is free if explicitly categorized as Free Projects OR has a valid free_until date
  const isFreeProject = item?.category === 'Free Projects';
  const isFreeLimitedTime = item?.free_until && new Date(item.free_until) > new Date();
  const isZeroCost = isFreeProject || isFreeLimitedTime;

  const calculateTotal = () => {
      if (!item) return { total: 0, discount: 0, final: 0 };
      
      let base = item.price;
      
      // If free, override price
      if (isZeroCost) {
          return { total: 0, discount: item.price, final: 0 };
      }

      let discount = 0;
      if (appliedOffer) {
          discount = base * (appliedOffer.discountPercentage / 100);
      }

      return {
          total: base,
          discount: discount,
          final: base - discount
      };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (item) {
        setIsProcessing(true);
        setProcessingStep(1); // Payment/Verification

        try {
             const { final, discount } = calculateTotal();
             
             await api.createOrder({
                user_id: user.id,
                type: 'project',
                project_id: item.id,
                service_title: item.title,
                domain_requested: false,
                business_email_requested: false,
                total_amount: final,
                discount_amount: discount,
                applied_offer_code: appliedOffer?.code,
                requirements: {
                    business_name: 'Instant Purchase',
                    business_category: 'N/A',
                    address_or_online: 'N/A',
                    requirements_text: isZeroCost ? 'Free Download' : 'Marketplace Purchase',
                    reference_links: ''
                }
            });
            
            setProcessingStep(4);
            toast.success("Success! Redirecting to files...");
            setTimeout(() => navigate('/dashboard'), 1000);

        } catch (error: any) {
             console.error(error);
             setIsProcessing(false);
             if (error.message && error.message.includes("VITE_RAZORPAY_KEY_ID")) {
                toast.error("Deployment Error: Razorpay Key missing.");
             } else {
                toast.error(error.message || "Transaction failed.");
             }
        }
    }
  };

  if (isProcessing) {
     return (
        <div className="min-h-[85vh] flex items-center justify-center px-4 relative overflow-hidden">
            {/* Ambient Glow */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
              style={{
                width: '600px', height: '600px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(124,143,161,0.08) 0%, transparent 70%)',
                filter: 'blur(60px)',
              }}
            />
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-2xl p-12 text-center glass-card relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[var(--vb-accent)] to-transparent animate-pulse" />
                
                <h2 className="text-3xl font-display font-bold text-foreground mb-2">
                  {isZeroCost ? 'Preparing Access' : 'Processing Order'}
                </h2>
                <p className="text-foreground/45 text-sm mb-12">Generating secure assets & configuration...</p>
                
                <div className="max-w-xl mx-auto px-4">
                     <Stepper 
                        currentStep={processingStep}
                        steps={[
                            { id: 1, label: isZeroCost ? "Verifying" : "Payment" },
                            { id: 2, label: isZeroCost ? "Accessing" : "Verifying" },
                            { id: 3, label: "Generating" },
                            { id: 4, label: "Complete" }
                        ]}
                     />
                </div>
            </motion.div>
        </div>
     )
  }

  if (!item) return <div className="p-20 text-center text-foreground/30 font-satoshi">Loading Project Details...</div>;

  const { total, discount, final } = calculateTotal();
  const allImages = item.image_url ? [item.image_url, ...(item.preview_images || [])] : (item.preview_images || []);
  const country = user.country;

  return (
    <div className="min-h-screen relative overflow-hidden py-12">
      {/* Ambient background glow */}
      <div
        className="absolute top-0 right-1/4 pointer-events-none"
        aria-hidden="true"
        style={{
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,143,161,0.03) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      <div className="container-vb relative z-10">
        {/* Back Link */}
        <div className="mb-8">
          <button 
            onClick={() => navigate('/marketplace')}
            className="flex items-center gap-2 text-foreground/40 hover:text-foreground transition-colors font-satoshi text-sm group"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Marketplace</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* LEFT: Project Details & Visuals */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <Badge variant="default" className="border-black/5 bg-black/2">
                  <UserIcon size={12} className="mr-1 inline-block text-foreground/45" />
                  <span className="text-foreground/75 font-satoshi">{item.developer_name}</span>
                </Badge>
                {isFreeLimitedTime && <Badge variant="success">FREE LIMITED TIME</Badge>}
                {isFreeProject && <Badge variant="success">FREE PROJECT</Badge>}
              </div>
              <h1 className="text-4xl font-display font-bold text-foreground mb-4 leading-tight">
                {item.title}
              </h1>
            </div>

            {/* Main Preview Image */}
            <div className="relative rounded-xl overflow-hidden border border-black/10 bg-[#EEF1F4] aspect-video group shadow-2xl">
              {selectedImage ? (
                <img 
                  src={selectedImage} 
                  alt="Preview" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-foreground/20">
                  <ImageIcon size={48} />
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {allImages.map((img, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setSelectedImage(img)}
                    className={`w-24 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all relative ${
                      selectedImage === img 
                        ? 'border-[var(--vb-accent)] opacity-100 scale-95' 
                        : 'border-transparent opacity-45 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Demo Link button for quick preview */}
            {item.demo_url && (
              <button 
                onClick={() => window.open(item.demo_url, '_blank')}
                className="w-full flex items-center justify-center gap-2 py-4 border border-black/10 bg-white/50 hover:bg-white/80 text-foreground/80 hover:text-foreground font-satoshi text-sm transition-all"
              >
                <Eye size={16} />
                <span>Open Live Project Demo</span>
              </button>
            )}

            {/* Detailed Description */}
            <div className="border-t border-black/10 pt-8 space-y-4">
              <h3 className="font-display font-semibold text-foreground text-lg">Project Details</h3>
              <p className="text-foreground/60 leading-relaxed text-sm font-satoshi">
                {item.full_description}
              </p>
            </div>
          </div>

          {/* RIGHT: Checkout Summary Card */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="glass-card p-8 md:p-10 space-y-8">
              <div>
                <h2 className="text-xl font-display font-bold text-foreground mb-1.5">
                  {isZeroCost ? 'Instant Access' : 'License Selection'}
                </h2>
                <p className="text-foreground/40 text-xs font-satoshi">
                  {isZeroCost ? 'Download full source files instantly.' : 'Complete your transaction to unlock project repository.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div 
                  className="p-5 border space-y-4"
                  style={{ borderColor: 'rgba(0,0,0,0.08)', background: '#EEF1F4' }}
                >
                  <div className="flex justify-between items-center text-sm font-satoshi text-foreground/80">
                    <span>Standard Developer License</span>
                    <span className={isZeroCost ? "text-foreground/30 line-through" : "font-bold text-foreground"}>
                      {formatPrice(item.price, country)}
                    </span>
                  </div>

                  {/* Coupon Input Area */}
                  {!isZeroCost && (
                    <div className="border-t border-black/10 pt-4">
                      {appliedOffer ? (
                        <div className="flex justify-between items-center bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-lg">
                          <div className="flex items-center gap-2">
                            <TicketPercent size={16} className="text-emerald-400" />
                            <span className="text-emerald-400 text-xs font-medium font-satoshi">
                              {appliedOffer.code} ({appliedOffer.discountPercentage}% OFF)
                            </span>
                          </div>
                          <button 
                            type="button" 
                            onClick={removeCoupon} 
                            className="text-foreground/40 hover:text-foreground transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <input 
                            placeholder="Discount code" 
                            value={couponCode} 
                            onChange={(e) => setCouponCode(e.target.value)}
                            className="vb-input h-9 text-xs"
                          />
                          <button 
                            type="button" 
                            onClick={handleApplyCoupon} 
                            disabled={isValidatingOffer || !couponCode}
                            className="btn-ghost px-4 h-9 py-0 border-black/15 hover:border-black/25 text-xs flex items-center justify-center"
                          >
                            {isValidatingOffer ? <Loader2 size={12} className="animate-spin" /> : 'Apply'}
                          </button>
                        </div>
                      )}
                      {offerError && <p className="text-[10px] text-red-400 mt-1 font-satoshi">{offerError}</p>}
                    </div>
                  )}
                  
                  {/* Discounts Info */}
                  {isZeroCost ? (
                    <div className="flex justify-between text-emerald-400 text-xs font-satoshi font-medium pt-1">
                      <span className="flex items-center gap-1"><Gift size={12}/> Complimentary access</span>
                      <span>-{formatPrice(item.price, country)}</span>
                    </div>
                  ) : appliedOffer && (
                    <div className="flex justify-between text-emerald-400 text-xs font-satoshi font-medium pt-1">
                      <span>Discount applied</span>
                      <span>-{formatPrice(discount, country)}</span>
                    </div>
                  )}

                  {/* Total Line */}
                  <div className="border-t border-black/10 pt-4 flex justify-between items-center text-foreground font-display font-semibold">
                    <span className="text-sm">Final Amount</span>
                    <div className="text-right">
                      {isZeroCost ? (
                        <span className="text-emerald-400 text-lg">FREE</span>
                      ) : (
                        <div className="flex flex-col items-end">
                          {appliedOffer && (
                            <span className="text-xs text-foreground/35 font-normal line-through mb-0.5">
                              {formatPrice(total, country)}
                            </span>
                          )}
                          <span className="text-xl font-bold">{formatPrice(final, country)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isProcessing}
                  className="w-full btn-primary h-12 flex items-center justify-center gap-2 font-display text-sm tracking-widest font-semibold"
                >
                  {isZeroCost ? (
                    <>
                      <Rocket size={16} />
                      <span>Unlock Instant Download</span>
                    </>
                  ) : (
                    <span>Complete Order Purchase</span>
                  )}
                </button>
                
                <div className="flex items-center justify-center gap-2 text-[10px] text-foreground/30 font-satoshi">
                  <Shield size={12} className="text-emerald-500/70" />
                  <span>Secure SSL Encryption Enabled</span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCheckout;
