
import React from 'react';
import { MessageSquareDashed } from 'lucide-react';

const MessagesIndexPage: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 text-slate-400 p-8 text-center h-full">
      <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center mb-4">
         <MessageSquareDashed size={48} className="text-slate-400" />
      </div>
      <h3 className="text-lg font-bold text-slate-700 mb-2">Select a Conversation</h3>
      <p className="text-sm max-w-xs">
        Choose a chat from the sidebar to start messaging or look for collaborators in the Marketplace.
      </p>
    </div>
  );
};

export default MessagesIndexPage;
