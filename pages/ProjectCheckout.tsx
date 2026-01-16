import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { MarketplaceItem, User, Offer } from '../types';
import { formatPrice } from '../constants';
import { Button, Card, Input, Badge } from '../components/ui/Components';
import { Stepper, ScrollFloat } from '../components/ui/ReactBits';
import { TicketPercent, X, Loader2, Shield, Download, Star, Eye, Image as ImageIcon, User as UserIcon, Check, Gift } from 'lucide-react';
import { useToast } from '../components/ui/Toast';

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

  const isFreeLimitedTime = item?.free_until && new Date(item.free_until) > new Date();

  const calculateTotal = () => {
      if (!item) return { total: 0, discount: 0, final: 0 };
      
      let base = item.price;
      
      // If free limited time, override price
      if (isFreeLimitedTime) {
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
                service_title: item.title, // Map project title to generic display title
                domain_requested: false,
                business_email_requested: false,
                total_amount: final,
                discount_amount: discount,
                applied_offer_code: appliedOffer?.code,
                requirements: {
                    business_name: 'Instant Purchase',
                    business_category: 'N/A',
                    address_or_online: 'N/A',
                    requirements_text: isFreeLimitedTime ? 'Free Student Download' : 'Marketplace Purchase',
                    reference_links: ''
                }
            });
            
            setProcessingStep(4);
            toast.success("Purchase successful! Accessing files...");
            setTimeout(() => navigate('/dashboard'), 1000);

        } catch (error: any) {
             console.error(error);
             setIsProcessing(false);
             if (error.message && error.message.includes("VITE_RAZORPAY_KEY_ID")) {
                toast.error("Deployment Error: Razorpay Key missing in environment variables.");
             } else {
                toast.error(error.message || "Transaction failed. Please try again.");
             }
        }
    }
  };

  if (isProcessing) {
     return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <Card className="w-full max-w-2xl p-12 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-vision-primary via-vision-secondary to-vision-primary animate-gradient-x"></div>
                
                <h2 className="text-3xl font-display font-bold text-white mb-2">
                    <ScrollFloat>{isFreeLimitedTime ? 'Preparing Download' : 'Processing Purchase'}</ScrollFloat>
                </h2>
                <p className="text-gray-400 mb-12">Generating secure download link...</p>
                
                <div className="max-w-xl mx-auto px-4">
                     <Stepper 
                        currentStep={processingStep}
                        steps={[
                            { id: 1, label: isFreeLimitedTime ? "Verifying" : "Payment" },
                            { id: 2, label: isFreeLimitedTime ? "Accessing" : "Verifying" },
                            { id: 3, label: "Generating" },
                            { id: 4, label: "Complete" }
                        ]}
                    />
                </div>

                <div className="mt-16 bg-white/5 rounded-lg p-4 inline-block">
                    <div className="flex items-center space-x-3 text-sm text-gray-300">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span>Secure 256-bit Encryption Active</span>
                    </div>
                </div>
            </Card>
        </div>
     )
  }

  if (!item) return <div className="p-20 text-center">Loading Project...</div>;

  const { total, discount, final } = calculateTotal();
  const allImages = item.image_url ? [item.image_url, ...(item.preview_images || [])] : (item.preview_images || []);
  const country = user.country;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Project Visuals & Details */}
        <div>
            <div className="mb-6">
                 <Button variant="ghost" className="pl-0 mb-4 text-gray-400 hover:text-white" onClick={() => navigate('/marketplace')}>
                     <span className="flex items-center gap-2"><X className="w-4 h-4" /> Cancel</span>
                 </Button>
                 
                 {/* Main Preview Image */}
                 <div className="rounded-xl overflow-hidden border border-white/10 bg-black/40 aspect-video mb-4 relative shadow-2xl">
                     {selectedImage ? (
                         <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                     ) : (
                         <div className="w-full h-full flex items-center justify-center text-gray-600">
                             <ImageIcon size={48} />
                         </div>
                     )}
                 </div>

                 {/* Thumbnails */}
                 {allImages.length > 1 && (
                     <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                         {allImages.map((img, idx) => (
                             <button 
                                key={idx} 
                                onClick={() => setSelectedImage(img)}
                                className={`w-20 h-14 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === img ? 'border-vision-primary' : 'border-transparent opacity-60 hover:opacity-100'}`}
                             >
                                 <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                             </button>
                         ))}
                     </div>
                 )}
            </div>
            
            <div className="flex justify-between items-start">
                <div>
                     <h1 className="text-3xl font-display font-bold text-white mb-2">{item.title}</h1>
                     <div className="flex items-center gap-2 mb-4">
                         <Badge variant="info">
                             <UserIcon size={12} className="mr-1 inline-block" />
                             {item.developer_name}
                         </Badge>
                         {isFreeLimitedTime && <Badge variant="success">FREE LIMITED TIME</Badge>}
                     </div>
                     <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
                         <div className="flex items-center gap-1 text-yellow-500">
                             <Star size={14} fill="currentColor" />
                             <span>{item.rating}</span>
                         </div>
                         <div className="flex items-center gap-1">
                             <Eye size={14} />
                             <span>{item.views} views</span>
                         </div>
                         <div className="flex items-center gap-1">
                             <Download size={14} />
                             <span>{item.purchases} sold</span>
                         </div>
                     </div>
                </div>
                {item.demo_url && (
                    <Button variant="outline" onClick={() => window.open(item.demo_url, '_blank')}>
                        <Eye size={16} className="mr-2" /> Live Preview
                    </Button>
                )}
            </div>

            <div className="prose prose-invert max-w-none text-gray-300 text-sm mb-8 border-t border-white/10 pt-6">
                <h3 className="text-white font-bold mb-2">About this Project</h3>
                <p className="leading-relaxed">{item.full_description}</p>
            </div>

            <div className="mb-8">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Included Features</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {item.features.map((feature, i) => (
                        <div key={i} className="flex items-center text-sm text-gray-400 p-2 rounded bg-white/5 border border-white/5">
                            <Check className="w-4 h-4 text-vision-primary mr-2 flex-shrink-0" />
                            {feature}
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Checkout Card */}
        <div>
            <Card className="sticky top-24 border-vision-primary/30 shadow-[0_0_50px_rgba(6,182,212,0.05)]">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-white mb-1">
                        {isFreeLimitedTime ? 'Student Access' : 'Purchase License'}
                    </h2>
                    <p className="text-gray-400 text-sm">Unlock full source code & documentation.</p>
                </div>

                 <form onSubmit={handleSubmit} className="space-y-6">
                     <div className="bg-white/5 rounded-lg p-6 mb-4 text-left space-y-3">
                         <div className="flex justify-between text-gray-300">
                             <span className="font-medium">Standard License</span>
                             <span className={isFreeLimitedTime ? "font-bold text-gray-500 line-through" : "font-bold text-white"}>
                                 {formatPrice(item.price, country)}
                             </span>
                         </div>
                         <div className="flex justify-between text-gray-500 text-xs border-b border-white/5 pb-3">
                             <span>Instant Download • Lifetime Updates</span>
                         </div>

                         {/* Coupon Section (Only if not free) */}
                         {!isFreeLimitedTime && (
                            <div className="pt-3">
                                {appliedOffer ? (
                                    <div className="flex justify-between items-center bg-green-500/10 border border-green-500/20 p-2 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <TicketPercent size={16} className="text-green-400" />
                                            <span className="text-green-400 text-sm font-medium">{appliedOffer.code} ({appliedOffer.discountPercentage}% OFF)</span>
                                        </div>
                                        <button type="button" onClick={removeCoupon} className="text-gray-400 hover:text-white">
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <Input 
                                            placeholder="Discount Code" 
                                            value={couponCode} 
                                            onChange={(e) => setCouponCode(e.target.value)}
                                            className="h-9 text-sm"
                                        />
                                        <Button 
                                            type="button" 
                                            onClick={handleApplyCoupon} 
                                            disabled={isValidatingOffer || !couponCode}
                                            variant="secondary"
                                            size="sm"
                                            className="h-auto"
                                        >
                                            {isValidatingOffer ? <Loader2 size={14} className="animate-spin" /> : 'Apply'}
                                        </Button>
                                    </div>
                                )}
                                {offerError && <p className="text-xs text-red-400 mt-1">{offerError}</p>}
                            </div>
                         )}
                         
                         {/* Discount Line */}
                         {isFreeLimitedTime ? (
                             <div className="flex justify-between text-green-400 text-sm font-medium animate-in fade-in slide-in-from-top-1">
                                 <span className="flex items-center gap-1"><Gift size={12}/> Limited Time Free</span>
                                 <span>-{formatPrice(item.price, country)}</span>
                             </div>
                         ) : appliedOffer && (
                             <div className="flex justify-between text-green-400 text-sm font-medium animate-in fade-in slide-in-from-top-1">
                                 <span>Discount Applied</span>
                                 <span>-{formatPrice(discount, country)}</span>
                             </div>
                         )}

                         <div className="border-t border-white/10 pt-3 flex justify-between text-xl font-bold text-vision-primary items-center mt-2">
                             <span>Total</span>
                             <div className="text-right">
                                 {isFreeLimitedTime ? (
                                     <span className="text-green-400">FREE</span>
                                 ) : (
                                     <>
                                        {appliedOffer && <span className="block text-xs text-gray-500 font-normal line-through mb-1">{formatPrice(total, country)}</span>}
                                        <span>{formatPrice(final, country)}</span>
                                     </>
                                 )}
                             </div>
                         </div>
                     </div>
                     
                     <Button type="submit" isLoading={isProcessing} className={`w-full h-12 text-base shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] ${isFreeLimitedTime ? 'bg-green-500 text-black hover:bg-green-400 border-none' : ''}`}>
                         {isFreeLimitedTime ? 'Download Now' : 'Complete Purchase & Download'}
                     </Button>
                     
                     <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-4">
                         <Shield size={12} className="text-green-500" />
                         <span>Secure SSL Encrypted {isFreeLimitedTime ? 'Connection' : 'Payment'}</span>
                     </div>
                 </form>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default ProjectCheckout;