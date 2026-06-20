import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Service, User, Offer, MarketplaceItem } from '../types';
import { SUPPORTED_COUNTRIES } from '../constants';
import { Input, Textarea } from '../components/ui/Components';
import { Stepper } from '../components/ui/ReactBits';
import { Globe, User as UserIcon, Tag, ShieldCheck, Image as ImageIcon, Check } from 'lucide-react';
import { useToast } from '../components/ui/Toast';
import { motion } from 'framer-motion';

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
        <div className="min-h-[85vh] flex items-center justify-center px-4 py-10 relative overflow-hidden">
            {/* Ambient Glow */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
              style={{
                width: '500px', height: '500px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(124,143,161,0.06) 0%, transparent 70%)',
                filter: 'blur(60px)',
              }}
            />
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-2xl p-12 text-center glass-card relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[var(--vb-accent)] to-transparent animate-pulse" />
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-2">
                  Submitting Request
                </h2>
                <p className="text-foreground/45 text-sm mb-12">Sending details to our developer team...</p>
                <div className="max-w-xl mx-auto px-4">
                     <Stepper currentStep={processingStep} steps={[{ id: 1, label: "Saving" }, { id: 2, label: "Routing" }, { id: 3, label: "Notifying" }, { id: 4, label: "Done" }]} />
                </div>
            </motion.div>
        </div>
     )
  }

  if (!service && !isCustom) return <div className="p-20 text-center text-foreground/30 font-satoshi">Loading Service Details...</div>;

  return (
    <div className="min-h-screen relative overflow-hidden py-12">
      {/* Ambient background glows */}
      <div
        className="absolute top-0 left-1/4 pointer-events-none"
        aria-hidden="true"
        style={{
          width: '600px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(124,143,161,0.03) 0%, transparent 75%)',
          filter: 'blur(80px)',
        }}
      />

      <div className="container-vb relative z-10 max-w-4xl">
        <div className="glass-card p-8 md:p-12 space-y-8">
          
          {/* Header Area */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-black/10">
              <div>
                  <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
                      {isCustom ? <span>Request Custom Build</span> : <>New Request: <span className="text-foreground/80">{service?.title}</span></>}
                  </h1>
                  <p className="text-[10px] text-foreground/40 mt-1 uppercase tracking-widest font-mono">
                    Step {step} of 2
                  </p>
              </div>
              
              <div className="flex items-center space-x-2 bg-[#EEF1F4] hover:bg-white/50 px-3.5 py-1.5 rounded-lg border border-black/10 transition-colors">
                  <Globe size={14} className="text-foreground/40" />
                  <select 
                    value={country} 
                    onChange={(e) => setCountry(e.target.value)} 
                    className="bg-transparent text-foreground text-[10px] font-display font-semibold uppercase tracking-wider outline-none cursor-pointer"
                  >
                      {SUPPORTED_COUNTRIES.map(c => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                  </select>
              </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 ? (
               <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-6 bg-[#EEF1F4] rounded-xl border border-black/10">
                      <div className="col-span-full mb-2">
                          <h4 className="text-[10px] font-display font-semibold text-foreground/80 uppercase tracking-widest flex items-center gap-2">
                              <UserIcon size={12} className="text-[var(--vb-accent)]" /> Contact & Client Details
                          </h4>
                      </div>
                      <Input label="Your Name" name="client_name" value={formData.client_name} onChange={handleChange} required />
                      {isCustom && <Input label="Project Name" name="project_title" value={formData.project_title} onChange={handleChange} placeholder="e.g. E-Commerce Platform" required />}
                      <Input label="Email Address" type="email" name="client_email" value={formData.client_email} onChange={handleChange} required />
                      <Input label="Phone / WhatsApp" type="tel" name="client_phone" value={formData.client_phone} onChange={handleChange} placeholder="+91..." required />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <Input label="Company / Brand Name" name="business_name" value={formData.business_name} onChange={handleChange} required />
                      <Input label="Industry / Niche" name="business_category" value={formData.business_category} onChange={handleChange} placeholder="e.g. Design, Retail" required />
                  </div>
                  <Input label="Address or Online Handle" name="address_or_online" value={formData.address_or_online} onChange={handleChange} placeholder="e.g. San Francisco, CA or @username" required />
                  <Textarea label="Core System Requirements" name="requirements_text" value={formData.requirements_text} onChange={handleChange} rows={6} placeholder="Provide a detailed brief of features, preferred stack, database design, design aesthetic, or other specific requirements..." required />
                  <Input label="Inspirational Reference Links" name="reference_links" value={formData.reference_links} onChange={handleChange} placeholder="competitor-site.com, dribbble.com/shot" />
                  
                  {/* Design References */}
                  {marketplaceItems.length > 0 && (
                    <div className="pt-6 border-t border-black/10 space-y-4">
                        <div className="space-y-1">
                          <h4 className="text-xs font-display font-bold text-foreground uppercase tracking-widest">Visual Project References</h4>
                          <p className="text-xs text-foreground/50 font-satoshi">Select one or more templates/projects from our studio inventory that match your desired aesthetic.</p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar p-1">
                            {marketplaceItems.map(item => (
                                <div 
                                    key={item.id} 
                                    onClick={() => toggleReference(item.id)}
                                    className={`relative cursor-pointer rounded-lg border overflow-hidden group transition-all ${
                                      selectedReferences.includes(item.id) 
                                        ? 'border-[var(--vb-accent)] ring-1 ring-[var(--vb-accent)]' 
                                        : 'border-black/10 hover:border-black/20'
                                    }`}
                                >
                                    <div className="aspect-video bg-black/5">
                                        {item.image_url ? (
                                            <img src={item.image_url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt={item.title} />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-foreground/20"><ImageIcon size={20} /></div>
                                        )}
                                    </div>
                                    <div className="p-3 bg-white/70">
                                        <p className="text-[10px] font-display font-bold text-foreground truncate">{item.title}</p>
                                        <p className="text-[9px] text-foreground/50 mt-0.5">{item.category}</p>
                                    </div>
                                    {selectedReferences.includes(item.id) && (
                                        <div className="absolute top-1.5 right-1.5 bg-[var(--vb-accent)] text-white rounded-full p-0.5">
                                            <Check size={10} strokeWidth={3} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                  )}

                  {/* Optional provisions */}
                  <div className="pt-6 border-t border-black/10 space-y-4">
                      <h4 className="text-xs font-display font-bold text-foreground uppercase tracking-widest">Asset Provisions (Include in Request)</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {(isCustom || service?.allow_domain) && (
                            <label className="flex items-center space-x-3.5 cursor-pointer p-4 rounded-xl border border-black/10 bg-white/70 hover:bg-white/90 transition-all">
                                <input 
                                  type="checkbox" 
                                  name="domain_requested" 
                                  checked={formData.domain_requested} 
                                  onChange={handleCheckbox} 
                                  className="form-checkbox h-4 w-4 text-[var(--vb-accent)] rounded bg-transparent border-black/20 focus:ring-0 focus:ring-offset-0" 
                                />
                                <div className="flex-grow">
                                    <span className="text-foreground text-sm font-semibold block">Register Domain Name</span>
                                    <span className="text-[9px] text-[#6C757D] uppercase tracking-widest font-mono">Include domain setup</span>
                                </div>
                            </label>
                        )}
                        {(isCustom || service?.allow_business_email) && (
                            <label className="flex items-center space-x-3.5 cursor-pointer p-4 rounded-xl border border-black/10 bg-white/70 hover:bg-white/90 transition-all">
                                <input 
                                  type="checkbox" 
                                  name="business_email_requested" 
                                  checked={formData.business_email_requested} 
                                  onChange={handleCheckbox} 
                                  className="form-checkbox h-4 w-4 text-[var(--vb-accent)] rounded bg-transparent border-black/20 focus:ring-0 focus:ring-offset-0" 
                                />
                                <div className="flex-grow">
                                    <span className="text-foreground text-sm font-semibold block">Business Workspace Email</span>
                                    <span className="text-[9px] text-[#6C757D] uppercase tracking-widest font-mono">Google Workspace Setup</span>
                                </div>
                            </label>
                        )}
                      </div>
                  </div>

                  <div className="flex justify-end pt-8 border-t border-black/10">
                      <button 
                        type="submit" 
                        className="btn-primary h-12 px-8 font-display text-xs tracking-widest font-semibold"
                      >
                          Review & Finalize
                      </button>
                  </div>
               </>
            ) : (
               <div className="text-center py-6">
                   <h2 className="text-xl font-display font-bold text-foreground mb-8 uppercase tracking-widest">
                     Confirm Order Request
                   </h2>
                   
                   <div className="glass-card p-8 sm:p-10 mb-8 text-left max-w-lg mx-auto space-y-5 relative overflow-hidden">
                       <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[var(--vb-accent)] to-transparent" />
                       
                       <div className="flex justify-between items-center text-foreground/90 pb-4 border-b border-black/10">
                           <span className="flex items-center gap-2 font-display font-bold text-sm uppercase tracking-widest">
                            <Tag size={14} className="text-[var(--vb-accent)]" /> 
                            {isCustom ? formData.project_title : service?.title}
                           </span>
                           <span className="font-mono text-[9px] uppercase font-bold text-[var(--vb-accent)] bg-white/70 border border-black/15 px-2 py-0.5 rounded">
                            Pending Review
                           </span>
                       </div>
                       
                       <div className="space-y-3 py-2 text-xs font-satoshi text-foreground/50">
                           <div>
                            <span className="text-foreground/30 uppercase tracking-wider block text-[9px] mb-0.5">Contact Name</span> 
                            <span className="text-foreground/80 font-medium">{formData.client_name}</span>
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-foreground/30 uppercase tracking-wider block text-[9px] mb-0.5">Phone / WA</span> 
                              <span className="text-foreground/80 font-mono">{formData.client_phone}</span>
                            </div>
                            <div>
                              <span className="text-foreground/30 uppercase tracking-wider block text-[9px] mb-0.5">Email</span> 
                              <span className="text-foreground/80 font-mono">{formData.client_email}</span>
                            </div>
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                            {formData.domain_requested && (
                              <div>
                                <span className="text-foreground/30 uppercase tracking-wider block text-[9px] mb-0.5">Asset</span> 
                                <span className="text-foreground/85 font-medium">Custom Domain Registration</span>
                              </div>
                            )}
                            {formData.business_email_requested && (
                              <div>
                                <span className="text-foreground/30 uppercase tracking-wider block text-[9px] mb-0.5">Asset</span> 
                                <span className="text-foreground/85 font-medium">Workspace Email Setup</span>
                              </div>
                            )}
                           </div>
                           {selectedReferences.length > 0 && (
                               <div>
                                <span className="text-foreground/30 uppercase tracking-wider block text-[9px] mb-0.5">Design References</span> 
                                <span className="text-foreground/85 font-medium">{selectedReferences.length} items attached</span>
                               </div>
                           )}
                       </div>

                       <div className="border-t border-black/10 pt-5 flex justify-between text-xl font-display font-semibold text-foreground items-center">
                           <span className="text-xs uppercase tracking-widest text-[#6C757D] font-satoshi">
                              Estimated Budget
                           </span>
                           <span className="text-sm font-semibold text-[var(--vb-accent)]">
                            To Be Determined
                           </span>
                       </div>
                       <p className="text-[10px] text-[#6C757D] text-center font-satoshi mt-2 italic">
                          A customized quote will be provided by your developer after review.
                       </p>
                   </div>

                   <div className="flex items-start gap-4.5 max-w-lg mx-auto mb-8 p-4 border border-black/10 bg-[#EEF1F4] rounded-xl text-left">
                      <ShieldCheck className="text-emerald-400 shrink-0 mt-0.5" size={18} />
                      <div className="space-y-1">
                          <h4 className="text-xs font-display font-semibold text-foreground uppercase tracking-widest">
                            No Initial Charges
                          </h4>
                          <p className="text-xs text-[#6C757D] font-satoshi leading-relaxed">
                            Submitting this build brief is completely free. We will review your files, design a detailed proposal/quote, and post it to your dashboard.
                          </p>
                      </div>
                   </div>
                   
                   <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button 
                        type="button" 
                        onClick={() => { setStep(1); window.scrollTo(0,0); }} 
                        disabled={isProcessing} 
                        className="btn-ghost h-12 px-8 text-xs tracking-widest font-semibold"
                      >
                        Adjust Brief
                      </button>
                      <button 
                        type="submit" 
                        className="btn-primary h-12 px-8 font-display text-xs tracking-widest font-semibold min-w-[200px]"
                      >
                        Submit Order Brief
                      </button>
                   </div>
               </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewOrder;
