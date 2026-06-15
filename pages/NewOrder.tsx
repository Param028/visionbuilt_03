import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Service, User, Offer, MarketplaceItem } from '../types';
import { SUPPORTED_COUNTRIES } from '../constants';
import { Button, Card, Input, Textarea } from '../components/ui/Components';
import { Stepper, ScrollFloat } from '../components/ui/ReactBits';
import { Globe, User as UserIcon, Tag, ShieldCheck, Image as ImageIcon, Check } from 'lucide-react';
import { useToast } from '../components/ui/Toast';

const NewOrder: React.FC<{ user: User }> = ({ user }) => {
  const [searchParams] = useSearchParams();
  const serviceId = searchParams.get('serviceId');
  const navigate = useNavigate();
  const toast = useToast();
  
  const [service, setService] = useState<Service | null>(null);
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>([]);
  const [selectedReferences, setSelectedReferences] = useState<string[]>([]);
  
  const [step, setStep] = useState(1);
  const [country, setCountry] = useState(user.country || 'India');
  const [isCustom, setIsCustom] = useState(!serviceId);

  const [formData, setFormData] = useState({
    project_title: '',
    client_name: user.name || '',
    client_email: user.email || '',
    client_phone: '',
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
    // Fetch marketplace items for references
    api.getMarketplaceItems().then(setMarketplaceItems);
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

  const toggleReference = (id: string) => {
      setSelectedReferences(prev => 
          prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      );
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
        // Status defaults to 'pending' in API/DB.
        // PRICE IS SET TO 0 (TBD) for both Custom and Standard Services as per request
        await api.createOrder({
            user_id: user.id,
            type: 'service',
            service_id: service?.id,
            service_title: isCustom ? formData.project_title : (service?.title || 'Custom Project'),
            is_custom: isCustom,
            domain_requested: formData.domain_requested,
            business_email_requested: formData.business_email_requested,
            total_amount: 0, // Set to 0 so developer sets it later
            discount_amount: 0, 
            applied_offer_code: appliedOffer?.code,
            reference_project_ids: selectedReferences, 
            requirements: {
                business_name: formData.business_name,
                business_category: formData.business_category,
                address_or_online: formData.address_or_online,
                requirements_text: formData.requirements_text,
                reference_links: formData.reference_links,
                client_name: formData.client_name,
                client_email: formData.client_email,
                client_phone: formData.client_phone
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
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-foreground/20 via-foreground/60 to-foreground/20 animate-gradient-x"></div>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-2">
                    <ScrollFloat>Submitting Request</ScrollFloat>
                </h2>
                <p className="text-foreground/50 mb-12">Sending details to our developer team...</p>
                <div className="max-w-xl mx-auto px-4">
                     <Stepper currentStep={processingStep} steps={[{ id: 1, label: "Saving" }, { id: 2, label: "Routing" }, { id: 3, label: "Notifying" }, { id: 4, label: "Done" }]} />
                </div>
            </Card>
        </div>
     )
  }

  if (!service && !isCustom) return <div className="p-20 text-center text-foreground/50">Loading Service...</div>;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 sm:py-16">
      <Card className="border-divider/50 w-full">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
                <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground">
                    {isCustom ? <span>Request Custom Build</span> : <>New Request: <span className="text-foreground/80">{service?.title}</span></>}
                </h1>
                <p className="text-xs text-foreground/50 mt-1 uppercase tracking-widest font-mono">Phase {step} / 02</p>
            </div>
            <div className="flex items-center space-x-2 bg-content2 px-3 py-1.5 rounded-lg border border-divider">
                <Globe size={14} className="text-foreground/75" />
                <select value={country} onChange={(e) => setCountry(e.target.value)} className="bg-transparent text-foreground text-[10px] font-bold uppercase outline-none cursor-pointer">
                    {SUPPORTED_COUNTRIES.map(c => <option key={c} value={c} className="bg-content1 text-foreground">{c}</option>)}
                </select>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 ? (
             <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 sm:p-6 bg-content2/40 rounded-xl border border-divider shadow-inner">
                    <div className="col-span-full mb-2">
                        <h4 className="text-[10px] font-bold text-foreground/80 uppercase tracking-widest flex items-center gap-2">
                            <UserIcon size={12} /> Contact & Identity
                        </h4>
                    </div>
                    <Input label="Your Name" name="client_name" value={formData.client_name} onChange={handleChange} required className="h-12" />
                    {isCustom && <Input label="Project Title" name="project_title" value={formData.project_title} onChange={handleChange} placeholder="e.g. Portfolio v2" required className="h-12" />}
                    <Input label="Email Address" type="email" name="client_email" value={formData.client_email} onChange={handleChange} required className="h-12" />
                    <Input label="Phone / WhatsApp (Required)" type="tel" name="client_phone" value={formData.client_phone} onChange={handleChange} placeholder="+1..." required className="h-12" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Business Name" name="business_name" value={formData.business_name} onChange={handleChange} required className="h-12" />
                    <Input label="Industry Category" name="business_category" value={formData.business_category} onChange={handleChange} placeholder="e.g. Retail" required className="h-12" />
                </div>
                <Input label="Address or Online Handle" name="address_or_online" value={formData.address_or_online} onChange={handleChange} required className="h-12" />
                <Textarea label="Core Requirements" name="requirements_text" value={formData.requirements_text} onChange={handleChange} rows={6} placeholder="Describe the functionality, tech stack, or specific features you need..." required />
                <Input label="Reference URLs (Links)" name="reference_links" value={formData.reference_links} onChange={handleChange} placeholder="competitor.com, design.com" className="h-12" />
                
                {/* Visual References Selection */}
                <div className="pt-6 border-t border-divider">
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-widest mb-4">Attach Design References</h4>
                    <p className="text-xs text-foreground/50 mb-4">Select projects from our marketplace that match the style or functionality you are looking for.</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto custom-scrollbar p-1">
                        {marketplaceItems.map(item => (
                            <div 
                                key={item.id} 
                                onClick={() => toggleReference(item.id)}
                                className={`relative cursor-pointer rounded-lg border overflow-hidden group transition-all ${selectedReferences.includes(item.id) ? 'border-foreground ring-1 ring-foreground' : 'border-divider hover:border-foreground/30'}`}
                            >
                                <div className="aspect-video bg-black/40">
                                    {item.image_url ? (
                                        <img src={item.image_url} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" alt={item.title} />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-foreground/30"><ImageIcon size={20} /></div>
                                    )}
                                </div>
                                <div className="p-2 bg-content2">
                                    <p className="text-[10px] font-bold text-foreground truncate">{item.title}</p>
                                    <p className="text-[9px] text-foreground/50">{item.category}</p>
                                </div>
                                {selectedReferences.includes(item.id) && (
                                    <div className="absolute top-1 right-1 bg-foreground text-background rounded-full p-0.5">
                                        <Check size={12} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pt-6 border-t border-divider space-y-4">
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-widest">Asset Provisions (Optional)</h4>
                    {(isCustom || service?.allow_domain) && (
                        <label className="flex items-center space-x-3 cursor-pointer p-4 rounded-xl border border-divider hover:bg-content2 transition-all">
                            <input type="checkbox" name="domain_requested" checked={formData.domain_requested} onChange={handleCheckbox} className="form-checkbox h-5 w-5 text-foreground rounded bg-transparent border-divider focus:ring-0" />
                            <div className="flex-grow">
                                <span className="text-foreground block text-sm font-medium">Provision Custom Domain</span>
                                <span className="text-[10px] text-foreground/50 uppercase tracking-wider">Include in quote request</span>
                            </div>
                        </label>
                    )}
                    {(isCustom || service?.allow_business_email) && (
                        <label className="flex items-center space-x-3 cursor-pointer p-4 rounded-xl border border-divider hover:bg-content2 transition-all">
                            <input type="checkbox" name="business_email_requested" checked={formData.business_email_requested} onChange={handleCheckbox} className="form-checkbox h-5 w-5 text-foreground rounded bg-transparent border-divider focus:ring-0" />
                            <div className="flex-grow">
                                <span className="text-foreground block text-sm font-medium">Business Workspace Email</span>
                                <span className="text-[10px] text-foreground/50 uppercase tracking-wider">Include in quote request</span>
                            </div>
                        </label>
                    )}
                </div>

                <div className="flex justify-end pt-6">
                    <Button type="submit" size="lg" variant="primary" className="w-full sm:w-auto min-w-[200px] h-12">
                        Review & Submit
                    </Button>
                </div>
             </>
          ) : (
             <div className="text-center py-6">
                 <h2 className="text-xl font-bold text-foreground mb-8 uppercase tracking-tight">Request Summary</h2>
                 <div className="bg-content2/40 rounded-2xl p-6 sm:p-10 mb-8 text-left max-w-lg mx-auto space-y-4 border border-divider shadow-md overflow-hidden relative">
                     <div className="absolute -top-4 -right-4 w-24 h-24 bg-foreground/5 rounded-full blur-2xl" />
                     
                     <div className="flex justify-between items-center text-foreground/90">
                         <span className="flex items-center gap-2 font-bold text-sm uppercase tracking-wider"><Tag size={14} className="text-foreground/75" /> {isCustom ? formData.project_title : service?.title}</span>
                         <span className="font-mono text-foreground font-bold text-sm bg-foreground/10 px-2 py-1 rounded">Pending Review</span>
                     </div>
                     
                     <div className="space-y-2 border-l border-divider pl-4 py-2 mt-4 text-xs text-foreground/70">
                         <div><span className="text-foreground/40 uppercase">Contact:</span> {formData.client_phone}</div>
                         <div><span className="text-foreground/40 uppercase">Email:</span> {formData.client_email}</div>
                         {formData.domain_requested && <div><span className="text-foreground/40 uppercase">Feature:</span> Custom Domain Requested</div>}
                         {formData.business_email_requested && <div><span className="text-foreground/40 uppercase">Feature:</span> Business Email Requested</div>}
                         {selectedReferences.length > 0 && (
                             <div><span className="text-foreground/40 uppercase">References:</span> {selectedReferences.length} items attached</div>
                         )}
                     </div>

                     <div className="border-t border-divider pt-6 flex justify-between text-xl font-bold text-foreground items-center mt-4">
                         <span className="text-base uppercase tracking-widest text-foreground/60">
                            Quote Total
                         </span>
                         <div className="text-right">
                             <span className="text-sm text-foreground/50">To Be Determined</span>
                         </div>
                     </div>
                     <p className="text-[10px] text-foreground/50 text-right mt-1">
                        Final pricing will be provided by developer after review.
                     </p>
                 </div>

                 <div className="flex items-start gap-3 max-w-lg mx-auto mb-8 p-4 bg-content2 border border-divider rounded-xl">
                    <ShieldCheck className="text-foreground shrink-0 mt-0.5" size={20} />
                    <div className="text-left">
                        <h4 className="text-xs font-bold text-foreground uppercase tracking-widest mb-1">
                             Quote Request
                        </h4>
                        <p className="text-xs text-foreground/60">
                            Submitting this request is free. Our team will analyze your requirements and send a custom quote with payment options to your dashboard.
                        </p>
                    </div>
                 </div>
                 
                 <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button type="button" variant="ghost" onClick={() => { setStep(1); window.scrollTo(0,0); }} disabled={isProcessing} className="h-12 px-8">Edit Details</Button>
                    <Button type="submit" isLoading={isProcessing} className="min-w-[240px] h-12" variant="primary">
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
