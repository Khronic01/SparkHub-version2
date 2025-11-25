'use client';

import React, { useEffect, useState } from 'react';
import { User, Trophy, Star, Activity, Award } from 'lucide-react';

interface Badge {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
}

interface UserStats {
  xp: number;
  level: number;
  nextLevelProgress: number;
  completedTasks: number;
  badges: Badge[];
  streak: number;
}

export default function ProfilePage() {
  // In a real app, you would get the ID from the session or params
  // Here we assume we are viewing "me" via a special endpoint logic or just fetching "current"
  const [stats, setStats] = useState<UserStats | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Get Me
        const userRes = await fetch('/api/auth/me');
        if (!userRes.ok) return;
        const userData = await userRes.json();
        setUser(userData);

        // 2. Get Stats
        const statsRes = await fetch(`/api/users/${userData.id}/stats`);
        if (statsRes.ok) {
            setStats(await statsRes.json());
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading profile...</div>;
  if (!user) return <div className="p-8 text-center">User not found.</div>;

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-6 mb-8">
             <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                {user.image ? (
                    <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                    <User size={40} className="text-slate-400" />
                )}
             </div>
             <div className="text-center md:text-left flex-1">
                 <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
                 <p className="text-slate-500">{user.email}</p>
                 <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3">
                     <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wide">
                        Level {stats?.level || 1}
                     </span>
                     <div className="flex items-center gap-1 text-orange-500 text-sm font-medium bg-orange-50 px-3 py-1 rounded-full">
                         <Activity size={14} />
                         <span>{stats?.streak || 0} Day Streak</span>
                     </div>
                 </div>
             </div>
             
             {/* Level Progress */}
             <div className="w-full md:w-64 bg-slate-50 p-4 rounded-xl border border-slate-100">
                 <div className="flex justify-between text-xs mb-2 font-bold text-slate-500">
                     <span>XP</span>
                     <span>{stats?.nextLevelProgress || 0} / 100</span>
                 </div>
                 <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                     <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600" 
                        style={{ width: `${stats?.nextLevelProgress || 0}%` }}
                     ></div>
                 </div>
                 <p className="text-xs text-slate-400 mt-2 text-center">
                    {100 - (stats?.nextLevelProgress || 0)} XP to next level
                 </p>
             </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Stats */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Trophy className="text-yellow-500" size={20} />
                    Achievements
                </h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl text-center">
                        <div className="text-2xl font-bold text-slate-900">{stats?.xp || 0}</div>
                        <div className="text-xs text-slate-500 uppercase font-bold mt-1">Total XP</div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl text-center">
                        <div className="text-2xl font-bold text-slate-900">{stats?.completedTasks || 0}</div>
                        <div className="text-xs text-slate-500 uppercase font-bold mt-1">Tasks Done</div>
                    </div>
                </div>
            </div>

            {/* Badges */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                 <h2 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Award className="text-purple-500" size={20} />
                    Badges ({stats?.badges.length || 0})
                </h2>
                
                {stats && stats.badges.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                        {stats.badges.map(badge => (
                            <div key={badge.id} className="flex flex-col items-center text-center group">
                                <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center text-orange-500 mb-2 border border-orange-200 group-hover:scale-110 transition-transform">
                                    <Star size={20} className="fill-current" />
                                </div>
                                <span className="text-xs font-medium text-slate-700">{badge.name}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-slate-400 text-sm">
                        No badges earned yet. Start completing tasks!
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}