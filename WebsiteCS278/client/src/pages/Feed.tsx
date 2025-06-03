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

  useEffect(() => {
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
        setError(err instanceof Error ? err.message : 'Failed to load broadcasts');
      } finally {
        setLoading(false);
      }
    };

    fetchBroadcasts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-between p-6">
      <div className="max-w-md mx-auto w-full flex-1">
        <Heading level={1}>Discovery Feed</Heading>
        <p className="text-lg text-gray-500 mb-4">Explore other users' activity and their recommended tracks</p>
        
        {loading && (
          <div className="text-center text-gray-400">Loading broadcasts...</div>
        )}

        {error && (
          <div className="text-center text-red-500">{error}</div>
        )}

        <div className="space-y-6">
          {broadcasts.map((broadcast) => (
            <FeedPost
              key={broadcast.id}
              user={{
                id: 0, // We don't have this in the broadcast data
                username: broadcast.user,
                swag: 0, // We don't have this in the broadcast data
                profileImage: "https://via.placeholder.com/100" // Default image
              }}
              timeAgo={new Date(broadcast.timestamp).toLocaleDateString()}
              content={broadcast.title}
              type={broadcast.type.toLowerCase() === "track" ? "track" : "activity"}
              track={broadcast.type.toLowerCase() === "track" ? {
                id: broadcast.relatedid.toString(),
                title: broadcast.body.split(" by ")[0],
                artist: broadcast.body.split(" by ")[1],
                albumArt: "https://via.placeholder.com/100", // Default image
                trackLink: broadcast.relatedto || "#"
              } : undefined}
              likes={broadcast.likes}
            />
          ))}
        </div>

        <ButtonWrapper
          variant="primary"
          icon={<Plus size={16} />}
          width="hug"
          className="fixed left-1/2 -translate-x-1/2 bottom-20 z-50"
          onClick={() => setLocation("/broadcast-track")}
        >
          Broadcast Track
        </ButtonWrapper>
      </div>
      <BottomToolbar />
    </div>
  );
}