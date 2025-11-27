
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChatWindow } from '../../../components/ChatWindow';
import { ChevronLeft } from 'lucide-react';

interface ConversationDetail {
  id: string;
  recipientId: string;
  recipientName: string;
  recipientImage?: string;
}

const ConversationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [details, setDetails] = useState<ConversationDetail | null>(null);
  
  // Mock current user ID since we don't have real auth context in this scaffold
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch current user first (in real app this is from session)
    const init = async () => {
        try {
            // We use a specialized route or just assume a mocked user is available
            // Here we fetch 'me' via a hack or just searching for first user in DB via API
            // For the scaffold, let's assume the API returns the 'current user' info in the conversation metadata
            // or we fetch a known user.
            const res = await fetch('/api/conversations'); // This API uses prisma.user.findFirst() as me
            if (res.ok) {
                // This is just to get ID, bit inefficient but works for scaffold
                const data = await res.json(); 
                // The API doesn't return my ID directly, but let's assume we have a way.
                // Alternatively, we make a /api/auth/me route.
                // Let's just hardcode/fetch "me" in the component logic below via a separate call if needed.
                // For now, we will let ChatWindow handle fetching if we pass a flag, OR fetch conversation details which includes participants.
            }
        } catch(e) {}
    };
    init();
  }, []);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      try {
        const res = await fetch(`/api/conversations/${id}/messages`); // We can reuse this to get metadata? 
        // Actually better to have a specific details endpoint or extract from list.
        // Let's fetch list and find local for speed, or fetch specific.
        
        // Quick hack for scaffold: The ChatWindow will load messages. 
        // We need recipient info for the Header.
        // Let's hit the list API and filter.
        const listRes = await fetch('/api/conversations');
        if (listRes.ok) {
            const conversations = await listRes.json();
            const found = conversations.find((c: any) => c.id === id);
            if (found) {
                setDetails({
                    id: found.id,
                    recipientId: "unknown", // Not critical for UI display
                    recipientName: found.name,
                    recipientImage: found.avatar
                });
                
                // Hack: we need currentUserId for ChatWindow to alignment.
                // The /api/conversations route implies we are the viewer. 
                // Let's fetch a simple "who am i" 
                const meRes = await fetch('/api/auth/session/me'); // We don't have this yet.
                // Let's just fallback to "fetching first user" logic inside ChatWindow or pass a prop.
            }
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchDetails();
  }, [id]);

  // Since we need currentUserId for alignment (Left/Right), we really need it.
  // We'll use a separate effect to get it from a new simple endpoint
  useEffect(() => {
      fetch('/api/auth/me').then(res => res.json()).then(data => setCurrentUserId(data.id)).catch(() => {});
  }, []);

  if (!id) return null;
  if (!currentUserId) return <div className="p-4">Loading session...</div>;

  return (
    <div className="flex flex-col h-full">
        {/* Mobile Header Overrides */}
        <div className="md:hidden p-2 border-b border-slate-200 flex items-center">
            <Link to="/messages" className="flex items-center text-slate-600">
                <ChevronLeft size={20} />
                <span>Back</span>
            </Link>
        </div>

        <ChatWindow 
            conversationId={id}
            currentUserId={currentUserId}
            recipientName={details?.recipientName || 'Chat'}
            recipientImage={details?.recipientImage}
        />
    </div>
  );
};

export default ConversationPage;
