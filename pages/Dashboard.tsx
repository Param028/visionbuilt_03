import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, ArrowRight, Clock, Filter, Lightbulb, ThumbsUp, MessageSquarePlus } from 'lucide-react';
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
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">
              <ScrollFloat>Dashboard</ScrollFloat>
          </h1>
          <div className="text-gray-400">
              <ScrollFloat animationDuration={0.4}>
                 {`Welcome back, ${user.name.split(' ')[0]}`}
              </ScrollFloat>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
             <Button 
                variant={viewMode === 'wishlist' ? 'primary' : 'ghost'} 
                onClick={() => setViewMode('wishlist')}
                className="gap-2"
             >
                 <Lightbulb className="w-4 h-4" />
                 Community Wishlist
             </Button>
             <Button 
                variant={viewMode === 'orders' ? 'primary' : 'ghost'} 
                onClick={() => setViewMode('orders')}
                className="gap-2"
             >
                 <Filter className="w-4 h-4" />
                 My Orders
             </Button>
             <div className="w-px h-8 bg-white/10 mx-2 hidden md:block"></div>
             <Link to="/services">
                <Button variant="secondary">
                    <Plus className="w-4 h-4 mr-2" /> New Order
                </Button>
             </Link>
        </div>
      </div>

      {viewMode === 'orders' ? (
          <>
            {!loading && orders.length > 0 && (
                <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                    {['all', 'active', 'completed', 'cancelled'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap border ${
                                filter === f 
                                ? 'bg-vision-primary text-black border-vision-primary shadow-[0_0_10px_rgba(6,182,212,0.3)]' 
                                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border-white/5'
                            }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)} 
                            <span className={`ml-2 text-xs ${filter === f ? 'opacity-80' : 'opacity-50'}`}>
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
                    <div className="w-8 h-8 border-4 border-vision-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : filteredOrders.length === 0 ? (
                <Card className="text-center py-20 border-dashed border-2 border-white/10 bg-transparent">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Clock className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                    <ScrollFloat>{filter === 'all' ? 'No Active Orders' : 'No Orders Found'}</ScrollFloat>
                </h3>
                <p className="text-gray-400 mb-6">
                    {filter === 'all' 
                        ? "You haven't placed any orders yet. Start your journey with us." 
                        : `You have no ${filter} orders.`}
                </p>
                {filter === 'all' ? (
                    <Link to="/services">
                        <Button variant="outline">Browse Services</Button>
                    </Link>
                ) : (
                    <Button variant="ghost" onClick={() => setFilter('all')}>Clear Filter</Button>
                )}
                </Card>
            ) : (
                <div className="space-y-4">
                {filteredOrders.map((order) => (
                    <Link to={`/dashboard/order/${order.id}`} key={order.id}>
                    <Card className="hover:border-vision-primary/30 transition-all cursor-pointer group mb-4 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 relative z-10">
                        <div>
                            <div className="flex items-center space-x-3 mb-1">
                                <h3 className="font-bold text-lg text-white group-hover:text-vision-primary transition-colors">
                                    {order.service_title}
                                </h3>
                                <Badge variant={getStatusColor(order.status)}>{order.status.replace('_', ' ')}</Badge>
                            </div>
                            <p className="text-sm text-gray-400">Order ID: #{order.id} • {new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center text-sm font-medium text-gray-300">
                            View Details <ArrowRight className="w-4 h-4 ml-2 text-vision-primary group-hover:translate-x-1 transition-transform" />
                        </div>
                        </div>
                    </Card>
                    </Link>
                ))}
                </div>
            )}
          </>
      ) : (
          <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-vision-primary/10 to-transparent p-6 rounded-xl border border-vision-primary/20">
                  <div>
                      <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                          <Lightbulb className="text-yellow-400" size={24} />
                          Suggest the Next Big Project
                      </h2>
                      <p className="text-gray-400 text-sm max-w-xl">
                          Have an idea for a ready-made template or tool? Suggest it here! Our developers review these requests to decide what to build next for the Marketplace.
                      </p>
                  </div>
                  <Button onClick={() => setShowSuggestForm(!showSuggestForm)}>
                      {showSuggestForm ? 'Cancel Request' : 'Submit Idea'}
                  </Button>
              </div>

              {showSuggestForm && (
                  <Card className="animate-in fade-in slide-in-from-top-4 border-vision-primary/30">
                      <form onSubmit={handleSubmitSuggestion} className="space-y-4">
                          <Input 
                             placeholder="Project Title (e.g., Real Estate CRM, AI Chatbot)" 
                             value={suggestTitle}
                             onChange={(e) => setSuggestTitle(e.target.value)}
                             required
                          />
                          <Textarea 
                             placeholder="Describe the features and functionality you need..."
                             value={suggestDesc}
                             onChange={(e) => setSuggestDesc(e.target.value)}
                             required
                             rows={3}
                          />
                          <div className="flex justify-end">
                              <Button type="submit" disabled={isSubmittingSuggestion}>
                                  {isSubmittingSuggestion ? 'Submitting...' : 'Post Suggestion'}
                              </Button>
                          </div>
                      </form>
                  </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {suggestions.map(s => (
                      <Card key={s.id} className="flex flex-col relative overflow-hidden group">
                          {s.status !== 'open' && (
                              <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                                  s.status === 'completed' ? 'bg-green-500 text-black' : 'bg-yellow-500 text-black'
                              }`}>
                                  {s.status}
                              </div>
                          )}
                          <div className="flex-grow">
                              <h3 className="font-bold text-white mb-2 text-lg">{s.title}</h3>
                              <p className="text-gray-400 text-sm mb-4 leading-relaxed">{s.description}</p>
                              <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                                  <span>by {s.user_name}</span>
                                  <span>•</span>
                                  <span>{new Date(s.created_at).toLocaleDateString()}</span>
                              </div>
                          </div>
                          
                          <div className="pt-4 border-t border-white/5 flex justify-between items-center mt-auto">
                              <div className="flex items-center gap-2 text-vision-primary font-bold">
                                  <ThumbsUp size={16} />
                                  <span>{s.votes} Votes</span>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-gray-400 hover:text-vision-primary"
                                onClick={() => handleVote(s.id)}
                              >
                                  Vote Up
                              </Button>
                          </div>
                      </Card>
                  ))}
                  {suggestions.length === 0 && (
                      <div className="col-span-full text-center py-10 text-gray-500">
                          No suggestions yet. Be the first to submit one!
                      </div>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};

export default Dashboard;
