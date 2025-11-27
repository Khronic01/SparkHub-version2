
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, CheckCircle2, AlertCircle, User, Upload, Loader2, ArrowRight, DollarSign } from 'lucide-react';
import { FileUploader } from '../../../components/FileUploader';
import { useSocket } from '../../../lib/useSocket';

interface TaskData {
    id: string;
    title: string;
    description: string;
    status: string;
    reward: number;
    deliveryDays: number;
    createdAt: string;
    submissionUrl: string | null;
    submissionNotes: string | null;
    assignee: {
        id: string;
        name: string;
        image: string;
    } | null;
    idea: {
        id: string;
        title: string;
    };
}

const TaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [task, setTask] = useState<TaskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { socket, joinRoom, leaveRoom } = useSocket();

  // Fetch Data
  useEffect(() => {
    const fetchTask = async () => {
        if (!id) return;
        try {
            const res = await fetch(`/api/tasks/${id}`);
            if (!res.ok) throw new Error('Failed to load task');
            const data = await res.json();
            setTask(data);
            if (data.submissionUrl) setSubmissionUrl(data.submissionUrl);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };
    fetchTask();
  }, [id]);

  // Socket Listeners
  useEffect(() => {
      if (!id) return;
      joinRoom(`task:${id}`);

      const handleStatusUpdate = (data: any) => {
          setTask(prev => prev ? ({ ...prev, status: data.status, ...data }) : null);
      };

      socket?.on('task:submitted', handleStatusUpdate);
      socket?.on('task:approved', handleStatusUpdate);
      socket?.on('task:assigned', handleStatusUpdate);

      return () => {
          leaveRoom(`task:${id}`);
          socket?.off('task:submitted', handleStatusUpdate);
          socket?.off('task:approved', handleStatusUpdate);
          socket?.off('task:assigned', handleStatusUpdate);
      };
  }, [id, socket, joinRoom, leaveRoom]);

  const handleClaim = async () => {
      if (!task) return;
      try {
          setIsSubmitting(true);
          const res = await fetch(`/api/tasks/${task.id}/claim`, { method: 'POST' });
          if (!res.ok) throw new Error('Failed to claim');
          const updated = await res.json();
          setTask(updated);
          
          socket?.emit('task:event', { taskId: task.id, action: 'assigned', payload: updated });
      } catch (e) {
          alert('Failed to claim task');
      } finally {
          setIsSubmitting(false);
      }
  };

  const handleSubmitWork = async () => {
      if (!task || !submissionUrl) return;
      try {
          setIsSubmitting(true);
          const res = await fetch(`/api/tasks/${task.id}/submit`, { 
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({ submissionUrl, notes: 'Work completed via platform UI.' })
          });
          if (!res.ok) throw new Error('Failed to submit');
          const updated = await res.json();
          setTask(updated);

          socket?.emit('task:event', { taskId: task.id, action: 'submitted', payload: updated });
      } catch (e) {
          alert('Failed to submit work');
      } finally {
          setIsSubmitting(false);
      }
  };

  const handleApprove = async () => {
      if (!task) return;
      try {
          setIsSubmitting(true);
          const res = await fetch(`/api/tasks/${task.id}/approve`, { method: 'POST' });
          if (!res.ok) throw new Error('Failed to approve');
          const updated = await res.json();
          setTask(updated);

          socket?.emit('task:event', { taskId: task.id, action: 'approved', payload: updated });
      } catch (e) {
          alert('Failed to approve task');
      } finally {
          setIsSubmitting(false);
      }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;
  if (error || !task) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
            <Link to={`/ideas/${task.idea.id}`} className="hover:underline hover:text-blue-600">{task.idea.title}</Link>
            <span>/</span>
            <span>Task Details</span>
        </div>
        <div className="flex items-start justify-between">
            <h1 className="text-2xl font-bold text-slate-900">{task.title}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                task.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                task.status === 'SUBMITTED' ? 'bg-purple-100 text-purple-700' :
                task.status === 'ASSIGNED' ? 'bg-blue-100 text-blue-700' :
                'bg-slate-200 text-slate-600'
            }`}>
                {task.status}
            </span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500">
                    <Calendar size={20} />
                </div>
                <div>
                    <p className="text-xs text-slate-500 font-medium uppercase">Est. Delivery</p>
                    <p className="text-sm font-semibold text-slate-900">{task.deliveryDays} Days</p>
                </div>
            </div>
             <div className="flex items-center gap-3">
                <div className="p-2 bg-white border border-slate-200 rounded-lg text-green-600">
                    <DollarSign size={20} />
                </div>
                <div>
                    <p className="text-xs text-slate-500 font-medium uppercase">Reward</p>
                    <p className="text-sm font-semibold text-green-700">${task.reward} USDC</p>
                </div>
            </div>
             <div className="flex items-center gap-3">
                <div className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500">
                    {task.assignee ? <User size={20} /> : <AlertCircle size={20} />}
                </div>
                <div>
                    <p className="text-xs text-slate-500 font-medium uppercase">Assignee</p>
                    <p className="text-sm font-semibold text-slate-900">
                        {task.assignee ? task.assignee.name : 'Unassigned'}
                    </p>
                </div>
            </div>
        </div>

        <div className="p-6 md:p-8 space-y-8">
            <div>
                <h3 className="font-bold text-slate-900 mb-2">Description</h3>
                <p className="text-slate-600 leading-relaxed">{task.description}</p>
            </div>

            {/* Action Area */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                <h3 className="font-bold text-slate-900 mb-4">Action Required</h3>
                
                {task.status === 'PENDING' && (
                    <div className="flex flex-col items-center justify-center text-center py-4">
                        <p className="text-slate-600 mb-4">This task is open for contribution. Are you ready to take it on?</p>
                        <button 
                            onClick={handleClaim}
                            disabled={isSubmitting}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold shadow-sm transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? 'Processing...' : 'Claim Task'}
                        </button>
                    </div>
                )}

                {task.status === 'ASSIGNED' && (
                    <div>
                         <p className="text-sm text-slate-600 mb-4">
                            Submit your work (URL, Github link, or file) to notify the project owner.
                        </p>
                        <div className="mb-4">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Submission Link / File</label>
                            <div className="space-y-3">
                                <input 
                                    type="text" 
                                    placeholder="https://github.com/..." 
                                    value={submissionUrl}
                                    onChange={(e) => setSubmissionUrl(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-400">OR</span>
                                    <div className="flex-1">
                                        <FileUploader onUploadComplete={setSubmissionUrl} label="Upload File" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={handleSubmitWork}
                            disabled={!submissionUrl || isSubmitting}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white px-4 py-3 rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                            <span>Submit Work</span>
                        </button>
                    </div>
                )}

                {task.status === 'SUBMITTED' && (
                    <div>
                        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg mb-4 flex items-start gap-3">
                            <CheckCircle2 className="mt-0.5" size={18} />
                            <div>
                                <p className="font-bold text-sm">Work Submitted</p>
                                <p className="text-xs mt-1">Waiting for approval from the project owner.</p>
                                {task.submissionUrl && (
                                    <a href={task.submissionUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline mt-2 block">
                                        View Submission: {task.submissionUrl}
                                    </a>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex gap-3">
                            <button 
                                onClick={handleApprove}
                                disabled={isSubmitting}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold shadow-sm disabled:opacity-50"
                            >
                                {isSubmitting ? 'Processing...' : 'Approve & Release Funds'}
                            </button>
                            <button className="px-4 py-2 border border-slate-300 text-slate-600 font-medium rounded-lg hover:bg-slate-50">
                                Request Changes
                            </button>
                        </div>
                    </div>
                )}

                {task.status === 'COMPLETED' && (
                    <div className="flex items-center gap-3 text-green-700 bg-green-50 p-4 rounded-lg border border-green-100">
                        <CheckCircle2 size={24} />
                        <div>
                            <p className="font-bold">Task Completed</p>
                            <p className="text-sm">Funds have been released to the contributor.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPage;
