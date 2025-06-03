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
import { Plus } from "lucide-react";
import { Heading } from "@/components/Heading";
import { FeedPost } from "@/components/FeedPost";
import { useLocation } from "wouter";
import { useAuth } from "@/AuthContext";

const VITE_API_URL = "https://broadcastr.onrender.com";

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
}

export default function Feed() {
  const [location, setLocation] = useLocation();
  const { userDetails } = useAuth();
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBroadcasts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${VITE_API_URL}/api/get-broadcasts`);
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
            ? { ...broadcast, likes: broadcast.likes + 1 }
            : broadcast
        )
      );
    };

    const handleBroadcastUnliked = (event: CustomEvent) => {
      const broadcastId = event.detail.broadcastId;
      setBroadcasts(prevBroadcasts => 
        prevBroadcasts.map(broadcast => 
          broadcast.id === broadcastId
            ? { ...broadcast, likes: broadcast.likes - 1 }
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
        `${VITE_API_URL}/api/delete-broadcast?id=${broadcastId}`,
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
                profileImage: broadcast.user_pfp_med || broadcast.user_pfp_sm || broadcast.user_pfp_lg || broadcast.user_pfp_xl || "https://via.placeholder.com/100"
              }}
              timeAgo={new Date(broadcast.timestamp).toLocaleDateString()}
              content={broadcast.title}
              type={broadcast.type.toLowerCase() === "track" ? "track" : "activity"}
              track={broadcast.type.toLowerCase() === "track" ? {
                id: broadcast.relatedid,
                name: broadcast.body.split(" by ")[0],
                artist: broadcast.body.split(" by ")[1],
                playCount: 0
              } : undefined}
              likes={broadcast.likes}
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

      <BottomToolbar />
    </div>
  );
}