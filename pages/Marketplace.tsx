
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, ShoppingBag, Star, Download, TrendingUp, User as UserIcon, Sparkles, Layout, Rocket, ArrowUpDown } from 'lucide-react';
import { api } from '../services/api';
import { MarketplaceItem, User, ProjectCategory } from '../types';
import { formatPrice } from '../constants';
import { Button } from '../components/ui/Components';
import { ScrollFloat, GlareCard } from '../components/ui/ReactBits';

const Marketplace: React.FC<{ user: User | null }> = ({ user }) => {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ProjectCategory>('Premium Projects');
  const [sortBy, setSortBy] = useState<string>('newest');
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    
    const timeoutId = setTimeout(() => {
        if (isMounted && loading) {
            setLoading(false);
        }
    }, 15000);

    const fetchData = async () => {
      try {
        const data = await api.getMarketplaceItems();
        if (isMounted) setItems(data);
      } catch (error) {
        console.error("Failed to load marketplace items", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchData();

    return () => {
        isMounted = false;
        clearTimeout(timeoutId);
    };
  }, []);

  const handleBuy = (id: string) => {
    navigate(`/marketplace/buy/${id}`);
  };

  const handlePreview = (e: React.MouseEvent, url: string) => {
      e.stopPropagation();
      window.open(url, '_blank');
  };

  const getSortedItems = (itemsToSort: MarketplaceItem[]) => {
      return [...itemsToSort].sort((a, b) => {
          switch (sortBy) {
              case 'price_asc':
                  return a.price - b.price;
              case 'price_desc':
                  return b.price - a.price;
              case 'popularity':
                  return (b.purchases - a.purchases) || (b.views - a.views);
              case 'rating':
                  return b.rating - a.rating;
              case 'newest':
              default:
                  return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
          }
      });
  };

  // Strict filtering by Category
  const filteredItems = items.filter(item => {
      if (activeTab === 'Free Projects') {
          return item.category === 'Free Projects';
      }
      return item.category === activeTab;
  });

  const displayedItems = getSortedItems(filteredItems);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-foreground border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            <ScrollFloat>Marketplace</ScrollFloat>
        </h1>
        <div className="text-foreground/75 max-w-2xl mx-auto mb-8">
          <ScrollFloat animationDuration={0.4} stagger={0.01} className="justify-center">
            Premium templates and free resources for your next build.
          </ScrollFloat>
        </div>
 
        {/* Strictly Defined Tabs */}
        <div className="flex justify-center mb-8 overflow-x-auto pb-2 scrollbar-hide">
            <div className="bg-content1 border border-divider p-1 rounded-full flex space-x-2 shadow-sm">
                <button 
                    onClick={() => setActiveTab('Premium Projects')}
                    className={`px-6 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'Premium Projects' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground/60 hover:text-foreground'}`}
                >
                    <Layout size={16} /> Premium Projects
                </button>
                <button 
                    onClick={() => setActiveTab('UI/UX Design')}
                    className={`px-6 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'UI/UX Design' ? 'bg-secondary text-secondary-foreground shadow-sm border border-divider' : 'text-foreground/60 hover:text-foreground'}`}
                >
                    <Sparkles size={16} /> UI/UX Design
                </button>
                <button 
                    onClick={() => setActiveTab('Free Projects')}
                    className={`px-6 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'Free Projects' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground/60 hover:text-foreground'}`}
                >
                    <Rocket size={16} /> Free Projects
                </button>
            </div>
        </div>
      </div>

      {/* Sorting Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 border-b border-divider pb-4">
          <p className="text-sm text-foreground/70">
              Showing <span className="text-foreground font-bold">{displayedItems.length}</span> {activeTab}
          </p>
          <div className="flex items-center gap-3">
              <span className="text-sm text-foreground/50">Sort by:</span>
              <div className="relative group">
                  <select 
                      value={sortBy} 
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none bg-content1 border border-divider text-sm text-foreground pl-4 pr-10 py-2 rounded-lg cursor-pointer hover:border-focus/30 focus:outline-none focus:ring-2 focus:ring-focus/30 focus:border-focus transition-all duration-300"
                  >
                      <option value="newest" className="bg-content1 text-foreground">Newest Arrivals</option>
                      <option value="popularity" className="bg-content1 text-foreground">Popularity</option>
                      <option value="rating" className="bg-content1 text-foreground">Top Rated</option>
                      {activeTab !== 'Free Projects' && (
                          <>
                            <option value="price_asc" className="bg-content1 text-foreground">Price: Low to High</option>
                            <option value="price_desc" className="bg-content1 text-foreground">Price: High to Low</option>
                          </>
                      )}
                  </select>
                  <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50 pointer-events-none group-hover:text-foreground transition-colors" />
              </div>
          </div>
      </div>

      {displayedItems.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-divider rounded-xl bg-content1 shadow-sm">
              <ShoppingBag className="w-12 h-12 text-foreground/40 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">No Projects Found</h3>
              <p className="text-foreground/70">
                  New items for {activeTab} coming soon.
              </p>
          </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedItems.map((item, index) => (
            <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
            >
                <GlareCard className="h-full flex flex-col">
                    <div className="h-full flex flex-col">
                    {/* Image Thumbnail */}
                    <div className="h-48 w-full overflow-hidden relative group">
                        {item.image_url ? (
                            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        ) : (
                            <div className="w-full h-full bg-secondary flex items-center justify-center text-foreground/40">
                                <ShoppingBag size={32} />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                            {item.demo_url && (
                                <Button size="sm" variant="secondary" onClick={(e) => handlePreview(e, item.demo_url!)}>
                                    <Eye size={14} className="mr-2" /> Preview
                                </Button>
                            )}
                        </div>
                        
                        {/* Rating Badge */}
                        <div className="absolute top-2 right-2 bg-content1/80 backdrop-blur-sm px-2 py-1 rounded-full border border-divider flex items-center gap-1 text-xs text-amber-500 shadow-sm">
                            <Star size={10} fill="currentColor" />
                            <span className="font-bold">{item.rating}</span>
                            <span className="text-foreground/50">({item.review_count})</span>
                        </div>
                    </div>

                    <div className="p-6 flex flex-col flex-grow">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex flex-wrap gap-2 mb-2">
                                {item.tags.slice(0, 2).map(tag => (
                                    <span key={tag} className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-secondary border border-divider rounded text-foreground font-bold">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
 
                        <h3 className="text-xl font-bold font-display text-foreground mb-1">{item.title}</h3>
                        <div className="flex items-center text-xs text-foreground/50 mb-2">
                            <UserIcon size={12} className="mr-1" />
                            by <span className="text-foreground/80 ml-1">{item.developer_name}</span>
                        </div>
 
                        <p className="text-foreground/70 text-sm mb-4 line-clamp-2 flex-grow">{item.short_description}</p>
                        
                        {/* Stats */}
                        <div className="flex justify-between items-center text-xs text-foreground/50 border-t border-divider pt-4 mb-4">
                            <div className="flex items-center gap-1">
                                <TrendingUp size={14} />
                                <span>{item.views} views</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Download size={14} />
                                <span>{item.purchases} {activeTab === 'Free Projects' ? 'downloads' : 'sold'}</span>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between gap-4 mt-auto">
                            <div className="text-2xl font-bold text-foreground font-sora">
                                {activeTab === 'Free Projects' ? (
                                    <span className="text-emerald-600 dark:text-emerald-400">FREE</span>
                                ) : (
                                    formatPrice(item.price, user?.country)
                                )}
                            </div>
                            {(!user || user.role === 'client') ? (
                                <Button onClick={() => handleBuy(item.id)} className="flex-1">
                                    {activeTab === 'Free Projects' ? (
                                        <span className="flex items-center justify-center gap-2"><Download size={16}/> Launch</span>
                                    ) : 'Buy Now'}
                                </Button>
                            ) : (
                                <div className="flex-1 py-2 text-center text-xs text-foreground/50 border border-divider rounded-lg bg-secondary uppercase tracking-wider">
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
  );
};

export default Marketplace;
