
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Service, User, Offer } from '../types';
import { formatPrice, SUPPORTED_COUNTRIES } from '../constants';
import { Button, Card, Input, Textarea } from '../components/ui/Components';
import { Stepper, ScrollFloat } from '../components/ui/ReactBits';
import { Globe, User as UserIcon, Tag, ShieldCheck } from 'lucide-react';
import { useToast } from '../components/ui/Toast';

const NewOrder: React.FC<{ user: User }> = ({ user }) => {
  const [searchParams] = useSearchParams();
  const serviceId = searchParams.get('serviceId');
  const navigate = useNavigate();
  const toast = useToast();
  
  const [service, setService] = useState<Service | null>(null);
  const [step, setStep] = useState(1);
  const [country, setCountry] = useState(user.country || 'India');
  const [isCustom, setIsCustom] = useState(!serviceId);

  const [formData, setFormData] = useState({
    project_title: '',
    client_name: user.name || '',
    client_email: user.email || '',
    client_phone: '',
    client_budget: '',
    business_name: '',
    business_category: '',
    address_or_online: '',
    requirements_text: '',
    reference_links: '',
    domain_requested: false,
    business_email_requested: false
  });
  
  // Coupon State
  const [appliedOffer, _setAppliedOffer] = useState<Offer | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);

  useEffect(() => {
    if (serviceId) {
      api.getServices().then(services => {
        const s = services.find(x => x.id === serviceId);
        if (s) {
            setService(s);
            setIsCustom(false);
        }
      });
    } else {
        setIsCustom(true);
    }
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, [serviceId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
     const { name, checked } = e.target;
     setFormData(prev => ({ ...prev, [name]: checked }));
  };

  // Only calculate estimated total for display, not for charging
  const calculateEstimatedTotal = () => {
      if (!isCustom && !service) return 0;
      let base = isCustom ? 0 : (service?.base_price || 0);
      const dPrice = service?.domain_price ?? 15;
      const ePrice = service?.business_email_price ?? 50;
      if (formData.domain_requested) base += dPrice;
      if (formData.business_email_requested) base += ePrice;
      
      if (appliedOffer) {
          base = base - (base * (appliedOffer.discountPercentage / 100));
      }
      return base;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
       if (!formData.client_phone.trim()) {
           toast.error("Phone number is required for developer contact.");
           return;
       }
       setStep(2);
       window.scrollTo(0, 0);
       return;
    }
    
    setIsProcessing(true);
    setProcessingStep(1); 

    try {
        const estimated = calculateEstimatedTotal();
        
        // We do NOT charge here. We create a request.
        // Status defaults to 'pending' in API/DB.
        await api.createOrder({
            user_id: user.id,
            type: 'service',
            service_id: service?.id,
            service_title: isCustom ? formData.project_title : (service?.title || 'Custom Project'),
            is_custom: isCustom,
            domain_requested: formData.domain_requested,
            business_email_requested: formData.business_email_requested,
            // We pass the estimated amount, but the logic in API ensures no payment is triggered for 'service' type
            // The status will be 'pending', so the user won't be asked to pay yet.
            total_amount: isCustom ? 0 : estimated,
            discount_amount: 0, 
            applied_offer_code: appliedOffer?.code,
            requirements: {
                business_name: formData.business_name,
                business_category: formData.business_category,
                address_or_online: formData.address_or_online,
                requirements_text: formData.requirements_text,
                reference_links: formData.reference_links,
                client_name: formData.client_name,
                client_email: formData.client_email,
                client_phone: formData.client_phone,
                client_budget: formData.client_budget
            }
        });
        
        setProcessingStep(3); // Visual feedback
        
        setTimeout(() => {
            setProcessingStep(4);
            toast.success("Request sent! A developer will review and send a quote.");
            setTimeout(() => navigate('/dashboard'), 1500);
        }, 1000);

    } catch (error: any) {
        setIsProcessing(false);
        toast.error(error.message || "Failed to process order.");
    }
  };

  if (isProcessing) {
     return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
            <Card className="w-full max-w-2xl p-8 sm:p-12 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-vision-primary via-vision-secondary to-vision-primary animate-gradient-x"></div>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-2">
                    <ScrollFloat>Submitting Request</ScrollFloat>
                </h2>
                <p className="text-gray-400 mb-12">Sending details to our developer team...</p>
                <div className="max-w-xl mx-auto px-4">
                     <Stepper currentStep={processingStep} steps={[{ id: 1, label: "Saving" }, { id: 2, label: "Routing" }, { id: 3, label: "Notifying" }, { id: 4, label: "Done" }]} />
                </div>
            </Card>
        </div>
     )
  }

  if (!service && !isCustom) return <div className="p-20 text-center">Loading Service...</div>;

  const estimatedTotal = calculateEstimatedTotal();

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 sm:py-16">
      <Card className={`${isCustom ? "border-vision-secondary/30" : "border-vision-primary/30"} w-full`}>
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
                <h1 className="text-xl sm:text-2xl font-display font-bold text-white">
                    {isCustom ? <span className="text-vision-secondary">Request Custom Build</span> : <>New Request: <span className="text-vision-primary">{service?.title}</span></>}
                </h1>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-mono">Phase {step} / 02</p>
            </div>
            <div className="flex items-center space-x-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                <Globe size={14} className="text-vision-primary" />
                <select value={country} onChange={(e) => setCountry(e.target.value)} className="bg-transparent text-white text-[10px] font-bold uppercase outline-none cursor-pointer">
                    {SUPPORTED_COUNTRIES.map(c => <option key={c} value={c} className="bg-vision-900">{c}</option>)}
                </select>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 ? (
             <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 sm:p-6 bg-white/5 rounded-xl border border-white/10 shadow-inner">
                    <div className="col-span-full mb-2">
                        <h4 className="text-[10px] font-bold text-vision-secondary uppercase tracking-widest flex items-center gap-2">
                            <UserIcon size={12} /> Contact & Identity
                        </h4>
                    </div>
                    <Input label="Your Name" name="client_name" value={formData.client_name} onChange={handleChange} required className="h-12" />
                    {isCustom && <Input label="Project Title" name="project_title" value={formData.project_title} onChange={handleChange} placeholder="e.g. Portfolio v2" required className="h-12" />}
                    <Input label="Email Address" type="email" name="client_email" value={formData.client_email} onChange={handleChange} required className="h-12" />
                    <Input label="Phone / WhatsApp (Required)" type="tel" name="client_phone" value={formData.client_phone} onChange={handleChange} placeholder="+1..." required className="h-12" />
                    {isCustom && (
                        <div className="col-span-full">
                            <Input label="Estimated Budget ($)" name="client_budget" value={formData.client_budget} onChange={handleChange} placeholder="e.g. 1000 - 1500" required className="h-12" />
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Business Name" name="business_name" value={formData.business_name} onChange={handleChange} required className="h-12" />
                    <Input label="Industry Category" name="business_category" value={formData.business_category} onChange={handleChange} placeholder="e.g. Retail" required className="h-12" />
                </div>
                <Input label="Address or Online Handle" name="address_or_online" value={formData.address_or_online} onChange={handleChange} required className="h-12" />
                <Textarea label="Core Requirements" name="requirements_text" value={formData.requirements_text} onChange={handleChange} rows={6} placeholder="Describe the functionality, tech stack, or specific features you need..." required />
                <Input label="Reference URLs (Links)" name="reference_links" value={formData.reference_links} onChange={handleChange} placeholder="competitor.com, design.com" className="h-12" />
                
                <div className="pt-6 border-t border-white/5 space-y-4">
                    <h4 className="text-xs font-bold text-white uppercase tracking-widest">Asset Provisions</h4>
                    {(isCustom || service?.allow_domain) && (
                        <label className="flex items-center space-x-3 cursor-pointer p-4 rounded-xl border border-white/10 hover:bg-white/5 transition-all">
                            <input type="checkbox" name="domain_requested" checked={formData.domain_requested} onChange={handleCheckbox} className="form-checkbox h-5 w-5 text-vision-primary rounded bg-transparent border-gray-600 focus:ring-0" />
                            <div className="flex-grow">
                                <span className="text-gray-200 block text-sm font-medium">Provision Custom Domain</span>
                                <span className="text-[10px] text-gray-500 uppercase tracking-tighter tracking-wider">+ {formatPrice(service?.domain_price ?? 15, country)}</span>
                            </div>
                        </label>
                    )}
                    {(isCustom || service?.allow_business_email) && (
                        <label className="flex items-center space-x-3 cursor-pointer p-4 rounded-xl border border-white/10 hover:bg-white/5 transition-all">
                            <input type="checkbox" name="business_email_requested" checked={formData.business_email_requested} onChange={handleCheckbox} className="form-checkbox h-5 w-5 text-vision-primary rounded bg-transparent border-gray-600 focus:ring-0" />
                            <div className="flex-grow">
                                <span className="text-gray-200 block text-sm font-medium">Business Workspace Email</span>
                                <span className="text-[10px] text-gray-500 uppercase tracking-tighter tracking-wider">+ {formatPrice(service?.business_email_price ?? 50, country)}</span>
                            </div>
                        </label>
                    )}
                </div>

                <div className="flex justify-end pt-6">
                    <Button type="submit" size="lg" variant={isCustom ? 'secondary' : 'primary'} className="w-full sm:w-auto min-w-[200px] h-12">
                        Review & Submit
                    </Button>
                </div>
             </>
          ) : (
             <div className="text-center py-6">
                 <h2 className="text-xl font-bold text-white mb-8 uppercase tracking-tight">Request Summary</h2>
                 <div className="bg-white/5 rounded-2xl p-6 sm:p-10 mb-8 text-left max-w-lg mx-auto space-y-4 border border-white/10 shadow-2xl overflow-hidden relative">
                     <div className="absolute -top-4 -right-4 w-24 h-24 bg-vision-primary/5 rounded-full blur-2xl" />
                     
                     <div className="flex justify-between items-center text-gray-300">
                         <span className="flex items-center gap-2 font-bold text-sm uppercase tracking-wider"><Tag size={14} className="text-vision-primary" /> {isCustom ? formData.project_title : service?.title}</span>
                         <span className="font-mono text-vision-primary font-bold text-sm bg-vision-primary/10 px-2 py-1 rounded">Requesting Quote</span>
                     </div>
                     
                     <div className="space-y-2 border-l border-white/10 pl-4 py-2 mt-4 text-xs text-gray-400">
                         <div><span className="text-gray-500 uppercase">Contact:</span> {formData.client_phone}</div>
                         <div><span className="text-gray-500 uppercase">Email:</span> {formData.client_email}</div>
                         {isCustom && <div><span className="text-gray-500 uppercase">Budget:</span> {formData.client_budget}</div>}
                     </div>

                     <div className="border-t border-white/10 pt-6 flex justify-between text-xl font-bold text-white items-center mt-4">
                         <span className="text-base uppercase tracking-widest text-gray-400">Est. Total</span>
                         <div className="text-right">
                             <span>{isCustom ? 'TBD' : formatPrice(estimatedTotal, country)}</span>
                         </div>
                     </div>
                     <p className="text-[10px] text-gray-500 text-right mt-1">Final quote to be confirmed by developer.</p>
                 </div>

                 <div className="flex items-start gap-3 max-w-lg mx-auto mb-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <ShieldCheck className="text-blue-400 shrink-0 mt-0.5" size={20} />
                    <div className="text-left">
                        <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">No Payment Required Yet</h4>
                        <p className="text-xs text-gray-400">
                            Submitting this request does not charge your card. Our team will review your requirements and send a finalized quote with a deposit link to your dashboard.
                        </p>
                    </div>
                 </div>
                 
                 <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button type="button" variant="ghost" onClick={() => { setStep(1); window.scrollTo(0,0); }} disabled={isProcessing} className="h-12 px-8">Edit Details</Button>
                    <Button type="submit" isLoading={isProcessing} className="min-w-[240px] h-12" variant={isCustom ? 'secondary' : 'primary'}>
                        Submit Request
                    </Button>
                 </div>
             </div>
          )}
        </form>
      </Card>
    </div>
  );
};

export default NewOrder;
