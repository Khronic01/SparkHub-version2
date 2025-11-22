
import React, { useState } from 'react';
import { PlusCircle, Loader2, DollarSign, Clock, Briefcase } from 'lucide-react';

interface TaskCreatorProps {
  ideaId: string;
  onTaskCreated: (task: any) => void;
}

export const TaskCreator: React.FC<TaskCreatorProps> = ({ ideaId, onTaskCreated }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skill: '',
    reward: '',
    deliveryDays: '3'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/tasks/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ideaId,
          ...formData
        })
      });

      if (!response.ok) throw new Error('Failed to create task');

      const newTask = await response.json();
      onTaskCreated(newTask);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        skill: '',
        reward: '',
        deliveryDays: '3'
      });
      setIsExpanded(false);
    } catch (error) {
      console.error(error);
      alert('Failed to create task');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isExpanded) {
    return (
      <button 
        onClick={() => setIsExpanded(true)}
        className="w-full border-2 border-dashed border-slate-200 rounded-xl p-4 flex items-center justify-center gap-2 text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
      >
        <PlusCircle size={20} />
        <span className="font-medium">Add a Task to this Idea</span>
      </button>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-slate-900">Create New Task</h3>
        <button 
          onClick={() => setIsExpanded(false)}
          className="text-sm text-slate-400 hover:text-slate-600"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Task Title</label>
          <input 
            type="text" 
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Design Logo for App"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Required Skill</label>
            <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                <select 
                    name="skill" 
                    value={formData.skill}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white appearance-none"
                >
                    <option value="">Select Skill...</option>
                    <option value="Frontend Dev">Frontend Dev</option>
                    <option value="Backend Dev">Backend Dev</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Content">Content</option>
                </select>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reward (USDC)</label>
                <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                        type="number" 
                        name="reward"
                        min="0"
                        step="0.01"
                        value={formData.reward}
                        onChange={handleChange}
                        placeholder="0.00"
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Delivery (Days)</label>
                <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                        type="number" 
                        name="deliveryDays"
                        min="1"
                        value={formData.deliveryDays}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea 
            name="description"
            required
            value={formData.description}
            onChange={handleChange}
            rows={3}
            placeholder="Describe the task details..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
          />
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Create Task'}
        </button>
      </form>
    </div>
  );
};
