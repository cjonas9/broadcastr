import React, { useState, useEffect } from "react";
import { ButtonWrapper } from "@/components/ButtonWrapper";
import { BottomToolbar } from "@/components/BottomToolbar";
import TrackSelector from "@/components/TrackSelector";
import { useAuth } from "@/AuthContext";
import { useLocation } from "wouter";
import { Heading } from "@/components/Heading";
import { API_CONFIG } from "@/config";

// Related type descriptions that match the database
const RELATED_TYPE = {
  TRACK: "Track"  // This matches the Description column in the RelatedType table
};

export default function BroadcastTrackPage() {
  const [, setLocation] = useLocation();
  const { userDetails } = useAuth();
  const [caption, setCaption] = useState("");
  const [selectedTrack, setSelectedTrack] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Debug log to check user details
    console.log("Current user details:", userDetails);
  }, [userDetails]);

  const handlePost = async () => {
    if (!selectedTrack) {
      setError("Please select a track first");
      return;
    }
    
    if (!userDetails?.profile) {
      console.error("No user profile found:", userDetails);
      setError("User profile not found. Please try logging in again.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const title = caption || `Broadcasting ${selectedTrack.name}`;
      const body = `${selectedTrack.name} by ${selectedTrack.artist}`;
      
      // Create URL with query parameters
      const url = new URL(`${API_CONFIG.baseUrl}/api/create-broadcast`);
      url.searchParams.append('user', userDetails.profile);
      url.searchParams.append('title', title);
      url.searchParams.append('body', body);
      url.searchParams.append('relatedtype', RELATED_TYPE.TRACK);
      url.searchParams.append('relatedid', selectedTrack.id.toString());

      console.log("Creating broadcast with URL:", url.toString());

      const response = await fetch(url.toString(), {
        method: "POST"
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Broadcast creation failed:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(errorData.error || "Failed to create broadcast");
      }

      const responseData = await response.json();
      console.log("Broadcast created successfully:", responseData);

      // Dispatch an event to notify that a new broadcast was created
      window.dispatchEvent(new Event('newBroadcast'));

      // Wait a brief moment to ensure the event is processed
      await new Promise(resolve => setTimeout(resolve, 100));

      // Redirect to feed
      setLocation("/");
    } catch (err) {
      console.error("Error creating broadcast:", err);
      setError(err instanceof Error ? err.message : "Failed to post track. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Error handling for unauthenticated users
  if (!userDetails?.profile) {
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
