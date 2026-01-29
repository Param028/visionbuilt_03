
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, ArrowRight, Clock, Filter, Lightbulb, ThumbsUp, PenTool, Sparkles, Loader2, User as UserIcon } from 'lucide-react';
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
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">
              <ScrollFloat>Dashboard</ScrollFloat>
          </h1>
          <div className="text-gray-400 mt-1">
              <ScrollFloat animationDuration={0.4}>
                 {`Welcome back, ${user.name.split(' ')[0]} / Active Portal Protocol`}
              </ScrollFloat>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
             <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 mr-2">
                <button 
                    onClick={() => setViewMode('orders')}
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${viewMode === 'orders' ? 'bg-vision-primary text-vision-900 shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                    <Filter size={14} /> My Orders
                </button>
                <button 
                    onClick={() => setViewMode('wishlist')}
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${viewMode === 'wishlist' ? 'bg-vision-primary text-vision-900 shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                    <Lightbulb size={14} /> Wishlist
                </button>
             </div>

             <div className="flex gap-2">
                <Link to="/order/new">
                    <Button variant="outline" className="border-vision-secondary/50 text-vision-secondary hover:bg-vision-secondary/10 h-11">
                        <PenTool className="w-4 h-4 mr-2" /> Custom Project
                    </Button>
                </Link>
                <Link to="/services">
                    <Button variant="primary" className="h-11">
                        <Plus className="w-4 h-4 mr-2" /> New Order
                    </Button>
                </Link>
             </div>
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
                            className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap border ${
                                filter === f 
                                ? 'bg-vision-primary text-black border-vision-primary shadow-[0_0_20px_rgba(6,182,212,0.3)]' 
                                : 'bg-white/5 text-gray-500 hover:text-white hover:bg-white/10 border-white/5'
                            }`}
                        >
                            {f} 
                            <span className={`ml-2 px-1.5 py-0.5 rounded-md text-[9px] ${filter === f ? 'bg-black/20 text-black' : 'bg-white/5 text-gray-600'}`}>
                                {f === 'all' 
                                    ? orders.length 
                                    : f === 'active' 
                                        ? orders.filter(o => ['pending', 'accepted', 'in_progress', 'mockup_ready'].includes(o.status)).length
                                        : orders.filter(o => o.status === f).length
                                }
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center p-20">
                    <div className="w-10 h-10 border-4 border-vision-primary border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
                </div>
            ) : filteredOrders.length === 0 ? (
                <Card className="text-center py-20 border-dashed border-2 border-white/5 bg-transparent group hover:border-vision-primary/30 transition-all duration-500">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-500">
                    <Clock className="w-10 h-10 text-gray-700" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                    <ScrollFloat>{filter === 'all' ? 'System Clean: No Active Sessions' : 'Search Returned Empty'}</ScrollFloat>
                </h3>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                    {filter === 'all' 
                        ? "Initiate your first development cycle by selecting a service or requesting a custom build." 
                        : `No ${filter} logs found in history.`}
                </p>
                {filter === 'all' ? (
                    <div className="flex justify-center gap-4">
                        <Link to="/order/new">
                            <Button variant="outline" className="px-8 border-vision-secondary/50 text-vision-secondary">Custom Build</Button>
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
                    <Card className="hover:border-vision-primary/40 transition-all cursor-pointer group relative overflow-hidden bg-white/[0.02]">
                        <div className="absolute top-0 left-0 w-1 h-full bg-vision-primary/20 group-hover:bg-vision-primary transition-colors" />
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6 p-2">
                        <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                                <h3 className="font-bold text-xl text-white group-hover:text-vision-primary transition-colors">
                                    {order.service_title}
                                </h3>
                                {order.is_custom && <Badge variant="info" className="text-[8px] uppercase px-2 py-0.5 border-blue-500/30">Custom Request</Badge>}
                                <Badge variant={getStatusColor(order.status)} className="capitalize">{order.status.replace('_', ' ')}</Badge>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-mono text-gray-500">
                                <span>REF: #{order.id.slice(-8).toUpperCase()}</span>
                                <span>•</span>
                                <span>INIT: {new Date(order.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <span className="text-2xl font-sora font-bold text-white">
                                {order.total_amount === 0 ? 'TBD' : `$${order.total_amount}`}
                            </span>
                            <div className="flex items-center text-[10px] font-bold text-vision-primary uppercase tracking-widest group-hover:translate-x-1 transition-transform">
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
              <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-gradient-to-br from-vision-primary/10 via-black to-transparent p-8 rounded-2xl border border-vision-primary/20 shadow-2xl relative overflow-hidden">
                  <div className="absolute -top-12 -right-12 w-48 h-48 bg-vision-primary/5 blur-3xl rounded-full" />
                  <div className="relative z-10">
                      <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                          <Sparkles className="text-vision-primary animate-pulse" size={28} />
                          Contribute to the Roadmap
                      </h2>
                      <p className="text-gray-400 text-sm max-w-lg leading-relaxed">
                          Submit feature requests or project templates you'd like to see in the Marketplace. Popular community ideas are built by our core team.
                      </p>
                  </div>
                  <Button onClick={() => setShowSuggestForm(!showSuggestForm)} className="relative z-10 h-12 px-8">
                      {showSuggestForm ? 'Close Transmission' : 'Send Suggestion'}
                  </Button>
              </div>

              {showSuggestForm && (
                  <Card className="animate-in fade-in slide-in-from-top-6 border-vision-primary/30 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
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
                      <Card key={s.id} className="flex flex-col relative overflow-hidden group hover:border-vision-primary/20 transition-all bg-white/[0.01]">
                          {s.status !== 'open' && (
                              <div className={`absolute top-0 right-0 px-4 py-1 text-[10px] font-bold uppercase tracking-widest ${
                                  s.status === 'completed' ? 'bg-green-500 text-black' : 'bg-yellow-500 text-black'
                              }`}>
                                  {s.status}
                              </div>
                          )}
                          <div className="flex-grow">
                              <h3 className="font-bold text-white mb-3 text-lg group-hover:text-vision-primary transition-colors">{s.title}</h3>
                              <p className="text-gray-400 text-sm mb-6 leading-relaxed line-clamp-3">{s.description}</p>
                              <div className="flex items-center gap-3 text-[10px] text-gray-500 font-mono uppercase">
                                  <span className="flex items-center gap-1"><UserIcon size={10} /> {s.user_name}</span>
                                  <span>•</span>
                                  <span>{new Date(s.created_at).toLocaleDateString()}</span>
                              </div>
                          </div>
                          
                          <div className="pt-6 border-t border-white/5 flex justify-between items-center mt-auto">
                              <div className="flex items-center gap-2 text-vision-primary font-bold">
                                  <div className="p-2 bg-vision-primary/10 rounded-lg group-hover:bg-vision-primary group-hover:text-black transition-all">
                                      <ThumbsUp size={16} />
                                  </div>
                                  <span className="text-lg">{s.votes}</span>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white"
                                onClick={() => handleVote(s.id)}
                              >
                                  Endorse
                              </Button>
                          </div>
                      </Card>
                  ))}
                  {suggestions.length === 0 && (
                      <div className="col-span-full text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                          <p className="text-gray-500 font-mono uppercase tracking-[0.2em]">No suggestions logged in system</p>
                      </div>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};

export default Dashboard;
