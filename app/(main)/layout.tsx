'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { NotificationBell } from '@/components/NotificationBell';
import { useSocket } from '@/lib/useSocket';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { joinRoom } = useSocket();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  useEffect(() => {
    // Fetch current user info for header and socket initialization
    fetch('/api/auth/me')
        .then(res => {
            if(res.ok) return res.json();
            return null;
        })
        .then(data => {
            if(data) {
                setCurrentUserId(data.id);
                setUserAvatar(data.image);
                // Join personal room for notifications
                joinRoom(`user:${data.id}`);
            }
        })
        .catch(err => console.error(err));
  }, [joinRoom]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      <Sidebar />
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 flex-shrink-0">
             {/* Search Bar */}
             <div className="relative w-full max-w-md hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search for ideas, tasks, or people..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
             </div>

             <div className="flex items-center gap-4 ml-auto">
                 <NotificationBell currentUserId={currentUserId} />
                 
                 <Link href="/profile" className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border border-slate-200 hover:ring-2 hover:ring-blue-500 transition-all">
                    {userAvatar ? (
                        <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-300 text-slate-600 font-bold text-xs">
                            ME
                        </div>
                    )}
                 </Link>
             </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
                {children}
            </div>
        </div>
      </main>
    </div>
  );
}