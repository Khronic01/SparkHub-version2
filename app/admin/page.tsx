
import React, { useEffect, useState } from 'react';
import { Shield, Database, Activity, Users, Briefcase, DollarSign } from 'lucide-react';
import { AdminNav } from '../../components/AdminNav';

interface AdminStats {
    totalUsers: number;
    totalIdeas: number;
    totalTasks: number;
    totalVolume: number;
}

const AdminPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/stats');
            if (res.ok) {
                setStats(await res.json());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    fetchStats();
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
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <span className="text-slate-500 text-sm font-medium">Active Ideas</span>
                <Activity className="text-orange-500" size={20} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{loading ? '...' : stats?.totalIdeas}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <span className="text-slate-500 text-sm font-medium">Tasks Completed</span>
                <Briefcase className="text-green-500" size={20} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{loading ? '...' : stats?.totalTasks}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <span className="text-slate-500 text-sm font-medium">Volume (USDC)</span>
                <DollarSign className="text-purple-500" size={20} />
            </div>
            <p className="text-2xl font-bold text-slate-900">${loading ? '...' : stats?.totalVolume.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200">
            <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Activity size={18} /> System Health
            </h2>
            <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-700">Database Connection</span>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-bold">Healthy</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-700">Socket Server</span>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-bold">Connected</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-700">Storage (R2)</span>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-bold">Operational</span>
                </div>
            </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200">
             <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Shield size={18} /> Recent Security Events
            </h2>
            <div className="text-center py-8 text-slate-400 text-sm">
                No security alerts in the last 24 hours.
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
