
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, CheckCircle, 
  Edit, Trash2, Plus, Loader2, Filter, Calendar, Star, Package, 
  ImageIcon, Clock, Users, ClipboardList, 
  BarChart3, TrendingUp, DollarSign, Eye, X, TicketPercent, Layers, ToggleLeft, ToggleRight, Settings, 
  Lightbulb,
  User as UserIcon, Download, ChevronLeft, ChevronRight, Mail, Globe as GlobeIcon,
  CreditCard, HardDrive, Send, LogOut, Shield
} from 'lucide-react';
import { api } from '../services/api';
import { Order, Service, User, Offer, MarketplaceItem, Task, AnalyticsData, Role, ProjectSuggestion } from '../types';
import { Button, Card, Badge, Input, Textarea } from '../components/ui/Components';
import { ScrollFloat } from '../components/ui/ReactBits';
import { useToast } from '../components/ui/Toast';

// --- 1. Admin Analytics Component ---
const AdminAnalytics: React.FC<{ user: User }> = ({ user: _user }) => {
    const [data, setData] = useState<AnalyticsData | null>(null);

    useEffect(() => {
        api.getAnalytics().then(setData);
    }, []);

    if (!data) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-vision-primary" /></div>;

    const salesTrend = data.sales_trend && data.sales_trend.length > 0 ? data.sales_trend : [0, 0, 0, 0, 0, 0, 0];
    const maxSale = Math.max(...salesTrend, 100);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">
                <ScrollFloat>Platform Analytics</ScrollFloat>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 flex flex-col justify-between h-32 bg-gradient-to-br from-vision-900 to-vision-primary/10 border-vision-primary/30">
                    <div className="flex justify-between items-start">
                         <span className="text-gray-400 text-sm">Total Revenue</span>
                         <DollarSign className="text-vision-primary" size={20} />
                    </div>
                    <div className="text-3xl font-bold text-white">${(data.total_revenue || 0).toLocaleString()}</div>
                    <div className="text-xs text-green-400 flex items-center"><TrendingUp size={10} className="mr-1"/> +12% this month</div>
                </Card>
                <Card className="p-4 flex flex-col justify-between h-32">
                    <div className="flex justify-between items-start">
                         <span className="text-gray-400 text-sm">Total Views</span>
                         <Eye className="text-blue-400" size={20} />
                    </div>
                    <div className="text-3xl font-bold text-white">{(data.total_views || 0).toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Across all projects</div>
                </Card>
                <Card className="p-4 flex flex-col justify-between h-32">
                    <div className="flex justify-between items-start">
                         <span className="text-gray-400 text-sm">Active Orders</span>
                         <Package className="text-purple-400" size={20} />
                    </div>
                    <div className="text-3xl font-bold text-white">{data.active_projects || 0}</div>
                    <div className="text-xs text-gray-500">In production</div>
                </Card>
                <Card className="p-4 flex flex-col justify-between h-32">
                     <div className="flex justify-between items-start">
                         <span className="text-gray-400 text-sm">Top Developer</span>
                         <Star className="text-yellow-400" size={20} fill="currentColor" />
                    </div>
                    <div className="text-lg font-bold text-white truncate">{data.top_developer?.name || 'N/A'}</div>
                    <div className="w-full bg-gray-700 h-1.5 rounded-full mt-2">
                        <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: `${data.top_developer?.performance_score || 0}%` }}></div>
                    </div>
                    <div className="text-xs text-right text-gray-400 mt-1">Score: {data.top_developer?.performance_score || 0}</div>
                </Card>
            </div>
            
            <Card className="p-6">
                <h3 className="text-lg font-bold text-white mb-4">Sales Trend (Last 7 Days)</h3>
                <div className="h-48 flex items-end justify-between gap-2 px-2">
                    {salesTrend.map((val, idx) => (
                        <div key={idx} className="flex-1 flex flex-col justify-end group cursor-pointer">
                            <div 
                                className="w-full bg-vision-primary/30 hover:bg-vision-primary/80 transition-all rounded-t-sm relative"
                                style={{ height: `${(val / maxSale) * 100}%` }}
                            >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    ${val}
                                </div>
                            </div>
                            <div className="text-[10px] text-gray-500 text-center mt-2">D-{6-idx}</div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

// --- 2. Admin Services Component --- 
const AdminServices: React.FC<{ user: User }> = ({ user: _user }) => {
    const [services, setServices] = useState<Service[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const toast = useToast();
    
    // Create Form Data
    const [formData, setFormData] = useState<Partial<Service>>({
        title: '',
        description: '',
        base_price: 0,
        icon: 'Sparkles',
        features: [],
        is_enabled: true,
        allow_domain: true,
        domain_price: 15,
        allow_business_email: true,
        business_email_price: 50
    });
    
    const [featureInput, setFeatureInput] = useState('');
    const AVAILABLE_ICONS = ['Code', 'Layout', 'GraduationCap', 'Bot', 'Server', 'Database', 'Globe', 'Smartphone', 'PenTool', 'Sparkles'];

    useEffect(() => {
        api.getServices().then(setServices);
    }, []);

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            const updated = await api.updateService(id, { is_enabled: !currentStatus });
            setServices(updated);
            toast.success(`Service ${!currentStatus ? 'enabled' : 'disabled'}`);
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    const addFeature = () => {
        if(featureInput.trim()) {
            setFormData(prev => ({ ...prev, features: [...(prev.features || []), featureInput.trim()] }));
            setFeatureInput('');
        }
    };

    const removeFeature = (idx: number) => {
        setFormData(prev => ({ ...prev, features: (prev.features || []).filter((_, i) => i !== idx) }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            let updated;
            if (editingId) {
                updated = await api.updateService(editingId, formData);
                toast.success("Service updated successfully");
            } else {
                updated = await api.createService(formData as any);
                toast.success("Service created successfully");
            }
            setServices(updated);
            resetForm();
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (service: Service) => {
        setFormData({
            title: service.title,
            description: service.description,
            base_price: service.base_price,
            icon: service.icon,
            features: [...service.features],
            is_enabled: service.is_enabled,
            allow_domain: service.allow_domain,
            domain_price: service.domain_price,
            allow_business_email: service.allow_business_email,
            business_email_price: service.business_email_price
        });
        setEditingId(service.id);
        setShowForm(true);
        const formEl = document.getElementById('service-form');
        if (formEl) formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({ 
            title: '', 
            description: '', 
            base_price: 0, 
            icon: 'Sparkles', 
            features: [], 
            is_enabled: true,
            allow_domain: true,
            domain_price: 15,
            allow_business_email: true,
            business_email_price: 50
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-bold text-white">Manage Services</h2>
                 <Button onClick={() => showForm ? resetForm() : setShowForm(true)}>
                     {showForm ? 'Cancel' : <><Plus size={16} className="mr-2"/> Add New Service</>}
                 </Button>
            </div>

            {showForm && (
                <Card id="service-form" className="mb-8 border-vision-primary/30 animate-in fade-in slide-in-from-top-4">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-white">{editingId ? 'Edit Service Record' : 'Create New Offering'}</h3>
                        {editingId && <Badge variant="info">Active Editing</Badge>}
                    </div>
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Service Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Modern Web SaaS" required />
                            <Input type="number" label="Global Base Rate ($)" value={formData.base_price} onChange={e => setFormData({...formData, base_price: parseFloat(e.target.value)})} required />
                        </div>
                        <Textarea label="Executive Summary" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Describe technical scope..." required />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Interface Icon</label>
                                <select 
                                    className="flex h-11 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-gray-100 outline-none focus:ring-1 focus:ring-vision-primary/50"
                                    value={formData.icon}
                                    onChange={(e) => setFormData({...formData, icon: e.target.value})}
                                >
                                    {AVAILABLE_ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                                </select>
                            </div>
                            <div className="flex items-center h-full pt-6">
                                <label className="flex items-center space-x-3 cursor-pointer group p-3 rounded-lg border border-white/5 hover:border-white/10 transition-all">
                                    <input 
                                        type="checkbox" 
                                        checked={formData.is_enabled} 
                                        onChange={e => setFormData({...formData, is_enabled: e.target.checked})} 
                                        className="form-checkbox h-5 w-5 text-vision-primary rounded bg-transparent border-gray-600 focus:ring-0"
                                    />
                                    <span className="text-gray-300 text-sm font-bold uppercase tracking-widest group-hover:text-vision-primary transition-colors">Visible to Public</span>
                                </label>
                            </div>
                        </div>

                        <div className="p-5 bg-black/40 rounded-2xl border border-white/5 space-y-6 shadow-inner">
                            <h4 className="text-xs font-bold text-vision-primary uppercase tracking-widest flex items-center gap-2">
                                <Settings size={14} /> Add-on Provisions & Pricing
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={formData.allow_domain} 
                                            onChange={e => setFormData({...formData, allow_domain: e.target.checked})} 
                                            className="form-checkbox h-4 w-4 text-vision-primary rounded bg-transparent border-gray-700"
                                        />
                                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Enable Domain Provisioning</span>
                                    </label>
                                    <Input 
                                        type="number" 
                                        label="Domain Rate ($)" 
                                        value={formData.domain_price} 
                                        onChange={e => setFormData({...formData, domain_price: parseFloat(e.target.value)})}
                                        disabled={!formData.allow_domain}
                                    />
                                </div>
                                <div className="space-y-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={formData.allow_business_email} 
                                            onChange={e => setFormData({...formData, allow_business_email: e.target.checked})} 
                                            className="form-checkbox h-4 w-4 text-vision-primary rounded bg-transparent border-gray-700"
                                        />
                                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Enable Business Workspace</span>
                                    </label>
                                    <Input 
                                        type="number" 
                                        label="Email Rate ($)" 
                                        value={formData.business_email_price} 
                                        onChange={e => setFormData({...formData, business_email_price: parseFloat(e.target.value)})}
                                        disabled={!formData.allow_business_email}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Technical Feature Matrix</label>
                            <div className="flex gap-2 mb-3">
                                <Input value={featureInput} onChange={e => setFeatureInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())} placeholder="e.g. 1 Year Maintenance" className="flex-1" />
                                <Button type="button" onClick={addFeature} variant="secondary">Append</Button>
                            </div>
                            <div className="flex flex-wrap gap-2 min-h-[50px] p-3 bg-black/40 rounded-xl border border-white/5">
                                {formData.features?.length === 0 && <span className="text-xs text-gray-600 italic">No features defined...</span>}
                                {formData.features?.map((feat, i) => (
                                    <Badge key={i} className="bg-vision-primary/10 text-vision-primary py-1.5 pl-3 pr-2 flex items-center gap-2 border-vision-primary/20">
                                        <span className="text-[10px] font-bold">{feat}</span>
                                        <button type="button" onClick={() => removeFeature(i)} className="hover:text-red-400 transition-colors"><X size={12}/></button>
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 gap-3 border-t border-white/5">
                             <Button type="button" variant="ghost" onClick={resetForm}>Discard</Button>
                             <Button type="submit" disabled={isSubmitting} className="min-w-[180px]">
                                {isSubmitting ? <Loader2 className="animate-spin" /> : (editingId ? 'Update Service' : 'Authorize Listing')}
                             </Button>
                        </div>
                    </form>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map(service => (
                    <Card key={service.id} className="relative group hover:border-vision-primary/50 transition-all flex flex-col justify-between overflow-hidden bg-white/[0.01]">
                        <div className={`absolute top-0 right-0 w-20 h-20 -mr-10 -mt-10 blur-3xl opacity-20 transition-all ${service.is_enabled ? 'bg-cyan-500' : 'bg-yellow-500'}`}></div>
                        
                        <div>
                            <div className="flex justify-between items-start mb-5">
                                <div className="p-2.5 bg-white/5 rounded-xl text-vision-primary border border-white/10 shadow-lg">
                                    <Layers size={22} />
                                </div>
                                <Badge variant={service.is_enabled ? 'success' : 'warning'} className="uppercase text-[9px] tracking-widest font-bold">
                                    {service.is_enabled ? 'Public' : 'Hidden'}
                                </Badge>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-vision-primary transition-colors">{service.title}</h3>
                            <p className="text-gray-500 text-sm mb-6 line-clamp-3 leading-relaxed">{service.description}</p>
                            <div className="text-3xl font-bold text-vision-primary mb-6 flex items-baseline gap-1 font-sora">
                                ${service.base_price}
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] ml-2">Base</span>
                            </div>
                            <div className="space-y-4 mb-6">
                                <div className="flex flex-wrap gap-2">
                                    {service.allow_domain && (
                                        <Badge variant="info" className="text-[9px] bg-blue-500/10 border-blue-500/20 font-bold py-1">
                                            <GlobeIcon size={10} className="mr-1.5" /> DOMAIN (${service.domain_price})
                                        </Badge>
                                    )}
                                    {service.allow_business_email && (
                                        <Badge variant="info" className="text-[9px] bg-purple-500/10 border-purple-500/20 font-bold py-1">
                                            <Mail size={10} className="mr-1.5" /> EMAIL (${service.business_email_price})
                                        </Badge>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    {service.features.slice(0, 3).map((f, i) => (
                                        <div key={i} className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-vision-primary" /> 
                                            <span className="truncate">{f}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 pt-5 border-t border-white/5">
                            <Button variant="secondary" size="sm" className="flex-1 bg-white/5 border-white/10 hover:bg-vision-primary hover:text-vision-900 font-bold h-10" onClick={() => handleEdit(service)}>
                                <Edit className="mr-2" size={14} /> EDIT
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1 border-white/10 hover:bg-white/5 h-10" onClick={() => toggleStatus(service.id, service.is_enabled)}>
                                {service.is_enabled ? <ToggleRight className="mr-2" /> : <ToggleLeft className="mr-2" />}
                                {service.is_enabled ? 'HIDE' : 'SHOW'}
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

// --- 3. Admin Orders Component ---
const AdminOrders: React.FC<{ user: User }> = ({ user }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null); // For managing
    
    // Financial State
    const [finTotal, setFinTotal] = useState<number>(0);
    const [finDeposit, setFinDeposit] = useState<number>(0);
    const [isUpdatingFin, setIsUpdatingFin] = useState(false);

    // Upload State
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const toast = useToast();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        const data = await api.getOrders();
        setOrders(data);
        setLoading(false);
    };

    const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
        try {
            await api.updateOrderStatus(orderId, newStatus, user.id);
            toast.success(`Order status updated`);
            fetchOrders();
        } catch (e: any) {
            toast.error("Failed to update status");
        }
    };

    const openManager = (order: Order) => {
        setSelectedOrder(order);
        setFinTotal(order.total_amount);
        setFinDeposit(order.deposit_amount || 0);
    };

    const saveFinancials = async () => {
        if (!selectedOrder) return;
        setIsUpdatingFin(true);
        try {
            // Update financials AND set status to 'accepted' so the client can see pay buttons
            await api.updateOrderFinancials(selectedOrder.id, finTotal, finDeposit);
            toast.success("Quote sent & Client notified to pay deposit.");
            fetchOrders();
            setSelectedOrder(null);
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setIsUpdatingFin(false);
        }
    };

    const handleUploadDeliverable = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0] || !selectedOrder) return;
        setUploading(true);
        try {
            const url = await api.uploadFile(e.target.files[0]);
            await api.addDeliverable(selectedOrder.id, url);
            toast.success("Deliverable attached successfully");
            fetchOrders();
            // Refresh local state if needed or just close
            setSelectedOrder(null);
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setUploading(false);
        }
    };

    const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-vision-primary" /></div>;

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-bold text-white">Project Command Center</h2>
                 <div className="flex items-center gap-2">
                     <Filter size={16} className="text-gray-500" />
                     <select 
                        value={filter} 
                        onChange={e => setFilter(e.target.value)}
                        className="bg-black/40 border border-white/10 rounded-lg text-xs font-bold uppercase tracking-widest text-gray-300 px-4 py-2.5 outline-none focus:border-vision-primary transition-colors cursor-pointer"
                     >
                         <option value="all">All Logs</option>
                         <option value="pending">Pending Review</option>
                         <option value="accepted">Accepted/Quoted</option>
                         <option value="in_progress">In Production</option>
                         <option value="mockup_ready">Mockup Ready</option>
                         <option value="completed">Cycle Complete</option>
                     </select>
                 </div>
             </div>

             {/* Order Manager Modal */}
             {selectedOrder && (
                 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                     <Card className="w-full max-w-lg relative border-vision-primary/30">
                         <button onClick={() => setSelectedOrder(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20} /></button>
                         <h3 className="text-xl font-bold text-white mb-6">Manage Order #{selectedOrder.id.slice(-6).toUpperCase()}</h3>
                         
                         <div className="space-y-6">
                             {/* Financials Section */}
                             <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                 <h4 className="text-sm font-bold text-vision-primary uppercase tracking-widest mb-4 flex items-center gap-2"><CreditCard size={16}/> Quote & Billing</h4>
                                 <div className="grid grid-cols-2 gap-4 mb-4">
                                     <Input label="Total Amount ($)" type="number" value={finTotal} onChange={(e) => setFinTotal(parseFloat(e.target.value))} />
                                     <Input label="Deposit Required ($)" type="number" value={finDeposit} onChange={(e) => setFinDeposit(parseFloat(e.target.value))} />
                                 </div>
                                 <p className="text-xs text-gray-500 mb-4 bg-black/30 p-2 rounded">
                                     <span className="text-yellow-500 font-bold">Note:</span> Setting these values and saving will change order status to <strong>Accepted</strong> and enable payment buttons for the client.
                                 </p>
                                 <Button onClick={saveFinancials} disabled={isUpdatingFin} className="w-full">
                                     {isUpdatingFin ? <Loader2 className="animate-spin" /> : <><Send size={14} className="mr-2" /> Send Quote & Request Deposit</>}
                                 </Button>
                             </div>

                             {/* Deliverables Section */}
                             <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                 <h4 className="text-sm font-bold text-vision-secondary uppercase tracking-widest mb-4 flex items-center gap-2"><HardDrive size={16}/> Upload Proof/Deliverable</h4>
                                 <input type="file" ref={fileInputRef} className="hidden" onChange={handleUploadDeliverable} />
                                 <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-full border-dashed border-white/20 hover:bg-white/5 h-20 flex-col gap-2">
                                     {uploading ? <Loader2 className="animate-spin" /> : <ImageIcon size={24} className="text-gray-400" />}
                                     <span className="text-xs text-gray-500">Click to upload Mockups or Final Files</span>
                                 </Button>
                             </div>
                         </div>
                     </Card>
                 </div>
             )}

             <div className="overflow-x-auto rounded-2xl border border-white/5 bg-black/40 shadow-2xl">
                 <table className="w-full text-left text-sm text-gray-400">
                     <thead className="bg-white/[0.02] text-gray-500 uppercase text-[10px] tracking-[0.2em] font-bold">
                         <tr>
                             <th className="p-5">Reference</th>
                             <th className="p-5">Provision</th>
                             <th className="p-5">Contact Details</th>
                             <th className="p-5">Amount / Budget</th>
                             <th className="p-5">Status</th>
                             <th className="p-5 text-right">Moderation</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                         {filteredOrders.map(order => (
                             <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                                 <td className="p-5 font-mono text-[10px] opacity-40">#{order.id.slice(-8).toUpperCase()}</td>
                                 <td className="p-5">
                                     <div className="font-bold text-white group-hover:text-vision-primary transition-colors flex items-center gap-2">
                                         {order.service_title}
                                         {order.is_custom && <Badge variant="info" className="text-[7px]">CUSTOM</Badge>}
                                     </div>
                                     <div className="text-[10px] text-gray-600 mt-1">{new Date(order.created_at).toLocaleDateString()}</div>
                                 </td>
                                 <td className="p-5">
                                     <div className="text-white text-xs font-bold">{order.requirements?.client_name || order.requirements?.business_name || 'Anonymous'}</div>
                                     <div className="text-[10px] text-gray-500 mt-1 font-mono">{order.requirements?.client_email || 'N/A'}</div>
                                     <div className="text-[10px] text-vision-secondary mt-0.5 font-bold">{order.requirements?.client_phone || ''}</div>
                                 </td>
                                 <td className="p-5">
                                     <div className="font-bold text-white">${order.total_amount}</div>
                                     {order.requirements?.client_budget && order.total_amount === 0 && (
                                         <div className="text-[9px] text-yellow-500/70 font-bold uppercase mt-1">Target: {order.requirements.client_budget}</div>
                                     )}
                                     {order.amount_paid > 0 && <Badge variant="success" className="mt-1 text-[8px]">PAID: ${order.amount_paid}</Badge>}
                                 </td>
                                 <td className="p-5">
                                     <Badge variant={order.status === 'completed' ? 'success' : order.status === 'in_progress' ? 'info' : 'warning'}>
                                         {order.status.replace('_', ' ')}
                                     </Badge>
                                 </td>
                                 <td className="p-5 text-right">
                                     <div className="flex justify-end items-center gap-3">
                                         <Button size="sm" variant="secondary" onClick={() => openManager(order)} className="h-8 text-[10px] px-3">
                                             MANAGE
                                         </Button>
                                         <Link to={`/dashboard/order/${order.id}`}>
                                            <Button size="sm" variant="ghost" className="h-9 w-9 p-0 hover:bg-vision-primary/10 hover:text-vision-primary" title="Access Project Dashboard"><Eye size={16} /></Button>
                                         </Link>
                                         
                                         <div className="relative">
                                             <select 
                                                value={order.status} 
                                                onChange={(e) => handleStatusUpdate(order.id, e.target.value as Order['status'])}
                                                className="appearance-none bg-black/60 border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg pl-4 pr-10 py-2.5 focus:outline-none focus:border-vision-primary hover:border-white/20 transition-all cursor-pointer shadow-inner"
                                             >
                                                <option value="pending">Pending</option>
                                                <option value="accepted">Accepted</option>
                                                <option value="in_progress">Progress</option>
                                                <option value="mockup_ready">Mockup</option>
                                                <option value="completed">Complete</option>
                                                <option value="cancelled">Void</option>
                                             </select>
                                             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                                {/* ChevronDown icon was missing in previous import list but used here. It is usually available in lucide-react. 
                                                    Since I removed imports, I need to make sure I didn't remove it or add it back if needed.
                                                    Wait, ChevronDown was in imports in previous file version? No, it was missing in the import list provided in the error log.
                                                    Let's check the error log again. 
                                                    "pages/Admin.tsx:11:16 - error TS6133: 'Search' is declared but its value is never read."
                                                    ChevronDown was imported in line 11. It IS used.
                                                    I removed unused imports. ChevronDown is used so I should keep it.
                                                */}
                                             </div>
                                         </div>
                                     </div>
                                 </td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
                 {filteredOrders.length === 0 && <div className="p-20 text-center text-gray-600 font-mono uppercase tracking-[0.3em]">System history clean</div>}
             </div>
        </div>
    );
};

// --- 4. Admin Marketplace Component ---
const AdminMarketplace: React.FC<{ user: User }> = ({ user }) => {
    const [items, setItems] = useState<MarketplaceItem[]>([]);
    const [sales, setSales] = useState<Order[]>([]); // Sales ledger for current dev
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState<Partial<MarketplaceItem>>({
        title: '', price: 0, short_description: '', full_description: '', tags: [], features: []
    });
    const toast = useToast();

    useEffect(() => {
        api.getMarketplaceItems().then(setItems);
        // Fetch specific sales for this developer
        api.getMarketplaceSales(user.id).then(setSales);
    }, [user.id]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.createMarketplaceItem({
                ...formData as any,
                developer_id: user.id,
                developer_name: user.name
            });
            toast.success("Item listed successfully");
            setShowForm(false);
            api.getMarketplaceItems().then(setItems);
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure? This cannot be undone.")) return;
        try {
            await api.deleteMarketplaceItem(id);
            setItems(prev => prev.filter(i => i.id !== id));
            toast.success("Item removed");
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    return (
        <div className="space-y-8">
             <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-bold text-white">Marketplace Listings</h2>
                 <Button onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : <><Plus size={16} className="mr-2"/> List New Project</>}</Button>
             </div>

             {/* Sales Ledger */}
             <div className="bg-gradient-to-r from-green-500/5 to-transparent border border-green-500/20 rounded-xl p-6">
                 <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                     <DollarSign className="text-green-400" /> Sales Ledger
                 </h3>
                 {sales.length === 0 ? (
                     <p className="text-sm text-gray-500 italic">No sales recorded yet.</p>
                 ) : (
                     <div className="overflow-x-auto">
                         <table className="w-full text-left text-sm text-gray-300">
                             <thead className="text-xs uppercase text-gray-500 border-b border-white/10">
                                 <tr>
                                     <th className="pb-3">Project</th>
                                     <th className="pb-3">Buyer</th>
                                     <th className="pb-3">Date</th>
                                     <th className="pb-3 text-right">Amount</th>
                                 </tr>
                             </thead>
                             <tbody className="divide-y divide-white/5">
                                 {sales.map(sale => (
                                     <tr key={sale.id}>
                                         <td className="py-3 font-medium text-white">{sale.service_title}</td>
                                         <td className="py-3">
                                             <div className="text-xs">{sale.requirements.client_name || 'Guest'}</div>
                                             <div className="text-[10px] text-gray-500">{sale.requirements.client_email}</div>
                                         </td>
                                         <td className="py-3 text-xs text-gray-500">{new Date(sale.created_at).toLocaleDateString()}</td>
                                         <td className="py-3 text-right font-bold text-green-400">+${sale.total_amount}</td>
                                     </tr>
                                 ))}
                             </tbody>
                         </table>
                         <div className="mt-4 pt-4 border-t border-white/10 text-right text-sm text-gray-400">
                             Total Sales Count: <span className="text-white font-bold">{sales.length}</span>
                         </div>
                     </div>
                 )}
             </div>

             {showForm && (
                 <Card className="mb-6 border-vision-primary/30 animate-in fade-in zoom-in-95 duration-300">
                     <form onSubmit={handleCreate} className="space-y-4">
                         <div className="grid grid-cols-2 gap-4">
                             <Input label="Project Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                             <Input type="number" label="Sales Price ($)" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} required />
                         </div>
                         <Input label="Summary" value={formData.short_description} onChange={e => setFormData({...formData, short_description: e.target.value})} placeholder="Catchy one-liner for search results..." required />
                         <Textarea label="Full Details & Documentation" value={formData.full_description} onChange={e => setFormData({...formData, full_description: e.target.value})} placeholder="Explain setup instructions, stack, etc..." required />
                         
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <Input label="Featured Image URL" value={formData.image_url || ''} onChange={e => setFormData({...formData, image_url: e.target.value})} placeholder="https://..." />
                             <Input label="Instant Download Link" value={formData.download_url || ''} onChange={e => setFormData({...formData, download_url: e.target.value})} placeholder="Drive/Dropbox ZIP link" />
                         </div>
                         
                         <Input label="Live Demo URL" value={formData.demo_url || ''} onChange={e => setFormData({...formData, demo_url: e.target.value})} placeholder="https://..." />
                         
                         <div className="grid grid-cols-2 gap-4">
                             <Input label="Tags (comma separated)" value={formData.tags?.join(',')} onChange={e => setFormData({...formData, tags: e.target.value.split(',').map(s=>s.trim())})} placeholder="React, Node, Tailwind..." />
                             <Input label="Features (comma separated)" value={formData.features?.join(',')} onChange={e => setFormData({...formData, features: e.target.value.split(',').map(s=>s.trim())})} placeholder="Clean Code, Responsive, SEO..." />
                         </div>

                         <div className="flex justify-end pt-4 border-t border-white/5">
                             <Button type="submit">Publish to Marketplace</Button>
                         </div>
                     </form>
                 </Card>
             )}

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {items.map(item => (
                     <Card key={item.id} className="flex flex-col h-full group hover:border-vision-primary/30 transition-all">
                         <div className="h-40 bg-black/40 rounded-lg mb-4 overflow-hidden relative">
                             {item.image_url ? (
                                 <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                             ) : (
                                 <div className="flex items-center justify-center h-full text-gray-700"><ImageIcon size={32} /></div>
                             )}
                             <div className="absolute top-2 right-2 flex gap-1">
                                 <Button size="icon" variant="ghost" className="bg-black/50 hover:bg-red-500/80 w-8 h-8 rounded-full" onClick={() => handleDelete(item.id)}>
                                     <Trash2 size={14} className="text-white" />
                                 </Button>
                             </div>
                         </div>
                         <h3 className="font-bold text-white mb-1">{item.title}</h3>
                         <div className="text-[10px] text-gray-500 mb-2 uppercase tracking-widest flex items-center gap-1">
                            <UserIcon size={10} /> {item.developer_name}
                         </div>
                         <p className="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">{item.short_description}</p>
                         <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/5">
                             <span className="font-bold text-vision-primary text-lg">${item.price}</span>
                             <div className="flex items-center gap-3 text-[10px] text-gray-500">
                                <span className="flex items-center gap-1"><TrendingUp size={10}/> {item.views} views</span>
                                <span className="flex items-center gap-1"><Download size={10}/> {item.purchases} sales</span>
                             </div>
                         </div>
                     </Card>
                 ))}
             </div>
        </div>
    );
};

// --- 5. Admin Team Component --- (Unchanged structure)
const AdminTeam: React.FC<{ user: User }> = ({ user }) => {
    // ... [Previous Team Logic - Shortened]
    const [members, setMembers] = useState<User[]>([]);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteName, setInviteName] = useState('');
    const [inviteRole, setInviteRole] = useState<Role>('developer');
    const [isInviting, setIsInviting] = useState(false);
    const toast = useToast();

    useEffect(() => {
        api.getTeamMembers().then(setMembers);
    }, []);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsInviting(true);
        try {
            const updated = await api.inviteTeamMember(inviteName, inviteEmail, inviteRole, user.id);
            setMembers(updated);
            toast.success("Team member invited");
            setInviteEmail('');
            setInviteName('');
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setIsInviting(false);
        }
    };

    const handleRemove = async (id: string) => {
        if (!window.confirm("Access revocation is permanent. Remove this user?")) return;
        try {
            const updated = await api.removeTeamMember(id, user.id);
            setMembers(updated);
            toast.success("Access revoked");
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">System Access Control</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-3">
                     {members.map(member => (
                         <div key={member.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 transition-colors">
                             <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-vision-primary to-vision-secondary flex items-center justify-center text-vision-900 font-bold">
                                     {member.name.charAt(0)}
                                 </div>
                                 <div>
                                     <div className="font-bold text-white flex items-center gap-2">
                                         {member.name} 
                                         {member.id === user.id && <span className="text-[10px] bg-white/10 px-1.5 rounded text-gray-400">SELF</span>}
                                     </div>
                                     <div className="text-xs text-gray-500 font-mono">{member.email}</div>
                                 </div>
                             </div>
                             <div className="flex items-center gap-6">
                                 <Badge variant={member.role === 'super_admin' ? 'warning' : member.role === 'admin' ? 'info' : 'default'} className="uppercase">
                                     {member.role.replace('_', ' ')}
                                 </Badge>
                                 {member.id !== user.id && user.role === 'super_admin' && (
                                     <button onClick={() => handleRemove(member.id)} className="text-gray-600 hover:text-red-500 transition-colors p-2" title="Revoke Access">
                                         <Trash2 size={16} />
                                     </button>
                                 )}
                             </div>
                         </div>
                     ))}
                </div>

                <Card className="h-fit sticky top-8">
                    <h3 className="font-bold text-white mb-4">Add Operative</h3>
                    <p className="text-xs text-gray-500 mb-6">User will receive an invite email to set their security credentials.</p>
                    <form onSubmit={handleInvite} className="space-y-4">
                        <Input placeholder="Full Name" value={inviteName} onChange={e => setInviteName(e.target.value)} required />
                        <Input type="email" placeholder="Email Address" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} required />
                        <div className="space-y-1">
                            <label className="text-[10px] text-gray-500 uppercase tracking-widest">Access Level</label>
                            <select 
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-sm text-gray-200 outline-none focus:border-vision-primary"
                                value={inviteRole}
                                onChange={(e) => setInviteRole(e.target.value as Role)}
                            >
                                <option value="developer">Developer (Limited)</option>
                                <option value="admin">System Admin</option>
                            </select>
                        </div>
                        <Button type="submit" className="w-full mt-4" disabled={isInviting}>
                            {isInviting ? <Loader2 className="animate-spin" /> : 'Send Credentials'}
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
};

// --- 6. Admin Offers Component --- (Unchanged)
const AdminOffers: React.FC = () => {
    // ... [Previous Offers Logic]
    const [offers, setOffers] = useState<Offer[]>([]);
    const [formData, setFormData] = useState({ title: '', description: '', code: '', discountPercentage: 10, validUntil: '' });
    const toast = useToast();

    useEffect(() => {
        api.getOffers().then(setOffers);
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const updated = await api.createOffer(formData);
            setOffers(updated);
            toast.success("Coupon code active");
            setFormData({ title: '', description: '', code: '', discountPercentage: 10, validUntil: '' });
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const updated = await api.deleteOffer(id);
            setOffers(updated);
            toast.success("Offer retired");
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Campaign Management</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="h-fit">
                    <h3 className="font-bold text-white mb-4">Create Promotion</h3>
                    <form onSubmit={handleCreate} className="space-y-3">
                        <Input placeholder="Campaign Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                        <Input placeholder="Short Summary" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
                        <div className="grid grid-cols-2 gap-2">
                             <Input placeholder="PROMO20" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} required />
                             <Input type="number" placeholder="Discount %" value={formData.discountPercentage} onChange={e => setFormData({...formData, discountPercentage: parseInt(e.target.value)})} required />
                        </div>
                        <Input type="date" label="Expiry Date" value={formData.validUntil} onChange={e => setFormData({...formData, validUntil: e.target.value})} />
                        <Button type="submit" className="w-full mt-2">Generate Code</Button>
                    </form>
                </Card>

                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {offers.map(offer => (
                        <Card key={offer.id} className="relative border-dashed border-2 border-vision-primary/20 bg-black/20 hover:border-vision-primary/40 transition-colors">
                            <button onClick={() => handleDelete(offer.id)} className="absolute top-2 right-2 text-gray-600 hover:text-red-400 p-2">
                                <X size={16} />
                            </button>
                            <div className="text-vision-primary font-mono text-xl font-bold mb-2 tracking-widest">{offer.code}</div>
                            <h4 className="font-bold text-white text-sm">{offer.title}</h4>
                            <p className="text-[11px] text-gray-500 mb-3 leading-relaxed">{offer.description}</p>
                            <div className="flex justify-between items-center text-[10px] text-gray-400 mt-4 border-t border-white/5 pt-3">
                                <span className="font-bold text-white">{offer.discountPercentage}% REDUCTION</span>
                                <span className="flex items-center gap-1">
                                    <Clock size={10} /> 
                                    {offer.validUntil ? `Expires ${new Date(offer.validUntil).toLocaleDateString()}` : 'Indefinite'}
                                </span>
                            </div>
                        </Card>
                    ))}
                    {offers.length === 0 && <div className="col-span-full py-12 text-center text-gray-600 italic border-2 border-dashed border-white/5 rounded-xl">No active promotional campaigns.</div>}
                </div>
            </div>
        </div>
    );
};

// --- 7. Admin Tasks Component --- (Unchanged)
const AdminTasks: React.FC<{ user: User }> = ({ user }) => {
    // ... [Previous Tasks Logic - Shortened]
    const [tasks, setTasks] = useState<Task[]>([]);
    const [developers, setDevelopers] = useState<User[]>([]);
    const [newTask, setNewTask] = useState({ title: '', description: '', assigned_to_id: '', due_date: '', priority: 'medium' as 'low'|'medium'|'high' });
    const toast = useToast();

    useEffect(() => {
        api.getTasks().then(setTasks);
        api.getDevelopers().then(setDevelopers);
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const updated = await api.addTask(newTask, user.id);
            setTasks(updated);
            toast.success("Directive assigned");
            setNewTask({ title: '', description: '', assigned_to_id: '', due_date: '', priority: 'medium' });
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    const updateStatus = async (id: string, status: Task['status']) => {
        try {
            const updated = await api.updateTaskStatus(id, status, user.id);
            setTasks(updated);
        } catch (e: any) {
            toast.error("Status sync failed");
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Directives Board</h2>
            
            {user.role !== 'developer' && (
                <Card className="mb-6 border-vision-primary/20">
                     <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-4">
                         <div className="flex-1 min-w-[250px]">
                             <Input label="Task Summary" placeholder="Objective..." value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} required />
                         </div>
                         <div className="flex-1 min-w-[200px]">
                              <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1.5 pl-1">Assignee</label>
                              <select 
                                  className="w-full h-10 bg-black/20 border border-white/10 rounded-lg px-3 text-sm text-gray-200 outline-none focus:border-vision-primary"
                                  value={newTask.assigned_to_id}
                                  onChange={e => setNewTask({...newTask, assigned_to_id: e.target.value})}
                                  required
                              >
                                  <option value="">Select Dev...</option>
                                  {developers.map(dev => <option key={dev.id} value={dev.id}>{dev.name}</option>)}
                              </select>
                         </div>
                         <div className="w-40">
                             <Input type="date" label="Deadline" value={newTask.due_date} onChange={e => setNewTask({...newTask, due_date: e.target.value})} required />
                         </div>
                         <Button type="submit" className="mb-1"><Plus size={16} className="mr-2" /> Dispatch</Button>
                     </form>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['todo', 'in_progress', 'done'].map(status => (
                    <div key={status} className="bg-white/5 rounded-2xl p-4 border border-white/5 min-h-[400px]">
                        <div className="flex justify-between items-center mb-6 px-1">
                            <h3 className="uppercase text-[10px] font-bold text-gray-500 tracking-widest flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${status === 'done' ? 'bg-green-500' : status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-500'}`}></div>
                                {status.replace('_', ' ')}
                            </h3>
                            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white font-mono">{tasks.filter(t => status === 'done' ? t.status === 'done' : status === 'in_progress' ? t.status === 'in_progress' : t.status === 'todo').length}</span>
                        </div>
                        <div className="space-y-4">
                            {tasks.filter(t => (status === 'done' ? t.status === 'done' : status === 'in_progress' ? t.status === 'in_progress' : (t.status === 'todo' || t.status === 'review'))).map(task => (
                                <div key={task.id} className="bg-black/40 p-4 rounded-xl border border-white/5 hover:border-vision-primary/30 transition-all group relative">
                                    <div className="flex justify-between items-start mb-2 gap-2">
                                        <h4 className="font-bold text-sm text-white group-hover:text-vision-primary transition-colors">{task.title}</h4>
                                        <Badge variant={task.priority === 'high' ? 'warning' : 'default'} className="text-[8px] px-1.5 py-0 uppercase">{task.priority}</Badge>
                                    </div>
                                    <div className="text-[10px] text-gray-500 flex items-center gap-1.5 mt-2">
                                        <UserIcon size={10} /> {task.assigned_to_name}
                                    </div>
                                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/5">
                                         <div className="text-[10px] text-gray-600 flex items-center gap-1">
                                            <Calendar size={10} /> {new Date(task.due_date).toLocaleDateString()}
                                         </div>
                                         <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                             {status !== 'todo' && <button onClick={() => updateStatus(task.id, 'todo')} className="p-1 hover:text-white transition-colors"><ChevronLeft size={16} /></button>}
                                             {status !== 'done' && <button onClick={() => updateStatus(task.id, status === 'todo' ? 'in_progress' : 'done')} className="p-1 hover:text-white transition-colors"><ChevronRight size={16} /></button>}
                                         </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- 8. Admin Requests Component --- (Unchanged)
const AdminRequests: React.FC = () => {
    // ... [Previous Requests Logic - Shortened]
    const [requests, setRequests] = useState<ProjectSuggestion[]>([]);
    const toast = useToast();

    useEffect(() => {
        api.getProjectSuggestions().then(setRequests);
    }, []);

    const updateStatus = async (id: string, status: ProjectSuggestion['status']) => {
        try {
            const updated = await api.updateProjectSuggestionStatus(id, status);
            setRequests(updated);
            toast.success("Status updated");
        } catch (e: any) {
            toast.error("Failed to sync");
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Public Backlog</h2>
            <div className="overflow-x-auto rounded-xl border border-white/5 bg-white/5">
                 <table className="w-full text-left text-sm text-gray-400">
                     <thead className="bg-white/5 text-gray-200 uppercase text-[10px] tracking-widest font-bold">
                         <tr>
                             <th className="p-4">Trend</th>
                             <th className="p-4">Submission</th>
                             <th className="p-4">User</th>
                             <th className="p-4">Status</th>
                             <th className="p-4 text-right">Moderation</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                         {requests.map(req => (
                             <tr key={req.id} className="hover:bg-white/5 transition-colors">
                                 <td className="p-4 font-bold text-vision-primary text-lg">{req.votes}</td>
                                 <td className="p-4">
                                     <div className="font-bold text-white">{req.title}</div>
                                     <div className="text-[11px] text-gray-500 max-w-sm truncate opacity-60 mt-1">{req.description}</div>
                                 </td>
                                 <td className="p-4">
                                    <div className="text-white text-xs">{req.user_name}</div>
                                    <div className="text-[10px] opacity-40">{new Date(req.created_at).toLocaleDateString()}</div>
                                 </td>
                                 <td className="p-4">
                                     <Badge variant={req.status === 'completed' ? 'success' : req.status === 'planned' ? 'info' : 'default'} className="text-[10px] uppercase">
                                         {req.status}
                                     </Badge>
                                 </td>
                                 <td className="p-4 text-right">
                                     <select 
                                        value={req.status}
                                        onChange={(e) => updateStatus(req.id, e.target.value as any)}
                                        className="bg-black/40 border border-white/10 rounded text-[11px] px-2 py-1.5 outline-none cursor-pointer focus:border-vision-primary"
                                     >
                                         <option value="open">Pending Review</option>
                                         <option value="planned">In Roadmap</option>
                                         <option value="completed">Deployed</option>
                                     </select>
                                 </td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
                 {requests.length === 0 && <div className="p-16 text-center text-gray-600 italic">Community backlog is currently empty.</div>}
            </div>
        </div>
    );
}

// --- Main Admin Layout ---
const Admin: React.FC<{ user: User }> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('analytics');
  const navigate = useNavigate();

  useEffect(() => {
    if (user.role === 'client') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const menuItems = [
      { id: 'analytics', label: 'Platform Metrics', icon: BarChart3 },
      { id: 'orders', label: 'Client Orders', icon: ClipboardList },
      { id: 'requests', label: 'Feature Backlog', icon: Lightbulb },
      { id: 'services', label: 'Service Inventory', icon: Layers },
      { id: 'marketplace', label: 'Marketplace Ops', icon: ShoppingBag },
      { id: 'offers', label: 'Marketing Hub', icon: TicketPercent },
      { id: 'tasks', label: 'Internal Directives', icon: CheckCircle },
      { id: 'team', label: 'Identity Access', icon: Users, role: ['super_admin'] },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-gray-200 font-sans selection:bg-vision-primary/30">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 bg-vision-900 border-r border-white/5 hidden md:flex flex-col">
          <div className="p-8">
            <h1 className="text-lg font-display font-bold text-white tracking-[0.2em] flex items-center gap-3">
                <Shield size={24} className="text-vision-primary" />
                VISION BUILT
            </h1>
            <p className="text-[10px] text-gray-600 mt-2 uppercase tracking-widest font-mono">Control Center v1.2.0</p>
          </div>
          
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
            {menuItems.map(item => {
                if (item.role && !item.role.includes(user.role)) return null;
                const Icon = item.icon;
                return (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-5 py-4 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${
                            activeTab === item.id 
                            ? 'bg-vision-primary/10 text-vision-primary border border-vision-primary/20 shadow-[0_0_20px_rgba(6,182,212,0.1)]' 
                            : 'text-gray-500 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <Icon size={18} />
                        {item.label}
                    </button>
                );
            })}
          </nav>

          <div className="p-6 border-t border-white/5 bg-black/20">
              <div className="flex items-center gap-4 px-2 py-3">
                  <div className="w-10 h-10 rounded-full bg-gray-800 border border-white/10 flex items-center justify-center text-xs font-bold text-white shadow-inner">
                      {user.name.charAt(0)}
                  </div>
                  <div className="overflow-hidden">
                      <p className="text-xs font-bold text-white truncate uppercase tracking-wider">{user.name}</p>
                      <p className="text-[10px] text-gray-500 truncate capitalize font-mono">{user.role.replace('_', ' ')}</p>
                  </div>
              </div>
              <Link to="/">
                <Button variant="ghost" className="w-full mt-4 justify-start text-[10px] uppercase tracking-widest text-gray-600 hover:text-red-400">
                    <LogOut size={14} className="mr-2" /> Revoke Session
                </Button>
              </Link>
          </div>
        </aside>

        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 w-full bg-vision-900 border-b border-white/10 z-20 flex justify-between items-center p-4">
             <span className="font-bold text-white text-xs uppercase tracking-widest">Admin Control</span>
             <select 
                value={activeTab} 
                onChange={(e) => setActiveTab(e.target.value)}
                className="bg-black/20 text-[10px] text-white border border-white/10 rounded px-2 py-1 font-bold uppercase tracking-widest outline-none"
             >
                 {menuItems.map(i => <option key={i.id} value={i.id}>{i.label}</option>)}
             </select>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-black/10 p-4 md:p-10 pt-20 md:pt-10 relative custom-scrollbar">
            <div className="max-w-7xl mx-auto">
                <div className="mb-10 animate-in fade-in duration-700">
                    <h1 className="text-3xl font-display font-bold text-white mb-2 uppercase tracking-tight">System / {activeTab}</h1>
                    <p className="text-sm text-gray-500">Managing global system state and operative logistics.</p>
                </div>
                
                {activeTab === 'analytics' && <AdminAnalytics user={user} />}
                {activeTab === 'services' && <AdminServices user={user} />}
                {activeTab === 'orders' && <AdminOrders user={user} />}
                {activeTab === 'marketplace' && <AdminMarketplace user={user} />}
                {activeTab === 'requests' && <AdminRequests />}
                {activeTab === 'team' && <AdminTeam user={user} />}
                {activeTab === 'offers' && <AdminOffers />}
                {activeTab === 'tasks' && <AdminTasks user={user} />}
            </div>
        </main>
      </div>
    </div>
  );
};

export default Admin;
