
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Eye, ShoppingBag, Star, Download, TrendingUp, User as UserIcon,
  Sparkles, Layout, Rocket, ArrowUpDown,
} from 'lucide-react';
import { api } from '../services/api';
import { MarketplaceItem, User, ProjectCategory } from '../types';
import { formatPrice } from '../constants';
import { GlareCard } from '../components/ui/ReactBits';

const TABS: { key: ProjectCategory; icon: React.ReactNode; label: string }[] = [
  { key: 'Premium Projects', icon: <Layout size={14} />, label: 'Premium Projects' },
  { key: 'UI/UX Design',     icon: <Sparkles size={14} />, label: 'UI/UX Design' },
  { key: 'Free Projects',    icon: <Rocket size={14} />, label: 'Free Projects' },
];


// ── Loading skeleton ──────────────────────────────────────────
const ItemSkeleton = () => (
  <div className="glass-card overflow-hidden animate-pulse">
    <div className="h-44 bg-white/5" />
    <div className="p-6 space-y-3">
      <div className="h-4 w-2/3 bg-white/5 rounded" />
      <div className="h-4 w-full bg-white/4 rounded" />
      <div className="h-4 w-5/6 bg-white/4 rounded" />
      <div className="mt-4 flex justify-between items-center">
        <div className="h-6 w-20 bg-white/5 rounded" />
        <div className="h-9 w-28 bg-white/5 rounded" />
      </div>
    </div>
  </div>
);

// ── COMPONENT ─────────────────────────────────────────────────
const Marketplace: React.FC<{ user: User | null }> = ({ user }) => {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ProjectCategory>('Premium Projects');
  const [sortBy, setSortBy] = useState<string>('newest');
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const timeoutId = setTimeout(() => {
      if (isMounted && loading) setLoading(false);
    }, 15000);

    const fetchData = async () => {
      try {
        const data = await api.getMarketplaceItems();
        if (isMounted) setItems(data);
      } catch (error) {
        console.error('Failed to load marketplace items', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => { isMounted = false; clearTimeout(timeoutId); };
  }, []);

  const handleBuy     = (id: string) => navigate(`/marketplace/buy/${id}`);
  const handlePreview = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    window.open(url, '_blank');
  };

  const getSortedItems = (itemsToSort: MarketplaceItem[]) =>
    [...itemsToSort].sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':  return a.price - b.price;
        case 'price_desc': return b.price - a.price;
        case 'popularity': return (b.purchases - a.purchases) || (b.views - a.views);
        case 'rating':     return b.rating - a.rating;
        default:           return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }
    });

  const filteredItems  = items.filter(item => item.category === activeTab);
  const displayedItems = getSortedItems(filteredItems);

  // Detect which tabs have content
  const availableTabs = TABS.filter(t => items.some(i => i.category === t.key));

  return (
    <div className="min-h-screen">

      {/* ── PAGE HEADER ── */}
      <div
        className="relative border-b pt-20 pb-16 overflow-hidden"
        style={{ borderColor: 'rgba(255,255,255,0.10)' }}
      >
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
          aria-hidden="true"
          style={{
            width: '600px', height: '300px', borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(124,143,161,0.06) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <div className="container-vb relative z-10 text-center">
          <motion.p
            className="text-label mb-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Browse & Download
          </motion.p>
          <motion.h1
            className="text-display font-display font-bold text-foreground mb-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Marketplace
          </motion.h1>
          <motion.p
            className="text-[rgba(255,255,255,0.82)] text-lg max-w-xl mx-auto leading-relaxed font-light"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Premium templates, UI kits, and free resources for your next build.
          </motion.p>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="container-vb section-y-sm">

        {/* Tab bar */}
        <div className="flex justify-center mb-8">
          <div
            className="flex gap-1 p-1 border"
            style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}
          >
            {(availableTabs.length > 0 ? availableTabs : TABS.slice(0, 3)).map((tab) => (
              <button
                key={tab.key}
                id={`marketplace-tab-${tab.key.toLowerCase().replace(/[^a-z]/g, '-')}`}
                onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-2 px-5 py-2 text-xs font-satoshi tracking-widest uppercase transition-all duration-300"
                style={{
                  color:   activeTab === tab.key ? '#F8F9FA' : 'rgba(248,249,250,0.38)',
                  background: activeTab === tab.key ? 'rgba(255,255,255,0.07)' : 'transparent',
                  borderBottom: activeTab === tab.key ? '1px solid rgba(255,255,255,0.25)' : '1px solid transparent',
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Controls row */}
        <div
          className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 pb-5 border-b"
          style={{ borderColor: 'rgba(255,255,255,0.10)' }}
        >
          <p className="text-[rgba(255,255,255,0.58)] text-sm font-satoshi">
            Showing{' '}
            <span className="text-foreground font-medium">{displayedItems.length}</span>{' '}
            {activeTab.toLowerCase()}
          </p>

          <div className="flex items-center gap-3">
            <span className="text-xs text-foreground/30 font-satoshi tracking-widest uppercase">Sort</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="vb-input appearance-none pr-8 !h-9 !text-xs cursor-pointer"
              >
                <option value="newest" className="bg-[#2C3137]">Newest</option>
                <option value="popularity" className="bg-[#2C3137]">Popularity</option>
                <option value="rating" className="bg-[#2C3137]">Top Rated</option>
                {activeTab !== 'Free Projects' && (
                  <>
                    <option value="price_asc" className="bg-[#2C3137]">Price ↑</option>
                    <option value="price_desc" className="bg-[#2C3137]">Price ↓</option>
                  </>
                )}
              </select>
              <ArrowUpDown
                size={12}
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'rgba(248,249,250,0.3)' }}
              />
            </div>
          </div>
        </div>

        {/* Items grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map(i => <ItemSkeleton key={i} />)}
          </div>
        ) : displayedItems.length === 0 ? (
          <div className="glass-card flex flex-col items-center justify-center text-center p-16 max-w-md mx-auto">
            <ShoppingBag
              className="mb-5"
              size={32}
              style={{ color: 'rgba(248,249,250,0.18)' }}
            />
            <h3 className="font-display font-bold text-foreground text-xl mb-2">No Projects Found</h3>
            <p className="text-foreground/35 text-sm">New {activeTab} items coming soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06, duration: 0.5 }}
              >
                <GlareCard className="h-full flex flex-col overflow-hidden">
                  <div className="h-full flex flex-col">

                    {/* Image */}
                    <div className="h-44 w-full overflow-hidden relative group">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 filter grayscale-[50%] group-hover:grayscale-0 group-hover:opacity-100 opacity-80"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{ background: 'rgba(255,255,255,0.03)' }}
                        >
                          <ShoppingBag size={28} style={{ color: 'rgba(248,249,250,0.18)' }} />
                        </div>
                      )}

                      {/* Preview overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                        {item.demo_url && (
                          <button
                            onClick={(e) => handlePreview(e, item.demo_url!)}
                            className="btn-ghost !py-2 !px-4 !text-xs"
                          >
                            <Eye size={12} /> Preview
                          </button>
                        )}
                      </div>

                      {/* Rating badge */}
                      <div
                        className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 border text-xs"
                        style={{
                          borderColor: 'rgba(251,191,36,0.2)',
                          background: 'rgba(33,37,41,0.9)',
                          color: 'rgba(251,191,36,0.9)',
                          backdropFilter: 'blur(8px)',
                        }}
                      >
                        <Star size={9} fill="currentColor" />
                        <span className="font-semibold">{item.rating}</span>
                        <span style={{ color: 'rgba(248,249,250,0.35)' }}>({item.review_count})</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col flex-grow">
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {item.tags.slice(0, 2).map(tag => (
                          <span
                            key={tag}
                            className="text-[10px] font-satoshi font-medium px-2 py-0.5 tracking-widest uppercase border"
                            style={{
                              borderColor: 'rgba(255,255,255,0.14)',
                              color: 'rgba(255,255,255,0.58)',
                              background: 'rgba(255,255,255,0.07)',
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <h3 className="font-display font-bold text-foreground text-lg mb-1">{item.title}</h3>
                      <div className="flex items-center gap-1 text-xs mb-2" style={{ color: 'rgba(248,249,250,0.3)' }}>
                        <UserIcon size={10} />
                        <span>by <span style={{ color: 'rgba(248,249,250,0.55)' }}>{item.developer_name}</span></span>
                      </div>
                      <p className="text-[rgba(255,255,255,0.82)] text-sm mb-4 line-clamp-2 flex-grow leading-relaxed">
                        {item.short_description}
                      </p>

                      {/* Stats */}
                      <div
                        className="flex justify-between items-center text-xs pt-3 mb-4 border-t"
                        style={{ borderColor: 'rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.58)' }}
                      >
                        <div className="flex items-center gap-1.5">
                          <TrendingUp size={11} /> <span>{item.views} views</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Download size={11} />
                          <span>{item.purchases} {activeTab === 'Free Projects' ? 'downloads' : 'sold'}</span>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between gap-3 mt-auto">
                        <div className="font-display font-bold text-foreground text-xl">
                          {activeTab === 'Free Projects' ? (
                            <span style={{ color: 'rgba(52,211,153,0.8)' }}>FREE</span>
                          ) : (
                            formatPrice(item.price, user?.country)
                          )}
                        </div>

                        {(!user || user.role === 'client') ? (
                          <button
                            onClick={() => handleBuy(item.id)}
                            className="btn-primary flex-1 justify-center !py-2.5 !text-xs"
                          >
                            {activeTab === 'Free Projects' ? (
                              <><Download size={12} /> Download</>
                            ) : 'Buy Now'}
                          </button>
                        ) : (
                          <div
                            className="flex-1 py-2.5 text-center text-[10px] font-satoshi tracking-widest uppercase border"
                            style={{ borderColor: 'rgba(255,255,255,0.10)', color: 'rgba(248,249,250,0.65)' }}
                          >
                            Admin Mode
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </GlareCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
