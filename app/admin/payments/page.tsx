
import React, { useEffect, useState } from 'react';
import { Shield, DollarSign, ArrowDownLeft, ArrowUpRight, Lock } from 'lucide-react';
import { AdminNav } from '../../../components/AdminNav';

interface Transaction {
    id: string;
    amount: number;
    type: string;
    status: string;
    description: string;
    createdAt: string;
    wallet: {
        user: {
            email: string;
        }
    }
}

const AdminPaymentsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      fetch('/api/admin/transactions')
        .then(res => res.json())
        .then(data => setTransactions(data))
        .catch(e => console.error(e))
        .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
            <Shield className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-slate-900">Financial Oversight</h1>
        </div>
        
        <AdminNav />

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="p-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-900">Recent Transactions</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Description</th>
                            <th className="px-6 py-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                             <tr><td colSpan={6} className="px-6 py-8 text-center">Loading...</td></tr>
                        ) : transactions.map(tx => (
                            <tr key={tx.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-mono text-xs text-slate-500">{tx.id.substring(0,8)}...</td>
                                <td className="px-6 py-4">
                                    <span className={`flex items-center gap-1 font-bold text-xs ${
                                        tx.type === 'DEPOSIT' ? 'text-green-600' :
                                        tx.type === 'WITHDRAWAL' ? 'text-red-600' :
                                        tx.type === 'ESCROW_LOCK' ? 'text-blue-600' : 'text-slate-600'
                                    }`}>
                                        {tx.type === 'DEPOSIT' && <ArrowDownLeft size={14} />}
                                        {tx.type === 'WITHDRAWAL' && <ArrowUpRight size={14} />}
                                        {tx.type === 'ESCROW_LOCK' && <Lock size={14} />}
                                        {tx.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-600">{tx.wallet.user.email}</td>
                                <td className="px-6 py-4 font-mono font-bold text-slate-900">${tx.amount.toFixed(2)}</td>
                                <td className="px-6 py-4 text-slate-500 truncate max-w-xs">{tx.description}</td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100">
                                        {tx.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default AdminPaymentsPage;
