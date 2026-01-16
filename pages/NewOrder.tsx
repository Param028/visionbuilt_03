import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Service, User, Offer } from '../types';
import { formatPrice, SUPPORTED_COUNTRIES } from '../constants';
import { Button, Card, Input, Textarea } from '../components/ui/Components';
import { Stepper, ScrollFloat } from '../components/ui/ReactBits';
import { TicketPercent, X, Loader2, Globe } from 'lucide-react';
import { useToast } from '../components/ui/Toast';

const NewOrder: React.FC<{ user: User }> = ({ user }) => {
  const [searchParams] = useSearchParams();
  const serviceId = searchParams.get('serviceId');
  const navigate = useNavigate();
  const toast = useToast();
  
  const [service, setService] = useState<Service | null>(null);
  const [step, setStep] = useState(1);
  const [country, setCountry] = useState(user.country || 'India');

  const [formData, setFormData] = useState({
    business_name: '',
    business_category: '',
    address_or_online: '',
    requirements_text: '',
    reference_links: '',
    domain_requested: false,
    business_email_requested: false
  });
  
  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedOffer, setAppliedOffer] = useState<Offer | null>(null);
  const [isValidatingOffer, setIsValidatingOffer] = useState(false);
  const [offerError, setOfferError] = useState<string | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);

  useEffect(() => {
    if (serviceId) {
      api.getServices().then(services => {
        const s = services.find(x => x.id === serviceId);
        if (s) setService(s);
      });
    }
  }, [serviceId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
     const { name, checked } = e.target;
     setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleApplyCoupon = async () => {
      if (!couponCode.trim()) return;
      setIsValidatingOffer(true);
      setOfferError(null);
      setAppliedOffer(null);

      const offer = await api.validateOffer(couponCode.toUpperCase());
      if (offer) {
          setAppliedOffer(offer);
          toast.success("Coupon applied successfully!");
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

  const calculateTotal = () => {
      if (!service) return { total: 0, discount: 0, final: 0 };
      
      let base = service.base_price;
      if (formData.domain_requested) base += 15;
      if (formData.business_email_requested) base += 50;
      
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
    if (step === 1) {
       setStep(2);
       return;
    }
    
    if (service) {
        setIsProcessing(true);
        setProcessingStep(1); // Payment Gateway

        try {
            const { final, discount } = calculateTotal();
            
            // Initiate order
            await api.createOrder({
                user_id: user.id,
                type: 'service',
                service_id: service.id,
                service_title: service.title,
                domain_requested: formData.domain_requested,
                business_email_requested: formData.business_email_requested,
                total_amount: final,
                discount_amount: discount,
                applied_offer_code: appliedOffer?.code,
                requirements: {
                    business_name: formData.business_name,
                    business_category: formData.business_category,
                    address_or_online: formData.address_or_online,
                    requirements_text: formData.requirements_text,
                    reference_links: formData.reference_links
                }
            });
            
            setProcessingStep(4); // Complete
            toast.success("Order placed successfully!");
            setTimeout(() => navigate('/dashboard'), 500);
        } catch (error: any) {
            console.error(error);
            setIsProcessing(false);
            if (error.message && error.message.includes("VITE_RAZORPAY_KEY_ID")) {
                toast.error("Deployment Error: Razorpay Key missing in environment variables.");
            } else {
                toast.error(error.message || "Payment failed or cancelled. Please try again.");
            }
        }
    }
  };

  if (isProcessing) {
     return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <Card className="w-full max-w-2xl p-6 sm:p-12 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-vision-primary via-vision-secondary to-vision-primary animate-gradient-x"></div>
                
                <h2 className="text-3xl font-display font-bold text-white mb-2">
                    <ScrollFloat>Processing Payment</ScrollFloat>
                </h2>
                <p className="text-gray-400 mb-12">Please do not close this window.</p>
                
                <div className="max-w-xl mx-auto px-2 sm:px-4">
                     <Stepper 
                        currentStep={processingStep}
                        steps={[
                            { id: 1, label: "Gateway" },
                            { id: 2, label: "Verifying" },
                            { id: 3, label: "Confirming" },
                            { id: 4, label: "Finalizing" }
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

  if (!service) return <div className="p-20 text-center">Loading Service...</div>;

  const { total, discount, final } = calculateTotal();

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Card>
        <div className="mb-8 flex justify-between items-start">
            <div>
                <h1 className="text-2xl font-display font-bold text-white">
                    New Order: <span className="text-vision-primary">{service.title}</span>
                </h1>
                <div className="flex items-center space-x-2 mt-2 max-w-[200px]">
                    <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-vision-primary' : 'bg-gray-700'}`}></div>
                    <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-vision-primary' : 'bg-gray-700'}`}></div>
                </div>
            </div>
            
            {/* Country Selector for Order */}
            <div className="flex items-center space-x-2">
                <Globe size={16} className="text-gray-400" />
                <select 
                    value={country} 
                    onChange={(e) => setCountry(e.target.value)}
                    className="bg-black/30 text-white text-xs border border-white/10 rounded px-2 py-1 outline-none"
                >
                    {SUPPORTED_COUNTRIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 ? (
             <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input 
                        label="Business Name" 
                        name="business_name" 
                        value={formData.business_name} 
                        onChange={handleChange} 
                        required 
                    />
                    <Input 
                        label="Category" 
                        name="business_category" 
                        value={formData.business_category} 
                        onChange={handleChange} 
                        placeholder="e.g. E-commerce, SaaS" 
                        required 
                    />
                </div>
                <Input 
                    label="Address / Online Handle" 
                    name="address_or_online" 
                    value={formData.address_or_online} 
                    onChange={handleChange} 
                    required 
                />
                <Textarea 
                    label="Project Requirements" 
                    name="requirements_text" 
                    value={formData.requirements_text} 
                    onChange={handleChange} 
                    rows={4}
                    placeholder="Describe what you need in detail..."
                    required 
                />
                <Input 
                    label="Reference Links (Optional)" 
                    name="reference_links" 
                    value={formData.reference_links} 
                    onChange={handleChange} 
                    placeholder="example.com"
                />
                
                <div className="pt-4 border-t border-white/5 space-y-4">
                    <h4 className="text-sm font-semibold text-white">Additional Services</h4>
                    <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border border-white/10 hover:bg-white/5 transition-colors">
                        <input type="checkbox" name="domain_requested" checked={formData.domain_requested} onChange={handleCheckbox} className="form-checkbox h-5 w-5 text-vision-primary rounded bg-transparent border-gray-600 focus:ring-offset-0 focus:ring-0" />
                        <div className="flex-grow">
                            <span className="text-gray-200 block text-sm font-medium">Domain Registration</span>
                            <span className="text-gray-500 text-xs">We will secure your perfect domain name (+ {formatPrice(15, country)})</span>
                        </div>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border border-white/10 hover:bg-white/5 transition-colors">
                        <input type="checkbox" name="business_email_requested" checked={formData.business_email_requested} onChange={handleCheckbox} className="form-checkbox h-5 w-5 text-vision-primary rounded bg-transparent border-gray-600 focus:ring-offset-0 focus:ring-0" />
                        <div className="flex-grow">
                            <span className="text-gray-200 block text-sm font-medium">Professional Business Email</span>
                            <span className="text-gray-500 text-xs">Google Workspace or Outlook setup (+ {formatPrice(50, country)})</span>
                        </div>
                    </label>
                </div>

                <div className="flex justify-end pt-4">
                    <Button type="submit">
                        Continue to Payment
                    </Button>
                </div>
             </>
          ) : (
             <div className="text-center py-6">
                 <h2 className="text-xl font-bold text-white mb-6">
                     <ScrollFloat>Order Summary</ScrollFloat>
                 </h2>
                 <div className="bg-white/5 rounded-lg p-6 mb-8 text-left max-w-md mx-auto space-y-3">
                     <div className="flex justify-between text-gray-300">
                         <span>{service.title}</span>
                         <span>{formatPrice(service.base_price, country)}</span>
                     </div>
                     {formData.domain_requested && (
                         <div className="flex justify-between text-gray-300">
                             <span>Domain Registration</span>
                             <span>{formatPrice(15, country)}</span>
                         </div>
                     )}
                     {formData.business_email_requested && (
                         <div className="flex justify-between text-gray-300">
                             <span>Business Email</span>
                             <span>{formatPrice(50, country)}</span>
                         </div>
                     )}

                     {/* Coupon Section */}
                     <div className="border-t border-white/10 pt-4 mt-2">
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
                     
                     {/* Discount Line */}
                     {appliedOffer && (
                         <div className="flex justify-between text-green-400 text-sm mt-3 font-medium animate-in fade-in slide-in-from-top-1">
                             <span>Discount Applied</span>
                             <span>-{formatPrice(discount, country)}</span>
                         </div>
                     )}

                     <div className="border-t border-white/10 pt-3 flex justify-between text-xl font-bold text-vision-primary items-center mt-2">
                         <span>Total</span>
                         <div className="text-right">
                             {appliedOffer && (
                                 <span className="block text-xs text-gray-500 font-normal line-through mb-1">{formatPrice(total, country)}</span>
                             )}
                             <span>{formatPrice(final, country)}</span>
                         </div>
                     </div>
                 </div>
                 
                 <div className="flex gap-4 justify-center">
                    <Button type="button" variant="ghost" onClick={() => setStep(1)} disabled={isProcessing}>
                        Back
                    </Button>
                    <Button type="submit" isLoading={isProcessing} className="min-w-[200px]">
                        Pay & Place Order
                    </Button>
                 </div>
                 <p className="mt-4 text-xs text-gray-500">Secured by Razorpay</p>
             </div>
          )}
        </form>
      </Card>
    </div>
  );
};

export default NewOrder;