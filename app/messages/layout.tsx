'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Plus, MessageSquare } from 'lucide-react';

interface Conversation {
  id: string;
  name: string; // Group name or Other User Name
  lastMessage: string;
  updatedAt: string;
  avatar?: string;
}

const MessagesLayout = ({ children }: { children: React.ReactNode }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const pathname = usePathname();
  const isDetailView = pathname !== '/messages' && pathname !== '/messages/';

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch('/api/conversations');
        if (res.ok) {
          const data = await res.json();
          setConversations(data);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchConversations();
  }, []);

  return (
    <div className="h-[calc(100vh-2rem)] flex bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Sidebar List - Hidden on mobile if viewing a conversation */}
      <div className={`w-full md:w-80 lg:w-96 flex flex-col border-r border-slate-200 ${isDetailView ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-200">
           <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Messages</h2>
              <button className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                 <Plus size={20} />
              </button>
           </div>
           <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
           </div>
        </div>

        <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                    <MessageSquare size={32} className="mx-auto mb-2 opacity-20" />
                    <p className="text-sm">No conversations yet.</p>
                </div>
            ) : (
                <div className="divide-y divide-slate-50">
                    {conversations.map(conv => {
                        const isActive = pathname === `/messages/${conv.id}`;
                        return (
                        <Link 
                            key={conv.id} 
                            href={`/messages/${conv.id}`}
                            className={`flex items-center gap-3 p-4 transition-colors hover:bg-slate-50 ${isActive ? 'bg-blue-50 border-l-4 border-blue-600' : 'border-l-4 border-transparent'}`}
                        >
                            <div className="w-12 h-12 rounded-full bg-slate-200 flex-shrink-0 overflow-hidden">
                                {conv.avatar ? (
                                    <img src={conv.avatar} alt={conv.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-300 text-slate-600 font-bold">
                                        {conv.name.substring(0, 2).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className="font-bold text-slate-900 truncate text-sm">{conv.name}</h4>
                                    <span className="text-[10px] text-slate-400 flex-shrink-0">
                                        {new Date(conv.updatedAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 truncate">{conv.lastMessage || 'No messages'}</p>
                            </div>
                        </Link>
                    )})}
                </div>
            )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col ${!isDetailView ? 'hidden md:flex' : 'flex'}`}>
         {children}
      </div>
    </div>
  );
};

export default MessagesLayout;