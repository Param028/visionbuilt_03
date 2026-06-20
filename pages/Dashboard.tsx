
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, ArrowRight, Clock, Filter, Lightbulb, ThumbsUp,
  PenTool, Sparkles, Loader2, User as UserIcon,
} from 'lucide-react';
import { api } from '../services/api';
import { Order, User, ProjectSuggestion } from '../types';
import { Badge, Input, Textarea } from '../components/ui/Components';
import { useToast } from '../components/ui/Toast';

// ── Helper ─────────────────────────────────────────────────────
const getStatusVariant = (status: Order['status']) => {
  switch (status) {
    case 'completed':                          return 'success';
    case 'in_progress': case 'accepted':       return 'info';
    case 'mockup_ready': case 'pending':       return 'warning';
    default:                                   return 'default';
  }
};

// ── Section header ─────────────────────────────────────────────
const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-label mb-4">{children}</p>
);

// ── COMPONENT ─────────────────────────────────────────────────
const Dashboard: React.FC<{ user: User }> = ({ user }) => {
  const [orders, setOrders]               = useState<Order[]>([]);
  const [suggestions, setSuggestions]     = useState<ProjectSuggestion[]>([]);
  const [loading, setLoading]             = useState(true);
  const [viewMode, setViewMode]           = useState<'orders' | 'wishlist'>('orders');
  const [filter, setFilter]               = useState('all');
  const [showSuggestForm, setShowSuggestForm] = useState(false);
  const [suggestTitle, setSuggestTitle]   = useState('');
  const [suggestDesc, setSuggestDesc]     = useState('');
  const [isSubmitting, setIsSubmitting]   = useState(false);

  const navigate = useNavigate();
  const toast    = useToast();

  useEffect(() => {
    if (user.role !== 'client') { navigate('/admin'); return; }
    const fetchData = async () => {
      const [orderData, suggestData] = await Promise.all([
        api.getOrders(user.id),
        api.getProjectSuggestions(),
      ]);
      setOrders(orderData);
      setSuggestions(suggestData);
      setLoading(false);
    };
    fetchData();
  }, [user.id, user.role, navigate]);

  const handleVote = async (id: string) => {
    const updated = await api.voteProjectSuggestion(id);
    setSuggestions(updated);
    toast.success('Vote recorded!');
  };

  const handleSubmitSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const updated = await api.createProjectSuggestion({
        user_id:     user.id,
        user_name:   user.name,
        title:       suggestTitle,
        description: suggestDesc,
      });
      setSuggestions(updated);
      setShowSuggestForm(false);
      setSuggestTitle('');
      setSuggestDesc('');
      toast.success('Suggestion submitted!');
    } catch {
      toast.error('Failed to submit suggestion.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'active') return ['pending', 'accepted', 'in_progress', 'mockup_ready'].includes(order.status);
    return order.status === filter;
  });

  if (user.role !== 'client') return null;

  return (
    <div className="min-h-screen">

      {/* ── Dashboard header ── */}
      <div
        className="relative border-b pt-20 pb-12"
        style={{ borderColor: 'rgba(0,0,0,0.08)' }}
      >
        <div
          className="absolute top-0 right-0 pointer-events-none"
          aria-hidden="true"
          style={{
            width: '400px', height: '250px', borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(124,143,161,0.05) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <div className="container-vb">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-8">

            {/* Greeting */}
            <div>
              <motion.p
                className="text-label mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                Client Portal
              </motion.p>
              <motion.div
                className="flex items-center gap-3 mb-3"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div
                  className="w-9 h-9 flex items-center justify-center text-sm font-display font-bold"
                  style={{ background: 'rgba(124,143,161,0.12)', color: 'var(--vb-accent)' }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <h1 className="text-display-sm font-display font-bold text-foreground">
                  Welcome back, {user.name.split(' ')[0]}.
                </h1>
              </motion.div>
              <motion.p
                className="text-foreground/35 text-sm max-w-md leading-relaxed"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
              >
                Track your active projects and manage your development pipeline in real-time.
              </motion.p>
            </div>

            {/* Actions */}
            <motion.div
              className="flex flex-wrap items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
            >
              {/* View mode toggle */}
              <div
                className="flex border p-0.5"
                style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'var(--vb-bg-alt)' }}
              >
                {(['orders', 'wishlist'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-satoshi tracking-widest uppercase transition-all"
                    style={{
                      color: viewMode === mode ? '#FFFFFF' : 'rgba(255,255,255,0.58)',
                      background: viewMode === mode ? 'rgba(255,255,255,0.12)' : 'transparent',
                    }}
                  >
                    {mode === 'orders' ? <Filter size={12} /> : <Lightbulb size={12} />}
                    {mode === 'orders' ? 'Orders' : 'Roadmap'}
                  </button>
                ))}
              </div>

              <Link to="/order/new">
                <button className="btn-ghost !text-xs !py-2.5 !px-5 flex items-center gap-2">
                  <PenTool size={12} /> Custom Build
                </button>
              </Link>
              <Link to="/services">
                <button className="btn-primary !text-xs !py-2.5 !px-5 flex items-center gap-2">
                  <Plus size={12} /> New Order
                </button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="container-vb section-y-sm">

        <AnimatePresence mode="wait">

          {/* ── ORDERS VIEW ── */}
          {viewMode === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              {/* Filter bar */}
              {!loading && orders.length > 0 && (
                <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
                  {['all', 'active', 'completed', 'cancelled'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      id={`filter-${f}`}
                      className="px-4 py-1.5 text-[10px] font-satoshi font-medium uppercase tracking-widest transition-all whitespace-nowrap border"
                      style={{
                        borderColor: filter === f ? 'rgba(255,255,255,0.24)' : 'rgba(255,255,255,0.08)',
                        color:       filter === f ? '#FFFFFF' : 'rgba(255,255,255,0.58)',
                        background:  filter === f ? 'rgba(255,255,255,0.12)' : 'transparent',
                      }}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              )}

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="glass-card h-20 animate-pulse" />
                  ))}
                </div>
              ) : filteredOrders.length === 0 ? (
                /* Empty state */
                <div className="glass-card text-center py-20 px-8">
                  <div
                    className="w-14 h-14 mx-auto mb-7 flex items-center justify-center border"
                    style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.06)' }}
                  >
                    <Clock size={22} style={{ color: 'var(--vb-muted)' }} />
                  </div>
                  <h3 className="font-display font-bold text-foreground text-xl mb-3">
                    {filter === 'all' ? 'No Active Sessions' : 'Search Returned Empty'}
                  </h3>
                  <p className="text-foreground/35 text-sm mb-10 max-w-sm mx-auto leading-relaxed">
                    {filter === 'all'
                      ? 'Initiate your first development cycle by selecting a service or requesting a custom build.'
                      : `No ${filter} orders found.`}
                  </p>
                  {filter === 'all' ? (
                    <div className="flex justify-center gap-3">
                      <Link to="/order/new">
                        <button className="btn-ghost !text-xs !py-2.5">Custom Build</button>
                      </Link>
                      <Link to="/services">
                        <button className="btn-primary !text-xs !py-2.5">Browse Catalog</button>
                      </Link>
                    </div>
                  ) : (
                    <button className="btn-ghost !text-xs !py-2.5" onClick={() => setFilter('all')}>
                      Clear Filter
                    </button>
                  )}
                </div>
              ) : (
                /* Order list */
                <div className="space-y-3">
                  {filteredOrders.map((order, i) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link to={`/dashboard/order/${order.id}`}>
                        <div
                          className="glass-card group flex flex-col sm:flex-row justify-between sm:items-center gap-5 p-6 relative overflow-hidden"
                          style={{ borderRadius: '8px' }}
                        >
                          {/* Side accent bar */}
                          <div
                            className="absolute top-0 left-0 w-0.5 h-full transition-all duration-300 group-hover:w-1"
                            style={{ background: 'var(--vb-accent)' }}
                          />

                          <div className="pl-3 flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                              <h3 className="font-display font-bold text-foreground text-lg">
                                {order.service_title}
                              </h3>
                              {order.is_custom && (
                                <Badge variant="info" className="text-[9px] uppercase px-2 py-0.5">
                                  Custom
                                </Badge>
                              )}
                              <Badge variant={getStatusVariant(order.status)} className="capitalize text-[9px]">
                                {order.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <div
                              className="flex items-center gap-3 text-[10px] font-satoshi tracking-wide"
                              style={{ color: 'var(--vb-muted)' }}
                            >
                              <span>REF #{order.id.slice(-8).toUpperCase()}</span>
                              <span>·</span>
                              <span>{new Date(order.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-6 pl-3 sm:pl-0">
                            <div className="text-right">
                              <span className="font-display font-bold text-foreground text-xl">
                                {order.total_amount === 0 ? 'TBD' : `₹${order.total_amount}`}
                              </span>
                            </div>
                            <div
                              className="flex items-center gap-1 text-[10px] font-satoshi tracking-widest uppercase transition-all group-hover:gap-2"
                              style={{ color: 'var(--vb-muted)' }}
                            >
                              View <ArrowRight size={11} />
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── ROADMAP / WISHLIST VIEW ── */}
          {viewMode === 'wishlist' && (
            <motion.div
              key="wishlist"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              {/* Roadmap header card */}
              <div className="glass-card p-8 md:p-10 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
                <div
                  className="absolute top-0 right-0 pointer-events-none"
                  aria-hidden="true"
                  style={{
                    width: '300px', height: '200px', borderRadius: '50%',
                    background: 'radial-gradient(ellipse, rgba(124,143,161,0.06) 0%, transparent 70%)',
                    filter: 'blur(40px)',
                  }}
                />
                <div className="relative z-10">
                  <SectionLabel>Community</SectionLabel>
                  <h2 className="text-display-sm font-display font-bold text-foreground mb-3 flex items-center gap-3">
                    <Sparkles size={22} style={{ color: 'var(--vb-accent)' }} />
                    Product Roadmap
                  </h2>
                  <p className="text-foreground/40 text-sm max-w-lg leading-relaxed">
                    Submit ideas for features or project templates. Popular requests are built by our team and released to the Marketplace.
                  </p>
                </div>
                <button
                  onClick={() => setShowSuggestForm(!showSuggestForm)}
                  className="btn-primary !text-xs relative z-10"
                >
                  {showSuggestForm ? 'Close' : 'Suggest a Feature'}
                </button>
              </div>

              {/* Suggestion form */}
              <AnimatePresence>
                {showSuggestForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden mb-8"
                  >
                    <div className="glass-card p-8">
                      <p className="text-label mb-6">New Suggestion</p>
                      <form onSubmit={handleSubmitSuggestion} className="space-y-5">
                        <div>
                          <label className="text-xs font-satoshi tracking-widest uppercase mb-1.5 block" style={{ color: 'var(--vb-muted)' }}>
                            Title
                          </label>
                          <Input
                            placeholder="e.g., Enterprise E-commerce Boilerplate"
                            value={suggestTitle}
                            onChange={(e) => setSuggestTitle(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className="text-xs font-satoshi tracking-widest uppercase mb-1.5 block" style={{ color: 'var(--vb-muted)' }}>
                            Description
                          </label>
                          <Textarea
                            placeholder="Detail the core features, tech stack, and use-case..."
                            value={suggestDesc}
                            onChange={(e) => setSuggestDesc(e.target.value)}
                            required
                            rows={4}
                          />
                        </div>
                        <div className="flex justify-end">
                          <button type="submit" disabled={isSubmitting} className="btn-primary !text-xs !py-2.5 !px-8 min-w-[160px] justify-center">
                            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : 'Submit Suggestion'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Suggestions grid */}
              {suggestions.length === 0 ? (
                <div
                  className="text-center py-20 border"
                  style={{ borderColor: 'rgba(0,0,0,0.12)', borderStyle: 'dashed' }}
                >
                  <p className="font-satoshi text-xs tracking-widest uppercase" style={{ color: 'var(--vb-muted)' }}>
                    No suggestions in the system yet
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {suggestions.map((s, i) => (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                    >
                      <div className="glass-card p-7 flex flex-col h-full group relative overflow-hidden">
                        {/* Status badge */}
                        {s.status !== 'open' && (
                          <div
                            className="absolute top-0 right-0 px-3 py-1 text-[10px] font-satoshi font-medium uppercase tracking-widest border-b border-l"
                            style={{
                              borderColor: s.status === 'completed' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)',
                              color: s.status === 'completed' ? 'rgba(16,185,129,0.8)' : 'rgba(245,158,11,0.8)',
                              background: s.status === 'completed' ? 'rgba(16,185,129,0.05)' : 'rgba(245,158,11,0.05)',
                            }}
                          >
                            {s.status}
                          </div>
                        )}

                        <div className="flex-1">
                          <h3 className="font-display font-bold text-foreground mb-3 text-base">{s.title}</h3>
                          <p className="text-foreground/40 text-sm leading-relaxed line-clamp-3 mb-5">{s.description}</p>
                          <div className="flex items-center gap-3 text-[10px] font-satoshi" style={{ color: 'var(--vb-muted)' }}>
                            <span className="flex items-center gap-1"><UserIcon size={9} /> {s.user_name}</span>
                            <span>·</span>
                            <span>{new Date(s.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                          <div
                            className="pt-5 mt-5 border-t flex justify-between items-center"
                            style={{ borderColor: 'rgba(0,0,0,0.08)' }}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="p-2 border transition-all duration-300 group-hover:border-black/20"
                                style={{ borderColor: 'rgba(0,0,0,0.08)' }}
                              >
                              <ThumbsUp size={13} style={{ color: 'var(--vb-accent)' }} />
                            </div>
                            <span className="font-display font-bold text-foreground">{s.votes}</span>
                          </div>
                            <button
                              onClick={() => handleVote(s.id)}
                              className="text-[10px] font-satoshi tracking-widest uppercase transition-colors"
                              style={{ color: 'var(--vb-muted)' }}
                              onMouseEnter={e => (e.currentTarget.style.color = 'var(--vb-text)')}
                              onMouseLeave={e => (e.currentTarget.style.color = 'var(--vb-muted)')}
                            >
                            Endorse
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default Dashboard;
