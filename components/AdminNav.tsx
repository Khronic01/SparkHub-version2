
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Users, AlertTriangle, DollarSign, LayoutDashboard, Briefcase } from 'lucide-react';

export const AdminNav: React.FC = () => {
  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={18} />, end: true },
    { path: '/admin/users', label: 'Users', icon: <Users size={18} /> },
    { path: '/admin/tasks', label: 'Tasks', icon: <Briefcase size={18} /> },
    { path: '/admin/payments', label: 'Payments', icon: <DollarSign size={18} /> },
    { path: '/admin/disputes', label: 'Disputes', icon: <AlertTriangle size={18} /> },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.end}
          className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`
          }
        >
          {item.icon}
          <span>{item.label}</span>
        </NavLink>
      ))}
    </div>
  );
};
