
import React, { useEffect, useState } from 'react';
import { Search, Filter, Plus, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MarketItem {
    id: string;
    title: string;
    description: string;
    price: number;
    previewImage: string | null;
    category: string;
    seller: {
        name: string;
        image: string;
    };
}

const MarketplacePage: React.FC = () => {
  const [items, setItems] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
      const fetchItems = async () => {
          try {
            const query = search ? `?search=${search}` : '';
            const res = await fetch(`/api/marketplace${query}`);
            if (res.ok) {
                const data = await res.json();
                setItems(data);
            }
          } catch(e) {
              console.error(e);
          } finally {
              setLoading(false);
          }
      };
      
      // Debounce search
      const timeout = setTimeout(fetchItems, 500);
      return () => clearTimeout(timeout);
  }, [search]);

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Marketplace</h1>
                <p className="text-slate-500 text-sm">Buy and sell digital assets, templates, and services.</p>
            </div>
            
            <Link to="/marketplace/new" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-colors">
                <Plus size={18} />
                <span>Sell Item</span>
            </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search templates, assets..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm"
                />
            </div>
            <button className="flex items-center justify-center gap-2 px-6 py-3 border border-slate-200 bg-white rounded-xl hover:bg-slate-50 text-slate-700 font-medium">
                <Filter size={18} />
                <span>Filter</span>
            </button>
        </div>

        {/* Grid */}
        {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1,2,3].map(i => (
                    <div key={i} className="h-80 bg-slate-100 rounded-xl animate-pulse"></div>
                ))}
            </div>
        ) : items.length === 0 ? (
             <div className="text-center py-16 text-slate-400">
                 <ShoppingCart size={48} className="mx-auto mb-4 opacity-20" />
                 <p className="text-lg font-medium">No items found</p>
                 <p className="text-sm">Try adjusting your search or list the first item!</p>
             </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                    <Link key={item.id} to={`/marketplace/${item.id}`} className="group bg-white rounded-xl border border-slate-200 hover:shadow-lg hover:border-blue-200 transition-all overflow-hidden flex flex-col">
                        <div className="h-48 bg-slate-100 relative overflow-hidden">
                            {item.previewImage ? (
                                <img 
                                    src={item.previewImage} 
                                    alt={item.title} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                                    <ShoppingCart size={32} />
                                </div>
                            )}
                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-slate-800 shadow-sm">
                                ${item.price.toFixed(2)}
                            </div>
                            <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur px-2 py-1 rounded text-xs font-bold text-white">
                                {item.category}
                            </div>
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                            <h3 className="font-bold text-lg text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                                {item.title}
                            </h3>
                            <p className="text-slate-500 text-sm line-clamp-2 mb-4 flex-1">
                                {item.description}
                            </p>
                            <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                                <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden">
                                    {item.seller.image && <img src={item.seller.image} className="w-full h-full object-cover"/>}
                                </div>
                                <span className="text-xs font-medium text-slate-500 truncate">
                                    by {item.seller.name || 'Anonymous'}
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        )}
    </div>
  );
};

export default MarketplacePage;
