'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Filter, Plus, ShoppingCart } from 'lucide-react';

interface MarketItem {
    id: string;
    title: string;
    description: string;
    price: number;
    previewImage: string | null;
    category: string;
    seller: { name: string; image: string; };
}

export default function MarketplacePage() {
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
      
      const timeout = setTimeout(fetchItems, 500);
      return () => clearTimeout(timeout);
  }, [search]);

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Marketplace</h1>
            </div>
            <Link href="/marketplace/new" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-colors">
                <Plus size={18} />
                <span>Sell Item</span>
            </Link>
        </div>

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
        </div>

        {loading ? (
            <div>Loading...</div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                    <Link key={item.id} href={`/marketplace/${item.id}`} className="group bg-white rounded-xl border border-slate-200 hover:shadow-lg hover:border-blue-200 transition-all overflow-hidden flex flex-col">
                        <div className="h-48 bg-slate-100 relative overflow-hidden">
                            {item.previewImage && <img src={item.previewImage} alt={item.title} className="w-full h-full object-cover" />}
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                            <h3 className="font-bold text-lg text-slate-900 mb-2">{item.title}</h3>
                            <p className="text-slate-500 text-sm line-clamp-2 mb-4">{item.description}</p>
                            <div className="font-bold text-blue-600">${item.price}</div>
                        </div>
                    </Link>
                ))}
            </div>
        )}
    </div>
  );
}