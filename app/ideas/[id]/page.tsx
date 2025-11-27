
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ThumbsUp, 
  MessageCircle, 
  Share2, 
  User, 
  Calendar, 
  Send,
  Loader2,
  Paperclip,
  Briefcase,
  CheckCircle2,
  Clock,
  DollarSign,
  Edit2
} from 'lucide-react';
import { TaskCreator } from '../../../components/TaskCreator';
import { useSocket } from '../../../lib/useSocket';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface Task {
    id: string;
    title: string;
    description: string;
    status: string;
    reward: number;
    deliveryDays: number;
    skill: string | null;
    assignee: {
        name: string | null;
        image: string | null;
    } | null;
}

interface IdeaData {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  attachments: string[];
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
  comments: Comment[];
  tasks: Task[];
  _count: {
    likes: number;
    comments: number;
  };
  isLiked: boolean;
}

const IdeaDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [idea, setIdea] = useState<IdeaData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Interaction states
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  // Edit states
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskData, setEditTaskData] = useState<{reward: string, deliveryDays: string}>({ reward: '', deliveryDays: '' });

  // Socket
  const { socket, joinRoom, leaveRoom } = useSocket();

  const fetchData = async () => {
    if (!id) return;
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

  useEffect(() => {
    fetchData();
  }, [id]);

  // Setup Socket Listeners
  useEffect(() => {
    if (!id) return;

    joinRoom(`idea:${id}`);

    const handleRemoteComment = (newComment: Comment) => {
        // Check if we already have it (to avoid duplicate from self if optimistic UI was used)
        // Since we only append after API success locally, duplicates are possible if we listen to own events.
        // For this implementation, we will filter by ID or rely on the fact that local append happens before remote broadcast arrives?
        // Actually, simple way: append if ID not in list.
        setIdea(prev => {
            if (!prev) return null;
            if (prev.comments.find(c => c.id === newComment.id)) return prev;
            return {
                ...prev,
                comments: [newComment, ...prev.comments],
                _count: { ...prev._count, comments: prev._count.comments + 1 }
            };
        });
    };

    const handleRemoteLike = (data: { likesCount: number }) => {
        setIdea(prev => prev ? ({
            ...prev,
            _count: { ...prev._count, likes: data.likesCount }
        }) : null);
    };

    socket?.on('idea:comment', handleRemoteComment);
    socket?.on('idea:liked', handleRemoteLike);

    return () => {
        leaveRoom(`idea:${id}`);
        socket?.off('idea:comment', handleRemoteComment);
        socket?.off('idea:liked', handleRemoteLike);
    };
  }, [id, socket, joinRoom, leaveRoom]);


  const handleLike = async () => {
    if (!idea || isLiking) return;
    
    const previousIdea = { ...idea };
    const newIsLiked = !idea.isLiked;
    const newCount = newIsLiked 
      ? idea._count.likes + 1 
      : Math.max(0, idea._count.likes - 1);

    setIdea({
      ...idea,
      isLiked: newIsLiked,
      _count: { ...idea._count, likes: newCount }
    });

    setIsLiking(true);
    try {
      const res = await fetch(`/api/ideas/${id}/like`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to like');
      
      const data = await res.json();
      
      // Notify others
      socket?.emit('idea:event', { 
          ideaId: id, 
          action: 'liked', 
          payload: { likesCount: data.likesCount } 
      });

      setIdea(prev => prev ? ({
        ...prev,
        isLiked: data.isLiked,
        _count: { ...prev._count, likes: data.likesCount }
      }) : null);
    } catch (err) {
      setIdea(previousIdea);
      console.error(err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !idea) return;

    setIsSubmittingComment(true);
    try {
      const res = await fetch(`/api/ideas/${id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentText }),
      });

      if (!res.ok) throw new Error('Failed to post comment');
      
      const newComment = await res.json();
      
      setIdea(prev => prev ? ({
        ...prev,
        comments: [newComment, ...prev.comments],
        _count: { ...prev._count, comments: prev._count.comments + 1 }
      }) : null);

      // Notify others
      socket?.emit('idea:event', {
          ideaId: id,
          action: 'comment',
          payload: newComment
      });
      
      setCommentText('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleTaskCreated = (newTask: Task) => {
    setIdea(prev => prev ? ({
        ...prev,
        tasks: [newTask, ...prev.tasks]
    }) : null);
  };

  const startEditingTask = (task: Task) => {
    setEditingTaskId(task.id);
    setEditTaskData({
        reward: task.reward.toString(),
        deliveryDays: task.deliveryDays.toString()
    });
  };

  const saveTaskEdit = async (taskId: string) => {
     try {
         const res = await fetch(`/api/tasks/${taskId}`, {
             method: 'PUT',
             headers: {'Content-Type': 'application/json'},
             body: JSON.stringify({
                 reward: editTaskData.reward,
                 deliveryDays: editTaskData.deliveryDays
             })
         });

         if (!res.ok) throw new Error("Failed to update task");
         const updatedTask = await res.json();

         setIdea(prev => prev ? ({
             ...prev,
             tasks: prev.tasks.map(t => t.id === taskId ? {...t, reward: updatedTask.reward, deliveryDays: updatedTask.deliveryDays} : t)
         }) : null);
         
         setEditingTaskId(null);
     } catch (e) {
         console.error(e);
         alert("Failed to update task");
     }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (error || !idea) {
    return (
      <div className="p-8 text-center bg-red-50 rounded-xl border border-red-100 text-red-600">
        <h2 className="text-lg font-bold mb-2">Error loading idea</h2>
        <p>{error || 'Idea not found'}</p>
        <Link to="/" className="inline-block mt-4 text-blue-600 hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
        {/* Header Image / Hero */}
        <div className="w-full h-64 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl relative overflow-hidden shadow-lg">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute bottom-0 left-0 p-8 text-white w-full">
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                        {idea.category}
                    </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{idea.title}</h1>
                <div className="flex items-center gap-4 text-sm text-blue-100">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {formatDate(idea.createdAt)}
                  </span>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
                
                {/* Description Card */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                        <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                            {idea.author.image ? (
                                <img src={idea.author.image} alt={idea.author.name || 'Author'} className="w-full h-full object-cover" />
                            ) : (
                                <User className="text-slate-400" size={24} />
                            )}
                        </div>
                        <div>
                            <p className="font-bold text-slate-900">{idea.author.name || 'Anonymous User'}</p>
                            <p className="text-sm text-slate-500">Project Lead</p>
                        </div>
                    </div>
                    
                    <div className="prose prose-slate max-w-none mb-6">
                        <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {idea.content}
                        </p>
                    </div>

                    {idea.tags && idea.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {idea.tags.map((tag, i) => (
                          <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md font-medium">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {idea.attachments && idea.attachments.length > 0 && (
                       <div className="space-y-2 pt-4 border-t border-slate-100">
                          <h4 className="text-sm font-semibold text-slate-900 mb-2">Attachments</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {idea.attachments.map((url, i) => (
                              <a 
                                key={i} 
                                href={url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors group"
                              >
                                <div className="p-2 bg-blue-50 text-blue-600 rounded">
                                  <Paperclip size={16} />
                                </div>
                                <span className="text-sm text-slate-600 truncate flex-1 group-hover:text-blue-600">
                                  Attachment {i + 1}
                                </span>
                              </a>
                            ))}
                          </div>
                       </div>
                    )}
                </div>

                {/* Tasks Section */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <Briefcase size={20} />
                            Available Tasks ({idea.tasks?.length || 0})
                        </h3>
                    </div>

                    <div className="mb-6">
                        <TaskCreator ideaId={idea.id} onTaskCreated={handleTaskCreated} />
                    </div>

                    <div className="space-y-4">
                        {idea.tasks && idea.tasks.map(task => (
                            <Link to={`/tasks/${task.id}`} key={task.id} className="block border border-slate-200 rounded-xl p-5 hover:border-blue-300 transition-colors bg-slate-50/50">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                             <h4 className="font-bold text-slate-900">{task.title}</h4>
                                             {task.status === 'PENDING' && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-bold">OPEN</span>}
                                             {task.status !== 'PENDING' && <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-xs rounded-full font-bold">{task.status}</span>}
                                        </div>
                                        <p className="text-sm text-slate-600 line-clamp-2">{task.description}</p>
                                    </div>
                                    {editingTaskId !== task.id && (
                                        <button 
                                            onClick={(e) => { e.preventDefault(); startEditingTask(task); }}
                                            className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                                            title="Edit Reward/Deadline"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 mt-4 text-sm">
                                    <div className="flex items-center gap-1 text-slate-600 bg-white px-2 py-1 rounded border border-slate-200">
                                        <Briefcase size={14} />
                                        <span>{task.skill || 'General'}</span>
                                    </div>
                                    
                                    {editingTaskId === task.id ? (
                                        <div className="flex items-center gap-2 bg-white p-1 rounded border border-blue-300" onClick={e => e.preventDefault()}>
                                            <div className="flex items-center">
                                                <DollarSign size={14} className="text-green-600" />
                                                <input 
                                                    type="number"
                                                    className="w-16 text-xs border-none outline-none p-0"
                                                    value={editTaskData.reward}
                                                    onChange={(e) => setEditTaskData({...editTaskData, reward: e.target.value})}
                                                />
                                            </div>
                                            <div className="flex items-center border-l border-slate-200 pl-2">
                                                <Clock size={14} className="text-orange-500 mr-1" />
                                                <input 
                                                    type="number"
                                                    className="w-12 text-xs border-none outline-none p-0"
                                                    value={editTaskData.deliveryDays}
                                                    onChange={(e) => setEditTaskData({...editTaskData, deliveryDays: e.target.value})}
                                                />
                                                <span className="text-xs text-slate-400 ml-1">days</span>
                                            </div>
                                            <button 
                                                onClick={() => saveTaskEdit(task.id)}
                                                className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded"
                                            >
                                                Save
                                            </button>
                                            <button 
                                                onClick={() => setEditingTaskId(null)}
                                                className="px-2 py-0.5 text-slate-500 text-xs"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-1 text-green-700 font-medium">
                                                <DollarSign size={14} />
                                                <span>${task.reward} USDC</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-orange-600">
                                                <Clock size={14} />
                                                <span>{task.deliveryDays} Days</span>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {task.assignee && (
                                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 pt-3 border-t border-slate-200">
                                        <CheckCircle2 size={14} className="text-blue-500" />
                                        <span>Assigned to {task.assignee.name}</span>
                                    </div>
                                )}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Comments Section */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <MessageCircle size={20} />
                        Discussion ({idea._count.comments})
                    </h3>
                    
                    {/* Comment Form */}
                    <form onSubmit={handleCommentSubmit} className="mb-8 flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center">
                             <User size={20} className="text-slate-500" />
                        </div>
                        <div className="flex-1">
                            <div className="relative">
                                <textarea
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Share your thoughts or ask a question..."
                                    className="w-full p-4 pr-12 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                                    rows={3}
                                />
                                <button 
                                    type="submit"
                                    disabled={isSubmittingComment || !commentText.trim()}
                                    className="absolute bottom-3 right-3 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isSubmittingComment ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                </button>
                            </div>
                        </div>
                    </form>

                    {/* Comments List */}
                    <div className="space-y-6">
                        {idea.comments.length === 0 ? (
                            <p className="text-center text-slate-500 py-4">No comments yet. Be the first to share your thoughts!</p>
                        ) : (
                            idea.comments.map((comment) => (
                                <div key={comment.id} className="flex gap-4 animate-fade-in">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                        {comment.author.image ? (
                                            <img src={comment.author.image} alt="User" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="font-bold text-slate-500 text-xs">
                                                {comment.author.name ? comment.author.name.substring(0,2).toUpperCase() : '??'}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="bg-slate-50 p-4 rounded-xl rounded-tl-none">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-bold text-slate-900 text-sm">
                                                    {comment.author.name || 'Anonymous'}
                                                </span>
                                                <span className="text-xs text-slate-400">
                                                    {formatDate(comment.createdAt)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-700">{comment.content}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
                {/* Actions */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm sticky top-24">
                    <div className="flex gap-3 mb-6">
                        <button 
                            onClick={handleLike}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
                                idea.isLiked 
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            <ThumbsUp size={18} className={idea.isLiked ? 'fill-current' : ''} />
                            <span>{idea.isLiked ? 'Supported' : 'Support'}</span>
                            <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${idea.isLiked ? 'bg-white/20' : 'bg-slate-100'}`}>
                                {idea._count.likes}
                            </span>
                        </button>
                        <button className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors">
                            <Share2 size={20} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                            <span className="text-slate-500 text-sm">Funding Goal</span>
                            <span className="font-bold text-slate-900">$10,000</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-full w-[15%]"></div>
                        </div>
                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                            <span>$1,500 raised</span>
                            <span>15%</span>
                        </div>
                        
                        <div className="pt-4">
                            <h4 className="font-semibold text-sm text-slate-900 mb-3">Collaboration</h4>
                            <p className="text-xs text-slate-500 mb-3">
                                This project is looking for contributors.
                            </p>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm p-2 bg-slate-50 rounded border border-slate-100">
                                    <span className="text-slate-700">React Developer</span>
                                    <span className="text-green-600 font-medium text-xs bg-green-50 px-2 py-0.5 rounded-full">Open</span>
                                </div>
                                <div className="flex items-center justify-between text-sm p-2 bg-slate-50 rounded border border-slate-100">
                                    <span className="text-slate-700">Marketing</span>
                                    <span className="text-green-600 font-medium text-xs bg-green-50 px-2 py-0.5 rounded-full">Open</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default IdeaDetailPage;
