import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { MarketplaceItem, User, Offer } from '../types';
import { formatPrice } from '../constants';
import { Button, Card, Input, Badge } from '../components/ui/Components';
import { Stepper, ScrollFloat } from '../components/ui/ReactBits';
import { TicketPercent, X, Loader2, Shield, Eye, ImageIcon, User as UserIcon, Gift, Rocket } from 'lucide-react';
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
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <Card className="w-full max-w-2xl p-12 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-foreground/20 via-foreground/60 to-foreground/20 animate-gradient-x"></div>
                
                <h2 className="text-3xl font-display font-bold text-foreground mb-2">
                    <ScrollFloat>{isZeroCost ? 'Preparing Download' : 'Processing Purchase'}</ScrollFloat>
                </h2>
                <p className="text-foreground/50 mb-12">Generating secure download link...</p>
                
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
            </Card>
        </div>
     )
  }

  if (!item) return <div className="p-20 text-center text-foreground/50">Loading Project...</div>;

  const { total, discount, final } = calculateTotal();
  const allImages = item.image_url ? [item.image_url, ...(item.preview_images || [])] : (item.preview_images || []);
  const country = user.country;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Project Visuals & Details */}
        <div>
            <div className="mb-6">
                 <Button variant="ghost" className="pl-0 mb-4 text-foreground/50 hover:text-foreground" onClick={() => navigate('/marketplace')}>
                     <span className="flex items-center gap-2"><X className="w-4 h-4" /> Cancel</span>
                 </Button>
                 
                 {/* Main Preview Image */}
                 <div className="rounded-xl overflow-hidden border border-divider bg-content2 aspect-video mb-4 relative shadow-md">
                     {selectedImage ? (
                          <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                     ) : (
                          <div className="w-full h-full flex items-center justify-center text-foreground/30">
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
                                 className={`w-20 h-14 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === img ? 'border-foreground' : 'border-transparent opacity-60 hover:opacity-100'}`}
                              >
                                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                              </button>
                          ))}
                     </div>
                 )}
            </div>
            
            <div className="flex justify-between items-start">
                <div>
                     <h1 className="text-3xl font-display font-bold text-foreground mb-2">{item.title}</h1>
                     <div className="flex items-center gap-2 mb-4">
                          <Badge variant="default">
                              <UserIcon size={12} className="mr-1 inline-block text-foreground/75" />
                              {item.developer_name}
                          </Badge>
                          {isFreeLimitedTime && <Badge variant="success">FREE LIMITED TIME</Badge>}
                          {isFreeProject && <Badge variant="success">FREE PROJECT</Badge>}
                     </div>
                </div>
                {item.demo_url && (
                    <Button variant="outline" onClick={() => window.open(item.demo_url, '_blank')}>
                        <Eye size={16} className="mr-2" /> Live Preview
                    </Button>
                )}
            </div>

            <div className="prose prose-invert max-w-none text-foreground/70 text-sm mb-8 border-t border-divider pt-6">
                <h3 className="text-foreground font-bold mb-2">Project Details</h3>
                <p className="leading-relaxed">{item.full_description}</p>
            </div>
        </div>

        {/* Checkout Card */}
        <div>
            <Card className="sticky top-24 border-divider shadow-md">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-foreground mb-1">
                        {isZeroCost ? 'Instant Access' : 'Purchase License'}
                    </h2>
                    <p className="text-foreground/50 text-sm">{isZeroCost ? 'Download source code immediately.' : 'Unlock full source code & documentation.'}</p>
                </div>

                 <form onSubmit={handleSubmit} className="space-y-6">
                     <div className="bg-content2/50 rounded-lg p-6 mb-4 text-left space-y-3 border border-divider/50">
                          <div className="flex justify-between text-foreground/85">
                              <span className="font-medium">Standard License</span>
                              <span className={isZeroCost ? "font-bold text-foreground/40 line-through" : "font-bold text-foreground"}>
                                  {formatPrice(item.price, country)}
                              </span>
                          </div>

                          {/* Coupon Section (Only if not free) */}
                          {!isZeroCost && (
                            <div className="pt-3">
                                {appliedOffer ? (
                                    <div className="flex justify-between items-center bg-success/10 border border-success/20 p-2 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <TicketPercent size={16} className="text-success" />
                                            <span className="text-success text-sm font-medium">{appliedOffer.code} ({appliedOffer.discountPercentage}% OFF)</span>
                                        </div>
                                        <button type="button" onClick={removeCoupon} className="text-foreground/50 hover:text-foreground">
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
                                            className="h-auto font-semibold px-4 border-divider"
                                        >
                                            {isValidatingOffer ? <Loader2 size={14} className="animate-spin" /> : 'Apply'}
                                        </Button>
                                    </div>
                                )}
                                {offerError && <p className="text-xs text-danger mt-1">{offerError}</p>}
                            </div>
                          )}
                          
                          {/* Discount Line */}
                          {isZeroCost ? (
                              <div className="flex justify-between text-success text-sm font-medium animate-in fade-in slide-in-from-top-1">
                                  <span className="flex items-center gap-1"><Gift size={12}/> Free Access</span>
                                  <span>-{formatPrice(item.price, country)}</span>
                              </div>
                          ) : appliedOffer && (
                              <div className="flex justify-between text-success text-sm font-medium animate-in fade-in slide-in-from-top-1">
                                  <span>Discount Applied</span>
                                  <span>-{formatPrice(discount, country)}</span>
                              </div>
                          )}

                          <div className="border-t border-divider pt-3 flex justify-between text-xl font-bold text-foreground items-center mt-2">
                              <span>Total</span>
                              <div className="text-right">
                                  {isZeroCost ? (
                                      <span className="text-success">FREE</span>
                                  ) : (
                                      <>
                                         {appliedOffer && <span className="block text-xs text-foreground/45 font-normal line-through mb-1">{formatPrice(total, country)}</span>}
                                         <span>{formatPrice(final, country)}</span>
                                      </>
                                  )}
                              </div>
                          </div>
                     </div>
                     
                     <Button type="submit" isLoading={isProcessing} className="w-full h-12 text-base font-semibold" variant="primary">
                          {isZeroCost ? <><Rocket size={18} className="mr-2"/> Launch Project</> : 'Complete Purchase & Download'}
                     </Button>
                     
                     <div className="flex items-center justify-center gap-2 text-xs text-foreground/45 mt-4">
                          <Shield size={12} className="text-success" />
                          <span>Secure SSL Encrypted {isZeroCost ? 'Connection' : 'Transaction'}</span>
                     </div>
                 </form>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default ProjectCheckout;
