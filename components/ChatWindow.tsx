
import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Loader2, MoreVertical, Check, CheckCheck, Image as ImageIcon } from 'lucide-react';
import { useSocket } from '../lib/useSocket';
import { FileUploader } from './FileUploader';

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  attachments: string[];
  isOptimistic?: boolean;
}

interface ChatWindowProps {
  conversationId: string;
  currentUserId: string;
  recipientName?: string;
  recipientImage?: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ 
  conversationId, 
  currentUserId,
  recipientName = "Chat",
  recipientImage
}) => {
  const { socket, joinRoom, leaveRoom } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [showUploader, setShowUploader] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  // Changed NodeJS.Timeout to ReturnType<typeof setTimeout> to fix namespace error in environments where @types/node is not available
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/conversations/${conversationId}/messages`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (error) {
        console.error("Failed to load messages", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (conversationId) {
      fetchMessages();
      joinRoom(conversationId);
    }

    return () => {
      if (conversationId) leaveRoom(conversationId);
    };
  }, [conversationId, joinRoom, leaveRoom]);

  // Socket Listeners
  useEffect(() => {
    if (!socket || !conversationId) return;

    const handleNewMessage = (msg: any) => {
      // If message is from me, we might have already added it optimistically.
      // For simplicity, we filter out if ID matches or we rely on the fact that 
      // optimistic messages have a temp ID. Real messages replace them.
      // Here we just append if not exists (naive check)
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    };

    const handleTypingStart = (data: { user: string }) => {
      if (data.user !== currentUserId) setTypingUser(data.user);
    };

    const handleTypingStop = (data: { user: string }) => {
      if (data.user !== currentUserId) setTypingUser(null);
    };

    socket.on('message:new', handleNewMessage);
    socket.on('typing:start', handleTypingStart);
    socket.on('typing:stop', handleTypingStop);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('typing:start', handleTypingStart);
      socket.off('typing:stop', handleTypingStop);
    };
  }, [socket, conversationId, currentUserId]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typingUser]);

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      socket?.emit('typing:start', { roomId: conversationId, user: currentUserId });
    }
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket?.emit('typing:stop', { roomId: conversationId, user: currentUserId });
    }, 2000);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && attachments.length === 0) || !conversationId) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: Message = {
      id: tempId,
      content: inputText,
      senderId: currentUserId,
      createdAt: new Date().toISOString(),
      attachments: attachments,
      isOptimistic: true
    };

    setMessages(prev => [...prev, optimisticMsg]);
    setInputText('');
    setAttachments([]);
    setShowUploader(false);

    try {
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          content: optimisticMsg.content,
          attachments: optimisticMsg.attachments
        })
      });

      if (res.ok) {
        const realMsg = await res.json();
        // Replace optimistic message
        setMessages(prev => prev.map(m => m.id === tempId ? realMsg : m));
        
        // Emit socket event manually if the server doesn't auto-broadcast on API call
        // (Our server setup broadcasts in the API or via socket, let's assume API triggers socket or we emit here)
        socket?.emit('message:send', { roomId: conversationId, message: realMsg });
      } else {
         console.error('Failed to send');
         // Mark as failed in UI
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = (url: string) => {
    setAttachments(prev => [...prev, url]);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
            {recipientImage ? (
              <img src={recipientImage} alt={recipientName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold">
                {recipientName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-sm md:text-base">{recipientName}</h2>
            {typingUser && <p className="text-xs text-green-600 animate-pulse">Typing...</p>}
          </div>
        </div>
        <button className="text-slate-400 hover:text-slate-600">
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50" ref={scrollRef}>
        {isLoading ? (
          <div className="flex justify-center pt-10">
            <Loader2 className="animate-spin text-slate-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <p>No messages yet</p>
            <p className="text-sm">Say hello!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.senderId === currentUserId;
            const showAvatar = !isMe && (index === 0 || messages[index-1].senderId !== msg.senderId);
            
            return (
              <div key={msg.id} className={`flex gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                {!isMe && (
                  <div className={`w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 ${!showAvatar && 'invisible'}`}>
                     {recipientImage && <img src={recipientImage} className="w-full h-full rounded-full object-cover" />}
                  </div>
                )}
                
                <div className={`max-w-[75%] space-y-1`}>
                  <div className={`px-4 py-2 rounded-2xl text-sm shadow-sm ${
                    isMe 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                  } ${msg.isOptimistic ? 'opacity-70' : ''}`}>
                    {msg.content}
                  </div>

                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {msg.attachments.map((url, idx) => (
                         <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="block rounded-lg overflow-hidden border border-slate-200 w-32 h-32 relative">
                            {url.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                              <img src={url} alt="attachment" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                <Paperclip size={24} className="text-slate-400" />
                              </div>
                            )}
                         </a>
                      ))}
                    </div>
                  )}
                  
                  <div className={`text-[10px] flex items-center gap-1 ${isMe ? 'justify-end text-slate-400' : 'text-slate-400'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    {isMe && !msg.isOptimistic && <CheckCheck size={12} className="text-blue-500" />}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200">
        {attachments.length > 0 && (
           <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
              {attachments.map((url, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-lg border border-slate-200 overflow-hidden flex-shrink-0 group">
                      <img src={url} alt="thumb" className="w-full h-full object-cover opacity-70" />
                      <button 
                        onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                        className="absolute inset-0 flex items-center justify-center bg-black/20 text-white opacity-0 group-hover:opacity-100"
                      >
                          X
                      </button>
                  </div>
              ))}
           </div>
        )}

        {showUploader && (
            <div className="mb-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <FileUploader onUploadComplete={handleFileUpload} label="Select file to send" />
                <button onClick={() => setShowUploader(false)} className="text-xs text-slate-500 mt-2 underline">Cancel</button>
            </div>
        )}

        <form onSubmit={handleSend} className="flex items-end gap-2">
          <button 
            type="button" 
            onClick={() => setShowUploader(!showUploader)}
            className={`p-3 rounded-full transition-colors flex-shrink-0 ${
                attachments.length > 0 ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:bg-slate-100'
            }`}
          >
            {attachments.length > 0 ? <ImageIcon size={20} /> : <Paperclip size={20} />}
          </button>
          
          <div className="flex-1 relative">
            <textarea
              value={inputText}
              onChange={(e) => { setInputText(e.target.value); handleTyping(); }}
              onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
              placeholder="Type a message..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none resize-none max-h-32"
              rows={1}
            />
          </div>

          <button 
            type="submit" 
            disabled={(!inputText.trim() && attachments.length === 0)}
            className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all disabled:opacity-50 disabled:scale-95 flex-shrink-0 shadow-sm"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};
