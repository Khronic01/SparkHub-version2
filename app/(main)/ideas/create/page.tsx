'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Sparkles, X, CheckCircle, AlertCircle } from 'lucide-react';
import { FileUploader } from '@/components/FileUploader';

export default function CreateIdeaPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Technology',
    description: '',
    tags: '',
  });

  const [attachments, setAttachments] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (url: string) => {
    setAttachments(prev => [...prev, url]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ideas/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            ...formData,
            attachments
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create idea');
      }

      setSuccess(true);
      
      // Redirect after delay
      setTimeout(() => {
        router.push(`/ideas/${data.ideaId}`);
      }, 2000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <Link href="/" className="flex items-center text-slate-500 hover:text-slate-900 mb-6 text-sm font-medium transition-colors">
        <ChevronLeft size={16} className="mr-1" />
        Back to Dashboard
      </Link>

      {success && (
         <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-700 animate-fade-in">
            <CheckCircle size={20} />
            <div>
                <p className="font-bold">Idea Launched Successfully!</p>
                <p className="text-sm">Redirecting you to your new idea...</p>
            </div>
         </div>
      )}

      {error && (
         <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700 animate-fade-in">
            <AlertCircle size={20} />
            <p>{error}</p>
         </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-slate-100">
            <h1 className="text-2xl font-bold text-slate-900">Create a New Spark</h1>
            <p className="text-slate-500 mt-2">Share your innovative idea with the community to find collaborators and funding.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            {/* Form Fields Same as Original */}
            <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Title <span className="text-red-500">*</span></label>
                <input 
                    type="text" 
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Sustainable Urban Vertical Gardens"
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    required
                />
            </div>

             <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Category <span className="text-red-500">*</span></label>
                <select 
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                >
                    <option value="Technology">Technology</option>
                    <option value="Sustainability">Sustainability</option>
                    <option value="Education">Education</option>
                    <option value="Art & Design">Art & Design</option>
                    <option value="Finance">Finance</option>
                    <option value="Health">Health</option>
                    <option value="Community">Community</option>
                </select>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Description <span className="text-red-500">*</span></label>
                <textarea 
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={6}
                    placeholder="Describe your idea in detail. What problem does it solve? Who is it for?"
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                    required
                ></textarea>
                <p className="text-xs text-slate-500 text-right">{formData.description.length} characters</p>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Tags</label>
                <input 
                    type="text" 
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="e.g. blockchain, react, climate-change (comma separated)"
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Attachments</label>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
                    <FileUploader 
                        onUploadComplete={handleFileUpload}
                        label="Upload images or documents"
                    />
                    
                    {attachments.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Attached Files</p>
                            {attachments.map((url, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-white p-3 rounded border border-slate-200 text-sm">
                                    <span className="truncate max-w-[200px] md:max-w-md text-slate-600">{url}</span>
                                    <button 
                                        type="button" 
                                        onClick={() => removeAttachment(idx)}
                                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="pt-4">
                <button 
                    type="submit" 
                    disabled={isLoading || success}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <span>Publishing...</span>
                    ) : success ? (
                        <span>Launched!</span>
                    ) : (
                        <>
                            <Sparkles size={18} />
                            <span>Launch Idea</span>
                        </>
                    )}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}