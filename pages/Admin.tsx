
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, CheckCircle, 
  Edit, Trash2, Plus, 
  ImageIcon, Users, ClipboardList, 
  BarChart3, TicketPercent, Layers, 
  Lightbulb,
  User as UserIcon, LogOut, Shield, Zap
} from 'lucide-react';
import { api } from '../services/api';
import { User, MarketplaceItem, ProjectCategory } from '../types';
import { Button, Card, Badge, Input, Textarea, ConfirmDialog } from '../components/ui/Components';
import { useToast } from '../components/ui/Toast';
import { CURRENCY_CONFIG } from '../constants';

// --- Admin Marketplace ---
const AdminMarketplace: React.FC<{ user: User }> = ({ user }) => {
    const [items, setItems] = useState<MarketplaceItem[]>([]);
    // Removed unused sales state
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const toast = useToast();

    // Currency Handling
    const userCurrencyCode = CURRENCY_CONFIG[user.country || 'India']?.code || 'USD';
    const userCurrencyRate = CURRENCY_CONFIG[user.country || 'India']?.rate || 1;
    const [inputCurrency, setInputCurrency] = useState('USD');

    // Default category 'Websites'
    const [formData, setFormData] = useState<Partial<MarketplaceItem>>({
        title: '', price: 0, category: 'Websites', short_description: '', full_description: '', tags: [], features: [], is_featured: false
    });

    useEffect(() => {
        api.getMarketplaceItems().then(setItems);
        // Removed unused getMarketplaceSales call
    }, [user.id]);

    const handleCategoryChange = (cat: ProjectCategory) => {
        setFormData(prev => ({
            ...prev,
            category: cat,
            // If Free Projects, force price to 0
            price: cat === 'Free Projects' ? 0 : prev.price
        }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const rate = inputCurrency === 'USD' ? 1 : userCurrencyRate;
            const payload = {
                ...formData,
                price: (formData.price || 0) / rate
            };

            if (editingId) {
                await api.updateMarketplaceItem(editingId, payload);
                toast.success("Item updated successfully");
            } else {
                await api.createMarketplaceItem({
                    ...payload as any,
                    developer_id: user.id,
                    developer_name: user.name
                });
                toast.success("Item listed successfully");
            }
            setShowForm(false);
            setEditingId(null);
            setInputCurrency('USD');
            // Reset form
            setFormData({ title: '', price: 0, category: 'Websites', short_description: '', full_description: '', tags: [], features: [], is_featured: false });
            api.getMarketplaceItems().then(setItems);
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    const handleEdit = (item: MarketplaceItem) => {
        setInputCurrency('USD');
        setFormData({
            title: item.title,
            price: item.price,
            category: item.category || 'Websites', // Default fallback
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

    const confirmDelete = (id: string) => {
        setDeleteId(id);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await api.deleteMarketplaceItem(deleteId);
            setItems(prev => prev.filter(i => i.id !== deleteId));
            toast.success("Item removed");
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setDeleteId(null);
        }
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
                 <h2 className="text-2xl font-bold text-white">Marketplace Listings</h2>
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
                                <button 
                                    type="button"
                                    onClick={() => setInputCurrency('USD')}
                                    className={`px-3 py-1 text-[10px] font-bold rounded transition-colors ${inputCurrency === 'USD' ? 'bg-vision-primary text-black' : 'text-gray-400 hover:text-white'}`}
                                >
                                    USD ($)
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setInputCurrency(userCurrencyCode)}
                                    className={`px-3 py-1 text-[10px] font-bold rounded transition-colors ${inputCurrency !== 'USD' ? 'bg-vision-primary text-black' : 'text-gray-400 hover:text-white'}`}
                                >
                                    {userCurrencyCode}
                                </button>
                            </div>
                        </div>
                     </div>
                     <form onSubmit={handleSave} className="space-y-4">
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <div className="space-y-1">
                                 <label className="text-[10px] uppercase text-gray-500 font-bold tracking-widest">Category</label>
                                 <select 
                                    value={formData.category} 
                                    onChange={(e) => handleCategoryChange(e.target.value as ProjectCategory)}
                                    className="w-full h-10 bg-black/40 border border-white/10 rounded-lg px-3 text-sm text-white focus:border-vision-primary"
                                 >
                                     <option value="Websites">Websites</option>
                                     <option value="UI/UX Design">UI/UX Design</option>
                                     <option value="Free Projects">Free Projects</option>
                                 </select>
                             </div>
                             <Input label="Project Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                             <Input 
                                type="number" 
                                label={`Sales Price (${inputCurrency})`} 
                                value={formData.price} 
                                onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} 
                                disabled={formData.category === 'Free Projects'}
                                placeholder={formData.category === 'Free Projects' ? "Free ($0)" : "Price"}
                                required 
                             />
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
                                <input 
                                    type="checkbox" 
                                    checked={formData.is_featured} 
                                    onChange={e => setFormData({...formData, is_featured: e.target.checked})} 
                                    className="form-checkbox h-5 w-5 text-vision-primary rounded bg-transparent border-gray-600 focus:ring-0"
                                />
                                <span className="text-gray-300 text-sm font-bold uppercase tracking-widest group-hover:text-vision-primary transition-colors flex items-center gap-2">
                                    <Zap size={14} className="text-yellow-400" /> Feature on Homepage
                                </span>
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
                                 <Button size="icon" variant="secondary" className="w-8 h-8 rounded-full" onClick={() => handleEdit(item)} title="Edit Project">
                                     <Edit size={14} />
                                 </Button>
                                 <Button size="icon" variant="ghost" className="bg-black/50 hover:bg-red-500/80 w-8 h-8 rounded-full" onClick={() => confirmDelete(item.id)} title="Delete Project">
                                     <Trash2 size={14} className="text-white" />
                                 </Button>
                             </div>
                             {item.is_featured && (
                                 <div className="absolute bottom-2 left-2 bg-yellow-500/90 text-black text-[9px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1">
                                     <Zap size={10} fill="currentColor"/> Featured
                                 </div>
                             )}
                         </div>
                         <h3 className="font-bold text-white mb-1">{item.title}</h3>
                         <div className="flex justify-between items-center mb-2">
                             <Badge variant="default" className="text-[9px]">{item.category}</Badge>
                             <div className="text-[10px] text-gray-500 uppercase tracking-widest flex items-center gap-1">
                                <UserIcon size={10} /> {item.developer_name}
                             </div>
                         </div>
                         <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/5">
                             <span className="font-bold text-vision-primary text-lg">
                                 {item.category === 'Free Projects' ? 'FREE' : `$${item.price}`}
                             </span>
                         </div>
                     </Card>
                 ))}
             </div>
        </div>
    );
};

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
                
                {activeTab === 'marketplace' ? <AdminMarketplace user={user} /> : (
                    <div className="p-10 text-center border-dashed border border-white/10 rounded-lg">
                        <p className="text-gray-500">Module <strong>{activeTab}</strong> deactivated for maintenance optimization.</p>
                    </div>
                )}
            </div>
        </main>
      </div>
    </div>
  );
};

export default Admin;
