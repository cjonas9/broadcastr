/* 
Feed.tsx: Page for the feed feature
-----------------------------------
TODO:
- Connect feed to backend of real users
- Save feed posts to backend database
- need to replace mock posts with real posts
*/

import React, { useState, useEffect } from "react";
import { BottomToolbar } from "@/components/BottomToolbar";
import { ButtonWrapper } from "@/components/ButtonWrapper";
import { Plus, MessageCircle, X } from "lucide-react";
import { Heading } from "@/components/Heading";
import { FeedPost } from "@/components/FeedPost";
import { useLocation } from "wouter";
import { useAuth } from "@/AuthContext";
import { API_CONFIG } from "@/config";

interface Broadcast {
  id: number;
  user: string;
  user_pfp_sm: string;
  user_pfp_med: string;
  user_pfp_lg: string;
  user_pfp_xl: string;
  title: string;
  body: string;
  timestamp: string;
  type: string;
  relatedto: string;
  relatedid: number;
  likes: number;
  isLiked: boolean;
}

interface Conversation {
  conversant: string;
  lastConversation: string;
}

export default function Feed() {
  const [location, setLocation] = useLocation();
  const { userDetails } = useAuth();
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [conversationsError, setConversationsError] = useState<string | null>(null);

  const fetchBroadcasts = async () => {
    try {
      setLoading(true);
      const url = new URL(`${API_CONFIG.baseUrl}/api/get-broadcasts`);
      if (userDetails?.profile) {
        url.searchParams.append('current_user', userDetails.profile);
      }
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Failed to fetch broadcasts');
      }
      const data = await response.json();
      setBroadcasts(data.broadcasts);
      setError(null);
    } catch (err) {
      console.error('Error fetching broadcasts:', err);
      setError('Failed to load broadcasts');
    } finally {
      setLoading(false);
    }
  };
//   for getting message bubble on feed page!!!
  const fetchConversations = async () => {
    if (!userDetails?.profile) {
      setLoadingConversations(false);
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
      setConversationsError(null);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setConversationsError('Failed to load conversations');
    } finally {
      setLoadingConversations(false);
    }
  };

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  // Listen for broadcast events
  useEffect(() => {
    const handleNewBroadcast = () => {
      fetchBroadcasts();
    };

    const handleBroadcastDeleted = () => {
      fetchBroadcasts();
    };

    const handleBroadcastLiked = (event: CustomEvent) => {
      const broadcastId = event.detail.broadcastId;
      setBroadcasts(prevBroadcasts => 
        prevBroadcasts.map(broadcast => 
          broadcast.id === broadcastId
            ? { ...broadcast, likes: broadcast.likes + 1, isLiked: true }
            : broadcast
        )
      );
    };

    const handleBroadcastUnliked = (event: CustomEvent) => {
      const broadcastId = event.detail.broadcastId;
      setBroadcasts(prevBroadcasts => 
        prevBroadcasts.map(broadcast => 
          broadcast.id === broadcastId
            ? { ...broadcast, likes: broadcast.likes - 1, isLiked: false }
            : broadcast
        )
      );
    };

    window.addEventListener('newBroadcast', handleNewBroadcast);
    window.addEventListener('broadcastDeleted', handleBroadcastDeleted);
    window.addEventListener('broadcastLiked', handleBroadcastLiked as EventListener);
    window.addEventListener('broadcastUnliked', handleBroadcastUnliked as EventListener);

    return () => {
      window.removeEventListener('newBroadcast', handleNewBroadcast);
      window.removeEventListener('broadcastDeleted', handleBroadcastDeleted);
      window.removeEventListener('broadcastLiked', handleBroadcastLiked as EventListener);
      window.removeEventListener('broadcastUnliked', handleBroadcastUnliked as EventListener);
    };
  }, []);

  const handleBroadcastDelete = async (broadcastId: number) => {
    try {
      const response = await fetch(
        `${API_CONFIG.baseUrl}/api/delete-broadcast?id=${broadcastId}`,
        { method: 'POST' }
      );
      
      if (!response.ok) {
        throw new Error('Failed to delete broadcast');
      }

      // Update local state immediately
      setBroadcasts(prevBroadcasts => 
        prevBroadcasts.filter(broadcast => broadcast.id !== broadcastId)
      );

      // Dispatch event to notify other components
      window.dispatchEvent(new Event('broadcastDeleted'));
    } catch (error) {
      console.error('Error deleting broadcast:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-between p-6">
      <div className="max-w-md mx-auto w-full flex-1">
        <Heading level={1}>Discovery Feed</Heading>
        <p className="text-lg text-gray-500 mb-4">Explore other users' activity and their recommended tracks</p>
        
        {loading && broadcasts.length === 0 && (
          <div className="text-center text-gray-400">Loading broadcasts...</div>
        )}

        {error && (
          <div className="text-center text-red-500">{error}</div>
        )}

        <div className="space-y-6">
          {broadcasts.map((broadcast) => (
            <FeedPost
              key={broadcast.id}
              id={broadcast.id}
              user={{
                id: 0,
                username: broadcast.user,
                swag: 0,
                profileImage: (broadcast.user === "System" || broadcast.user === "@System")
                  ? "https://i.ibb.co/Q7fkzTqg/bc-logo.png"
                  : broadcast.user_pfp_lg || broadcast.user_pfp_med || broadcast.user_pfp_xl || broadcast.user_pfp_sm
              }}
              timeAgo={new Date(broadcast.timestamp).toLocaleDateString()}
              content={broadcast.title}
              body={broadcast.type.toLowerCase() === "track" ? undefined : broadcast.body}
              type={broadcast.type.toLowerCase() === "track" ? "track" : "activity"}
              track={broadcast.type.toLowerCase() === "track" ? {
                id: broadcast.relatedid,
                name: broadcast.body.split(" by ")[0],
                artist: broadcast.body.split(" by ")[1],
                playCount: 0
              } : undefined}
              likes={broadcast.likes}
              isLiked={broadcast.isLiked}
              onDelete={() => handleBroadcastDelete(broadcast.id)}
            />
          ))}

          {broadcasts.length === 0 && !loading && !error && (
            <div className="text-center text-gray-400">No broadcasts yet. Be the first to share!</div>
          )}
        </div>
      </div>

      <div className="fixed bottom-24 right-6">
        <ButtonWrapper
          width="hug"
          variant="primary"
          onClick={() => setLocation("/broadcast-track")}
          className="!rounded-full !p-4"
        >
          <Plus size={24} />
        </ButtonWrapper>
      </div>

      <div className="fixed bottom-24 left-6">
        <ButtonWrapper
          width="hug"
          variant="primary"
          onClick={() => {
            setIsMessagesOpen(true);
            fetchConversations();
          }}
          className="!rounded-full !p-4"
        >
          <MessageCircle size={24} />
        </ButtonWrapper>
      </div>

      {/* Messages Panel */}
      {isMessagesOpen && (
        <div className="fixed bottom-40 left-6 bg-gray-900 border border-gray-800 rounded-lg shadow-xl w-72">
          <div className="flex items-center justify-between p-3 border-b border-gray-800">
            <h3 className="text-white font-semibold">Messages</h3>
            <button
              onClick={() => setIsMessagesOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {loadingConversations ? (
              <div className="p-4 text-gray-400 text-center">Loading...</div>
            ) : conversationsError ? (
              <div className="p-4 text-red-400 text-center">{conversationsError}</div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-gray-400 text-center">No conversations yet</div>
            ) : (
              <div className="divide-y divide-gray-800">
                {conversations.map((conv) => (
                  <button
                    key={conv.conversant}
                    onClick={() => {
                      setLocation(`/dm/${conv.conversant}`);
                      setIsMessagesOpen(false);
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

      <BottomToolbar />
    </div>
  );
}