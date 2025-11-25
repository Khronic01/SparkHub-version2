'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Bell, Check, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useSocket } from '@/lib/useSocket';
import Link from 'next/link';

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
        const fetchNotifications = async () => {
            try {
                const res = await fetch('/api/notifications');
                if (res.ok) setNotifications(await res.json());
            } catch (e) { console.error(e); }
        };
        fetchNotifications();
    }, [currentUserId]);

    useEffect(() => {
        setUnreadCount(notifications.filter(n => !n.read).length);
    }, [notifications]);

    // Socket logic omitted for brevity, assumes standard implementation

    const markAsRead = async (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        try { await fetch(`/api/notifications/${id}/read`, { method: 'POST' }); } catch (error) {}
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
                    <div className="p-3 border-b border-slate-100 bg-slate-50">
                        <h3 className="font-bold text-slate-700 text-sm">Notifications</h3>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                        {notifications.map(notif => (
                            <div key={notif.id} className={`p-3 hover:bg-slate-50 transition-colors flex gap-3 ${!notif.read ? 'bg-blue-50/30' : ''}`}>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-slate-800 mb-1">{notif.message}</p>
                                    {notif.link && (
                                        <Link 
                                            href={notif.link} 
                                            onClick={() => setIsOpen(false)}
                                            className="text-xs font-medium text-blue-600 hover:underline"
                                        >
                                            View
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};