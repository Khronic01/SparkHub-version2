
import React, { useEffect, useState } from 'react';
import { Shield, AlertCircle, Check, X } from 'lucide-react';
import { AdminNav } from '../../../components/AdminNav';

interface Dispute {
    id: string;
    reason: string;
    status: string;
    createdAt: string;
    initiator: { name: string; email: string };
    task: { title: string; id: string };
}

const AdminDisputesPage: React.FC = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/disputes')
        .then(res => res.json())
        .then(data => setDisputes(data))
        .catch(e => console.error(e))
        .finally(() => setLoading(false));
  }, []);

  const handleResolve = async (id: string, resolution: string) => {
      if(!confirm(`Resolve as ${resolution}?`)) return;
      await fetch('/api/admin/disputes', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ disputeId: id, resolution })
      });
      // Refresh
      const res = await fetch('/api/admin/disputes');
      setDisputes(await res.json());
  };

  return (
    <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
            <Shield className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-slate-900">Dispute Resolution</h1>
        </div>
        
        <AdminNav />

        <div className="space-y-4">
            {loading ? (
                <div className="text-center py-10 text-slate-400">Loading disputes...</div>
            ) : disputes.length === 0 ? (
                <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-400">
                    <Check size={48} className="mx-auto mb-4 text-green-400" />
                    <h3 className="text-lg font-bold text-slate-700">All Clear</h3>
                    <p>No active disputes needing attention.</p>
                </div>
            ) : (
                disputes.map(dispute => (
                    <div key={dispute.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase">
                                    {dispute.status}
                                </span>
                                <span className="text-slate-400 text-sm">
                                    {new Date(dispute.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <h3 className="font-bold text-slate-900 text-lg mb-1">
                                {dispute.task.title}
                            </h3>
                            <p className="text-sm text-slate-500 mb-4">
                                Dispute initiated by <span className="font-semibold text-slate-700">{dispute.initiator.name}</span>
                            </p>
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-slate-700">
                                <p className="text-sm font-bold mb-1">Reason:</p>
                                {dispute.reason}
                            </div>
                        </div>
                        <div className="flex flex-col justify-center gap-2 min-w-[200px]">
                            <button 
                                onClick={() => handleResolve(dispute.id, 'REFUND_PAYER')}
                                className="w-full py-2 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-medium text-sm transition-colors"
                            >
                                Refund Payer
                            </button>
                            <button 
                                onClick={() => handleResolve(dispute.id, 'RELEASE_CONTRIBUTOR')}
                                className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition-colors"
                            >
                                Release to Contributor
                            </button>
                            <button 
                                onClick={() => handleResolve(dispute.id, 'DISMISS')}
                                className="w-full py-2 px-4 text-slate-400 hover:text-slate-600 text-sm"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
  );
};

export default AdminDisputesPage;
