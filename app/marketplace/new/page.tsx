
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Loader2, DollarSign } from 'lucide-react';
import { FileUploader } from '../../../components/FileUploader';

const MarketplaceNewPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
      title: '',
      description: '',
      price: '',
      category: 'Templates',
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [contentUrl, setContentUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!contentUrl) {
          alert("Please upload the content file.");
          return;
      }
      
      setIsLoading(true);
      try {
          const res = await fetch('/api/marketplace/create', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({
                  ...formData,
                  previewImage,
                  contentUrl
              })
          });
          
          if (res.ok) {
              navigate('/marketplace');
          } else {
              throw new Error('Failed to create');
          }
      } catch (e) {
          console.error(e);
          alert("Something went wrong");
      } finally {
          setIsLoading(false);
      }
  };

  return (
    <div className="max-w-2xl mx-auto pb-12 animate-fade-in">
        <button onClick={() => navigate('/marketplace')} className="flex items-center text-slate-500 hover:text-slate-900 mb-6 text-sm font-medium transition-colors">
            <ChevronLeft size={16} className="mr-1" />
            Back to Marketplace
        </button>
        
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="p-6 md:p-8 border-b border-slate-100">
                <h1 className="text-2xl font-bold text-slate-900">Sell an Item</h1>
                <p className="text-slate-500 mt-2">List your templates, assets, or services for sale.</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Item Name</label>
                    <input 
                        type="text" 
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="e.g. Ultimate Next.js Boilerplate"
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700">Price (USDC)</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                            <input 
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                value={formData.price}
                                onChange={(e) => setFormData({...formData, price: e.target.value})}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700">Category</label>
                        <select 
                            value={formData.category}
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        >
                            <option>Templates</option>
                            <option>UI Kits</option>
                            <option>Code Snippets</option>
                            <option>3D Assets</option>
                            <option>Audio</option>
                        </select>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Description</label>
                    <textarea 
                        required
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    />
                </div>

                <div className="space-y-4 pt-2">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Preview Image</label>
                        <FileUploader 
                            onUploadComplete={setPreviewImage} 
                            accept="image/*" 
                            label="Upload cover image"
                            initialUrl={previewImage || undefined}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Content File (Product)</label>
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <FileUploader 
                                onUploadComplete={setContentUrl} 
                                label="Upload zip, pdf, or code"
                                initialUrl={contentUrl || undefined}
                            />
                            <p className="text-xs text-blue-600 mt-2">This file will be securely stored and only accessible after purchase.</p>
                        </div>
                    </div>
                </div>

                <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50"
                >
                    {isLoading ? <Loader2 className="animate-spin mx-auto" /> : 'List Item for Sale'}
                </button>
            </form>
        </div>
    </div>
  );
};

export default MarketplaceNewPage;
