'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckSquare, Clock, ArrowRight, Briefcase, DollarSign } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  reward: number;
  deliveryDays: number;
  createdAt: string;
  idea: {
    id: string;
    title: string;
  };
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch('/api/tasks');
        if (res.ok) {
          const data = await res.json();
          setTasks(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <CheckSquare className="w-8 h-8 text-blue-600" />
        <div>
           <h1 className="text-2xl font-bold text-slate-900">My Tasks</h1>
           <p className="text-slate-500">Track and manage your assigned work.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-400">Loading your tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
          <Briefcase size={48} className="mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-bold text-slate-700 mb-2">No active tasks</h3>
          <p className="text-slate-500 mb-6">You haven't been assigned to any tasks yet.</p>
          <Link href="/marketplace" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
             Browse Opportunities
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map(task => (
            <Link 
              key={task.id} 
              href={`/tasks/${task.id}`}
              className="block bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                 <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                    task.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                    task.status === 'SUBMITTED' ? 'bg-purple-100 text-purple-700' :
                    task.status === 'ASSIGNED' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-600'
                }`}>
                    {task.status}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock size={12} />
                  {new Date(task.createdAt).toLocaleDateString()}
                </span>
              </div>

              <h3 className="font-bold text-lg text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                {task.title}
              </h3>
              
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                 <span className="text-slate-400">for</span>
                 <span className="font-medium text-slate-700 truncate">{task.idea.title}</span>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                 <div className="flex items-center gap-1 text-green-700 font-bold text-sm">
                    <DollarSign size={14} />
                    <span>{task.reward}</span>
                 </div>
                 <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}