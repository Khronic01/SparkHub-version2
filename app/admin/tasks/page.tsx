
import React from 'react';
import { Shield, AlertTriangle } from 'lucide-react';
import { AdminNav } from '../../../components/AdminNav';

const AdminTasksPage: React.FC = () => {
  return (
    <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
            <Shield className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-slate-900">Task Oversight</h1>
        </div>
        
        <AdminNav />

        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
            <AlertTriangle size={48} className="mx-auto text-slate-300 mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">No Tasks Require Intervention</h2>
            <p className="text-slate-500">All 142 active tasks are progressing normally.</p>
        </div>
    </div>
  );
};

export default AdminTasksPage;
