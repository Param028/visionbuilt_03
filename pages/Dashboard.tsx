
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, ArrowRight, Clock, Filter, Lightbulb, ThumbsUp, PenTool, Sparkles, Loader2, User as UserIcon, Activity } from 'lucide-react';
import { api } from '../services/api';
import { Order, User, ProjectSuggestion } from '../types';
import { Button, Card, Badge, Input, Textarea } from '../components/ui/Components';
import { ScrollFloat } from '../components/ui/ReactBits';
import { useToast } from '../components/ui/Toast';

const Dashboard: React.FC<{ user: User }> = ({ user }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [suggestions, setSuggestions] = useState<ProjectSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'orders' | 'wishlist'>('orders');
  const [filter, setFilter] = useState('all');
  
  // Suggestion Form
  const [showSuggestForm, setShowSuggestForm] = useState(false);
  const [suggestTitle, setSuggestTitle] = useState('');
  const [suggestDesc, setSuggestDesc] = useState('');
  const [isSubmittingSuggestion, setIsSubmittingSuggestion] = useState(false);

  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    // Redirect non-clients to Admin Dashboard
    if (user.role !== 'client') {
        navigate('/admin');
        return;
    }

    const fetchData = async () => {
      const orderData = await api.getOrders(user.id);
      const suggestData = await api.getProjectSuggestions();
      setOrders(orderData);
      setSuggestions(suggestData);
      setLoading(false);
    };
    fetchData();
  }, [user.id, user.role, navigate]);

  const handleVote = async (id: string) => {
      const updated = await api.voteProjectSuggestion(id);
      setSuggestions(updated);
      toast.success("Vote recorded!");
  };

  const handleSubmitSuggestion = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmittingSuggestion(true);
      try {
          const updated = await api.createProjectSuggestion({
              user_id: user.id,
              user_name: user.name,
              title: suggestTitle,
              description: suggestDesc
          });
          setSuggestions(updated);
          setShowSuggestForm(false);
          setSuggestTitle('');
          setSuggestDesc('');
          toast.success("Suggestion submitted!");
      } catch (e: any) {
          toast.error("Failed to submit suggestion.");
      } finally {
          setIsSubmittingSuggestion(false);
      }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': 
      case 'accepted':
          return 'info';
      case 'mockup_ready':
      case 'pending': 
          return 'warning';
      default: return 'default';
    }
  };

  const filteredOrders = orders.filter(order => {
      if (filter === 'all') return true;
      if (filter === 'active') return ['pending', 'accepted', 'in_progress', 'mockup_ready'].includes(order.status);
      return order.status === filter;
  });

  if (user.role !== 'client') return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end mb-12 gap-6 pb-6 border-b border-divider">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <div className="w-10 h-10 rounded-xl bg-foreground/10 flex items-center justify-center text-foreground border border-divider">
                 <Activity size={20} />
             </div>
             <h1 className="text-3xl font-display font-bold text-foreground">
                <ScrollFloat>Client Portal</ScrollFloat>
             </h1>
          </div>
          <p className="text-foreground/75 text-sm max-w-md">
             Welcome back, {user.name.split(' ')[0]}. Manage your active developments and track project status in real-time.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
             <div className="flex bg-content1 p-1 rounded-lg border border-divider shadow-sm mr-2">
                <button 
                    onClick={() => setViewMode('orders')}
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-md transition-all ${viewMode === 'orders' ? 'bg-primary text-primary-foreground shadow' : 'text-foreground/60 hover:text-foreground'}`}
                >
                    <Filter size={14} /> Orders
                </button>
                <button 
                    onClick={() => setViewMode('wishlist')}
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-md transition-all ${viewMode === 'wishlist' ? 'bg-primary text-primary-foreground shadow' : 'text-foreground/60 hover:text-foreground'}`}
                >
                    <Lightbulb size={14} /> Roadmap
                </button>
             </div>
 
              <Link to="/order/new">
                <Button variant="outline" className="h-10 text-xs uppercase tracking-widest font-bold">
                    <PenTool className="w-3 h-3 mr-2" /> Custom
                </Button>
             </Link>
             <Link to="/services">
                <Button variant="primary" className="h-10 text-xs uppercase tracking-widest font-bold">
                    <Plus className="w-3 h-3 mr-2" /> New Order
                </Button>
             </Link>
        </div>
      </div>

      {viewMode === 'orders' ? (
          <>
            {!loading && orders.length > 0 && (
                <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                    {['all', 'active', 'completed', 'cancelled'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap border ${
                                filter === f 
                                ? 'bg-primary text-primary-foreground border-transparent shadow-sm' 
                                : 'bg-transparent text-foreground/60 hover:text-foreground border-transparent hover:bg-secondary'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center p-20">
                    <div className="w-10 h-10 border-4 border-foreground border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : filteredOrders.length === 0 ? (
                <Card className="text-center py-20 border-dashed border-2 border-divider bg-transparent group hover:border-focus/30 transition-all duration-500">
                <div className="w-20 h-20 bg-content1 border border-divider rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-500 shadow-sm">
                    <Clock className="w-10 h-10 text-foreground/40" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">
                    <ScrollFloat>{filter === 'all' ? 'System Clean: No Active Sessions' : 'Search Returned Empty'}</ScrollFloat>
                </h3>
                <p className="text-foreground/50 mb-8 max-w-sm mx-auto">
                    {filter === 'all' 
                        ? "Initiate your first development cycle by selecting a service or requesting a custom build." 
                        : `No ${filter} logs found in history.`}
                </p>
                {filter === 'all' ? (
                    <div className="flex justify-center gap-4">
                        <Link to="/order/new">
                            <Button variant="outline" className="px-8">Custom Build</Button>
                        </Link>
                        <Link to="/services">
                            <Button variant="primary" className="px-8">Browse Catalog</Button>
                        </Link>
                    </div>
                ) : (
                    <Button variant="ghost" onClick={() => setFilter('all')}>Clear Data Filter</Button>
                )}
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                {filteredOrders.map((order) => (
                    <Link to={`/dashboard/order/${order.id}`} key={order.id}>
                    <Card className="hover:border-focus/30 transition-all cursor-pointer group relative overflow-hidden bg-content1 border border-divider shadow-sm">
                        <div className="absolute top-0 left-0 w-1 h-full bg-foreground/20 group-hover:bg-foreground transition-colors" />
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6 p-2">
                        <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                                <h3 className="font-bold text-xl text-foreground group-hover:text-foreground/80 transition-colors">
                                    {order.service_title}
                                </h3>
                                {order.is_custom && <Badge variant="info" className="text-[8px] uppercase px-2 py-0.5">Custom Request</Badge>}
                                <Badge variant={getStatusColor(order.status)} className="capitalize">{order.status.replace('_', ' ')}</Badge>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-mono text-foreground/50">
                                <span>REF: #{order.id.slice(-8).toUpperCase()}</span>
                                <span>•</span>
                                <span>INIT: {new Date(order.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <span className="text-2xl font-sora font-bold text-foreground">
                                {order.total_amount === 0 ? 'TBD' : `$${order.total_amount}`}
                            </span>
                            <div className="flex items-center text-[10px] font-bold text-foreground/80 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                                Dashboard Access <ArrowRight size={14} className="ml-1" />
                            </div>
                        </div>
                        </div>
                    </Card>
                    </Link>
                ))}
                </div>
            )}
          </>
      ) : (
          <div className="space-y-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-content1 p-8 rounded-2xl border border-divider shadow relative overflow-hidden">
                  <div className="absolute -top-12 -right-12 w-48 h-48 bg-foreground/5 blur-2xl rounded-full" />
                  <div className="relative z-10">
                      <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-3">
                          <Sparkles className="text-foreground animate-pulse" size={28} />
                          Contribute to the Roadmap
                      </h2>
                      <p className="text-foreground/70 text-sm max-w-lg leading-relaxed">
                          Submit feature requests or project templates you'd like to see in the Marketplace. Popular community ideas are built by our core team.
                      </p>
                  </div>
                  <Button onClick={() => setShowSuggestForm(!showSuggestForm)} className="relative z-10 h-12 px-8">
                      {showSuggestForm ? 'Close Transmission' : 'Send Suggestion'}
                  </Button>
              </div>

              {showSuggestForm && (
                  <Card className="animate-in fade-in slide-in-from-top-6 border-divider shadow-sm">
                      <form onSubmit={handleSubmitSuggestion} className="space-y-5">
                          <Input 
                             label="Transmission Topic"
                             placeholder="e.g., Enterprise E-commerce Boilerplate" 
                             value={suggestTitle}
                             onChange={(e) => setSuggestTitle(e.target.value)}
                             required
                          />
                          <Textarea 
                             label="Functional Specs"
                             placeholder="Detail the core features, stack, and use-case..."
                             value={suggestDesc}
                             onChange={(e) => setSuggestDesc(e.target.value)}
                             required
                             rows={4}
                          />
                          <div className="flex justify-end pt-2">
                              <Button type="submit" size="lg" disabled={isSubmittingSuggestion} className="min-w-[200px]">
                                  {isSubmittingSuggestion ? <Loader2 className="animate-spin" /> : 'Log Suggestion'}
                              </Button>
                          </div>
                      </form>
                  </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {suggestions.map(s => (
                      <Card key={s.id} className="flex flex-col relative overflow-hidden group hover:border-focus/30 border border-divider transition-all bg-content1 shadow-sm">
                          {s.status !== 'open' && (
                              <div className={`absolute top-0 right-0 px-4 py-1 text-[10px] font-bold uppercase tracking-widest ${
                                  s.status === 'completed' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                              }`}>
                                  {s.status}
                              </div>
                          )}
                          <div className="flex-grow">
                              <h3 className="font-bold text-foreground mb-3 text-lg group-hover:text-foreground/80 transition-colors">{s.title}</h3>
                              <p className="text-foreground/75 text-sm mb-6 leading-relaxed line-clamp-3">{s.description}</p>
                              <div className="flex items-center gap-3 text-[10px] text-foreground/50 font-mono uppercase">
                                  <span className="flex items-center gap-1"><UserIcon size={10} /> {s.user_name}</span>
                                  <span>•</span>
                                  <span>{new Date(s.created_at).toLocaleDateString()}</span>
                              </div>
                          </div>
                          
                          <div className="pt-6 border-t border-divider flex justify-between items-center mt-auto">
                              <div className="flex items-center gap-2 text-foreground font-bold">
                                  <div className="p-2 bg-secondary rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                      <ThumbsUp size={16} />
                                  </div>
                                  <span className="text-lg">{s.votes}</span>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-xs font-bold uppercase tracking-widest text-foreground/60 hover:text-foreground"
                                onClick={() => handleVote(s.id)}
                              >
                                  Endorse
                              </Button>
                          </div>
                      </Card>
                  ))}
                  {suggestions.length === 0 && (
                      <div className="col-span-full text-center py-20 bg-content1 rounded-3xl border border-dashed border-divider">
                          <p className="text-foreground/50 font-mono uppercase tracking-[0.2em]">No suggestions logged in system</p>
                      </div>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};

export default Dashboard;
