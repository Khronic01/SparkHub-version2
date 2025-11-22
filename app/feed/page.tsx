
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, MessageCircle, Lightbulb, Briefcase, UserPlus, User, Calendar } from 'lucide-react';

interface FeedItem {
    type: 'IDEA_CREATE' | 'TASK_CREATE' | 'COMMENT';
    id: string;
    date: string;
    actor: { name: string; image: string | null };
    content: string;
    subContent?: string;
    link: string;
    meta?: string;
}

const FeedPage: React.FC = () => {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const fetchFeed = async () => {
          try {
              const res = await fetch('/api/feed');
              if(res.ok) {
                  const data = await res.json();
                  setFeed(data);
              }
          } catch(e) {
              console.error(e);
          } finally {
              setLoading(false);
          }
      };
      fetchFeed();
  }, []);

  const renderIcon = (type: string) => {
      switch(type) {
          case 'IDEA_CREATE': return <div className="bg-blue-100 p-2 rounded-full text-blue-600"><Lightbulb size={16} /></div>;
          case 'TASK_CREATE': return <div className="bg-green-100 p-2 rounded-full text-green-600"><Briefcase size={16} /></div>;
          case 'COMMENT': return <div className="bg-purple-100 p-2 rounded-full text-purple-600"><MessageCircle size={16} /></div>;
          default: return <div className="bg-slate-100 p-2 rounded-full text-slate-600"><Activity size={16} /></div>;
      }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
        <div className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                    <Activity className="text-blue-600" />
                    Activity Feed
                </h1>
                <p className="text-slate-500 mt-1">Updates from people you follow and ideas you support.</p>
            </div>
            <Link to="/marketplace" className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                Find People
            </Link>
        </div>

        <div className="space-y-6">
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-slate-400">Loading updates...</p>
                </div>
            ) : feed.length === 0 ? (
                <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
                    <UserPlus size={48} className="mx-auto mb-4 text-slate-300" />
                    <h3 className="text-lg font-bold text-slate-700 mb-2">Your feed is empty</h3>
                    <p className="text-slate-500 mb-6">Follow creators or like ideas to see updates here.</p>
                    <div className="flex justify-center gap-4">
                        <Link to="/marketplace" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Explore Ideas</Link>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
                    {feed.map((item, idx) => (
                        <div key={`${item.type}-${item.id}-${idx}`} className="p-6 hover:bg-slate-50 transition-colors">
                            <div className="flex gap-4">
                                <div className="flex-shrink-0">
                                    {item.actor.image ? (
                                        <img src={item.actor.image} alt="Actor" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                                            <User size={20} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-1">
                                        <div className="text-sm text-slate-900">
                                            <span className="font-bold mr-1">{item.actor.name}</span>
                                            <span className="text-slate-600">{item.content}</span>
                                        </div>
                                        <span className="text-xs text-slate-400 flex-shrink-0 flex items-center gap-1">
                                            <Calendar size={12} />
                                            {new Date(item.date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    
                                    {item.subContent && (
                                        <div className="mt-2 p-3 bg-slate-50 rounded-lg text-sm text-slate-600 italic border border-slate-100">
                                            "{item.subContent}"
                                        </div>
                                    )}

                                    <div className="mt-3 flex items-center gap-4">
                                        <Link to={item.link} className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1">
                                            View Details
                                        </Link>
                                        {item.meta && (
                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded font-medium">
                                                {item.meta}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex-shrink-0 self-center ml-2 hidden sm:block">
                                     {renderIcon(item.type)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
};

export default FeedPage;
