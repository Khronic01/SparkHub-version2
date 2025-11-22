
import React, { useEffect, useState, useRef } from 'react';
import { Bell, Check, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useSocket } from '../lib/useSocket';
import { Link } from 'react-router-dom';

interface Notification {
    id: string;
    type: string;
    message: string;
    link?: string;
    read: boolean;
    createdAt: string;
}

interface NotificationBellProps {
    currentUserId: string | null;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ currentUserId }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { socket } = useSocket();

    useEffect(() => {
        if (!currentUserId) return;
        fetchNotifications();
        
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [currentUserId]);

    useEffect(() => {
        // Calculate unread
        setUnreadCount(notifications.filter(n => !n.read).length);
    }, [notifications]);

    useEffect(() => {
        if (!socket || !currentUserId) return;

        const handleNewNotification = (newNotif: Notification) => {
            setNotifications(prev => [newNotif, ...prev]);
            // Optional: Play sound
        };

        socket.on('notification:new', handleNewNotification);
        return () => {
            socket.off('notification:new', handleNewNotification);
        };
    }, [socket, currentUserId]);

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications');
            if (res.ok) {
                setNotifications(await res.json());
            }
        } catch (e) {
            console.error("Failed to fetch notifications", e);
        }
    };

    const markAsRead = async (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

        try {
            await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
        } catch (error) {
            console.error(error);
        }
    };

    const markAllRead = async () => {
        // Optimistic
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        
        // We would typically have a bulk read endpoint, 
        // but for this scaffold we'll just iterate locally or assume UI is enough for now
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'SUCCESS': return <CheckCircle size={16} className="text-green-500" />;
            case 'WARNING': return <AlertTriangle size={16} className="text-orange-500" />;
            case 'ERROR': return <XCircle size={16} className="text-red-500" />;
            default: return <Info size={16} className="text-blue-500" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full shadow-sm ring-2 ring-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-fade-in">
                    <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="font-bold text-slate-700 text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                            <button onClick={markAllRead} className="text-xs text-blue-600 hover:underline">
                                Mark all read
                            </button>
                        )}
                    </div>
                    
                    <div className="max-h-[300px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-sm">
                                No notifications
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {notifications.map(notif => (
                                    <div 
                                        key={notif.id} 
                                        className={`p-3 hover:bg-slate-50 transition-colors flex gap-3 ${!notif.read ? 'bg-blue-50/30' : ''}`}
                                    >
                                        <div className="mt-1 flex-shrink-0">
                                            {getIcon(notif.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-slate-800 mb-1">{notif.message}</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-slate-400">
                                                    {new Date(notif.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                                </span>
                                                <div className="flex gap-2">
                                                    {notif.link && (
                                                        <Link 
                                                            to={notif.link} 
                                                            onClick={() => {
                                                                setIsOpen(false);
                                                                markAsRead(notif.id);
                                                            }}
                                                            className="text-xs font-medium text-blue-600 hover:underline"
                                                        >
                                                            View
                                                        </Link>
                                                    )}
                                                    {!notif.read && (
                                                        <button 
                                                            onClick={(e) => markAsRead(notif.id, e)}
                                                            className="text-slate-400 hover:text-slate-600"
                                                            title="Mark as read"
                                                        >
                                                            <Check size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
