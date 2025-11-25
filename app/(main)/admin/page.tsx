'use client';

import React, { useEffect, useState } from 'react';
import { Shield, Activity, Users, Briefcase, DollarSign } from 'lucide-react';
import { AdminNav } from '@/components/AdminNav';

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => { setStats(data); setLoading(false); })
      .catch(e => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-8 h-8 text-indigo-600" />
        <h1 className="text-3xl font-bold text-slate-900">Admin Console</h1>
      </div>

      <AdminNav />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <span className="text-slate-500 text-sm font-medium">Total Users</span>
                <Users className="text-blue-500" size={20} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{loading ? '...' : stats?.totalUsers}</p>
        </div>
        {/* Other stats... */}
      </div>
    </div>
  );
}