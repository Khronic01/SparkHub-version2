import React, { useEffect, useState } from 'react';
import { Mail, MapPin, Link as LinkIcon, Github, Linkedin, Trophy, Award, Flame, Star } from 'lucide-react';
import { Loader2 } from 'lucide-react';

interface Badge {
    id: string;
    code: string;
    name: string;
    description: string;
    icon: string;
}

interface UserStats {
    xp: number;
    level: number;
    nextLevelProgress: number;
    completedTasks: number;
    badges: Badge[];
    streak: number;
}

const ProfilePage: React.FC = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Mock User Data for basic profile info
  const user = {
      name: 'Alex Mercer',
      role: 'Senior Full Stack Engineer',
      location: 'San Francisco, CA',
      email: 'alex@example.com',
      website: 'alexmercer.dev',
      avatar: 'https://picsum.photos/seed/user1/200'
  };

  useEffect(() => {
    const fetchStats = async () => {
        try {
            // Fetch "me" first to get ID, then fetch stats
            const meRes = await fetch('/api/auth/me');
            if (!meRes.ok) return;
            const meData = await meRes.json();
            
            const statsRes = await fetch(`/api/users/${meData.id}/stats`);
            if (statsRes.ok) {
                const data = await statsRes.json();
                setStats(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    fetchStats();
  }, []);

  const renderIcon = (iconName: string) => {
      switch(iconName) {
          case 'Hammer': return <div className="bg-blue-100 p-2 rounded-full text-blue-600"><Award size={20} /></div>;
          case 'TrendingUp': return <div className="bg-green-100 p-2 rounded-full text-green-600"><Trophy size={20} /></div>;
          case 'Flame': return <div className="bg-orange-100 p-2 rounded-full text-orange-600"><Flame size={20} /></div>;
          case 'MessageCircle': return <div className="bg-purple-100 p-2 rounded-full text-purple-600"><Star size={20} /></div>;
          default: return <div className="bg-slate-100 p-2 rounded-full text-slate-600"><Award size={20} /></div>;
      }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
        {/* Profile Header */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
            <div className="h-32 bg-slate-800"></div>
            <div className="px-8 pb-8">
                <div className="relative flex justify-between items-end -mt-12 mb-6">
                    <div className="w-24 h-24 rounded-full bg-white p-1">
                         <div className="w-full h-full rounded-full bg-slate-300 overflow-hidden">
                             <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                         </div>
                    </div>
                    <button className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 text-slate-700 transition-colors">
                        Edit Profile
                    </button>
                </div>

                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        {user.name}
                        {stats && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full font-bold border border-yellow-200">
                                Lvl {stats.level}
                            </span>
                        )}
                    </h1>
                    <p className="text-slate-500">{user.role}</p>
                    
                    <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                            <MapPin size={16} />
                            <span>{user.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Mail size={16} />
                            <span>{user.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <LinkIcon size={16} />
                            <a href="#" className="hover:underline">{user.website}</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
                {/* Stats Card */}
                <div className="bg-white p-6 rounded-xl border border-slate-200">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Trophy size={18} className="text-yellow-500" />
                        <span>Progress</span>
                    </h3>
                    
                    {loading ? <Loader2 className="animate-spin mx-auto text-slate-400" /> : stats ? (
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-slate-700">Level {stats.level}</span>
                                    <span className="text-slate-500">{stats.nextLevelProgress}/100 XP</span>
                                </div>
                                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                                    <div 
                                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full transition-all duration-1000"
                                        style={{ width: `${stats.nextLevelProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <div className="bg-slate-50 p-3 rounded-lg text-center">
                                    <div className="text-xl font-bold text-slate-900">{stats.xp}</div>
                                    <div className="text-xs text-slate-500 uppercase tracking-wide">Total XP</div>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-lg text-center">
                                    <div className="text-xl font-bold text-slate-900">{stats.completedTasks}</div>
                                    <div className="text-xs text-slate-500 uppercase tracking-wide">Tasks Done</div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-slate-500 text-sm">Stats unavailable</p>
                    )}
                </div>
                
                {/* Skills */}
                <div className="bg-white p-6 rounded-xl border border-slate-200">
                    <h3 className="font-bold text-slate-900 mb-4">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                        {['React', 'TypeScript', 'Node.js', 'Next.js', 'PostgreSQL', 'TailwindCSS'].map(skill => (
                            <span key={skill} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Socials */}
                <div className="bg-white p-6 rounded-xl border border-slate-200">
                    <h3 className="font-bold text-slate-900 mb-4">Socials</h3>
                    <div className="space-y-3">
                        <a href="#" className="flex items-center gap-3 text-slate-600 hover:text-slate-900">
                            <Github size={20} />
                            <span>@alexmercer</span>
                        </a>
                        <a href="#" className="flex items-center gap-3 text-slate-600 hover:text-blue-700">
                            <Linkedin size={20} />
                            <span>in/alexmercer</span>
                        </a>
                    </div>
                </div>
            </div>

            {/* Main Column */}
            <div className="md:col-span-2 space-y-6">
                 {/* Badges Showcase */}
                 <div className="bg-white p-6 rounded-xl border border-slate-200">
                    <h3 className="font-bold text-slate-900 mb-4">Badges & Achievements</h3>
                    {loading ? <Loader2 className="animate-spin mx-auto text-slate-400" /> : (
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {stats && stats.badges.length > 0 ? stats.badges.map(badge => (
                                <div key={badge.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    {renderIcon(badge.icon)}
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-sm">{badge.name}</h4>
                                        <p className="text-xs text-slate-500">{badge.description}</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-2 text-center py-6 text-slate-400 text-sm">
                                    <p>No badges earned yet. Start creating ideas!</p>
                                </div>
                            )}
                            {/* Placeholder locked badge */}
                            <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 opacity-50 grayscale">
                                <div className="bg-slate-100 p-2 rounded-full text-slate-400"><Trophy size={20} /></div>
                                <div>
                                    <h4 className="font-bold text-slate-700 text-sm">High Roller</h4>
                                    <p className="text-xs text-slate-500">Earn over 1000 USDC</p>
                                </div>
                            </div>
                         </div>
                    )}
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200">
                    <h3 className="font-bold text-slate-900 mb-4">About</h3>
                    <p className="text-slate-600 leading-relaxed">
                        I am a passionate developer with over 5 years of experience building scalable web applications. 
                        I love working with modern tech stacks like the T3 stack. Currently looking for interesting projects 
                        in the CleanTech space.
                    </p>
                </div>
            </div>
        </div>
    </div>
  );
};

export default ProfilePage;
