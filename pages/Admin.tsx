
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingBag, Settings, Phone, CheckCircle, XCircle, 
  Edit, Trash2, Save, Plus, Loader2, Filter, Calendar, Star, Package, 
  Image as ImageIcon, Upload, Activity, Clock, Users, ClipboardList, 
  BarChart3, TrendingUp, DollarSign, Eye, X, AlertTriangle, Play, Check, 
  TicketPercent, Layers, ToggleLeft, ToggleRight, Sparkles, Code, Layout, 
  GraduationCap, Bot, Server, Database, Globe, Smartphone, PenTool, LogOut,
  ChevronDown, Search, MoreHorizontal, Shield, Lightbulb
} from 'lucide-react';
import { api } from '../services/api';
import { Order, Service, User, Offer, MarketplaceItem, AdminActivity, Task, AnalyticsData, Role, ProjectSuggestion } from '../types';
import { Button, Card, Badge, Input, Textarea } from '../components/ui/Components';
import { ScrollFloat } from '../components/ui/ReactBits';
import { useToast } from '../components/ui/Toast';
import { formatPrice } from '../constants';

// --- 1. Admin Analytics Component ---
const AdminAnalytics: React.FC<{ user: User }> = ({ user }) => {
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
const AdminServices: React.FC<{ user: User }> = ({ user }) => {
    const [services, setServices] = useState<Service[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const toast = useToast();
    
    // Create Form Data
    const [formData, setFormData] = useState<Partial<Service>>({
        title: '',
        description: '',
        base_price: 0,
        icon: 'Sparkles',
        features: [],
        is_enabled: true
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

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const updated = await api.createService(formData as any);
            setServices(updated);
            setShowForm(false);
            setFormData({ title: '', description: '', base_price: 0, icon: 'Sparkles', features: [], is_enabled: true });
            toast.success("Service created successfully");
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-bold text-white">Manage Services</h2>
                 <Button onClick={() => setShowForm(!showForm)}>
                     {showForm ? 'Cancel' : 'Add New Service'}
                 </Button>
            </div>

            {showForm && (
                <Card className="mb-8 border-vision-primary/30">
                    <h3 className="font-bold text-white mb-4">Create New Service</h3>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Service Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                            <Input type="number" label="Base Price ($)" value={formData.base_price} onChange={e => setFormData({...formData, base_price: parseFloat(e.target.value)})} required />
                        </div>
                        <Textarea label="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Icon</label>
                                <select 
                                    className="flex h-10 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-gray-100 outline-none focus:ring-2 focus:ring-vision-primary/50"
                                    value={formData.icon}
                                    onChange={(e) => setFormData({...formData, icon: e.target.value})}
                                >
                                    {AVAILABLE_ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                                </select>
                            </div>
                            <div className="flex items-center h-full pt-6">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={formData.is_enabled} 
                                        onChange={e => setFormData({...formData, is_enabled: e.target.checked})} 
                                        className="form-checkbox h-5 w-5 text-vision-primary rounded bg-transparent border-gray-600"
                                    />
                                    <span className="text-gray-200 text-sm">Enable Immediately</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1">Features List</label>
                            <div className="flex gap-2 mb-2">
                                <Input value={featureInput} onChange={e => setFeatureInput(e.target.value)} placeholder="e.g. 5 Revisions" className="flex-1" />
                                <Button type="button" onClick={addFeature} variant="secondary">Add</Button>
                            </div>
                            <ul className="space-y-1">
                                {formData.features?.map((feat, i) => (
                                    <li key={i} className="flex justify-between items-center text-sm text-gray-400 bg-white/5 px-2 py-1 rounded">
                                        <span>{feat}</span>
                                        <button type="button" onClick={() => removeFeature(i)} className="text-red-400 hover:text-red-300"><X size={14}/></button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex justify-end pt-2">
                             <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="animate-spin" /> : 'Create Service'}
                             </Button>
                        </div>
                    </form>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {services.map(service => (
                    <Card key={service.id} className="relative group hover:border-vision-primary/50 transition-all flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-bold text-white">{service.title}</h3>
                                <Badge variant={service.is_enabled ? 'success' : 'warning'}>
                                    {service.is_enabled ? 'Active' : 'Disabled'}
                                </Badge>
                            </div>
                            <p className="text-gray-400 text-sm mb-4 line-clamp-2">{service.description}</p>
                            <div className="text-xl font-bold text-vision-primary mb-4">${service.base_price}</div>
                            <div className="space-y-1 mb-4">
                                {service.features.slice(0, 3).map((f, i) => (
                                    <div key={i} className="text-xs text-gray-500 flex items-center">
                                        <CheckCircle size={10} className="mr-1 text-vision-primary" /> {f}
                                    </div>
                                ))}
                                {service.features.length > 3 && <div className="text-xs text-gray-600">+{service.features.length - 3} more</div>}
                            </div>
                        </div>
                        <div className="flex gap-2 border-t border-white/5 pt-4 mt-auto">
                            <Button variant="outline" size="sm" className="flex-1" onClick={() => toggleStatus(service.id, service.is_enabled)}>
                                {service.is_enabled ? <><ToggleRight className="mr-2" /> Disable</> : <><ToggleLeft className="mr-2" /> Enable</>}
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
            toast.success(`Order #${orderId} updated to ${newStatus}`);
            fetchOrders();
        } catch (e: any) {
            toast.error("Failed to update status");
        }
    };

    const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-vision-primary" /></div>;

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-bold text-white">Manage Orders</h2>
                 <select 
                    value={filter} 
                    onChange={e => setFilter(e.target.value)}
                    className="bg-black/20 border border-white/10 rounded-lg text-sm text-gray-300 px-3 py-2 outline-none"
                 >
                     <option value="all">All Status</option>
                     <option value="pending">Pending</option>
                     <option value="accepted">Accepted</option>
                     <option value="in_progress">In Progress</option>
                     <option value="mockup_ready">Mockup Ready</option>
                     <option value="completed">Completed</option>
                 </select>
             </div>

             <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm text-gray-400">
                     <thead className="bg-white/5 text-gray-200 uppercase text-xs">
                         <tr>
                             <th className="p-3">ID</th>
                             <th className="p-3">Service</th>
                             <th className="p-3">Client Request</th>
                             <th className="p-3">Amount</th>
                             <th className="p-3">Status</th>
                             <th className="p-3 text-right">Actions / Update</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                         {filteredOrders.map(order => (
                             <tr key={order.id} className="hover:bg-white/5 transition-colors">
                                 <td className="p-3 font-mono text-xs">{order.id}</td>
                                 <td className="p-3">
                                     <div className="font-bold text-white">{order.service_title}</div>
                                     <div className="text-xs opacity-70">{new Date(order.created_at).toLocaleDateString()}</div>
                                 </td>
                                 <td className="p-3 max-w-xs truncate" title={order.requirements?.requirements_text || 'No details'}>
                                     {order.type === 'project' ? <Badge variant="info">Project Download</Badge> : (order.requirements?.business_name || 'N/A')}
                                 </td>
                                 <td className="p-3 font-bold text-vision-primary">${order.total_amount}</td>
                                 <td className="p-3">
                                     <Badge variant={order.status === 'completed' ? 'success' : order.status === 'in_progress' ? 'info' : 'warning'}>
                                         {order.status.replace('_', ' ')}
                                     </Badge>
                                 </td>
                                 <td className="p-3 text-right">
                                     <div className="flex justify-end items-center gap-2">
                                         <Link to={`/dashboard/order/${order.id}`}>
                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="View Details"><Eye size={14} /></Button>
                                         </Link>
                                         
                                         {/* Status Update Dropdown */}
                                         <div className="relative">
                                             <select 
                                                value={order.status} 
                                                onChange={(e) => handleStatusUpdate(order.id, e.target.value as Order['status'])}
                                                className="appearance-none bg-black/40 border border-white/10 text-white text-xs rounded pl-3 pr-8 py-1.5 focus:outline-none focus:border-vision-primary hover:border-white/30 transition-colors cursor-pointer"
                                                title="Change Project Status"
                                             >
                                                <option value="pending" className="bg-vision-900 text-gray-300">Pending</option>
                                                <option value="accepted" className="bg-vision-900 text-blue-400">Accepted</option>
                                                <option value="in_progress" className="bg-vision-900 text-yellow-400">In Progress</option>
                                                <option value="mockup_ready" className="bg-vision-900 text-orange-400">Mockup Ready</option>
                                                <option value="completed" className="bg-vision-900 text-green-400">Completed</option>
                                                <option value="cancelled" className="bg-vision-900 text-red-400">Cancelled</option>
                                             </select>
                                             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                                                <ChevronDown size={12} />
                                             </div>
                                         </div>
                                     </div>
                                 </td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
                 {filteredOrders.length === 0 && <div className="p-8 text-center text-gray-500">No orders found.</div>}
             </div>
        </div>
    );
};

// --- 4. Admin Marketplace Component ---
const AdminMarketplace: React.FC<{ user: User }> = ({ user }) => {
    const [items, setItems] = useState<MarketplaceItem[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState<Partial<MarketplaceItem>>({
        title: '', price: 0, short_description: '', full_description: '', tags: [], features: []
    });
    const toast = useToast();

    useEffect(() => {
        api.getMarketplaceItems().then(setItems);
    }, []);

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
        if (!window.confirm("Are you sure?")) return;
        try {
            await api.deleteMarketplaceItem(id);
            setItems(prev => prev.filter(i => i.id !== id));
            toast.success("Item removed");
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-bold text-white">Marketplace Items</h2>
                 <Button onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : 'List New Item'}</Button>
             </div>

             {showForm && (
                 <Card className="mb-6 border-vision-primary/30">
                     <form onSubmit={handleCreate} className="space-y-4">
                         <div className="grid grid-cols-2 gap-4">
                             <Input label="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                             <Input type="number" label="Price" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} required />
                         </div>
                         <Input label="Short Description" value={formData.short_description} onChange={e => setFormData({...formData, short_description: e.target.value})} required />
                         <Textarea label="Full Details" value={formData.full_description} onChange={e => setFormData({...formData, full_description: e.target.value})} required />
                         <Input label="Image URL" value={formData.image_url || ''} onChange={e => setFormData({...formData, image_url: e.target.value})} placeholder="https://..." />
                         <Input label="Download URL (After Purchase)" value={formData.download_url || ''} onChange={e => setFormData({...formData, download_url: e.target.value})} placeholder="https://..." />
                         <Input label="Demo URL" value={formData.demo_url || ''} onChange={e => setFormData({...formData, demo_url: e.target.value})} placeholder="https://..." />
                         
                         <div className="grid grid-cols-2 gap-4">
                             <Input label="Tags (comma separated)" value={formData.tags?.join(',')} onChange={e => setFormData({...formData, tags: e.target.value.split(',').map(s=>s.trim())})} />
                             <Input label="Features (comma separated)" value={formData.features?.join(',')} onChange={e => setFormData({...formData, features: e.target.value.split(',').map(s=>s.trim())})} />
                         </div>

                         <div className="flex justify-end">
                             <Button type="submit">Publish Item</Button>
                         </div>
                     </form>
                 </Card>
             )}

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {items.map(item => (
                     <Card key={item.id} className="flex flex-col h-full">
                         <div className="h-40 bg-black/40 rounded-lg mb-4 overflow-hidden relative">
                             {item.image_url ? (
                                 <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                             ) : (
                                 <div className="flex items-center justify-center h-full text-gray-600"><ShoppingBag /></div>
                             )}
                             <div className="absolute top-2 right-2 flex gap-1">
                                 <Button size="icon" variant="ghost" className="bg-black/50 hover:bg-red-500/80 w-8 h-8 rounded-full" onClick={() => handleDelete(item.id)}>
                                     <Trash2 size={14} className="text-white" />
                                 </Button>
                             </div>
                         </div>
                         <h3 className="font-bold text-white mb-1">{item.title}</h3>
                         <div className="text-xs text-gray-500 mb-2">by {item.developer_name}</div>
                         <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/5">
                             <span className="font-bold text-vision-primary">${item.price}</span>
                             <span className="text-xs text-gray-400">{item.purchases} Sales</span>
                         </div>
                     </Card>
                 ))}
             </div>
        </div>
    );
};

// --- 5. Admin Team Component ---
const AdminTeam: React.FC<{ user: User }> = ({ user }) => {
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
            toast.success(`${inviteName} invited successfully!`);
            setInviteEmail('');
            setInviteName('');
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setIsInviting(false);
        }
    };

    const handleRemove = async (id: string) => {
        if (!window.confirm("Remove this team member?")) return;
        try {
            const updated = await api.removeTeamMember(id, user.id);
            setMembers(updated);
            toast.success("Team member removed.");
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Team Management</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                     {members.map(member => (
                         <div key={member.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                             <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-vision-primary to-vision-secondary flex items-center justify-center text-white font-bold">
                                     {member.name.charAt(0)}
                                 </div>
                                 <div>
                                     <div className="font-bold text-white">{member.name} {member.id === user.id && '(You)'}</div>
                                     <div className="text-xs text-gray-400">{member.email}</div>
                                 </div>
                             </div>
                             <div className="flex items-center gap-4">
                                 <Badge variant={member.role === 'super_admin' ? 'warning' : member.role === 'admin' ? 'info' : 'default'}>
                                     {member.role.replace('_', ' ')}
                                 </Badge>
                                 {member.id !== user.id && user.role === 'super_admin' && (
                                     <button onClick={() => handleRemove(member.id)} className="text-gray-500 hover:text-red-400">
                                         <Trash2 size={16} />
                                     </button>
                                 )}
                             </div>
                         </div>
                     ))}
                </div>

                <Card className="h-fit">
                    <h3 className="font-bold text-white mb-4">Invite New Member</h3>
                    <form onSubmit={handleInvite} className="space-y-4">
                        <Input placeholder="Full Name" value={inviteName} onChange={e => setInviteName(e.target.value)} required />
                        <Input type="email" placeholder="Email Address" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} required />
                        <select 
                            className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-sm text-gray-200 outline-none"
                            value={inviteRole}
                            onChange={(e) => setInviteRole(e.target.value as Role)}
                        >
                            <option value="developer">Developer</option>
                            <option value="admin">Admin</option>
                        </select>
                        <Button type="submit" className="w-full" disabled={isInviting}>
                            {isInviting ? <Loader2 className="animate-spin" /> : 'Send Invite'}
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
};

// --- 6. Admin Offers Component ---
const AdminOffers: React.FC = () => {
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
            toast.success("Offer created");
            setFormData({ title: '', description: '', code: '', discountPercentage: 10, validUntil: '' });
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const updated = await api.deleteOffer(id);
            setOffers(updated);
            toast.success("Offer deleted");
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Manage Offers & Coupons</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="h-fit">
                    <h3 className="font-bold text-white mb-4">Create Offer</h3>
                    <form onSubmit={handleCreate} className="space-y-3">
                        <Input placeholder="Offer Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                        <Input placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
                        <div className="grid grid-cols-2 gap-2">
                             <Input placeholder="CODE" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} required />
                             <Input type="number" placeholder="%" value={formData.discountPercentage} onChange={e => setFormData({...formData, discountPercentage: parseInt(e.target.value)})} required />
                        </div>
                        <Input type="date" label="Valid Until" value={formData.validUntil} onChange={e => setFormData({...formData, validUntil: e.target.value})} />
                        <Button type="submit" className="w-full">Create</Button>
                    </form>
                </Card>

                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {offers.map(offer => (
                        <Card key={offer.id} className="relative border-dashed border-2 border-vision-primary/30">
                            <button onClick={() => handleDelete(offer.id)} className="absolute top-2 right-2 text-gray-500 hover:text-red-400">
                                <X size={16} />
                            </button>
                            <div className="text-vision-primary font-mono text-xl font-bold mb-1">{offer.code}</div>
                            <h4 className="font-bold text-white">{offer.title}</h4>
                            <p className="text-xs text-gray-400 mb-2">{offer.description}</p>
                            <div className="flex justify-between items-center text-xs text-gray-500 mt-2 border-t border-white/5 pt-2">
                                <span>{offer.discountPercentage}% OFF</span>
                                <span>Exp: {offer.validUntil ? new Date(offer.validUntil).toLocaleDateString() : 'Never'}</span>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- 7. Admin Tasks Component ---
const AdminTasks: React.FC<{ user: User }> = ({ user }) => {
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
            toast.success("Task assigned");
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
            toast.error("Failed to update task");
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Task Board</h2>
            
            {user.role !== 'developer' && (
                <Card className="mb-6">
                     <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-4">
                         <div className="flex-1 min-w-[200px]">
                             <Input placeholder="Task Title" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} required />
                         </div>
                         <div className="flex-1 min-w-[200px]">
                              <select 
                                  className="w-full h-10 bg-black/20 border border-white/10 rounded-lg px-3 text-sm text-gray-200 outline-none"
                                  value={newTask.assigned_to_id}
                                  onChange={e => setNewTask({...newTask, assigned_to_id: e.target.value})}
                                  required
                              >
                                  <option value="">Assign To...</option>
                                  {developers.map(dev => <option key={dev.id} value={dev.id}>{dev.name}</option>)}
                              </select>
                         </div>
                         <div className="w-32">
                             <Input type="date" value={newTask.due_date} onChange={e => setNewTask({...newTask, due_date: e.target.value})} required />
                         </div>
                         <Button type="submit"><Plus size={16} /> Assign</Button>
                     </form>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['todo', 'in_progress', 'done'].map(status => (
                    <div key={status} className="bg-white/5 rounded-xl p-4 border border-white/10 min-h-[300px]">
                        <h3 className="uppercase text-xs font-bold text-gray-500 mb-4 tracking-wider flex justify-between">
                            {status.replace('_', ' ')}
                            <span className="bg-white/10 px-2 rounded text-white">{tasks.filter(t => status === 'done' ? t.status === 'done' : status === 'in_progress' ? t.status === 'in_progress' : t.status === 'todo').length}</span>
                        </h3>
                        <div className="space-y-3">
                            {tasks.filter(t => (status === 'done' ? t.status === 'done' : status === 'in_progress' ? t.status === 'in_progress' : (t.status === 'todo' || t.status === 'review'))).map(task => (
                                <div key={task.id} className="bg-black/40 p-3 rounded-lg border border-white/5 hover:border-vision-primary/30 transition-all group">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-sm text-white">{task.title}</h4>
                                        <Badge variant={task.priority === 'high' ? 'warning' : 'default'} className="text-[10px] px-1 py-0">{task.priority}</Badge>
                                    </div>
                                    <div className="text-xs text-gray-500 mb-2">To: {task.assigned_to_name}</div>
                                    <div className="flex justify-between items-center mt-2">
                                         <div className="text-[10px] text-gray-600">{new Date(task.due_date).toLocaleDateString()}</div>
                                         <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                             {status !== 'todo' && <button onClick={() => updateStatus(task.id, 'todo')} className="p-1 hover:text-vision-primary"><ChevronDown size={14} className="rotate-90" /></button>}
                                             {status !== 'done' && <button onClick={() => updateStatus(task.id, status === 'todo' ? 'in_progress' : 'done')} className="p-1 hover:text-vision-primary"><ChevronDown size={14} className="-rotate-90" /></button>}
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

// --- 8. Admin Requests Component ---
const AdminRequests: React.FC = () => {
    const [requests, setRequests] = useState<ProjectSuggestion[]>([]);
    const toast = useToast();

    useEffect(() => {
        api.getProjectSuggestions().then(setRequests);
    }, []);

    const updateStatus = async (id: string, status: ProjectSuggestion['status']) => {
        try {
            const updated = await api.updateProjectSuggestionStatus(id, status);
            setRequests(updated);
            toast.success("Request status updated");
        } catch (e: any) {
            toast.error("Failed to update status");
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Community Requests</h2>
            <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm text-gray-400">
                     <thead className="bg-white/5 text-gray-200 uppercase text-xs">
                         <tr>
                             <th className="p-3">Votes</th>
                             <th className="p-3">Request</th>
                             <th className="p-3">User</th>
                             <th className="p-3">Date</th>
                             <th className="p-3">Status</th>
                             <th className="p-3 text-right">Action</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                         {requests.map(req => (
                             <tr key={req.id} className="hover:bg-white/5 transition-colors">
                                 <td className="p-3 font-bold text-vision-primary">{req.votes}</td>
                                 <td className="p-3">
                                     <div className="font-bold text-white">{req.title}</div>
                                     <div className="text-xs text-gray-500 max-w-sm truncate">{req.description}</div>
                                 </td>
                                 <td className="p-3">{req.user_name}</td>
                                 <td className="p-3 text-xs">{new Date(req.created_at).toLocaleDateString()}</td>
                                 <td className="p-3">
                                     <Badge variant={req.status === 'completed' ? 'success' : req.status === 'planned' ? 'info' : 'default'}>
                                         {req.status.toUpperCase()}
                                     </Badge>
                                 </td>
                                 <td className="p-3 text-right">
                                     <select 
                                        value={req.status}
                                        onChange={(e) => updateStatus(req.id, e.target.value as any)}
                                        className="bg-black/40 border border-white/10 rounded text-xs px-2 py-1 outline-none cursor-pointer"
                                     >
                                         <option value="open">Open</option>
                                         <option value="planned">Planned</option>
                                         <option value="completed">Completed</option>
                                     </select>
                                 </td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
                 {requests.length === 0 && <div className="p-10 text-center text-gray-500">No requests yet.</div>}
            </div>
        </div>
    );
}

// --- Main Admin Layout ---
const Admin: React.FC<{ user: User }> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('analytics');
  const navigate = useNavigate();

  // Protect Admin Route
  useEffect(() => {
    if (user.role === 'client') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const menuItems = [
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
      { id: 'orders', label: 'Orders', icon: ClipboardList },
      { id: 'requests', label: 'Requests', icon: Lightbulb },
      { id: 'services', label: 'Services', icon: Layers },
      { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
      { id: 'offers', label: 'Offers', icon: TicketPercent },
      { id: 'tasks', label: 'Tasks', icon: CheckCircle },
      { id: 'team', label: 'Team', icon: Users, role: ['super_admin'] },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-gray-200 font-sans">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-vision-900 border-r border-white/5 hidden md:flex flex-col">
          <div className="p-6">
            <h1 className="text-xl font-display font-bold text-white tracking-wider flex items-center gap-2">
                <Shield size={20} className="text-vision-primary" />
                ADMIN PANEL
            </h1>
          </div>
          
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
            {menuItems.map(item => {
                if (item.role && !item.role.includes(user.role)) return null;
                const Icon = item.icon;
                return (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                            activeTab === item.id 
                            ? 'bg-vision-primary/10 text-vision-primary border border-vision-primary/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <Icon size={18} />
                        {item.label}
                    </button>
                );
            })}
          </nav>

          <div className="p-4 border-t border-white/5">
              <div className="flex items-center gap-3 px-4 py-2">
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white">
                      {user.name.charAt(0)}
                  </div>
                  <div className="overflow-hidden">
                      <p className="text-sm font-medium text-white truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate capitalize">{user.role.replace('_', ' ')}</p>
                  </div>
              </div>
              <Link to="/">
                <Button variant="ghost" className="w-full mt-2 justify-start text-gray-500 hover:text-white">
                    <LogOut size={16} className="mr-2" /> Exit to Site
                </Button>
              </Link>
          </div>
        </aside>

        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 w-full bg-vision-900 border-b border-white/10 z-20 flex justify-between items-center p-4">
             <span className="font-bold text-white">Admin Panel</span>
             <select 
                value={activeTab} 
                onChange={(e) => setActiveTab(e.target.value)}
                className="bg-black/20 text-sm text-white border border-white/10 rounded px-2 py-1"
             >
                 {menuItems.map(i => <option key={i.id} value={i.id}>{i.label}</option>)}
             </select>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-black/20 p-4 md:p-8 pt-20 md:pt-8 relative">
            <div className="max-w-7xl mx-auto">
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
