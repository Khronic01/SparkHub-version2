'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Settings, 
  PlusCircle, 
  ShoppingBag, 
  MessageSquare, 
  User, 
  Zap,
  CheckSquare,
  Activity
} from 'lucide-react';
import { useSocket } from '@/lib/useSocket';

const NavItem: React.FC<{ href: string; icon: React.ReactNode; label: string; active: boolean }> = ({ 
  href, icon, label, active 
}) => (
  <Link
    href={href}
    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
      active 
        ? 'bg-blue-50 text-blue-600 font-medium' 
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`}
  >
    {icon}
    <span>{label}</span>
  </Link>
);

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { isConnected } = useSocket();

  return (
    <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex-shrink-0 h-auto md:h-screen sticky top-0 overflow-y-auto z-20">
      <div className="p-6 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-2 text-blue-600 font-bold text-xl">
          <Zap className="w-6 h-6 fill-current" />
          <span>SparkHub</span>
        </Link>
      </div>

      <nav className="p-4 space-y-1">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3">Platform</div>
        <NavItem href="/" icon={<Home size={20} />} label="Dashboard" active={pathname === '/'} />
        <NavItem href="/feed" icon={<Activity size={20} />} label="My Feed" active={pathname === '/feed'} />
        <NavItem href="/marketplace" icon={<ShoppingBag size={20} />} label="Marketplace" active={pathname?.startsWith('/marketplace')} />
        <NavItem href="/messages" icon={<MessageSquare size={20} />} label="Messages" active={pathname?.startsWith('/messages')} />
        
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-6 mb-2 px-3">Management</div>
        <NavItem href="/ideas/create" icon={<PlusCircle size={20} />} label="New Idea" active={pathname === '/ideas/create'} />
        <NavItem href="/tasks" icon={<CheckSquare size={20} />} label="My Tasks" active={pathname === '/tasks' || (pathname?.startsWith('/tasks') && pathname !== '/tasks/create')} />
        
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-6 mb-2 px-3">Settings</div>
        <NavItem href="/profile" icon={<User size={20} />} label="Profile" active={pathname?.startsWith('/profile')} />
        <NavItem href="/admin" icon={<Settings size={20} />} label="Admin" active={pathname?.startsWith('/admin')} />
      </nav>

      <div className="p-4 mt-auto border-t border-slate-100">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <p className="text-xs text-slate-500 font-medium mb-1">Status</p>
              <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span className="text-xs text-slate-700">{isConnected ? 'Socket Connected' : 'Disconnected'}</span>
              </div>
          </div>
      </div>
    </aside>
  );
};