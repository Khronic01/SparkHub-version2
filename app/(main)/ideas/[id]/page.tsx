'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ThumbsUp, MessageCircle, Share2, User, Calendar, Send, Loader2, Paperclip, Briefcase, Edit2, DollarSign, Clock, CheckCircle2 
} from 'lucide-react';
import { TaskCreator } from '@/components/TaskCreator';
import { useSocket } from '@/lib/useSocket';

// Interfaces remain same as original...
interface IdeaData {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  attachments: string[];
  createdAt: string;
  author: { id: string; name: string | null; image: string | null; };
  comments: any[];
  tasks: any[];
  _count: { likes: number; comments: number; };
  isLiked: boolean;
}

export default function IdeaDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  
  const [idea, setIdea] = useState<IdeaData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  
  const { socket, joinRoom, leaveRoom } = useSocket();

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/ideas/${id}`);
        if (!res.ok) throw new Error('Failed to fetch idea');
        const data = await res.json();
        setIdea(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    joinRoom(`idea:${id}`);
    
    // Socket handlers...
    return () => leaveRoom(`idea:${id}`);
  }, [id, joinRoom, leaveRoom]);

  if (isLoading) return <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto" /></div>;
  if (!idea) return <div>Idea not found</div>;

  return (
    <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="w-full h-64 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl relative overflow-hidden shadow-lg p-8 flex flex-col justify-end text-white">
             <div className="mb-2">
                <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">{idea.category}</span>
             </div>
             <h1 className="text-3xl font-bold">{idea.title}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <div className="bg-white p-6 rounded-xl border border-slate-200">
                    <p className="whitespace-pre-wrap text-slate-700">{idea.content}</p>
                </div>
                
                {/* Tasks */}
                <div className="bg-white p-6 rounded-xl border border-slate-200">
                    <h3 className="font-bold text-slate-900 mb-6">Tasks</h3>
                    <TaskCreator ideaId={idea.id} onTaskCreated={(t) => setIdea(prev => prev ? {...prev, tasks: [t, ...prev.tasks]} : null)} />
                    <div className="space-y-4 mt-6">
                        {idea.tasks.map(task => (
                            <Link href={`/tasks/${task.id}`} key={task.id} className="block border border-slate-200 rounded-xl p-4 hover:border-blue-300">
                                <h4 className="font-bold">{task.title}</h4>
                                <span className="text-sm text-slate-500">{task.status}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Sidebar Stats */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 h-fit">
                <div className="flex gap-3 mb-6">
                     <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold">Support</button>
                </div>
            </div>
        </div>
    </div>
  );
}