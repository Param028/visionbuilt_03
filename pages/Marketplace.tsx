
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, ShoppingBag, Star, Download, TrendingUp, User as UserIcon, GraduationCap, Sparkles, Clock, ArrowUpDown } from 'lucide-react';
import { api } from '../services/api';
import { MarketplaceItem, User } from '../types';
import { formatPrice } from '../constants';
import { Button } from '../components/ui/Components';
import { ScrollFloat, GlareCard } from '../components/ui/ReactBits';

const Marketplace: React.FC<{ user: User | null }> = ({ user }) => {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'premium' | 'student'>('premium');
  const [sortBy, setSortBy] = useState<string>('newest');
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    
    // Failsafe timeout
    const timeoutId = setTimeout(() => {
        if (isMounted && loading) {
            setLoading(false);
        }
    }, 5000);

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

  // Filter items based on Free Limited Time Status
  const premiumItems = items.filter(item => !item.free_until || new Date(item.free_until) <= new Date());
  const freeItems = items.filter(item => item.free_until && new Date(item.free_until) > new Date());

  const getSortedItems = (itemsToSort: MarketplaceItem[]) => {
      return [...itemsToSort].sort((a, b) => {
          switch (sortBy) {
              case 'price_asc':
                  return a.price - b.price;
              case 'price_desc':
                  return b.price - a.price;
              case 'popularity':
                  // Sort by purchases first, then views
                  return (b.purchases - a.purchases) || (b.views - a.views);
              case 'rating':
                  return b.rating - a.rating;
              case 'newest':
              default:
                  // Assuming there is a created_at field, fallback to generic order if missing or equal
                  return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
          }
      });
  };

  const displayedItems = getSortedItems(activeTab === 'premium' ? premiumItems : freeItems);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-vision-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            <ScrollFloat>Ready-Made Projects</ScrollFloat>
        </h1>
        <div className="text-gray-400 max-w-2xl mx-auto mb-8">
          <ScrollFloat animationDuration={0.4} stagger={0.01} className="justify-center">
            Accelerate your development with our premium templates and exclusive student resources.
          </ScrollFloat>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
            <div className="bg-white/5 border border-white/10 p-1 rounded-full flex space-x-2">
                <button 
                    onClick={() => setActiveTab('premium')}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'premium' ? 'bg-vision-primary text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'text-gray-400 hover:text-white'}`}
                >
                    <div className="flex items-center gap-2">
                        <Sparkles size={16} />
                        Premium Projects
                    </div>
                </button>
                <button 
                    onClick={() => setActiveTab('student')}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'student' ? 'bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'text-gray-400 hover:text-white'}`}
                >
                    <div className="flex items-center gap-2">
                        <GraduationCap size={16} />
                        Free For Students
                    </div>
                </button>
            </div>
        </div>
      </div>

      {/* Sorting Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 border-b border-white/5 pb-4">
          <p className="text-sm text-gray-400">
              Showing <span className="text-white font-bold">{displayedItems.length}</span> {activeTab === 'premium' ? 'Premium' : 'Student'} Projects
          </p>
          <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Sort by:</span>
              <div className="relative group">
                  <select 
                      value={sortBy} 
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none bg-black/40 border border-white/10 text-sm text-white pl-4 pr-10 py-2 rounded-lg cursor-pointer hover:border-vision-primary/50 focus:outline-none focus:border-vision-primary transition-all"
                  >
                      <option value="newest" className="bg-vision-900">Newest Arrivals</option>
                      <option value="popularity" className="bg-vision-900">Popularity</option>
                      <option value="rating" className="bg-vision-900">Top Rated</option>
                      <option value="price_asc" className="bg-vision-900">Price: Low to High</option>
                      <option value="price_desc" className="bg-vision-900">Price: High to Low</option>
                  </select>
                  <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-hover:text-vision-primary transition-colors" />
              </div>
          </div>
      </div>

      {displayedItems.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-xl bg-white/5">
              <ShoppingBag className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Projects Found</h3>
              <p className="text-gray-400">
                  {activeTab === 'student' ? 'Check back later for limited-time free drops!' : 'New premium projects coming soon.'}
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
                            <div className="w-full h-full bg-vision-900 flex items-center justify-center text-gray-600">
                                <ShoppingBag size={32} />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                            {item.demo_url && (
                                <Button size="sm" variant="secondary" onClick={(e) => handlePreview(e, item.demo_url!)}>
                                    <Eye size={14} className="mr-2" /> Live Preview
                                </Button>
                            )}
                        </div>
                        
                        {/* Rating Badge */}
                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full border border-white/10 flex items-center gap-1 text-xs text-yellow-400">
                            <Star size={10} fill="currentColor" />
                            <span className="font-bold">{item.rating}</span>
                            <span className="text-gray-400">({item.review_count})</span>
                        </div>
                    </div>

                    <div className="p-6 flex flex-col flex-grow">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex flex-wrap gap-2 mb-2">
                                {item.tags.slice(0, 2).map(tag => (
                                    <span key={tag} className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-vision-primary/10 rounded text-vision-primary font-bold">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <h3 className="text-xl font-bold font-display text-white mb-1">{item.title}</h3>
                        <div className="flex items-center text-xs text-gray-500 mb-2">
                            <UserIcon size={12} className="mr-1" />
                            by <span className="text-gray-400 ml-1">{item.developer_name}</span>
                        </div>

                        <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-grow">{item.short_description}</p>
                        
                        {/* Free Timer */}
                        {activeTab === 'student' && item.free_until && (
                            <div className="mb-4 bg-green-500/10 border border-green-500/20 rounded p-2 flex items-center gap-2 text-xs text-green-400">
                                <Clock size={12} />
                                <span>Free until: {new Date(item.free_until).toLocaleDateString()}</span>
                            </div>
                        )}
                        
                        {/* Stats */}
                        <div className="flex justify-between items-center text-xs text-gray-500 border-t border-white/10 pt-4 mb-4">
                            <div className="flex items-center gap-1">
                                <TrendingUp size={14} />
                                <span>{item.views} interested</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Download size={14} />
                                <span>{item.purchases} sold</span>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between gap-4 mt-auto">
                            <div className="text-2xl font-bold text-white font-sora">
                                {activeTab === 'student' ? (
                                    <span className="text-green-400">FREE</span>
                                ) : (
                                    formatPrice(item.price, user?.country)
                                )}
                            </div>
                            {(!user || user.role === 'client') ? (
                                <Button onClick={() => handleBuy(item.id)} className={`flex-1 ${activeTab === 'student' ? 'bg-green-500 text-black hover:bg-green-400' : ''}`}>
                                    {activeTab === 'student' ? (
                                        <span className="flex items-center justify-center gap-2"><Download size={16}/> Download</span>
                                    ) : 'Buy Now'}
                                </Button>
                            ) : (
                                <div className="flex-1 py-2 text-center text-xs text-gray-500 border border-white/5 rounded-lg bg-white/5 uppercase tracking-wider">
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
