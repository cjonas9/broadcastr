import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { MessageCircle, X } from 'lucide-react';
import { useAuth } from '@/AuthContext';
import { API_CONFIG } from '@/config';

interface Conversation {
  conversant: string;
  lastConversation: string;
}

export default function MessageBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { userDetails } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!userDetails?.profile) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_CONFIG.baseUrl}/api/user/conversations?user=${encodeURIComponent(userDetails.profile)}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch conversations');
        }

        const data = await response.json();
        setConversations(data.conversations.map((conv: any) => ({
          conversant: conv.conversant,
          lastConversation: conv.lastconversation
        })));
        setError(null);
      } catch (err) {
        console.error('Error fetching conversations:', err);
        setError('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };

    // fetch conversations when user logs in
    if (userDetails?.profile) {
      fetchConversations();
    }
  }, [userDetails?.profile]); // only re-run on login/logout

  if (!userDetails) return null;

  return (
    <div className="fixed bottom-24 left-6 z-[60]">
      {/* message bubble */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-full shadow-lg"
      >
        <MessageCircle size={24} />
      </button>

      {/* convo panel */}
      {isOpen && (
        <div className="absolute bottom-16 left-0 bg-gray-900 border border-gray-800 rounded-lg shadow-xl w-72">
          <div className="flex items-center justify-between p-3 border-b border-gray-800">
            <h3 className="text-white font-semibold">Messages</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-gray-400 text-center">Loading...</div>
            ) : error ? (
              <div className="p-4 text-red-400 text-center">{error}</div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-gray-400 text-center">No conversations yet</div>
            ) : (
              <div className="divide-y divide-gray-800">
                {conversations.map((conv) => (
                  <button
                    key={conv.conversant}
                    onClick={() => {
                      setLocation(`/dm/${conv.conversant}`);
                      setIsOpen(false);
                    }}
                    className="w-full p-3 hover:bg-gray-800 flex items-center justify-between text-left"
                  >
                    <div>
                      <div className="text-white">@{conv.conversant}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(conv.lastConversation).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 