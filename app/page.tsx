import React from 'react';
import { Link } from 'react-router-dom';
import { Lightbulb, TrendingUp, Users, ArrowRight } from 'lucide-react';

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; change: string }> = ({ 
  title, value, icon, change 
}) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <span className="text-slate-500 text-sm font-medium">{title}</span>
      <div className="text-blue-600 bg-blue-50 p-2 rounded-lg">
        {icon}
      </div>
    </div>
    <div className="flex items-end justify-between">
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        <span className="text-emerald-600 text-xs font-medium bg-emerald-50 px-2 py-1 rounded-full">{change}</span>
    </div>
  </div>
);

const HomePage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Welcome back, Alex</h1>
        <p className="text-slate-500 mt-1">Here's what's happening in your workspace today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Active Ideas" 
          value="12" 
          icon={<Lightbulb size={20} />}
          change="+3 this week"
        />
        <StatCard 
          title="Project Revenue" 
          value="$24,500" 
          icon={<TrendingUp size={20} />}
          change="+12% vs last month"
        />
        <StatCard 
          title="Collaborators" 
          value="48" 
          icon={<Users size={20} />}
          change="+5 new"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="font-bold text-slate-900">Recent Ideas</h2>
                <Link to="/marketplace" className="text-sm text-blue-600 font-medium hover:underline">View all</Link>
            </div>
            <div className="divide-y divide-slate-100">
                {[1, 2, 3].map((i) => (
                    <Link key={i} to={`/ideas/${i}`} className="block p-6 hover:bg-slate-50 transition-colors group">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                                    AI-Powered Task Scheduler
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">Automating daily workflows with generative models.</p>
                            </div>
                            <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-600" />
                        </div>
                    </Link>
                ))}
            </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="font-bold text-slate-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
                <Link to="/ideas/create" className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-slate-600 hover:text-blue-600">
                    <Lightbulb className="mb-2" />
                    <span className="font-medium">Post Idea</span>
                </Link>
                <Link to="/messages" className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-slate-600 hover:text-purple-600">
                    <Users className="mb-2" />
                    <span className="font-medium">Find Talent</span>
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;