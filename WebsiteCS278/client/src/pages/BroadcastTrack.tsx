import React, { useState } from "react";
import { ButtonWrapper } from "@/components/ButtonWrapper";
import { BottomToolbar } from "@/components/BottomToolbar";
import TrackSelector from "@/components/TrackSelector";
import { useAuth } from "@/AuthContext";
import { useLocation } from "wouter";
import { Heading } from "@/components/Heading";

const VITE_API_URL = "https://broadcastr.onrender.com";

export default function BroadcastTrackPage() {
  const [, setLocation] = useLocation();
  const { userDetails } = useAuth();
  const [caption, setCaption] = useState("");
  const [selectedTrack, setSelectedTrack] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePost = async () => {
    if (!selectedTrack || !userDetails?.profile) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${VITE_API_URL}/api/create-broadcast?user=${encodeURIComponent(userDetails.profile)}&title=${encodeURIComponent(caption)}&body=${encodeURIComponent(`${selectedTrack.name} by ${selectedTrack.artist}`)}&relatedtype=TRACK&relatedid=${selectedTrack.id}`,
        { method: "POST" }
      );

      if (!response.ok) {
        throw new Error("Failed to create broadcast");
      }

      // Redirect to feed
      setLocation("/");
    } catch (err) {
      console.error("Error creating broadcast:", err);
      setError("Failed to post track. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Error handling for unauthenticated users
  if (!userDetails) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <Heading level={3} serif={false} className="mb-4 font-semibold">Please log in to continue</Heading>
          <ButtonWrapper
            width="hug"
            onClick={() => setLocation('/login')}
            >  
            Go to Login
          </ButtonWrapper>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-between p-6">
      <div className="max-w-md mx-auto w-full flex-1">
        <button className="text-2xl mb-4" onClick={() => window.history.back()}>←</button>
        <h1 className="font-heading text-4xl mb-2 text-center">Broadcast a Track</h1>
        <p className="text-gray-400 mb-8 text-center">
          Share a track you are recently jamming to with all BroadCastrs! Tracks must be selected within your most recently played 100 songs.
        </p>
        <div className="mb-6">
          <label className="block mb-2 text-gray-300 text-center">Caption</label>
          <input
            className="w-full bg-gray-800 rounded-md px-4 py-3 text-gray-200 placeholder-gray-500 outline-none"
            placeholder="Your thoughts here"
            value={caption}
            onChange={e => setCaption(e.target.value)}
          />
        </div>
        <TrackSelector
          selectedTrack={selectedTrack}
          onTrackSelect={setSelectedTrack}
          username={userDetails.profile}
          className="mb-6"
        />
        {error && (
          <div className="text-red-500 text-center mb-4">{error}</div>
        )}
        <ButtonWrapper 
          width="full" 
          className="mt-8" 
          disabled={!selectedTrack || loading}
          onClick={handlePost}
        >
          {loading ? "Posting..." : "+ Post Track"}
        </ButtonWrapper>
      </div>
      <BottomToolbar />
    </div>
  );
}
