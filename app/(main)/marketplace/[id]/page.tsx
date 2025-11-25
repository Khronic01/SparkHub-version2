'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Loader2, Download, ShieldCheck, User } from 'lucide-react';

interface ItemDetail {
    id: string;
    title: string;
    description: string;
    price: number;
    previewImage: string | null;
    category: string;
    contentUrl: string | null;
    isPurchased: boolean;
    seller: {
        id: string;
        name: string;
        image: string;
    }
}

export default function MarketplaceItemPage() {
  const params = useParams();
  const id = params?.id as string;
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
      const fetchItem = async () => {
          if(!id) return;
          try {
              const res = await fetch(`/api/marketplace/${id}`);
              if(res.ok) {
                  const data = await res.json();
                  setItem(data);
              }
          } catch(e) {
              console.error(e);
          } finally {
              setLoading(false);
          }
      };
      fetchItem();
  }, [id]);

  const handleBuy = async () => {
      if(!item) return;
      setPurchasing(true);
      try {
          const res = await fetch('/api/marketplace/buy', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({ itemId: item.id })
          });
          
          if(res.ok) {
              const data = await res.json();
              // Update state to show content
              setItem(prev => prev ? ({...prev, isPurchased: true, contentUrl: data.downloadUrl}) : null);
              alert("Purchase successful!");
          } else {
              const err = await res.json();
              alert(err.error || "Purchase failed");
          }
      } catch(e) {
          console.error(e);
          alert("Transaction failed");
      } finally {
          setPurchasing(false);
      }
  };

  if(loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;
  if(!item) return <div className="p-8 text-center">Item not found</div>;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-12">
        <Link href="/marketplace" className="flex items-center text-slate-500 hover:text-slate-900 mb-6 text-sm font-medium transition-colors">
            <ChevronLeft size={16} className="mr-1" />
            Back to Marketplace
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
                <div className="bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-sm aspect-video relative">
                    {item.previewImage ? (
                        <img src={item.previewImage} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">No Preview</div>
                    )}
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <span className="text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-3 py-1 rounded-full">{item.category}</span>
                    <h1 className="text-3xl font-bold text-slate-900 mt-3 mb-2">{item.title}</h1>
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <span>by</span>
                        <div className="flex items-center gap-1 font-medium text-slate-700">
                             {item.seller.image ? (
                                 <img src={item.seller.image} className="w-5 h-5 rounded-full" alt="Seller" />
                             ) : (
                                 <User size={16} />
                             )}
                             <span>{item.seller.name}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-end gap-2 mb-6">
                        <span className="text-3xl font-bold text-slate-900">${item.price}</span>
                        <span className="text-slate-500 mb-1">USDC</span>
                    </div>
                    
                    {item.isPurchased ? (
                        <div className="space-y-4">
                             <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center gap-3">
                                 <ShieldCheck size={24} />
                                 <span className="font-bold">You own this item</span>
                             </div>
                             <a 
                                href={item.contentUrl || '#'} 
                                target="_blank"
                                className="block w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-lg text-center transition-colors flex items-center justify-center gap-2"
                             >
                                <Download size={18} />
                                <span>Download Content</span>
                             </a>
                        </div>
                    ) : (
                        <button 
                            onClick={handleBuy}
                            disabled={purchasing}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {purchasing ? <Loader2 className="animate-spin" /> : 'Buy Now'}
                        </button>
                    )}
                </div>

                <div>
                    <h3 className="font-bold text-slate-900 mb-2">Description</h3>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{item.description}</p>
                </div>
            </div>
        </div>
    </div>
  );
}