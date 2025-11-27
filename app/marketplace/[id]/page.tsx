
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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

const MarketplaceItemPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
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
          
          const data = await res.json();
          
          if(res.ok) {
              // Update local state to show purchased
              setItem(prev => prev ? ({
                  ...prev,
                  isPurchased: true,
                  contentUrl: data.downloadUrl
              }) : null);
              alert("Purchase successful!");
          } else {
              throw new Error(data.error || "Purchase failed");
          }
      } catch(e: any) {
          alert(e.message);
      } finally {
          setPurchasing(false);
      }
  };

  if(loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;
  if(!item) return <div className="p-8 text-center">Item not found</div>;

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-fade-in">
        <Link to="/marketplace" className="inline-flex items-center text-slate-500 hover:text-slate-900 mb-6 text-sm font-medium transition-colors">
            <ChevronLeft size={16} className="mr-1" />
            Back to Marketplace
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Image */}
            <div className="space-y-6">
                <div className="bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 aspect-square relative">
                    {item.previewImage ? (
                        <img src={item.previewImage} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">No Preview</div>
                    )}
                </div>
                
                <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                            {item.seller.image ? (
                                <img src={item.seller.image} alt={item.seller.name} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-full h-full p-2 text-slate-400" />
                            )}
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Seller</p>
                            <p className="font-bold text-slate-900">{item.seller.name || 'Anonymous'}</p>
                        </div>
                     </div>
                     <Link to={`/messages/new?user=${item.seller.id}`} className="text-blue-600 text-sm font-medium hover:underline">
                        Contact
                     </Link>
                </div>
            </div>

            {/* Right: Info */}
            <div className="space-y-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                         <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md font-medium uppercase tracking-wider">
                            {item.category}
                         </span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-4">{item.title}</h1>
                    <div className="text-3xl font-bold text-blue-600">${item.price.toFixed(2)}</div>
                </div>

                <div className="prose prose-slate">
                    <p>{item.description}</p>
                </div>

                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <ShieldCheck size={18} className="text-green-600" />
                        <span>Secure transaction via SparkHub Wallet</span>
                    </div>
                    
                    {item.isPurchased ? (
                        <div className="space-y-3">
                            <div className="bg-green-100 text-green-700 px-4 py-3 rounded-lg font-bold text-center">
                                You own this item
                            </div>
                            {item.contentUrl && (
                                <a 
                                    href={item.contentUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-all"
                                >
                                    <Download size={18} />
                                    <span>Download Content</span>
                                </a>
                            )}
                        </div>
                    ) : (
                        <button 
                            onClick={handleBuy}
                            disabled={purchasing}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 transition-all disabled:opacity-70 disabled:scale-95"
                        >
                            {purchasing ? 'Processing...' : 'Buy Now'}
                        </button>
                    )}
                    
                    <p className="text-xs text-center text-slate-400">
                        Instant delivery • 20% platform fee included in seller payout
                    </p>
                </div>
            </div>
        </div>
    </div>
  );
};

export default MarketplaceItemPage;
