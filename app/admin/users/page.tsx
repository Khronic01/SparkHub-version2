
import React, { useEffect, useState } from 'react';
import { Search, MoreVertical, Shield, Ban, CheckCircle } from 'lucide-react';
import { AdminNav } from '../../../components/AdminNav';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    xp: number;
    createdAt: string;
}

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      fetchUsers();
  }, []);

  const fetchUsers = async () => {
      try {
          const res = await fetch('/api/admin/users');
          if(res.ok) setUsers(await res.json());
      } catch(e) {
          console.error(e);
      } finally {
          setLoading(false);
      }
  };

  const toggleRole = async (userId: string, currentRole: string) => {
      const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
      if(!confirm(`Change role to ${newRole}?`)) return;
      
      await fetch('/api/admin/users', {
          method: 'PUT',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ userId, role: newRole })
      });
      fetchUsers();
  };

  const filteredUsers = users.filter(u => 
      u.name?.toLowerCase().includes(search.toLowerCase()) || 
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
            <Shield className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
        </div>
        
        <AdminNav />

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                        type="text"
                        placeholder="Search users by name or email..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">XP</th>
                            <th className="px-6 py-4">Joined</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center">Loading...</td></tr>
                        ) : filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div>
                                        <div className="font-bold text-slate-900">{user.name || 'Unnamed'}</div>
                                        <div className="text-xs text-slate-500">{user.email}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-mono text-slate-600">{user.xp}</td>
                                <td className="px-6 py-4 text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-right">
                                    <button 
                                        onClick={() => toggleRole(user.id, user.role)}
                                        className="text-indigo-600 hover:underline text-xs font-medium mr-3"
                                    >
                                        {user.role === 'ADMIN' ? 'Demote' : 'Promote'}
                                    </button>
                                    <button className="text-red-600 hover:bg-red-50 p-1 rounded">
                                        <Ban size={16} />
                                    </button>
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

export default AdminUsersPage;
