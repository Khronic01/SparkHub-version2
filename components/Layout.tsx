
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Settings, 
  PlusCircle, 
  ShoppingBag, 
  MessageSquare, 
  User, 
  Zap,
  CheckSquare,
  Search,
  Activity
} from 'lucide-react';
import { useSocket } from '../lib/useSocket';
import { NotificationBell } from './NotificationBell';

interface LayoutProps {
  children: React.ReactNode;
}

const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string; active: boolean }> = ({ 
  to, icon, label, active 
}) => (
  <Link
    to={to}
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

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const p = location.pathname;
  const { isConnected, socket, joinRoom } = useSocket();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  useEffect(() => {
      // Fetch current user info for header and socket
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
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex-shrink-0 h-auto md:h-screen sticky top-0 overflow-y-auto z-20">
        <div className="p-6 border-b border-slate-100">
          <Link to="/" className="flex items-center gap-2 text-blue-600 font-bold text-xl">
            <Zap className="w-6 h-6 fill-current" />
            <span>SparkHub</span>
          </Link>
        </div>

        <nav className="p-4 space-y-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3">Platform</div>
          <NavItem to="/" icon={<Home size={20} />} label="Dashboard" active={p === '/'} />
          <NavItem to="/feed" icon={<Activity size={20} />} label="My Feed" active={p === '/feed'} />
          <NavItem to="/marketplace" icon={<ShoppingBag size={20} />} label="Marketplace" active={p.startsWith('/marketplace')} />
          <NavItem to="/messages" icon={<MessageSquare size={20} />} label="Messages" active={p.startsWith('/messages')} />
          
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-6 mb-2 px-3">Management</div>
          <NavItem to="/ideas/create" icon={<PlusCircle size={20} />} label="New Idea" active={p === '/ideas/create'} />
          <NavItem to="/tasks/1" icon={<CheckSquare size={20} />} label="My Tasks" active={p.startsWith('/tasks')} />
          
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-6 mb-2 px-3">Settings</div>
          <NavItem to="/profile" icon={<User size={20} />} label="Profile" active={p.startsWith('/profile')} />
          <NavItem to="/admin" icon={<Settings size={20} />} label="Admin" active={p.startsWith('/admin')} />
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
                 
                 <Link to="/profile" className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border border-slate-200 hover:ring-2 hover:ring-blue-500 transition-all">
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
};
