
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, CheckCircle, 
  Edit, Trash2, Plus, 
  ImageIcon, Users, ClipboardList, 
  BarChart3, TicketPercent, Layers, 
  Lightbulb,
  User as UserIcon, LogOut, Shield, Zap, RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { User, MarketplaceItem, ProjectCategory, Order, Service, Offer, Task, ProjectSuggestion, AnalyticsData } from '../types';
import { Button, Card, Badge, Input, Textarea, ConfirmDialog } from '../components/ui/Components';
import { useToast } from '../components/ui/Toast';
import { CURRENCY_CONFIG, formatPrice } from '../constants';

// --- Admin Sub-Components ---

// 1. Analytics
const AdminAnalytics: React.FC = () => {
    const [data, setData] = useState<AnalyticsData | null>(null);
    useEffect(() => { api.getAnalytics().then(setData); }, []);

    if (!data) return <div className="p-10 text-center"><RefreshCw className="animate-spin w-8 h-8 mx-auto text-vision-primary" /></div>;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-vision-primary/10 border-vision-primary/30">
                    <h3 className="text-xs font-bold text-vision-primary uppercase">Total Revenue</h3>
                    <p className="text-3xl font-bold text-white mt-2 font-mono">${data.total_revenue}</p>
                </Card>
                <Card>
                    <h3 className="text-xs font-bold text-gray-500 uppercase">Active Orders</h3>
                    <p className="text-3xl font-bold text-white mt-2">{data.active_projects}</p>
                </Card>
                <Card>
                    <h3 className="text-xs font-bold text-gray-500 uppercase">Total Views</h3>
                    <p className="text-3xl font-bold text-white mt-2">{data.total_views}</p>
                </Card>
                <Card>
                    <h3 className="text-xs font-bold text-gray-500 uppercase">Total Orders</h3>
                    <p className="text-3xl font-bold text-white mt-2">{data.total_orders}</p>
                </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <h3 className="text-lg font-bold text-white mb-4">Sales Trend (Last 7 Days)</h3>
                    <div className="h-48 flex items-end gap-2 px-2">
                        {data.sales_trend.map((val, i) => (
                             <div key={i} className="flex-1 bg-vision-primary/20 hover:bg-vision-primary/50 rounded-t-sm transition-all relative group" style={{ height: `${Math.max(10, (val / (Math.max(...data.sales_trend) || 1)) * 100)}%` }}>
                                 <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10">
                                     ${val}
                                 </div>
                             </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-500 px-2">
                        <span>7 Days Ago</span>
                        <span>Today</span>
                    </div>
                </Card>
                <Card>
                    <h3 className="text-lg font-bold text-white mb-4">Top Performer</h3>
                    {data.top_developer ? (
                        <div className="flex items-center gap-4">
                             <div className="w-16 h-16 rounded-full bg-vision-secondary/20 flex items-center justify-center text-vision-secondary text-2xl font-bold">
                                 {data.top_developer.name.charAt(0)}
                             </div>
                             <div>
                                 <h4 className="text-xl font-bold text-white">{data.top_developer.name}</h4>
                                 <p className="text-gray-400">{data.top_developer.email}</p>
                                 <Badge variant="success" className="mt-2">Top Developer</Badge>
                             </div>
                        </div>
                    ) : (
                        <p className="text-gray-500">No performance data available.</p>
                    )}
                </Card>
            </div>
        </div>
    );
};

// 2. Orders
const AdminOrders: React.FC<{ user: User }> = ({ user }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
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

    const handlePriceUpdate = async (id: string, currentTotal: number) => {
        const newPrice = prompt("Enter new total amount:", currentTotal.toString());
        if(newPrice && !isNaN(parseFloat(newPrice))) {
            try {
                await api.updateOrderPrice(id, parseFloat(newPrice), user.id);
                setOrders(prev => prev.map(o => o.id === id ? { ...o, total_amount: parseFloat(newPrice) } : o));
                toast.success("Price updated");
            } catch(e) { toast.error("Price update failed"); }
        }
    };

    if(loading) return <div className="text-center p-10">Loading orders...</div>;

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">Client Orders</h3>
            <div className="space-y-4">
                {orders.map(order => (
                    <Card key={order.id} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-white">{order.service_title}</h4>
                                <Badge variant={order.status === 'completed' ? 'success' : order.status === 'pending' ? 'warning' : 'info'}>{order.status}</Badge>
                                {order.type === 'project' && <Badge variant="default">Marketplace</Badge>}
                            </div>
                            <p className="text-xs text-gray-500 font-mono">ID: {order.id} | User: {order.user_id}</p>
                            <p className="text-xs text-gray-400 mt-1">Client Req: {order.requirements?.requirements_text?.slice(0, 50)}...</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-lg font-bold text-white cursor-pointer hover:text-vision-primary" onClick={() => handlePriceUpdate(order.id, order.total_amount)}>
                                    {formatPrice(order.total_amount, user.country)}
                                </p>
                                <p className="text-xs text-gray-500">Paid: {formatPrice(order.amount_paid, user.country)}</p>
                            </div>
                            <div className="flex flex-col gap-1">
                                <select 
                                    value={order.status}
                                    onChange={(e) => handleStatusUpdate(order.id, e.target.value as Order['status'])}
                                    className="bg-black/40 border border-white/10 text-xs text-white rounded px-2 py-1 outline-none"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="accepted">Accepted</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="mockup_ready">Mockup Ready</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                                <Link to={`/dashboard/order/${order.id}`}>
                                    <Button size="sm" variant="ghost" className="w-full text-xs h-7">View Chat</Button>
                                </Link>
                            </div>
                        </div>
                    </Card>
                ))}
                {orders.length === 0 && <p className="text-gray-500 text-center">No orders found.</p>}
            </div>
        </div>
    );
};

// 3. Services
const AdminServices: React.FC = () => {
    const [services, setServices] = useState<Service[]>([]);
    const toast = useToast();

    useEffect(() => { api.getServices().then(setServices); }, []);

    const handleToggle = async (service: Service) => {
        const updated = await api.updateService(service.id, { is_enabled: !service.is_enabled });
        setServices(updated);
        toast.success(`Service ${!service.is_enabled ? 'enabled' : 'disabled'}`);
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-white">Service Inventory</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map(s => (
                    <Card key={s.id} className="relative overflow-hidden group">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-bold text-white">{s.title}</h4>
                                <p className="text-sm text-gray-400 mt-1 line-clamp-2">{s.description}</p>
                                <p className="text-vision-primary font-bold mt-2">{formatPrice(s.base_price)}</p>
                            </div>
                            <button onClick={() => handleToggle(s)} className={`p-2 rounded-full ${s.is_enabled ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
                                <Zap size={18} fill={s.is_enabled ? "currentColor" : "none"} />
                            </button>
                        </div>
                    </Card>
                ))}
            </div>
            <p className="text-xs text-gray-500 text-center mt-4">To add new services, use the database console.</p>
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
            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-4">Active Coupons</h3>
                    <div className="space-y-3">
                        {offers.map(o => (
                            <Card key={o.id} className="flex justify-between items-center py-3">
                                <div>
                                    <h4 className="font-bold text-white">{o.code}</h4>
                                    <p className="text-xs text-gray-400">{o.title} • {o.discountPercentage}% OFF</p>
                                </div>
                                <Button size="icon" variant="ghost" onClick={() => handleDelete(o.id)} className="text-red-400 hover:bg-red-400/10">
                                    <Trash2 size={16} />
                                </Button>
                            </Card>
                        ))}
                    </div>
                </div>
                <Card className="flex-1 h-fit">
                    <h4 className="font-bold text-white mb-4">Create New Offer</h4>
                    <form onSubmit={handleCreate} className="space-y-3">
                        <Input label="Title" value={newOffer.title} onChange={e => setNewOffer({...newOffer, title: e.target.value})} required />
                        <div className="flex gap-3">
                            <Input label="Code" value={newOffer.code} onChange={e => setNewOffer({...newOffer, code: e.target.value.toUpperCase()})} required className="uppercase" />
                            <Input label="Discount %" type="number" value={newOffer.discountPercentage} onChange={e => setNewOffer({...newOffer, discountPercentage: parseInt(e.target.value)})} required />
                        </div>
                        <Textarea label="Description" value={newOffer.description} onChange={e => setNewOffer({...newOffer, description: e.target.value})} />
                        <Button type="submit" className="w-full">Create Offer</Button>
                    </form>
                </Card>
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
            <div className="flex justify-between items-center">
                 <h3 className="text-xl font-bold text-white">Internal Tasks</h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 {/* Task List */}
                 <div className="lg:col-span-2 space-y-3">
                     {tasks.map(t => (
                         <Card key={t.id} className="flex justify-between items-start">
                             <div>
                                 <div className="flex items-center gap-2 mb-1">
                                     <h4 className={`font-bold ${t.status === 'done' ? 'text-gray-500 line-through' : 'text-white'}`}>{t.title}</h4>
                                     <Badge variant={t.priority === 'high' ? 'danger' : t.priority === 'medium' ? 'warning' : 'info'}>{t.priority}</Badge>
                                 </div>
                                 <p className="text-sm text-gray-400">{t.description}</p>
                                 <p className="text-xs text-gray-500 mt-2">Assigned to: {t.assigned_to_name}</p>
                             </div>
                             <select 
                                value={t.status}
                                onChange={(e) => handleStatus(t.id, e.target.value as any)}
                                className="bg-black/40 border border-white/10 text-xs text-white rounded px-2 py-1 outline-none"
                             >
                                 <option value="todo">To Do</option>
                                 <option value="in_progress">In Progress</option>
                                 <option value="review">Review</option>
                                 <option value="done">Done</option>
                             </select>
                         </Card>
                     ))}
                     {tasks.length === 0 && <p className="text-gray-500">No tasks pending.</p>}
                 </div>

                 {/* Create Form */}
                 <Card className="h-fit">
                     <h4 className="font-bold text-white mb-4">Assign Task</h4>
                     <form onSubmit={handleCreate} className="space-y-3">
                         <Input label="Task Title" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} required />
                         <Textarea label="Details" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} />
                         <div className="space-y-1">
                             <label className="text-xs text-gray-400 uppercase font-bold">Assign To</label>
                             <select 
                                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white"
                                value={newTask.assigned_to_id}
                                onChange={e => setNewTask({...newTask, assigned_to_id: e.target.value})}
                             >
                                 {team.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                             </select>
                         </div>
                         <Button type="submit" className="w-full">Create Task</Button>
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
            <h3 className="text-xl font-bold text-white">Feature Requests</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suggestions.map(s => (
                    <Card key={s.id}>
                        <div className="flex justify-between items-start mb-2">
                             <h4 className="font-bold text-white">{s.title}</h4>
                             <Badge variant="info">{s.votes} Votes</Badge>
                        </div>
                        <p className="text-sm text-gray-400 mb-4">{s.description}</p>
                        <div className="flex justify-between items-center border-t border-white/5 pt-3">
                             <span className="text-xs text-gray-500">By: {s.user_name}</span>
                             <select 
                                value={s.status} 
                                onChange={(e) => handleStatus(s.id, e.target.value as any)}
                                className="bg-black/40 border border-white/10 text-xs text-white rounded px-2 py-1 outline-none"
                             >
                                 <option value="open">Open</option>
                                 <option value="planned">Planned</option>
                                 <option value="completed">Completed</option>
                             </select>
                        </div>
                    </Card>
                ))}
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2">
                    <h3 className="text-xl font-bold text-white mb-4">Team Roster</h3>
                    <div className="space-y-3">
                        {members.map(m => (
                            <div key={m.id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-vision-primary/20 flex items-center justify-center text-vision-primary font-bold">
                                        {m.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">{m.name}</h4>
                                        <p className="text-xs text-gray-400">{m.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge variant="default" className="uppercase">{m.role}</Badge>
                                    {user.role === 'super_admin' && m.id !== user.id && (
                                        <Button size="icon" variant="ghost" onClick={() => handleRemove(m.id)} className="text-red-400 hover:bg-red-500/10">
                                            <Trash2 size={16} />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="h-fit">
                    <h3 className="text-xl font-bold text-white mb-4">Invite Member</h3>
                    <form onSubmit={handleInvite} className="space-y-3">
                        <Input label="Name" value={inviteData.name} onChange={e => setInviteData({...inviteData, name: e.target.value})} required />
                        <Input label="Email" type="email" value={inviteData.email} onChange={e => setInviteData({...inviteData, email: e.target.value})} required />
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400 uppercase font-bold">Role</label>
                            <select 
                                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white"
                                value={inviteData.role}
                                onChange={e => setInviteData({...inviteData, role: e.target.value})}
                            >
                                <option value="developer">Developer</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <Input label="Initial Password (Optional)" type="password" value={inviteData.password} onChange={e => setInviteData({...inviteData, password: e.target.value})} placeholder="Auto-generate if empty" />
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? "Processing..." : "Send Invite"}
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
};

// --- Admin Marketplace (Existing) ---
const AdminMarketplace: React.FC<{ user: User }> = ({ user }) => {
    const [items, setItems] = useState<MarketplaceItem[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const toast = useToast();
    const userCurrencyCode = CURRENCY_CONFIG[user.country || 'India']?.code || 'USD';
    const userCurrencyRate = CURRENCY_CONFIG[user.country || 'India']?.rate || 1;
    const [inputCurrency, setInputCurrency] = useState('USD');
    const [formData, setFormData] = useState<Partial<MarketplaceItem>>({
        title: '', price: 0, category: 'Websites', short_description: '', full_description: '', tags: [], features: [], is_featured: false
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
            const payload = { ...formData, price: (formData.price || 0) / rate };
            if (editingId) {
                await api.updateMarketplaceItem(editingId, payload);
                toast.success("Item updated successfully");
            } else {
                await api.createMarketplaceItem({ ...payload as any, developer_id: user.id, developer_name: user.name });
                toast.success("Item listed successfully");
            }
            setShowForm(false);
            setEditingId(null);
            setInputCurrency('USD');
            setFormData({ title: '', price: 0, category: 'Websites', short_description: '', full_description: '', tags: [], features: [], is_featured: false });
            api.getMarketplaceItems().then(setItems);
        } catch (e: any) { toast.error(e.message); }
    };

    const handleEdit = (item: MarketplaceItem) => {
        setInputCurrency('USD');
        setFormData({
            title: item.title,
            price: item.price,
            category: item.category || 'Websites',
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
        setInputCurrency('USD');
        setFormData({ title: '', price: 0, category: 'Websites', short_description: '', full_description: '', tags: [], features: [], is_featured: false });
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

             <div className="flex justify-between items-center">
                 <h2 className="text-xl font-bold text-white">Marketplace Listings</h2>
                 <Button onClick={() => showForm ? cancelEdit() : setShowForm(true)}>
                     {showForm ? 'Cancel' : <><Plus size={16} className="mr-2"/> List New Project</>}
                 </Button>
             </div>

             {showForm && (
                 <Card className="mb-6 border-vision-primary/30 animate-in fade-in zoom-in-95 duration-300">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-white">{editingId ? 'Edit Project' : 'New Project'}</h3>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center bg-white/5 rounded-lg p-1 border border-white/10">
                                <button type="button" onClick={() => setInputCurrency('USD')} className={`px-3 py-1 text-[10px] font-bold rounded transition-colors ${inputCurrency === 'USD' ? 'bg-vision-primary text-black' : 'text-gray-400 hover:text-white'}`}>USD ($)</button>
                                <button type="button" onClick={() => setInputCurrency(userCurrencyCode)} className={`px-3 py-1 text-[10px] font-bold rounded transition-colors ${inputCurrency !== 'USD' ? 'bg-vision-primary text-black' : 'text-gray-400 hover:text-white'}`}>{userCurrencyCode}</button>
                            </div>
                        </div>
                     </div>
                     <form onSubmit={handleSave} className="space-y-4">
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <div className="space-y-1">
                                 <label className="text-[10px] uppercase text-gray-500 font-bold tracking-widest">Category</label>
                                 <select value={formData.category} onChange={(e) => handleCategoryChange(e.target.value as ProjectCategory)} className="w-full h-10 bg-black/40 border border-white/10 rounded-lg px-3 text-sm text-white focus:border-vision-primary">
                                     <option value="Websites">Websites</option>
                                     <option value="UI/UX Design">UI/UX Design</option>
                                     <option value="Free Projects">Free Projects</option>
                                 </select>
                             </div>
                             <Input label="Project Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                             <Input type="number" label={`Sales Price (${inputCurrency})`} value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} disabled={formData.category === 'Free Projects'} placeholder={formData.category === 'Free Projects' ? "Free ($0)" : "Price"} required />
                         </div>
                         <Input label="Summary" value={formData.short_description} onChange={e => setFormData({...formData, short_description: e.target.value})} placeholder="Catchy one-liner..." required />
                         <Textarea label="Full Details" value={formData.full_description} onChange={e => setFormData({...formData, full_description: e.target.value})} required />
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                     <Card key={item.id} className="flex flex-col h-full group hover:border-vision-primary/30 transition-all">
                         <div className="h-40 bg-black/40 rounded-lg mb-4 overflow-hidden relative">
                             {item.image_url ? (
                                 <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                             ) : (
                                 <div className="flex items-center justify-center h-full text-gray-700"><ImageIcon size={32} /></div>
                             )}
                             <div className="absolute top-2 right-2 flex gap-1">
                                 <Button size="icon" variant="secondary" className="w-8 h-8 rounded-full" onClick={() => handleEdit(item)} title="Edit Project"><Edit size={14} /></Button>
                                 <Button size="icon" variant="ghost" className="bg-black/50 hover:bg-red-500/80 w-8 h-8 rounded-full" onClick={() => confirmDelete(item.id)} title="Delete Project"><Trash2 size={14} className="text-white" /></Button>
                             </div>
                             {item.is_featured && <div className="absolute bottom-2 left-2 bg-yellow-500/90 text-black text-[9px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1"><Zap size={10} fill="currentColor"/> Featured</div>}
                         </div>
                         <h3 className="font-bold text-white mb-1">{item.title}</h3>
                         <div className="flex justify-between items-center mb-2">
                             <Badge variant="default" className="text-[9px]">{item.category}</Badge>
                             <div className="text-[10px] text-gray-500 uppercase tracking-widest flex items-center gap-1"><UserIcon size={10} /> {item.developer_name}</div>
                         </div>
                         <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/5">
                             <span className="font-bold text-vision-primary text-lg">{item.category === 'Free Projects' ? 'FREE' : `$${item.price}`}</span>
                         </div>
                     </Card>
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
      { id: 'analytics', label: 'Platform Metrics', icon: BarChart3 },
      { id: 'orders', label: 'Client Orders', icon: ClipboardList },
      { id: 'requests', label: 'Feature Backlog', icon: Lightbulb },
      { id: 'services', label: 'Service Inventory', icon: Layers },
      { id: 'marketplace', label: 'Marketplace Ops', icon: ShoppingBag },
      { id: 'offers', label: 'Marketing Hub', icon: TicketPercent },
      { id: 'tasks', label: 'Internal Directives', icon: CheckCircle },
      { id: 'team', label: 'Identity Access', icon: Users, role: ['super_admin'] },
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
                
                {renderContent()}
            </div>
        </main>
      </div>
    </div>
  );
};

export default Admin;
