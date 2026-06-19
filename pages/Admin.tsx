import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, CheckCircle, 
  Edit, Trash2, Plus, 
  ImageIcon, Users, ClipboardList, 
  BarChart3, TicketPercent, Layers, 
  Lightbulb, Bell, DollarSign,
  User as UserIcon, LogOut, Shield, Zap, RefreshCw, X, Calendar, Search, Wallet, Mail, Phone, Globe, Loader2
} from 'lucide-react';
import { api } from '../services/api';
import { User, MarketplaceItem, ProjectCategory, Order, Service, Offer, Task, ProjectSuggestion, AnalyticsData, AdminActivity } from '../types';
import { Badge, Input, Textarea, ConfirmDialog } from '../components/ui/Components';
import { useToast } from '../components/ui/Toast';
import { CURRENCY_CONFIG, formatPrice } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';

// --- Notifications Component ---
const AdminNotifications: React.FC = () => {
    const [activities, setActivities] = useState<AdminActivity[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        api.getAdminActivity().then(setActivities);
        const interval = setInterval(() => api.getAdminActivity().then(setActivities), 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative">
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="p-2.5 rounded-full hover:bg-white/[0.04] border border-white/5 relative transition-all"
            >
                <Bell size={18} className="text-foreground/50 hover:text-foreground" />
                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]"></span>
            </button>
            
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-4 w-96 bg-[#25292e] border border-white/5 rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl"
                    >
                        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#25292e]">
                            <span className="text-[10px] font-display font-semibold text-foreground uppercase tracking-widest flex items-center gap-2">
                                <Shield size={12} className="text-[var(--vb-accent)]" /> System Logs
                            </span>
                            <button onClick={() => setIsOpen(false)}><X size={14} className="text-foreground/40 hover:text-foreground" /></button>
                        </div>
                        <div className="max-h-[380px] overflow-y-auto custom-scrollbar p-2 space-y-1">
                            {activities.length === 0 ? (
                                <div className="p-8 text-center text-xs text-foreground/30 font-satoshi">No system activity logged.</div>
                            ) : (
                                activities.map(act => (
                                    <div key={act.id} className="p-3.5 rounded-lg hover:bg-white/[0.02] border border-transparent hover:border-white/5 transition-all text-left">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-[10px] font-display font-semibold text-foreground/80 uppercase tracking-wide">{act.action}</span>
                                            <span className="text-[9px] text-foreground/30 font-mono">{new Date(act.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        </div>
                                        <p className="text-xs text-foreground/50 leading-relaxed font-satoshi">{act.details}</p>
                                        <div className="mt-2.5 flex items-center gap-2">
                                            <div className="w-4.5 h-4.5 rounded-full bg-white/[0.04] border border-white/5 flex items-center justify-center text-[8px] font-bold text-foreground/60">
                                                {(act.admin_name || 'Sys').charAt(0)}
                                            </div>
                                            <span className="text-[9px] text-foreground/40 font-mono">Operator: {act.admin_name || 'System'}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// 1. Analytics
const AdminAnalytics: React.FC = () => {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '1y'>('7d');
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    useEffect(() => { 
        api.getAnalytics(timeRange).then(setData); 
    }, [timeRange]);

    if (!data) return <div className="p-20 text-center"><Loader2 className="animate-spin w-6 h-6 mx-auto text-foreground/40" /></div>;

    const StatCard = ({ title, value, icon: Icon }: any) => (
        <div className="glass-card p-6 md:p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity text-[var(--vb-accent)]">
                <Icon size={56} />
            </div>
            <h3 className="text-[10px] font-display font-bold text-foreground/40 uppercase tracking-widest mb-1.5">{title}</h3>
            <p className="text-3xl font-display font-bold text-foreground">{value}</p>
        </div>
    );

    const maxValue = Math.max(...data.sales_trend.map(d => d.value)) || 1;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Revenue" value={`$${data.total_revenue}`} icon={DollarSign} />
                <StatCard title="Active Projects" value={data.active_projects} icon={ClipboardList} />
                <StatCard title="Identity Hits" value={data.total_views} icon={Users} />
                <StatCard title="Gross Requests" value={data.total_orders} icon={ShoppingBag} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-card p-6 md:p-8">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                        <h3 className="text-sm font-display font-bold uppercase tracking-wider text-foreground">Revenue Velocity</h3>
                        <div className="flex bg-white/[0.02] p-1 rounded-lg border border-white/5">
                            {(['7d', '30d', '1y'] as const).map(range => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`px-3.5 py-1 text-[9px] font-display font-bold uppercase tracking-wider rounded-md transition-all ${
                                        timeRange === range 
                                        ? 'bg-foreground text-background shadow-md font-semibold' 
                                        : 'text-foreground/40 hover:text-foreground'
                                    }`}
                                >
                                    {range === '7d' ? 'Weekly' : range === '30d' ? 'Monthly' : 'Yearly'}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {/* Interactive Chart */}
                    <div className="h-64 w-full flex items-end gap-3 px-4 pb-4 overflow-x-auto custom-scrollbar">
                        {data.sales_trend.map((item, i) => (
                             <div 
                                key={i} 
                                className="flex-1 min-w-[24px] h-full flex flex-col justify-end group relative"
                                onMouseEnter={() => setHoveredIndex(i)}
                                onMouseLeave={() => setHoveredIndex(null)}
                             >
                                 {/* Tooltip */}
                                 {hoveredIndex === i && (
                                     <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3.5 z-50 animate-in fade-in slide-in-from-bottom-1 pointer-events-none">
                                         <div className="bg-[#25292e] border border-white/5 rounded-lg px-3 py-2 shadow-2xl text-center">
                                             <p className="text-[9px] text-foreground/40 uppercase tracking-widest font-mono mb-0.5">{new Date(item.date).toLocaleDateString()}</p>
                                             <p className="text-xs font-bold text-foreground">${item.value}</p>
                                         </div>
                                         <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-white/10 mx-auto"></div>
                                     </div>
                                 )}

                                 {/* Bar */}
                                 <div 
                                    className={`relative w-full rounded-t transition-all duration-300 ${
                                        hoveredIndex === i 
                                        ? 'bg-[var(--vb-accent)] opacity-100 shadow-[0_0_15px_rgba(124,143,161,0.3)]' 
                                        : 'bg-white/10 hover:bg-white/20'
                                    }`} 
                                    style={{ height: `${Math.max(6, (item.value / maxValue) * 100)}%` }}
                                 />
                                 
                                 {/* Label */}
                                 <div className="mt-2 text-[9px] text-foreground/30 text-center font-mono truncate select-none">
                                     {item.label}
                                 </div>
                             </div>
                        ))}
                    </div>
                </div>

                <div className="glass-card p-6 md:p-8 flex flex-col justify-center">
                    <h3 className="text-sm font-display font-bold uppercase tracking-wider text-foreground mb-8 text-center">Lead Architect</h3>
                    {data.top_developer ? (
                        <div className="text-center">
                             <div className="w-20 h-20 mx-auto rounded-full bg-white/[0.02] border border-white/5 p-1 mb-4 flex items-center justify-center shadow-lg">
                                <div className="w-full h-full rounded-full bg-white/[0.01] flex items-center justify-center text-2xl font-display font-bold text-foreground">
                                    {data.top_developer.name.charAt(0)}
                                </div>
                             </div>
                             <h4 className="text-lg font-display font-bold text-foreground">{data.top_developer.name}</h4>
                             <p className="text-xs text-foreground/45 font-mono mt-0.5">{data.top_developer.email}</p>
                             <div className="mt-6 inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/5 bg-white/[0.02] text-[var(--vb-accent)] text-[9px] font-display font-bold uppercase tracking-widest">
                                 <TicketPercent size={12} /> Top Performer
                             </div>
                        </div>
                    ) : (
                        <div className="text-center text-foreground/30 font-satoshi text-xs py-10">No architect logs registered.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

// 2. Orders (Enhanced UI & Inline Edit)
const AdminOrders: React.FC<{ user: User }> = ({ user }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    
    // Deletion State
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Payment Request Modal State
    const [paymentModal, setPaymentModal] = useState<{
        open: boolean;
        orderId: string | null;
        totalAmount: number;
        depositAmount: number;
        currency: string;
    }>({ open: false, orderId: null, totalAmount: 0, depositAmount: 0, currency: 'USD' });

    const toast = useToast();

    useEffect(() => {
        api.getOrders().then(data => {
            setOrders(data);
            setLoading(false);
        });
    }, []);

    const handleStatusUpdate = async (id: string, status: Order['status']) => {
        try {
            await api.updateOrderStatus(id, status, user.id);
            setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
            toast.success(`Order status updated to ${status}`);
        } catch(e) { toast.error("Update failed"); }
    };

    const handleDeleteOrder = async () => {
        if (!deleteId) return;
        try {
            await api.deleteOrder(deleteId);
            setOrders(prev => prev.filter(o => o.id !== deleteId));
            toast.success("Order deleted permanently");
        } catch(e: any) { toast.error(e.message || "Failed to delete order"); }
        finally { setDeleteId(null); }
    };

    const openPaymentRequest = (order: Order) => {
        setPaymentModal({
            open: true,
            orderId: order.id,
            totalAmount: order.total_amount || 0,
            depositAmount: order.deposit_amount || 0,
            currency: order.currency || 'USD'
        });
    };

    const submitPaymentRequest = async () => {
        if (!paymentModal.orderId) return;
        try {
            // Update financial data
            const updated = await api.updateOrderFinancials(paymentModal.orderId, paymentModal.totalAmount, paymentModal.depositAmount);
            
            // Update local state
            setOrders(prev => prev.map(o => o.id === paymentModal.orderId ? updated : o));
            
            // Notify Success
            toast.success("Payment request sent to client");
            setPaymentModal({ ...paymentModal, open: false });
        } catch(e: any) {
            toast.error(e.message || "Failed to send request");
        }
    };

    const filteredOrders = orders.filter(o => {
        const matchesFilter = filter === 'all' || o.status === filter;
        const matchesSearch = o.id.toLowerCase().includes(search.toLowerCase()) || 
                              o.service_title.toLowerCase().includes(search.toLowerCase()) ||
                              o.user_id.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    if(loading) return <div className="text-center p-20"><Loader2 className="animate-spin w-6 h-6 mx-auto text-foreground/40" /></div>;

    return (
        <div className="space-y-6">
            <ConfirmDialog 
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDeleteOrder}
                title="Delete Order"
                message="Are you sure you want to delete this order? This action removes all associated data and cannot be undone."
                variant="danger"
                confirmText="Delete Order"
            />

            {/* Payment Request Modal */}
            <AnimatePresence>
                {paymentModal.open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="w-full max-w-md bg-[#25292e] border border-white/5 p-8 rounded-xl shadow-2xl relative"
                        >
                            <button onClick={() => setPaymentModal({ ...paymentModal, open: false })} className="absolute top-4 right-4 text-foreground/40 hover:text-foreground"><X size={18} /></button>
                            
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 rounded-full bg-white/[0.02] border border-white/5 text-[var(--vb-accent)]">
                                    <Wallet size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-display font-bold text-foreground uppercase tracking-wide">Budget Action</h3>
                                    <p className="text-xs text-foreground/45 font-satoshi">Define fees and generate payment triggers.</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Input 
                                    label="Total Agreed Budget ($)" 
                                    type="number" 
                                    value={paymentModal.totalAmount}
                                    onChange={(e) => setPaymentModal({ ...paymentModal, totalAmount: parseFloat(e.target.value) })}
                                />
                                <Input 
                                    label="Required Deposit ($)" 
                                    type="number" 
                                    value={paymentModal.depositAmount}
                                    onChange={(e) => setPaymentModal({ ...paymentModal, depositAmount: parseFloat(e.target.value) })}
                                />
                                <div className="p-3 bg-white/[0.01] border border-white/5 rounded-lg font-satoshi">
                                    <p className="text-[10px] text-foreground/45 flex items-start gap-2">
                                        <Shield size={12} className="mt-0.5 shrink-0" />
                                        This updates the ledger and grants the client the ability to pay via Razorpay/Stripe instantly.
                                    </p>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button 
                                      type="button"
                                      onClick={() => setPaymentModal({ ...paymentModal, open: false })} 
                                      className="btn-ghost flex-1 h-10 text-xs font-semibold"
                                    >
                                      Cancel
                                    </button>
                                    <button 
                                      type="button"
                                      onClick={submitPaymentRequest} 
                                      className="btn-primary flex-1 h-10 text-xs font-semibold"
                                    >
                                      Post Request
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                <h3 className="text-sm font-display font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <ClipboardList className="text-[var(--vb-accent)]" size={18} /> Client Orders
                </h3>
                <div className="flex flex-wrap gap-2.5">
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/30 w-3.5 h-3.5" />
                        <input 
                            type="text" 
                            placeholder="Filter order briefs..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="vb-input h-9 text-xs pl-9 pr-4 w-full md:w-56"
                        />
                    </div>
                    <select 
                        value={filter} 
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-white/[0.02] border border-white/5 rounded-lg px-3.5 py-1.5 text-xs text-foreground/80 outline-none cursor-pointer font-satoshi"
                    >
                        <option value="all" className="bg-[#212529]">All States</option>
                        <option value="pending" className="bg-[#212529]">Pending</option>
                        <option value="in_progress" className="bg-[#212529]">In Progress</option>
                        <option value="completed" className="bg-[#212529]">Completed</option>
                    </select>
                </div>
            </div>

            <div className="space-y-4">
                {filteredOrders.map(order => (
                    <div key={order.id} className="glass-card p-6 flex flex-col lg:flex-row gap-6 lg:items-center justify-between relative overflow-hidden">
                        {/* Custom status bar */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                            order.status === 'completed' ? 'bg-emerald-500/70' : 
                            order.status === 'in_progress' ? 'bg-[var(--vb-accent)]' : 
                            order.status === 'pending' ? 'bg-amber-500/70' : 'bg-white/10'
                        }`} />

                        <div className="flex-1 min-w-0 font-satoshi">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="font-mono text-[9px] text-[var(--vb-accent)] uppercase tracking-wider bg-white/[0.02] border border-white/5 px-2 py-0.5 rounded">
                                    #{order.id.slice(0, 8).toUpperCase()}
                                </span>
                                <span className="text-[10px] text-foreground/30 flex items-center gap-1">
                                    <Calendar size={10} /> {new Date(order.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <h4 className="text-base font-display font-semibold text-foreground mb-1.5 truncate">{order.service_title}</h4>
                            <div className="flex items-center gap-4 text-xs text-foreground/50">
                                <span className="flex items-center gap-1"><UserIcon size={12}/> {order.requirements?.client_name || order.user_id}</span>
                                {order.type === 'project' && <span className="text-[8px] font-mono border border-white/5 bg-white/[0.02] px-1.5 py-0.5 rounded uppercase text-foreground/60 font-semibold tracking-wider">Inventory File</span>}
                            </div>
                            
                            {/* Identity contact card */}
                            <div className="mt-3.5 p-3.5 bg-white/[0.01] rounded-lg border border-white/5 flex flex-wrap gap-4 text-[11px] font-mono text-foreground/55">
                                {order.requirements?.client_email && (
                                    <span className="flex items-center gap-1.5">
                                        <Mail size={11} className="text-foreground/30"/> 
                                        {order.requirements.client_email}
                                    </span>
                                )}
                                {order.requirements?.client_phone && (
                                    <span className="flex items-center gap-1.5">
                                        <Phone size={11} className="text-foreground/30"/> 
                                        {order.requirements.client_phone}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Budget Info */}
                        <div className="flex flex-col items-start lg:items-end min-w-[140px] font-satoshi">
                            <span className="text-[9px] text-foreground/30 uppercase tracking-widest mb-0.5">Budget Balance</span>
                            <span className="text-lg font-bold text-foreground font-mono">{formatPrice(order.total_amount, user.country)}</span>
                            <span className="text-[11px] text-foreground/45 mt-0.5">Paid: <span className="text-emerald-400 font-mono font-bold">{formatPrice(order.amount_paid, user.country)}</span></span>
                        </div>

                        {/* Status Selectors */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 border-t lg:border-t-0 border-white/5 pt-4 lg:pt-0">
                            <select 
                                value={order.status}
                                onChange={(e) => handleStatusUpdate(order.id, e.target.value as Order['status'])}
                                className={`bg-[#25292e] border border-white/5 text-[10px] rounded-lg px-3 py-2 outline-none font-display font-semibold uppercase tracking-wider cursor-pointer ${
                                    order.status === 'completed' ? 'text-emerald-400' : 
                                    order.status === 'pending' ? 'text-amber-400' : 'text-[var(--vb-accent)]'
                                }`}
                            >
                                <option value="pending" className="bg-[#212529]">Pending</option>
                                <option value="accepted" className="bg-[#212529]">Accepted</option>
                                <option value="in_progress" className="bg-[#212529]">In Progress</option>
                                <option value="mockup_ready" className="bg-[#212529]">Mockup Ready</option>
                                <option value="completed" className="bg-[#212529]">Completed</option>
                                <option value="cancelled" className="bg-[#212529]">Cancelled</option>
                            </select>

                            <button 
                                onClick={() => openPaymentRequest(order)}
                                className="btn-ghost h-9 px-3.5 text-xs font-semibold whitespace-nowrap flex items-center justify-center border-white/5 hover:border-white/10"
                                title="Set Budget"
                            >
                                <DollarSign size={13} /> Request Cash
                            </button>

                            <Link to={`/dashboard/order/${order.id}`} className="w-full sm:w-auto">
                                <button className="btn-ghost h-9 px-4 text-xs font-semibold w-full border-white/5 hover:border-white/10">
                                    Chat
                                </button>
                            </Link>

                            <button 
                                onClick={() => setDeleteId(order.id)}
                                className="btn-ghost h-9 w-9 p-0 rounded-lg text-foreground/40 hover:text-red-400 hover:border-red-500/10 hover:bg-red-500/5 flex items-center justify-center border-white/5"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
                {filteredOrders.length === 0 && (
                    <div className="text-center py-20 bg-white/[0.01] rounded-xl border border-dashed border-white/5">
                        <ShoppingBag size={40} className="mx-auto text-foreground/20 mb-4" />
                        <p className="text-foreground/45 text-xs font-satoshi">No matching order briefs identified.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// 3. Services (Restored Edit Functionality)
const AdminServices: React.FC = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Service | null>(null);
    const [formData, setFormData] = useState<Partial<Service>>({
        title: '', description: '', base_price: 0, features: [], icon: 'Code', is_enabled: true
    });
    const toast = useToast();

    useEffect(() => { api.getServices().then(setServices); }, []);

    const handleEdit = (s: Service) => {
        setEditing(s);
        setFormData(s);
        setShowForm(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editing) {
                const updated = await api.updateService(editing.id, formData);
                setServices(updated);
                toast.success("Service updated");
            } else {
                const updated = await api.createService(formData as any);
                setServices(updated);
                toast.success("Service created");
            }
            setShowForm(false);
            setEditing(null);
            setFormData({ title: '', description: '', base_price: 0, features: [], icon: 'Code', is_enabled: true });
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    const handleToggle = async (service: Service) => {
        const updated = await api.updateService(service.id, { is_enabled: !service.is_enabled });
        setServices(updated);
        toast.success(`Service ${!service.is_enabled ? 'enabled' : 'disabled'}`);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-display font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <Layers className="text-[var(--vb-accent)]" size={18} /> Service Catalog
                </h3>
                <button 
                  onClick={() => { setEditing(null); setShowForm(!showForm); }}
                  className="btn-primary h-9 px-4 text-xs font-semibold"
                >
                    {showForm ? 'Cancel' : <><Plus size={14} className="mr-1.5 inline-block"/> Add Service</>}
                </button>
            </div>

            {showForm && (
                <div className="glass-card p-6 md:p-8 animate-in fade-in slide-in-from-top-4 mb-8">
                    <h4 className="font-display font-semibold text-foreground mb-6 text-sm uppercase tracking-wider">{editing ? 'Edit Service' : 'New Service Template'}</h4>
                    <form onSubmit={handleSave} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <Input label="Service Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                            <Input label="Base Price ($)" type="number" value={formData.base_price} onChange={e => setFormData({...formData, base_price: parseFloat(e.target.value)})} required />
                        </div>
                        <Textarea label="Core Overview" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
                        <Input label="Icon Reference (Lucide)" value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} placeholder="Code, Shield, Layers, Globe, Smartphone" />
                        <div className="flex justify-end pt-2">
                            <button type="submit" className="btn-primary h-10 px-6 text-xs font-semibold">{editing ? 'Update Service' : 'Create Service'}</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {services.map(s => (
                    <div key={s.id} className="glass-card p-6 flex flex-col justify-between group">
                        <div>
                          <div className="flex justify-between items-start mb-4">
                              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg text-foreground/75">
                                  <Layers size={20} />
                              </div>
                              <div className="flex gap-1.5">
                                  <button onClick={() => handleEdit(s)} className="p-2 border border-white/5 hover:border-white/10 rounded-lg text-foreground/50 hover:text-foreground transition-all"><Edit size={12}/></button>
                                  <button onClick={() => handleToggle(s)} className={`p-2 border rounded-lg transition-all ${s.is_enabled ? 'text-emerald-400 bg-emerald-500/5 border-emerald-500/10' : 'text-red-400 bg-red-500/5 border-red-500/10'}`}>
                                      <Zap size={12} fill={s.is_enabled ? "currentColor" : "none"} />
                                  </button>
                              </div>
                          </div>
                          <h4 className="font-display font-semibold text-foreground text-base mb-2">{s.title}</h4>
                          <p className="text-xs text-foreground/45 font-satoshi leading-relaxed line-clamp-3 mb-6">{s.description}</p>
                        </div>
                        <div className="flex justify-between items-center border-t border-white/5 pt-4 font-satoshi">
                            <span className="text-base font-bold text-foreground font-mono">{formatPrice(s.base_price)}</span>
                            <span className={`text-[9px] uppercase font-display font-bold px-2 py-0.5 rounded border ${s.is_enabled ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10' : 'bg-red-500/5 text-red-400 border-red-500/10'}`}>
                                {s.is_enabled ? 'Active' : 'Disabled'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// 4. Offers
const AdminOffers: React.FC = () => {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [newOffer, setNewOffer] = useState({ title: '', code: '', discountPercentage: 10, description: '' });
    const toast = useToast();

    useEffect(() => { api.getOffers().then(setOffers); }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const updated = await api.createOffer(newOffer);
            setOffers(updated);
            setNewOffer({ title: '', code: '', discountPercentage: 10, description: '' });
            toast.success("Offer created");
        } catch(e) { toast.error("Failed to create offer"); }
    };

    const handleDelete = async (id: string) => {
        const updated = await api.deleteOffer(id);
        setOffers(updated);
        toast.success("Offer deleted");
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 space-y-6">
                    <h3 className="text-sm font-display font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                        <TicketPercent className="text-[var(--vb-accent)]" size={18} /> Campaign Coupons
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {offers.map(o => (
                            <div key={o.id} className="glass-card p-5 flex justify-between items-center group">
                                <div>
                                    <h4 className="font-display font-semibold text-foreground text-base tracking-wider uppercase">{o.code}</h4>
                                    <p className="text-xs text-foreground/45 mt-0.5 font-satoshi">{o.title}</p>
                                    <div className="mt-3 inline-block border border-white/5 bg-white/[0.02] text-[var(--vb-accent)] text-[9px] font-mono font-bold px-2 py-0.5 rounded">
                                        {o.discountPercentage}% OFF
                                    </div>
                                </div>
                                <button 
                                  onClick={() => handleDelete(o.id)} 
                                  className="btn-ghost p-2 rounded-lg border border-white/5 text-foreground/40 hover:text-red-400 hover:border-red-500/10 flex items-center justify-center"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                        {offers.length === 0 && <div className="text-foreground/30 text-xs font-satoshi col-span-full">No active coupons available.</div>}
                    </div>
                </div>
                
                <div className="lg:w-80 shrink-0">
                    <div className="glass-card p-6 md:p-8 space-y-4">
                        <h4 className="font-display font-semibold text-foreground text-sm uppercase tracking-wider">New Coupon</h4>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <Input label="Campaign Title" value={newOffer.title} onChange={e => setNewOffer({...newOffer, title: e.target.value})} required />
                            <div className="grid grid-cols-2 gap-3">
                                <Input label="Code" value={newOffer.code} onChange={e => setNewOffer({...newOffer, code: e.target.value.toUpperCase()})} required className="uppercase font-mono" placeholder="WINTER25" />
                                <Input label="Discount %" type="number" value={newOffer.discountPercentage} onChange={e => setNewOffer({...newOffer, discountPercentage: parseInt(e.target.value)})} required />
                            </div>
                            <Textarea label="Campaign Brief (Internal)" value={newOffer.description} onChange={e => setNewOffer({...newOffer, description: e.target.value})} />
                            <button type="submit" className="w-full btn-primary h-10 text-xs font-semibold">Launch Coupon</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 5. Tasks (Updated with Inline Editing)
const AdminTasks: React.FC<{ user: User }> = ({ user }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTask, setNewTask] = useState({ title: '', description: '', assigned_to_id: user.id, priority: 'medium' as any, due_date: '' });
    const [team, setTeam] = useState<User[]>([]);
    const toast = useToast();

    useEffect(() => { 
        api.getTasks().then(setTasks); 
        api.getTeamMembers().then(setTeam);
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const updated = await api.addTask({ ...newTask, due_date: newTask.due_date || new Date().toISOString() }, user.id);
            setTasks(updated);
            setNewTask({ title: '', description: '', assigned_to_id: user.id, priority: 'medium', due_date: '' });
            toast.success("Task added");
        } catch(e) { toast.error("Failed to add task"); }
    };

    const handleStatus = async (id: string, status: Task['status']) => {
        const updated = await api.updateTaskStatus(id, status, user.id);
        setTasks(updated);
    };

    const handleUpdate = async (id: string, field: keyof Task, value: any) => {
        try {
            const updated = await api.updateTask(id, { [field]: value });
            setTasks(updated);
            toast.success("Task updated");
        } catch (e) {
            toast.error("Failed to update task");
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-sm font-display font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <CheckCircle className="text-[var(--vb-accent)]" size={18} /> System Tasks
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 {/* Task List */}
                 <div className="lg:col-span-2 space-y-4">
                     {tasks.map(t => (
                          <div key={t.id} className="glass-card p-5 flex justify-between items-start font-satoshi">
                              <div className="flex-1 mr-4 space-y-2">
                                  <div className="flex items-center gap-3">
                                      <input 
                                         defaultValue={t.title}
                                         onBlur={(e) => { if(e.target.value !== t.title) handleUpdate(t.id, 'title', e.target.value) }}
                                         className={`bg-transparent border-b border-transparent hover:border-white/15 focus:border-white/30 focus:outline-none font-display font-semibold text-base w-full transition-colors ${t.status === 'done' ? 'text-foreground/30 line-through' : 'text-foreground'}`}
                                      />
                                      <Badge variant={t.priority === 'high' ? 'danger' : t.priority === 'medium' ? 'warning' : 'info'} className="text-[9px] uppercase tracking-wider">{t.priority}</Badge>
                                  </div>
                                  <textarea
                                     defaultValue={t.description}
                                     onBlur={(e) => { if(e.target.value !== t.description) handleUpdate(t.id, 'description', e.target.value) }}
                                     className="bg-transparent border border-transparent hover:border-white/10 focus:border-white/20 focus:bg-white/[0.01] focus:outline-none text-xs text-foreground/50 w-full rounded p-2 transition-all resize-y min-h-[50px] font-satoshi leading-relaxed"
                                  />
                                  <div className="flex items-center gap-4 text-[10px] text-foreground/45 pt-1">
                                      <div className="flex items-center gap-2">
                                          <div className="w-5 h-5 rounded-full bg-white/[0.04] border border-white/5 flex items-center justify-center text-foreground/75 font-bold text-[9px]">
                                              {t.assigned_to_name.charAt(0)}
                                          </div>
                                          <span>{t.assigned_to_name}</span>
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        <Calendar size={11} className="text-foreground/30" />
                                        <input 
                                            type="date"
                                            className="bg-transparent text-[10px] text-foreground/40 hover:text-foreground focus:text-foreground outline-none cursor-pointer font-mono"
                                            defaultValue={t.due_date ? new Date(t.due_date).toISOString().split('T')[0] : ''}
                                            onBlur={(e) => {
                                                const val = e.target.value ? new Date(e.target.value).toISOString() : null;
                                                if (val && (!t.due_date || val.split('T')[0] !== t.due_date.split('T')[0])) {
                                                    handleUpdate(t.id, 'due_date', val);
                                                }
                                            }}
                                        />
                                    </div>
                                  </div>
                              </div>
                              <div className="flex flex-col gap-1.5 min-w-[110px]">
                                  <label className="text-[8px] text-foreground/30 uppercase font-mono tracking-wider">Status</label>
                                  <select 
                                     value={t.status}
                                     onChange={(e) => handleStatus(t.id, e.target.value as any)}
                                     className="bg-[#25292e] border border-white/5 text-[10px] text-foreground rounded-lg px-2.5 py-1.5 outline-none cursor-pointer hover:border-white/10 transition-colors font-semibold uppercase tracking-wider"
                                  >
                                      <option value="todo" className="bg-[#212529]">To Do</option>
                                      <option value="in_progress" className="bg-[#212529]">In Progress</option>
                                      <option value="review" className="bg-[#212529]">Review</option>
                                      <option value="done" className="bg-[#212529]">Done</option>
                                  </select>
                              </div>
                          </div>
                     ))}
                     {tasks.length === 0 && <p className="text-foreground/30 text-xs font-satoshi text-center py-10">No pending task directives.</p>}
                 </div>

                 {/* Create Form */}
                 <div className="glass-card p-6 md:p-8 space-y-4 h-fit">
                     <h4 className="font-display font-semibold text-foreground text-sm uppercase tracking-wider">New Task</h4>
                     <form onSubmit={handleCreate} className="space-y-4">
                         <Input label="Directive Title" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} required />
                         <Textarea label="Instructions" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} />
                         <div className="space-y-1.5">
                             <label className="text-xs text-foreground/50 uppercase font-bold tracking-wider font-satoshi">Assignee</label>
                             <select 
                                className="w-full bg-[#1b1e22] border border-white/5 rounded-lg px-3 py-2 text-xs text-foreground/80 outline-none font-satoshi"
                                value={newTask.assigned_to_id}
                                onChange={e => setNewTask({...newTask, assigned_to_id: e.target.value})}
                             >
                                 {team.map(m => <option key={m.id} value={m.id} className="bg-[#212529]">{m.name}</option>)}
                             </select>
                         </div>
                         <div className="space-y-1.5">
                             <label className="text-xs text-foreground/50 uppercase font-bold tracking-wider font-satoshi">Priority</label>
                             <select 
                                className="w-full bg-[#1b1e22] border border-white/5 rounded-lg px-3 py-2 text-xs text-foreground/80 outline-none font-satoshi"
                                value={newTask.priority}
                                onChange={e => setNewTask({...newTask, priority: e.target.value as any})}
                             >
                                 <option value="low" className="bg-[#212529]">Low</option>
                                 <option value="medium" className="bg-[#212529]">Medium</option>
                                 <option value="high" className="bg-[#212529]">High</option>
                             </select>
                         </div>
                         <button type="submit" className="w-full btn-primary h-10 text-xs font-semibold">Assign Directive</button>
                     </form>
                 </div>
            </div>
        </div>
    );
};

// 6. Requests (Suggestions)
const AdminRequests: React.FC = () => {
    const [suggestions, setSuggestions] = useState<ProjectSuggestion[]>([]);
    const toast = useToast();

    useEffect(() => { api.getProjectSuggestions().then(setSuggestions); }, []);

    const handleStatus = async (id: string, status: ProjectSuggestion['status']) => {
        const updated = await api.updateProjectSuggestionStatus(id, status);
        setSuggestions(updated);
        toast.success("Suggestion status updated");
    };

    return (
        <div className="space-y-6">
            <h3 className="text-sm font-display font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Lightbulb className="text-[var(--vb-accent)]" size={18} /> Feature Suggestions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {suggestions.map(s => (
                    <div key={s.id} className="glass-card p-6 flex flex-col justify-between font-satoshi">
                        <div>
                          <div className="flex justify-between items-start mb-3">
                               <h4 className="font-display font-semibold text-foreground text-base">{s.title}</h4>
                               <Badge variant="info" className="flex items-center gap-1 py-0.5 text-[9px]"><TicketPercent size={10} /> {s.votes} Votes</Badge>
                          </div>
                          <p className="text-xs text-foreground/45 leading-relaxed line-clamp-3 mb-6">{s.description}</p>
                        </div>
                        <div className="flex justify-between items-center border-t border-white/5 pt-4">
                             <div className="flex items-center gap-1.5 text-[10px] text-foreground/40 font-mono">
                                <UserIcon size={12} /> {s.user_name}
                             </div>
                             <select 
                                value={s.status} 
                                onChange={(e) => handleStatus(s.id, e.target.value as any)}
                                className="bg-[#25292e] border border-white/5 text-[10px] text-foreground rounded-lg px-2.5 py-1.5 outline-none cursor-pointer font-semibold uppercase tracking-wider"
                             >
                                 <option value="open" className="bg-[#212529]">Open</option>
                                 <option value="planned" className="bg-[#212529]">Planned</option>
                                 <option value="completed" className="bg-[#212529]">Completed</option>
                             </select>
                        </div>
                    </div>
                ))}
                {suggestions.length === 0 && <div className="col-span-full text-center text-foreground/30 text-xs font-satoshi py-10">No feature requests filed.</div>}
            </div>
        </div>
    );
};

// 7. Team
const AdminTeam: React.FC<{ user: User }> = ({ user }) => {
    const [members, setMembers] = useState<User[]>([]);
    const [inviteData, setInviteData] = useState({ name: '', email: '', role: 'developer', password: '' });
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    useEffect(() => { api.getTeamMembers().then(setMembers); }, []);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const updated = await api.inviteTeamMember(inviteData.name, inviteData.email, inviteData.role as any, user.id, inviteData.password);
            setMembers(updated);
            setInviteData({ name: '', email: '', role: 'developer', password: '' });
            toast.success("Member invited successfully");
        } catch(e: any) { toast.error(e.message); }
        finally { setLoading(false); }
    };

    const handleRemove = async (id: string) => {
        if(confirm("Are you sure? This will remove access immediately.")) {
            try {
                const updated = await api.removeTeamMember(id, user.id);
                setMembers(updated);
                toast.success("Member removed");
            } catch(e: any) { toast.error(e.message); }
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-sm font-display font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Users className="text-[var(--vb-accent)]" size={18} /> Operatives & Access
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    {members.map(m => (
                        <div key={m.id} className="glass-card p-5 flex justify-between items-center font-satoshi">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center text-foreground font-display font-bold text-lg">
                                    {m.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-display font-semibold text-foreground text-base">{m.name}</h4>
                                    <p className="text-xs text-foreground/45 font-mono">{m.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Badge variant={m.role === 'super_admin' ? 'danger' : m.role === 'admin' ? 'warning' : 'info'} className="uppercase tracking-widest text-[9px] py-1 px-3">
                                    {m.role.replace('_', ' ')}
                                </Badge>
                                {user.role === 'super_admin' && m.id !== user.id && (
                                    <button 
                                      onClick={() => handleRemove(m.id)} 
                                      className="btn-ghost p-2 rounded-full border border-white/5 text-foreground/40 hover:text-red-400 hover:border-red-500/10 flex items-center justify-center"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="glass-card p-6 md:p-8 space-y-4 h-fit">
                    <h3 className="font-display font-semibold text-foreground text-sm uppercase tracking-wider">Invite Operative</h3>
                    <form onSubmit={handleInvite} className="space-y-4 font-satoshi">
                        <Input label="Name" value={inviteData.name} onChange={e => setInviteData({...inviteData, name: e.target.value})} required />
                        <Input label="Email Address" type="email" value={inviteData.email} onChange={e => setInviteData({...inviteData, email: e.target.value})} required />
                        <div className="space-y-1.5">
                            <label className="text-xs text-foreground/50 uppercase font-bold tracking-wider">Access Clearance</label>
                            <select 
                                className="w-full bg-[#1b1e22] border border-white/5 rounded-lg px-3 py-2 text-xs text-foreground/80 outline-none"
                                value={inviteData.role}
                                onChange={e => setInviteData({...inviteData, role: e.target.value})}
                            >
                                <option value="developer" className="bg-[#212529]">Developer</option>
                                <option value="admin" className="bg-[#212529]">Admin</option>
                            </select>
                        </div>
                        <Input label="Security Key / Password" type="password" value={inviteData.password} onChange={e => setInviteData({...inviteData, password: e.target.value})} placeholder="Auto-generated if empty" />
                        <button type="submit" disabled={loading} className="w-full btn-primary h-10 text-xs font-semibold">
                            {loading ? "Registering..." : "Provision Access"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

// --- Admin Marketplace (Updated with Premium Projects & Time Limit) ---
const AdminMarketplace: React.FC<{ user: User }> = ({ user }) => {
    const [items, setItems] = useState<MarketplaceItem[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const toast = useToast();
    const userCurrencyCode = CURRENCY_CONFIG[user.country || 'India']?.code || 'USD';
    const userCurrencyRate = CURRENCY_CONFIG[user.country || 'India']?.rate || 1;
    const [inputCurrency, setInputCurrency] = useState('USD');
    const [freeDays, setFreeDays] = useState<number>(0); 

    const [formData, setFormData] = useState<Partial<MarketplaceItem>>({
        title: '', price: 0, category: 'Premium Projects', short_description: '', full_description: '', tags: [], features: [], is_featured: false
    });

    useEffect(() => { api.getMarketplaceItems().then(setItems); }, [user.id]);

    const handleCategoryChange = (cat: ProjectCategory) => {
        setFormData(prev => ({
            ...prev,
            category: cat,
            price: cat === 'Free Projects' ? 0 : prev.price
        }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const rate = inputCurrency === 'USD' ? 1 : userCurrencyRate;
            let payload: any = { ...formData, price: (formData.price || 0) / rate };
            
            if (formData.category === 'Free Projects' && freeDays > 0) {
                const expiry = new Date();
                expiry.setDate(expiry.getDate() + freeDays);
                payload.free_until = expiry.toISOString();
            }

            if (editingId) {
                await api.updateMarketplaceItem(editingId, payload);
                toast.success("Item updated successfully");
            } else {
                await api.createMarketplaceItem({ ...payload as any, developer_id: user.id, developer_name: user.name });
                toast.success("Item listed successfully");
            }
            setShowForm(false);
            setEditingId(null);
            setFreeDays(0);
            setInputCurrency('USD');
            setFormData({ title: '', price: 0, category: 'Premium Projects', short_description: '', full_description: '', tags: [], features: [], is_featured: false });
            api.getMarketplaceItems().then(setItems);
        } catch (e: any) { toast.error(e.message); }
    };

    const handleEdit = (item: MarketplaceItem) => {
        setInputCurrency('USD');
        setFormData({
            title: item.title,
            price: item.price,
            category: item.category || 'Premium Projects',
            short_description: item.short_description,
            full_description: item.full_description,
            image_url: item.image_url || '',
            demo_url: item.demo_url || '',
            download_url: item.download_url || '',
            tags: item.tags || [],
            features: item.features || [],
            is_featured: item.is_featured || false
        });
        setEditingId(item.id);
        setShowForm(true);
        window.scrollTo(0,0);
    };

    const confirmDelete = (id: string) => setDeleteId(id);

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await api.deleteMarketplaceItem(deleteId);
            setItems(prev => prev.filter(i => i.id !== deleteId));
            toast.success("Item removed");
        } catch (e: any) { toast.error(e.message); } 
        finally { setDeleteId(null); }
    };

    const cancelEdit = () => {
        setShowForm(false);
        setEditingId(null);
        setFreeDays(0);
        setInputCurrency('USD');
        setFormData({ title: '', price: 0, category: 'Premium Projects', short_description: '', full_description: '', tags: [], features: [], is_featured: false });
    };

    return (
        <div className="space-y-6">
             <ConfirmDialog 
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Listing"
                message="Are you sure you want to delete this project? This action cannot be undone."
                confirmText="Delete Project"
             />

             <div className="flex justify-between items-center mb-6">
                  <h2 className="text-sm font-display font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                      <ShoppingBag className="text-[var(--vb-accent)]" size={18} /> Marketplace Listings
                  </h2>
                  <button 
                    onClick={() => showForm ? cancelEdit() : setShowForm(true)}
                    className="btn-primary h-9 px-4 text-xs font-semibold"
                  >
                      {showForm ? 'Cancel' : <><Plus size={14} className="mr-1.5 inline-block"/> Add Product</>}
                  </button>
             </div>

             {showForm && (
                  <div className="glass-card p-6 md:p-8 mb-8 animate-in fade-in slide-in-from-top-4">
                      <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                        <h3 className="font-display font-semibold text-foreground text-sm uppercase tracking-wider">{editingId ? 'Edit Project' : 'Publish Product'}</h3>
                        <div className="flex items-center gap-3">
                            <div className="flex bg-white/[0.02] border border-white/5 rounded-lg p-0.5 font-mono text-[9px]">
                                <button type="button" onClick={() => setInputCurrency('USD')} className={`px-3 py-1 rounded transition-colors ${inputCurrency === 'USD' ? 'bg-foreground text-background font-bold' : 'text-foreground/40 hover:text-foreground'}`}>USD ($)</button>
                                <button type="button" onClick={() => setInputCurrency(userCurrencyCode)} className={`px-3 py-1 rounded transition-colors ${inputCurrency !== 'USD' ? 'bg-foreground text-background font-bold' : 'text-foreground/40 hover:text-foreground'}`}>{userCurrencyCode}</button>
                            </div>
                        </div>
                      </div>
                      <form onSubmit={handleSave} className="space-y-5 font-satoshi">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                              <div className="space-y-1.5">
                                  <label className="text-xs uppercase text-foreground/50 font-bold tracking-wider">Inventory Category</label>
                                  <select value={formData.category} onChange={(e) => handleCategoryChange(e.target.value as ProjectCategory)} className="w-full h-10 bg-[#1b1e22] border border-white/5 rounded-lg px-3 text-xs text-foreground focus:border-white/20 outline-none">
                                      <option value="Premium Projects" className="bg-[#212529]">Premium Projects</option>
                                      <option value="UI/UX Design" className="bg-[#212529]">UI/UX Design</option>
                                      <option value="Free Projects" className="bg-[#212529]">Free Projects</option>
                                  </select>
                              </div>
                              <Input label="Project Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                              {formData.category === 'Free Projects' ? (
                                 <Input label="Free Duration (Days, 0 = Forever)" type="number" value={freeDays} onChange={e => setFreeDays(parseInt(e.target.value))} />
                              ) : (
                                 <Input type="number" label={`Sales Price (${inputCurrency})`} value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} placeholder="Price" required />
                              )}
                          </div>
                          <Input label="One-liner Pitch" value={formData.short_description} onChange={e => setFormData({...formData, short_description: e.target.value})} placeholder="Provide a summary pitch..." required />
                          <Textarea label="Detailed Description" value={formData.full_description} onChange={e => setFormData({...formData, full_description: e.target.value})} required />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                              <Input label="Cover Image URL" value={formData.image_url || ''} onChange={e => setFormData({...formData, image_url: e.target.value})} placeholder="https://..." />
                              <Input label="Download Target Link (Zip/Repo)" value={formData.download_url || ''} onChange={e => setFormData({...formData, download_url: e.target.value})} />
                          </div>
                          <Input label="Project Live Demo URL" value={formData.demo_url || ''} onChange={e => setFormData({...formData, demo_url: e.target.value})} />
                          <div className="pt-2">
                              <label className="flex items-center space-x-3.5 cursor-pointer group p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all w-fit">
                                <input type="checkbox" checked={formData.is_featured} onChange={e => setFormData({...formData, is_featured: e.target.checked})} className="form-checkbox h-4 w-4 text-[var(--vb-accent)] rounded bg-transparent border-white/10 focus:ring-0 focus:ring-offset-0"/>
                                <span className="text-foreground/75 text-xs font-display font-semibold uppercase tracking-wider flex items-center gap-1.5"><Zap size={12} className="text-yellow-400" /> Feature on Homepage</span>
                            </label>
                          </div>
                          <div className="flex justify-end pt-5 border-t border-white/5 gap-3.5">
                              <button type="button" onClick={cancelEdit} className="btn-ghost h-10 px-5 text-xs font-semibold">Cancel</button>
                              <button type="submit" className="btn-primary h-10 px-6 text-xs font-semibold">{editingId ? 'Update Product' : 'Publish Product'}</button>
                          </div>
                      </form>
                  </div>
             )}

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {items.map(item => (
                      <div key={item.id} className="glass-card flex flex-col justify-between group overflow-hidden">
                          <div>
                            <div className="aspect-video bg-black/40 relative overflow-hidden">
                                {item.image_url ? (
                                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-foreground/20"><ImageIcon size={28} /></div>
                                )}
                                <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleEdit(item)} className="p-2 border border-white/10 bg-black/60 rounded-lg text-white hover:bg-[var(--vb-accent)] transition-colors"><Edit size={12} /></button>
                                    <button onClick={() => confirmDelete(item.id)} className="p-2 border border-white/10 bg-black/60 rounded-lg text-white hover:bg-red-500 transition-colors"><Trash2 size={12} /></button>
                                </div>
                                {item.is_featured && <div className="absolute bottom-3 left-3 bg-yellow-500 text-black text-[8px] font-display font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1"><Zap size={8} fill="currentColor"/> Featured</div>}
                            </div>
                            
                            <div className="p-5 font-satoshi space-y-3">
                                <h3 className="font-display font-bold text-foreground text-base truncate">{item.title}</h3>
                                <div className="flex justify-between items-center text-[10px]">
                                    <Badge variant="default" className="border-white/5 bg-white/2 py-0.5">{item.category}</Badge>
                                    <div className="text-foreground/45 uppercase tracking-wider flex items-center gap-1 font-mono"><UserIcon size={10} /> {item.developer_name}</div>
                                </div>
                            </div>
                          </div>
                          
                          <div className="p-5 pt-0 mt-auto flex justify-between items-center border-t border-white/5 pt-4 font-satoshi">
                              <span className="font-bold text-foreground text-lg font-mono">{item.category === 'Free Projects' ? 'FREE' : `$${item.price}`}</span>
                              <div className="flex items-center gap-1.5 text-[10px] text-foreground/40 font-mono">
                                  <Users size={12} /> {item.purchases} sales
                              </div>
                          </div>
                      </div>
                  ))}
             </div>
        </div>
    );
};

// 7. Subscriptions (Recurring Services)
const AdminSubscriptions: React.FC = () => {
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<any | null>(null);
    const [formData, setFormData] = useState<{
        title: string;
        description: string;
        price: number;
        interval: 'month' | 'year';
        features: string[];
        is_active: boolean;
        show_on_home: boolean;
        currency: string;
    }>({
        title: '', description: '', price: 0, interval: 'month', features: [], is_active: true, show_on_home: false, currency: 'USD'
    });
    const toast = useToast();

    useEffect(() => { api.getRecurringServices().then(setSubscriptions); }, []);

    const handleEdit = (s: any) => {
        setEditing(s);
        setFormData(s);
        setShowForm(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editing) {
                const updated = await api.updateRecurringService(editing.id, formData);
                setSubscriptions(updated);
                toast.success("Subscription updated");
            } else {
                const updated = await api.createRecurringService(formData);
                setSubscriptions(updated);
                toast.success("Subscription created");
            }
            setShowForm(false);
            setEditing(null);
            setFormData({ title: '', description: '', price: 0, interval: 'month', features: [], is_active: true, show_on_home: false, currency: 'USD' });
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    const handleDelete = async (id: string) => {
        if(!window.confirm("Delete this subscription plan?")) return;
        try {
            const updated = await api.deleteRecurringService(id);
            setSubscriptions(updated);
            toast.success("Subscription deleted");
        } catch(e: any) { toast.error(e.message); }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-display font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <RefreshCw className="text-[var(--vb-accent)]" size={18} /> Subscription Plans
                </h3>
                <button 
                  onClick={() => { setEditing(null); setShowForm(!showForm); }}
                  className="btn-primary h-9 px-4 text-xs font-semibold"
                >
                    {showForm ? 'Cancel' : <><Plus size={14} className="mr-1.5 inline-block"/> Add Plan</>}
                </button>
            </div>

            {showForm && (
                <div className="glass-card p-6 md:p-8 animate-in fade-in slide-in-from-top-4 mb-8">
                    <h4 className="font-display font-semibold text-foreground mb-6 text-sm uppercase tracking-wider">{editing ? 'Edit Plan' : 'New Subscription Template'}</h4>
                    <form onSubmit={handleSave} className="space-y-5 font-satoshi">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <Input label="Plan Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                            <div className="grid grid-cols-2 gap-3">
                                <Input label="Monthly Fee ($)" type="number" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} required />
                                <div className="space-y-1.5">
                                    <label className="text-xs text-foreground/50 uppercase font-bold tracking-wider">Interval</label>
                                    <select 
                                        className="w-full bg-[#1b1e22] border border-white/5 rounded-lg px-3 py-2 text-xs text-foreground/80 outline-none"
                                        value={formData.interval}
                                        onChange={e => setFormData({...formData, interval: e.target.value as 'month' | 'year'})}
                                    >
                                        <option value="month" className="bg-[#212529]">Monthly</option>
                                        <option value="year" className="bg-[#212529]">Yearly</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <Textarea label="Core Focus / Pitch" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
                        
                        <div className="space-y-1.5">
                            <label className="text-xs text-foreground/50 uppercase font-bold tracking-wider">Features Included (Comma separated)</label>
                            <Textarea 
                                value={Array.isArray(formData.features) ? formData.features.join(', ') : formData.features} 
                                onChange={e => setFormData({...formData, features: e.target.value.split(',').map(f => f.trim()) as any})} 
                                placeholder="Feature 1, Feature 2, Feature 3"
                            />
                        </div>

                        <div className="flex items-center gap-6 pt-2 select-none">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="accent-[var(--vb-accent)] w-4.5 h-4.5 bg-transparent border-white/10" />
                                <span className="text-xs text-foreground/75 font-semibold">Active Plan</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={formData.show_on_home} onChange={e => setFormData({...formData, show_on_home: e.target.checked})} className="accent-[var(--vb-accent)] w-4.5 h-4.5 bg-transparent border-white/10" />
                                <span className="text-xs text-foreground/75 font-semibold">Feature on Home</span>
                            </label>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button type="submit" className="btn-primary h-10 px-6 text-xs font-semibold">{editing ? 'Update Plan' : 'Create Plan'}</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {subscriptions.map(s => (
                    <div key={s.id} className="glass-card p-6 flex flex-col justify-between group">
                        <div>
                          <div className="flex justify-between items-start mb-4">
                              <Badge variant={s.is_active ? 'success' : 'danger'} className="uppercase text-[8px] py-0.5">{s.is_active ? 'Active' : 'Inactive'}</Badge>
                              <div className="flex gap-1.5">
                                  <button onClick={() => handleEdit(s)} className="p-2 border border-white/5 hover:border-white/10 rounded-lg text-foreground/50 hover:text-foreground transition-all"><Edit size={12}/></button>
                                  <button onClick={() => handleDelete(s.id)} className="p-2 border border-white/5 hover:border-red-500/10 rounded-lg text-foreground/50 hover:text-red-400 transition-all"><Trash2 size={12}/></button>
                              </div>
                          </div>
                          
                          <h4 className="font-display font-semibold text-foreground text-lg mb-1">{s.title}</h4>
                          <div className="flex items-baseline gap-1 mb-4 font-mono">
                              <span className="text-xl font-bold text-foreground">${s.price}</span>
                              <span className="text-[10px] text-foreground/45">/{s.interval}</span>
                          </div>
                          
                          <p className="text-xs text-foreground/45 font-satoshi leading-relaxed mb-6">{s.description}</p>
                        </div>
                        
                        {s.show_on_home && (
                            <div className="pt-4 border-t border-white/5 mt-auto">
                                <span className="text-[9px] uppercase font-display font-bold text-[var(--vb-accent)] flex items-center gap-1">
                                    <CheckCircle size={11} /> Home Featured
                                </span>
                            </div>
                        )}
                    </div>
                ))}
                {subscriptions.length === 0 && <div className="col-span-full text-center text-foreground/30 text-xs font-satoshi py-12">No recurring models published.</div>}
            </div>
        </div>
    );
};

// 8. Site Settings
const AdminSettings: React.FC = () => {
    const [settings, setSettings] = useState<any>(null);
    const toast = useToast();

    useEffect(() => {
        api.getSiteSettings().then(setSettings);
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.updateSiteSettings(settings);
            toast.success("Site settings updated!");
        } catch (err: any) {
            toast.error(err.message || "Failed to update settings");
        }
    };

    if (!settings) return null;

    return (
        <div className="space-y-6 font-satoshi">
            <h3 className="text-sm font-display font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Globe className="text-[var(--vb-accent)]" size={18} /> Site Content Management
            </h3>
            <div className="glass-card p-6 md:p-8">
                <form onSubmit={handleSave} className="space-y-6">
                    <h4 className="font-display font-semibold text-foreground text-sm uppercase tracking-wider border-b border-white/5 pb-2 mb-4">Hero Content</h4>
                    <div className="grid grid-cols-1 gap-5">
                        <Input label="Homepage Hero Title" value={settings.hero_title} onChange={e => setSettings({...settings, hero_title: e.target.value})} required />
                        <Textarea label="Homepage Subtitle Description" value={settings.hero_subtitle} onChange={e => setSettings({...settings, hero_subtitle: e.target.value})} required />
                    </div>
                    
                    <h4 className="font-display font-semibold text-foreground text-sm uppercase tracking-wider border-b border-white/5 pb-2 mb-4 mt-8">Studio Coordinates</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <Input label="Studio Support Email" type="email" value={settings.contact_email} onChange={e => setSettings({...settings, contact_email: e.target.value})} required />
                        <Input label="Studio Contact Phone" value={settings.contact_phone} onChange={e => setSettings({...settings, contact_phone: e.target.value})} required />
                    </div>

                    <div className="flex justify-end pt-4 border-t border-white/5">
                        <button type="submit" className="btn-primary h-10 px-6 text-xs font-semibold">Save Coordinates</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

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
      { id: 'analytics', label: 'Overview', icon: BarChart3 },
      { id: 'orders', label: 'Client Orders', icon: ClipboardList },
      { id: 'requests', label: 'Feature Backlog', icon: Lightbulb },
      { id: 'services', label: 'Services', icon: Layers },
      { id: 'subscriptions', label: 'Subscriptions', icon: RefreshCw },
      { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
      { id: 'offers', label: 'Coupons', icon: TicketPercent },
      { id: 'tasks', label: 'Directives', icon: CheckCircle },
      { id: 'settings', label: 'Site Content', icon: Globe, role: ['super_admin', 'admin'] },
      { id: 'team', label: 'Operatives', icon: Users, role: ['super_admin'] },
  ];

  const renderContent = () => {
      switch(activeTab) {
          case 'analytics': return <AdminAnalytics />;
          case 'orders': return <AdminOrders user={user} />;
          case 'requests': return <AdminRequests />;
          case 'services': return <AdminServices />;
          case 'subscriptions': return <AdminSubscriptions />;
          case 'marketplace': return <AdminMarketplace user={user} />;
          case 'offers': return <AdminOffers />;
          case 'tasks': return <AdminTasks user={user} />;
          case 'settings': return <AdminSettings />;
          case 'team': return <AdminTeam user={user} />;
          default: return <div className="p-10 text-center text-foreground/30 text-xs font-satoshi">Select a dashboard module</div>;
      }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-white/10">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-[#25292e] border-r border-white/5 hidden md:flex flex-col relative z-20">
          <div className="p-8">
            <h1 className="text-sm font-display font-bold text-foreground tracking-[0.25em] flex items-center gap-2">
                <Shield size={18} className="text-[var(--vb-accent)]" />
                VISION BUILT
            </h1>
            <p className="text-[8px] text-foreground/30 mt-2 uppercase tracking-widest font-mono pl-7">Operational Console</p>
          </div>
          
          <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
            {menuItems.map(item => {
                if (item.role && !item.role.includes(user.role)) return null;
                const Icon = item.icon;
                return (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-4.5 py-3 text-[10px] font-display font-semibold uppercase tracking-wider rounded-lg transition-all ${
                            activeTab === item.id 
                            ? 'bg-white/[0.04] text-foreground border border-white/5 shadow-md' 
                            : 'text-foreground/40 hover:text-foreground hover:bg-white/[0.01] border border-transparent'
                        }`}
                    >
                        <Icon size={14} className={activeTab === item.id ? 'text-[var(--vb-accent)]' : 'text-foreground/40'} />
                        <span>{item.label}</span>
                    </button>
                );
            })}
          </nav>

          <div className="p-4 border-t border-white/5 bg-white/[0.01]">
              <div className="flex items-center gap-3 px-2 py-2">
                  <div className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/5 flex items-center justify-center text-xs font-display font-bold text-foreground">
                      {user.name.charAt(0)}
                  </div>
                  <div className="overflow-hidden font-satoshi">
                      <p className="text-xs font-bold text-foreground truncate uppercase tracking-wide">{user.name}</p>
                      <p className="text-[9px] text-foreground/45 truncate capitalize font-mono mt-0.5">{user.role.replace('_', ' ')}</p>
                  </div>
              </div>
              <Link to="/">
                <button className="w-full btn-ghost mt-3 justify-start text-[9px] uppercase tracking-widest text-foreground/40 hover:text-red-400 h-8 border-none p-0 flex items-center gap-2">
                    <LogOut size={12} /> Sign Out
                </button>
              </Link>
          </div>
        </aside>

        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 w-full bg-[#25292e] border-b border-white/5 z-20 flex justify-between items-center p-4">
             <span className="font-display font-bold text-foreground text-xs uppercase tracking-widest flex items-center gap-1.5"><Shield size={12}/> Console</span>
             <div className="flex items-center gap-4">
                 <AdminNotifications />
                 <select 
                    value={activeTab} 
                    onChange={(e) => setActiveTab(e.target.value)}
                    className="bg-white/[0.02] text-[9px] text-foreground border border-white/5 rounded-lg px-2.5 py-1.5 font-display font-semibold uppercase tracking-wider outline-none cursor-pointer"
                 >
                     {menuItems.map(i => <option key={i.id} value={i.id} className="bg-[#212529]">{i.label}</option>)}
                 </select>
             </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-background p-4 md:p-8 pt-20 md:pt-8 relative custom-scrollbar">
            {/* Grid overlay */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
            
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="mb-8 animate-in fade-in duration-700 flex justify-between items-end border-b border-white/5 pb-6">
                    <div>
                        <h1 className="text-2xl font-display font-bold text-foreground mb-1 uppercase tracking-wider flex items-center gap-3">
                            {menuItems.find(i => i.id === activeTab)?.icon && React.createElement(menuItems.find(i => i.id === activeTab)!.icon, { size: 24, className: 'text-[var(--vb-accent)]' })}
                            {menuItems.find(i => i.id === activeTab)?.label}
                        </h1>
                        <p className="text-[10px] text-foreground/30 font-mono">System Integrity: OK // Operational v2.2.0</p>
                    </div>
                    <div className="hidden md:block">
                        <AdminNotifications />
                    </div>
                </div>
                
                {renderContent()}
            </div>
        </main>
      </div>
    </div>
  );
};

export default Admin;
