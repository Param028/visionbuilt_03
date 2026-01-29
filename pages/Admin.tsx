
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, CheckCircle, 
  Edit, Trash2, Plus, 
  ImageIcon, Users, ClipboardList, 
  BarChart3, TicketPercent, Layers, 
  Lightbulb, Bell, DollarSign,
  User as UserIcon, LogOut, Shield, Zap, RefreshCw, X, Calendar, Search
} from 'lucide-react';
import { api } from '../services/api';
import { User, MarketplaceItem, ProjectCategory, Order, Service, Offer, Task, ProjectSuggestion, AnalyticsData, AdminActivity } from '../types';
import { Button, Card, Badge, Input, Textarea, ConfirmDialog } from '../components/ui/Components';
import { useToast } from '../components/ui/Toast';
import { CURRENCY_CONFIG, formatPrice } from '../constants';

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
            <button onClick={() => setIsOpen(!isOpen)} className="p-2.5 rounded-full hover:bg-white/10 relative transition-colors">
                <Bell size={20} className="text-gray-400 hover:text-white" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]"></span>
            </button>
            
            {isOpen && (
                <div className="absolute right-0 mt-4 w-96 bg-[#0B1121] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-top-2">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                        <span className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                            <Shield size={14} className="text-vision-primary" /> System Logs
                        </span>
                        <button onClick={() => setIsOpen(false)}><X size={16} className="text-gray-500 hover:text-white" /></button>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2">
                        {activities.length === 0 ? (
                            <div className="p-8 text-center text-xs text-gray-500">No recent system activity.</div>
                        ) : (
                            activities.map(act => (
                                <div key={act.id} className="p-3 mb-1 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                                    <div className="flex justify-between items-start mb-1.5">
                                        <span className="text-[11px] font-bold text-vision-primary uppercase tracking-wide">{act.action}</span>
                                        <span className="text-[10px] text-gray-600 font-mono">{new Date(act.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    </div>
                                    <p className="text-xs text-gray-300 leading-relaxed">{act.details}</p>
                                    <div className="mt-2 flex items-center gap-1.5">
                                        <div className="w-4 h-4 rounded-full bg-gray-800 flex items-center justify-center text-[8px] text-gray-400">
                                            {(act.admin_name || 'Sys').charAt(0)}
                                        </div>
                                        <span className="text-[10px] text-gray-500">By {act.admin_name || 'System'}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// 1. Analytics
const AdminAnalytics: React.FC = () => {
    const [data, setData] = useState<AnalyticsData | null>(null);
    useEffect(() => { api.getAnalytics().then(setData); }, []);

    if (!data) return <div className="p-20 text-center"><RefreshCw className="animate-spin w-8 h-8 mx-auto text-vision-primary" /></div>;

    const StatCard = ({ title, value, icon: Icon, colorClass }: any) => (
        <div className="bg-[#0f172a]/60 backdrop-blur-md border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-white/10 transition-all">
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${colorClass}`}>
                <Icon size={64} />
            </div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{title}</h3>
            <p className="text-3xl font-display font-bold text-white">{value}</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Revenue" value={`$${data.total_revenue}`} icon={DollarSign} colorClass="text-vision-primary" />
                <StatCard title="Active Orders" value={data.active_projects} icon={ClipboardList} colorClass="text-purple-500" />
                <StatCard title="Total Views" value={data.total_views} icon={Users} colorClass="text-blue-500" />
                <StatCard title="Total Orders" value={data.total_orders} icon={ShoppingBag} colorClass="text-green-500" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 border-white/5 bg-[#0f172a]/40">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-white">Revenue Velocity</h3>
                        <Badge variant="default">Last 7 Days</Badge>
                    </div>
                    <div className="h-64 flex items-end gap-4 px-4 pb-4">
                        {data.sales_trend.map((val, i) => (
                             <div key={i} className="flex-1 flex flex-col justify-end group cursor-pointer">
                                 <div className="relative w-full bg-vision-primary/10 hover:bg-vision-primary/30 rounded-t-lg transition-all duration-300" style={{ height: `${Math.max(5, (val / (Math.max(...data.sales_trend) || 1)) * 100)}%` }}>
                                     <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-vision-900 border border-vision-primary/30 text-vision-primary text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity mb-2">
                                         ${val}
                                     </div>
                                 </div>
                                 <div className="h-1 w-full bg-white/5 mt-1 rounded-full group-hover:bg-vision-primary/50 transition-colors"></div>
                             </div>
                        ))}
                    </div>
                </Card>
                <Card className="border-white/5 bg-[#0f172a]/40">
                    <h3 className="text-lg font-bold text-white mb-6">Top Developer</h3>
                    {data.top_developer ? (
                        <div className="text-center py-8">
                             <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-vision-primary to-vision-secondary p-[2px] mb-4 shadow-[0_0_30px_rgba(139,92,246,0.3)]">
                                <div className="w-full h-full rounded-full bg-[#0f172a] flex items-center justify-center text-3xl font-bold text-white">
                                    {data.top_developer.name.charAt(0)}
                                </div>
                             </div>
                             <h4 className="text-xl font-bold text-white">{data.top_developer.name}</h4>
                             <p className="text-sm text-gray-400 font-mono mt-1">{data.top_developer.email}</p>
                             <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs font-bold uppercase tracking-widest">
                                 <TicketPercent size={14} /> Top Performer
                             </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">No data available</div>
                    )}
                </Card>
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
    
    // Inline Edit State
    const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
    const [tempPrice, setTempPrice] = useState<string>('');
    
    // Deletion State
    const [deleteId, setDeleteId] = useState<string | null>(null);

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

    const startPriceEdit = (order: Order) => {
        setEditingPriceId(order.id);
        setTempPrice(order.total_amount.toString());
    };

    const savePriceEdit = async (id: string) => {
        const newAmount = parseFloat(tempPrice);
        if (isNaN(newAmount) || newAmount < 0) {
            toast.error("Invalid amount");
            return;
        }
        try {
            await api.updateOrderPrice(id, newAmount, user.id);
            setOrders(prev => prev.map(o => o.id === id ? { ...o, total_amount: newAmount } : o));
            setEditingPriceId(null);
            toast.success("Price updated successfully");
        } catch(e) { toast.error("Failed to update price"); }
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

    const handlePayout = (order: Order) => {
        // Logic would normally integrate with Stripe Connect or similar payout API
        // For now, we simulate marking it as processed
        if (confirm(`Process payout for Order #${order.id.slice(0,6)}?\nAmount: ${formatPrice(order.amount_paid * 0.7)} (70% Share)`)) {
            toast.success(`Payout processed for Order #${order.id.slice(0,6)}`);
        }
    };

    const filteredOrders = orders.filter(o => {
        const matchesFilter = filter === 'all' || o.status === filter;
        const matchesSearch = o.id.toLowerCase().includes(search.toLowerCase()) || 
                              o.service_title.toLowerCase().includes(search.toLowerCase()) ||
                              o.user_id.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    if(loading) return <div className="text-center p-20"><RefreshCw className="animate-spin w-8 h-8 mx-auto text-vision-primary" /></div>;

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

            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <ClipboardList className="text-vision-primary" /> Client Orders
                </h3>
                <div className="flex flex-wrap gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                        <input 
                            type="text" 
                            placeholder="Search orders..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-black/40 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:border-vision-primary outline-none w-full md:w-64"
                        />
                    </div>
                    <select 
                        value={filter} 
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white outline-none cursor-pointer"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredOrders.map(order => (
                    <div key={order.id} className="bg-[#0f172a]/60 border border-white/5 rounded-xl p-5 hover:border-vision-primary/30 transition-all group relative overflow-hidden">
                        {/* Status Stripe */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                            order.status === 'completed' ? 'bg-green-500' : 
                            order.status === 'in_progress' ? 'bg-vision-primary' : 
                            order.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-500'
                        }`} />

                        <div className="flex flex-col lg:flex-row gap-6 lg:items-center justify-between pl-4">
                            {/* Order Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">
                                        #{order.id.slice(0, 8)}
                                    </span>
                                    <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                        <Calendar size={10} /> {new Date(order.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <h4 className="text-lg font-bold text-white mb-1 truncate">{order.service_title}</h4>
                                <div className="flex items-center gap-4 text-xs text-gray-400">
                                    <span className="flex items-center gap-1"><UserIcon size={12}/> {order.user_id}</span>
                                    {order.type === 'project' && <span className="bg-vision-secondary/10 text-vision-secondary px-2 py-0.5 rounded text-[10px] uppercase font-bold">Marketplace Project</span>}
                                </div>
                            </div>

                            {/* Financials (Inline Edit) */}
                            <div className="flex flex-col items-start lg:items-end min-w-[150px]">
                                <span className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Total Budget</span>
                                {editingPriceId === order.id ? (
                                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
                                        <input 
                                            type="number" 
                                            value={tempPrice}
                                            onChange={(e) => setTempPrice(e.target.value)}
                                            className="w-24 bg-black/50 border border-vision-primary text-white text-sm rounded px-2 py-1 outline-none"
                                            autoFocus
                                        />
                                        <button onClick={() => savePriceEdit(order.id)} className="p-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/40"><CheckCircle size={16} /></button>
                                        <button onClick={() => setEditingPriceId(null)} className="p-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/40"><X size={16} /></button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 group/price cursor-pointer" onClick={() => startPriceEdit(order)}>
                                        <span className="text-xl font-bold text-white font-mono">{formatPrice(order.total_amount, user.country)}</span>
                                        <Edit size={12} className="text-gray-600 group-hover/price:text-vision-primary transition-colors" />
                                    </div>
                                )}
                                <span className="text-xs text-gray-500 mt-1">Paid: <span className="text-green-400">{formatPrice(order.amount_paid, user.country)}</span></span>
                            </div>

                            {/* Actions & Status */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 border-t lg:border-t-0 border-white/5 pt-4 lg:pt-0">
                                <select 
                                    value={order.status}
                                    onChange={(e) => handleStatusUpdate(order.id, e.target.value as Order['status'])}
                                    className={`bg-black/40 border border-white/10 text-xs rounded-lg px-3 py-2 outline-none font-bold uppercase tracking-wide ${
                                        order.status === 'completed' ? 'text-green-400' : 
                                        order.status === 'pending' ? 'text-yellow-400' : 'text-blue-400'
                                    }`}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="accepted">Accepted</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="mockup_ready">Mockup Ready</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>

                                <Link to={`/dashboard/order/${order.id}`}>
                                    <Button size="sm" variant="ghost" className="w-full sm:w-auto h-9 border border-white/10 hover:border-vision-primary/50">
                                        Chat
                                    </Button>
                                </Link>

                                {order.status === 'completed' && order.amount_paid > 0 && (
                                    <Button 
                                        size="sm" 
                                        onClick={() => handlePayout(order)}
                                        className="h-9 bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/30"
                                    >
                                        <DollarSign size={14} className="mr-1" /> Payout
                                    </Button>
                                )}

                                <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-9 w-9 text-gray-500 hover:text-red-400 hover:bg-red-500/10"
                                    onClick={() => setDeleteId(order.id)}
                                >
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
                {filteredOrders.length === 0 && (
                    <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
                        <ShoppingBag size={48} className="mx-auto text-gray-600 mb-4" />
                        <p className="text-gray-400">No orders found matching your criteria.</p>
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
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Layers className="text-vision-primary" /> Service Inventory
                </h3>
                <Button onClick={() => { setEditing(null); setShowForm(!showForm); }}>
                    {showForm ? 'Cancel' : <><Plus size={16} className="mr-2"/> Add Service</>}
                </Button>
            </div>

            {showForm && (
                <Card className="animate-in fade-in slide-in-from-top-4 mb-8 border-vision-primary/30">
                    <h4 className="font-bold text-white mb-6 text-lg">{editing ? 'Edit Service' : 'New Service Configuration'}</h4>
                    <form onSubmit={handleSave} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <Input label="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                            <Input label="Base Price ($)" type="number" value={formData.base_price} onChange={e => setFormData({...formData, base_price: parseFloat(e.target.value)})} required />
                        </div>
                        <Textarea label="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required className="min-h-[100px]" />
                        <Input label="Icon Name (Lucide)" value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} placeholder="e.g. Code, Smartphone, Globe" />
                        <div className="flex justify-end pt-2">
                            <Button type="submit" className="min-w-[150px]">{editing ? 'Update Service' : 'Create Service'}</Button>
                        </div>
                    </form>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {services.map(s => (
                    <div key={s.id} className="bg-[#0f172a]/60 border border-white/5 rounded-xl p-5 hover:border-vision-primary/30 transition-all group relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-white/5 rounded-lg text-vision-primary group-hover:scale-110 transition-transform">
                                {/* Simple icon placeholder logic if generic, else dynamic render can be added */}
                                <Layers size={24} />
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => handleEdit(s)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"><Edit size={14}/></button>
                                <button onClick={() => handleToggle(s)} className={`p-2 rounded-lg transition-colors ${s.is_enabled ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>
                                    <Zap size={14} fill={s.is_enabled ? "currentColor" : "none"} />
                                </button>
                            </div>
                        </div>
                        <h4 className="font-bold text-white text-lg mb-2">{s.title}</h4>
                        <p className="text-sm text-gray-400 line-clamp-2 mb-4 h-10">{s.description}</p>
                        <div className="flex justify-between items-center border-t border-white/5 pt-4">
                            <span className="text-xl font-bold text-white font-mono">{formatPrice(s.base_price)}</span>
                            <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${s.is_enabled ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
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
        <div className="space-y-8">
            <div className="flex flex-col xl:flex-row gap-8">
                <div className="flex-1 space-y-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <TicketPercent className="text-vision-primary" /> Active Coupons
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {offers.map(o => (
                            <div key={o.id} className="flex justify-between items-center p-4 bg-[#0f172a]/60 border border-white/5 rounded-xl group hover:border-vision-primary/30 transition-all">
                                <div>
                                    <h4 className="font-bold text-white text-lg tracking-wide">{o.code}</h4>
                                    <p className="text-xs text-gray-400">{o.title}</p>
                                    <div className="mt-2 inline-block bg-vision-primary/10 text-vision-primary text-[10px] font-bold px-2 py-0.5 rounded">
                                        {o.discountPercentage}% DISCOUNT
                                    </div>
                                </div>
                                <Button size="icon" variant="ghost" onClick={() => handleDelete(o.id)} className="text-gray-500 hover:text-red-400 hover:bg-red-500/10">
                                    <Trash2 size={18} />
                                </Button>
                            </div>
                        ))}
                        {offers.length === 0 && <div className="text-gray-500 text-sm col-span-full">No active offers. Create one to drive sales.</div>}
                    </div>
                </div>
                
                <div className="xl:w-1/3">
                    <Card className="h-fit sticky top-6 border-vision-primary/20">
                        <h4 className="font-bold text-white mb-4 text-lg">Create New Offer</h4>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <Input label="Campaign Title" value={newOffer.title} onChange={e => setNewOffer({...newOffer, title: e.target.value})} required />
                            <div className="grid grid-cols-2 gap-3">
                                <Input label="Code" value={newOffer.code} onChange={e => setNewOffer({...newOffer, code: e.target.value.toUpperCase()})} required className="uppercase font-mono" placeholder="SUMMER25" />
                                <Input label="Discount %" type="number" value={newOffer.discountPercentage} onChange={e => setNewOffer({...newOffer, discountPercentage: parseInt(e.target.value)})} required />
                            </div>
                            <Textarea label="Description (Internal)" value={newOffer.description} onChange={e => setNewOffer({...newOffer, description: e.target.value})} className="min-h-[80px]" />
                            <Button type="submit" className="w-full">Launch Offer</Button>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
};

// 5. Tasks
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

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <CheckCircle className="text-vision-primary" /> Internal Directives
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 {/* Task List */}
                 <div className="lg:col-span-2 space-y-4">
                     {tasks.map(t => (
                         <div key={t.id} className="flex justify-between items-start bg-[#0f172a]/60 border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all">
                             <div>
                                 <div className="flex items-center gap-3 mb-2">
                                     <h4 className={`font-bold text-lg ${t.status === 'done' ? 'text-gray-500 line-through' : 'text-white'}`}>{t.title}</h4>
                                     <Badge variant={t.priority === 'high' ? 'danger' : t.priority === 'medium' ? 'warning' : 'info'} className="text-[10px] uppercase">{t.priority}</Badge>
                                 </div>
                                 <p className="text-sm text-gray-400 leading-relaxed mb-3">{t.description}</p>
                                 <div className="flex items-center gap-2 text-xs text-gray-500">
                                     <div className="w-5 h-5 rounded-full bg-vision-primary/20 flex items-center justify-center text-vision-primary font-bold text-[10px]">
                                         {t.assigned_to_name.charAt(0)}
                                     </div>
                                     <span>Assigned to {t.assigned_to_name}</span>
                                 </div>
                             </div>
                             <div className="flex flex-col gap-2 min-w-[120px]">
                                 <label className="text-[10px] text-gray-500 uppercase font-bold">Status</label>
                                 <select 
                                    value={t.status}
                                    onChange={(e) => handleStatus(t.id, e.target.value as any)}
                                    className="bg-black/40 border border-white/10 text-xs text-white rounded-lg px-3 py-2 outline-none cursor-pointer hover:border-vision-primary/50 transition-colors"
                                 >
                                     <option value="todo">To Do</option>
                                     <option value="in_progress">In Progress</option>
                                     <option value="review">Review</option>
                                     <option value="done">Done</option>
                                 </select>
                             </div>
                         </div>
                     ))}
                     {tasks.length === 0 && <p className="text-gray-500 text-center py-10">No pending tasks.</p>}
                 </div>

                 {/* Create Form */}
                 <Card className="h-fit sticky top-6 border-vision-primary/20">
                     <h4 className="font-bold text-white mb-4 text-lg">Assign New Task</h4>
                     <form onSubmit={handleCreate} className="space-y-4">
                         <Input label="Task Title" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} required />
                         <Textarea label="Details" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} className="min-h-[100px]" />
                         <div className="space-y-1.5">
                             <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Assign To</label>
                             <select 
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-vision-primary/50 outline-none"
                                value={newTask.assigned_to_id}
                                onChange={e => setNewTask({...newTask, assigned_to_id: e.target.value})}
                             >
                                 {team.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                             </select>
                         </div>
                         <div className="space-y-1.5">
                             <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Priority</label>
                             <select 
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-vision-primary/50 outline-none"
                                value={newTask.priority}
                                onChange={e => setNewTask({...newTask, priority: e.target.value as any})}
                             >
                                 <option value="low">Low</option>
                                 <option value="medium">Medium</option>
                                 <option value="high">High</option>
                             </select>
                         </div>
                         <Button type="submit" className="w-full mt-2">Create Task</Button>
                     </form>
                 </Card>
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
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Lightbulb className="text-vision-primary" /> Feature Requests
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {suggestions.map(s => (
                    <div key={s.id} className="bg-[#0f172a]/60 border border-white/5 rounded-xl p-6 hover:border-white/10 transition-all">
                        <div className="flex justify-between items-start mb-3">
                             <h4 className="font-bold text-white text-lg">{s.title}</h4>
                             <Badge variant="info" className="flex items-center gap-1"><TicketPercent size={12} /> {s.votes} Votes</Badge>
                        </div>
                        <p className="text-sm text-gray-400 mb-6 leading-relaxed">{s.description}</p>
                        <div className="flex justify-between items-center border-t border-white/5 pt-4">
                             <div className="flex items-center gap-2 text-xs text-gray-500">
                                <UserIcon size={12} /> {s.user_name}
                             </div>
                             <select 
                                value={s.status} 
                                onChange={(e) => handleStatus(s.id, e.target.value as any)}
                                className="bg-black/40 border border-white/10 text-xs text-white rounded-lg px-3 py-1.5 outline-none cursor-pointer hover:border-vision-primary/30 transition-colors"
                             >
                                 <option value="open">Open</option>
                                 <option value="planned">Planned</option>
                                 <option value="completed">Completed</option>
                             </select>
                        </div>
                    </div>
                ))}
                {suggestions.length === 0 && <div className="col-span-full text-center text-gray-500 py-10">No feature requests yet.</div>}
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
        <div className="space-y-8">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="text-vision-primary" /> Identity & Access
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    {members.map(m => (
                        <div key={m.id} className="flex justify-between items-center p-4 bg-[#0f172a]/60 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-vision-primary/10 flex items-center justify-center text-vision-primary font-bold text-lg border border-vision-primary/20">
                                    {m.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-lg">{m.name}</h4>
                                    <p className="text-xs text-gray-400 font-mono">{m.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Badge variant={m.role === 'super_admin' ? 'danger' : m.role === 'admin' ? 'warning' : 'info'} className="uppercase tracking-widest text-[10px] py-1">
                                    {m.role.replace('_', ' ')}
                                </Badge>
                                {user.role === 'super_admin' && m.id !== user.id && (
                                    <Button size="icon" variant="ghost" onClick={() => handleRemove(m.id)} className="text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-full">
                                        <Trash2 size={18} />
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <Card className="h-fit border-vision-primary/20 bg-[#0f172a]/80">
                    <h3 className="text-lg font-bold text-white mb-6">Invite New Member</h3>
                    <form onSubmit={handleInvite} className="space-y-4">
                        <Input label="Name" value={inviteData.name} onChange={e => setInviteData({...inviteData, name: e.target.value})} required />
                        <Input label="Email" type="email" value={inviteData.email} onChange={e => setInviteData({...inviteData, email: e.target.value})} required />
                        <div className="space-y-1.5">
                            <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Role</label>
                            <select 
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-vision-primary/50 outline-none"
                                value={inviteData.role}
                                onChange={e => setInviteData({...inviteData, role: e.target.value})}
                            >
                                <option value="developer">Developer</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <Input label="Initial Password (Optional)" type="password" value={inviteData.password} onChange={e => setInviteData({...inviteData, password: e.target.value})} placeholder="Leave empty to auto-generate" />
                        <Button type="submit" disabled={loading} className="w-full mt-2">
                            {loading ? "Processing..." : "Send Invitation"}
                        </Button>
                    </form>
                </Card>
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
        <div className="space-y-8">
             <ConfirmDialog 
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Listing"
                message="Are you sure you want to delete this project? This action cannot be undone."
                confirmText="Delete Project"
             />

             <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-bold text-white flex items-center gap-2">
                     <ShoppingBag className="text-vision-primary" /> Marketplace Ops
                 </h2>
                 <Button onClick={() => showForm ? cancelEdit() : setShowForm(true)}>
                     {showForm ? 'Cancel' : <><Plus size={16} className="mr-2"/> List New Project</>}
                 </Button>
             </div>

             {showForm && (
                 <Card className="mb-8 border-vision-primary/30 animate-in fade-in slide-in-from-top-4 bg-[#0f172a]/80">
                     <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-white">{editingId ? 'Edit Project' : 'New Project Listing'}</h3>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center bg-white/5 rounded-lg p-1 border border-white/10">
                                <button type="button" onClick={() => setInputCurrency('USD')} className={`px-3 py-1 text-[10px] font-bold rounded transition-colors ${inputCurrency === 'USD' ? 'bg-vision-primary text-black' : 'text-gray-400 hover:text-white'}`}>USD ($)</button>
                                <button type="button" onClick={() => setInputCurrency(userCurrencyCode)} className={`px-3 py-1 text-[10px] font-bold rounded transition-colors ${inputCurrency !== 'USD' ? 'bg-vision-primary text-black' : 'text-gray-400 hover:text-white'}`}>{userCurrencyCode}</button>
                            </div>
                        </div>
                     </div>
                     <form onSubmit={handleSave} className="space-y-5">
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                             <div className="space-y-1.5">
                                 <label className="text-[10px] uppercase text-gray-500 font-bold tracking-widest">Category</label>
                                 <select value={formData.category} onChange={(e) => handleCategoryChange(e.target.value as ProjectCategory)} className="w-full h-10 bg-black/40 border border-white/10 rounded-lg px-3 text-sm text-white focus:border-vision-primary outline-none">
                                     <option value="Premium Projects">Premium Projects</option>
                                     <option value="UI/UX Design">UI/UX Design</option>
                                     <option value="Free Projects">Free Projects</option>
                                 </select>
                             </div>
                             <Input label="Project Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                             {formData.category === 'Free Projects' ? (
                                <Input label="Free Duration (Days, 0 = Forever)" type="number" value={freeDays} onChange={e => setFreeDays(parseInt(e.target.value))} />
                             ) : (
                                <Input type="number" label={`Sales Price (${inputCurrency})`} value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} placeholder="Price" required />
                             )}
                         </div>
                         <Input label="Summary" value={formData.short_description} onChange={e => setFormData({...formData, short_description: e.target.value})} placeholder="Catchy one-liner..." required />
                         <Textarea label="Full Details" value={formData.full_description} onChange={e => setFormData({...formData, full_description: e.target.value})} required className="min-h-[100px]" />
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                             <Input label="Image URL" value={formData.image_url || ''} onChange={e => setFormData({...formData, image_url: e.target.value})} placeholder="https://..." />
                             <Input label="Download Link" value={formData.download_url || ''} onChange={e => setFormData({...formData, download_url: e.target.value})} />
                         </div>
                         <Input label="Demo URL" value={formData.demo_url || ''} onChange={e => setFormData({...formData, demo_url: e.target.value})} />
                         <div className="pt-2">
                             <label className="flex items-center space-x-3 cursor-pointer group p-3 rounded-lg border border-white/5 hover:border-white/10 transition-all bg-white/5 w-fit">
                                <input type="checkbox" checked={formData.is_featured} onChange={e => setFormData({...formData, is_featured: e.target.checked})} className="form-checkbox h-5 w-5 text-vision-primary rounded bg-transparent border-gray-600 focus:ring-0"/>
                                <span className="text-gray-300 text-sm font-bold uppercase tracking-widest group-hover:text-vision-primary transition-colors flex items-center gap-2"><Zap size={14} className="text-yellow-400" /> Feature on Homepage</span>
                            </label>
                         </div>
                         <div className="flex justify-end pt-4 border-t border-white/5 gap-2">
                             <Button type="button" variant="ghost" onClick={cancelEdit}>Cancel</Button>
                             <Button type="submit">{editingId ? 'Update Listing' : 'Publish to Marketplace'}</Button>
                         </div>
                     </form>
                 </Card>
             )}

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {items.map(item => (
                     <div key={item.id} className="flex flex-col h-full bg-[#0f172a]/60 border border-white/5 rounded-xl overflow-hidden hover:border-vision-primary/30 transition-all group shadow-lg">
                         <div className="h-40 bg-black/40 relative overflow-hidden">
                             {item.image_url ? (
                                 <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                             ) : (
                                 <div className="flex items-center justify-center h-full text-gray-700"><ImageIcon size={32} /></div>
                             )}
                             <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <Button size="icon" variant="secondary" className="w-8 h-8 rounded-lg shadow-lg" onClick={() => handleEdit(item)} title="Edit Project"><Edit size={14} /></Button>
                                 <Button size="icon" variant="ghost" className="bg-black/80 hover:bg-red-500 text-white w-8 h-8 rounded-lg shadow-lg" onClick={() => confirmDelete(item.id)} title="Delete Project"><Trash2 size={14} /></Button>
                             </div>
                             {item.is_featured && <div className="absolute bottom-2 left-2 bg-yellow-500/90 text-black text-[9px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1"><Zap size={10} fill="currentColor"/> Featured</div>}
                         </div>
                         
                         <div className="p-5 flex-1 flex flex-col">
                             <h3 className="font-bold text-white text-lg mb-1 truncate">{item.title}</h3>
                             <div className="flex justify-between items-center mb-3">
                                 <Badge variant="default" className="text-[9px]">{item.category}</Badge>
                                 <div className="text-[10px] text-gray-500 uppercase tracking-widest flex items-center gap-1"><UserIcon size={10} /> {item.developer_name}</div>
                             </div>
                             <div className="mt-auto flex justify-between items-center pt-4 border-t border-white/5">
                                 <span className="font-bold text-vision-primary text-xl font-mono">{item.category === 'Free Projects' ? 'FREE' : `$${item.price}`}</span>
                                 <div className="flex items-center gap-2 text-xs text-gray-500">
                                     <Users size={12} /> {item.purchases} Sales
                                 </div>
                             </div>
                         </div>
                     </div>
                 ))}
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
      { id: 'analytics', label: 'Dashboard', icon: BarChart3 },
      { id: 'orders', label: 'Client Orders', icon: ClipboardList },
      { id: 'requests', label: 'Feature Backlog', icon: Lightbulb },
      { id: 'services', label: 'Services', icon: Layers },
      { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
      { id: 'offers', label: 'Offers', icon: TicketPercent },
      { id: 'tasks', label: 'Tasks', icon: CheckCircle },
      { id: 'team', label: 'Team', icon: Users, role: ['super_admin'] },
  ];

  const renderContent = () => {
      switch(activeTab) {
          case 'analytics': return <AdminAnalytics />;
          case 'orders': return <AdminOrders user={user} />;
          case 'requests': return <AdminRequests />;
          case 'services': return <AdminServices />;
          case 'marketplace': return <AdminMarketplace user={user} />;
          case 'offers': return <AdminOffers />;
          case 'tasks': return <AdminTasks user={user} />;
          case 'team': return <AdminTeam user={user} />;
          default: return <div className="p-10 text-center">Select a module</div>;
      }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-gray-200 font-sans selection:bg-vision-primary/30">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-[#0B1121] border-r border-white/5 hidden md:flex flex-col relative z-20">
          <div className="p-8">
            <h1 className="text-lg font-display font-bold text-white tracking-[0.2em] flex items-center gap-3">
                <Shield size={24} className="text-vision-primary" />
                VISION BUILT
            </h1>
            <p className="text-[9px] text-gray-600 mt-2 uppercase tracking-widest font-mono pl-9">Control v2.1</p>
          </div>
          
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
            {menuItems.map(item => {
                if (item.role && !item.role.includes(user.role)) return null;
                const Icon = item.icon;
                return (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all ${
                            activeTab === item.id 
                            ? 'bg-vision-primary/10 text-vision-primary border border-vision-primary/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                            : 'text-gray-500 hover:text-white hover:bg-white/5 border border-transparent'
                        }`}
                    >
                        <Icon size={16} />
                        {item.label}
                    </button>
                );
            })}
          </nav>

          <div className="p-4 border-t border-white/5 bg-[#0f172a]/50">
              <div className="flex items-center gap-3 px-2 py-2">
                  <div className="w-8 h-8 rounded-full bg-vision-secondary/20 flex items-center justify-center text-xs font-bold text-vision-secondary border border-vision-secondary/30">
                      {user.name.charAt(0)}
                  </div>
                  <div className="overflow-hidden">
                      <p className="text-xs font-bold text-white truncate uppercase tracking-wider">{user.name}</p>
                      <p className="text-[9px] text-gray-500 truncate capitalize font-mono">{user.role.replace('_', ' ')}</p>
                  </div>
              </div>
              <Link to="/">
                <Button variant="ghost" className="w-full mt-3 justify-start text-[10px] uppercase tracking-widest text-gray-600 hover:text-red-400 h-8">
                    <LogOut size={12} className="mr-2" /> Sign Out
                </Button>
              </Link>
          </div>
        </aside>

        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 w-full bg-[#0B1121] border-b border-white/10 z-20 flex justify-between items-center p-4">
             <span className="font-bold text-white text-xs uppercase tracking-widest flex items-center gap-2"><Shield size={14}/> Admin</span>
             <div className="flex items-center gap-4">
                 <AdminNotifications />
                 <select 
                    value={activeTab} 
                    onChange={(e) => setActiveTab(e.target.value)}
                    className="bg-black/20 text-[10px] text-white border border-white/10 rounded-lg px-2 py-1.5 font-bold uppercase tracking-widest outline-none"
                 >
                     {menuItems.map(i => <option key={i.id} value={i.id}>{i.label}</option>)}
                 </select>
             </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#020617] p-4 md:p-8 pt-20 md:pt-8 relative custom-scrollbar">
            {/* Background Texture */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
            
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="mb-8 animate-in fade-in duration-700 flex justify-between items-end border-b border-white/5 pb-6">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-white mb-1 uppercase tracking-tight flex items-center gap-3">
                            {menuItems.find(i => i.id === activeTab)?.icon && React.createElement(menuItems.find(i => i.id === activeTab)!.icon, { size: 32, className: 'text-vision-primary' })}
                            {menuItems.find(i => i.id === activeTab)?.label}
                        </h1>
                        <p className="text-sm text-gray-500 font-mono">System Status: Operational // v2.1.0</p>
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
