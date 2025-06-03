import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/AuthContext';
import { ButtonWrapper } from '@/components/ButtonWrapper';
import { BottomToolbar } from '@/components/BottomToolbar';
import { Heading } from '@/components/Heading';
import TrackSelector from '@/components/TrackSelector';
import { Song } from '@/components/SongCard';
import { TrackSwap } from '@/components/TrackSwapCard';
import { API_CONFIG } from "@/config";

interface TrackSwapActionProps {
  swap: TrackSwap;
  actionType: 'send_track' | 'rate_track';
  onComplete: () => void;
}

export default function TrackSwapAction({ swap, actionType, onComplete }: TrackSwapActionProps) {
  const [, setLocation] = useLocation();
  const { userDetails } = useAuth();
  const [selectedTrack, setSelectedTrack] = useState<Song | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTrackSelect = async (selectedTrack: Song) => {
    if (!selectedTrack || !userDetails) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `${API_CONFIG.baseUrl}/api/add-song-swap-track?user=${encodeURIComponent(userDetails.profile)}&songswapid=${swap.id}&trackid=${selectedTrack.id}`,
        { method: 'POST' }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add track to song swap');
      }

      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add track to song swap');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReaction = async (rating: number) => {
    if (!userDetails) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `${API_CONFIG.baseUrl}/api/add-song-swap-reaction?user=${encodeURIComponent(userDetails.profile)}&songswapid=${swap.id}&reaction=${rating}`,
        { method: 'POST' }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to rate track');
      }

      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rate track');
    } finally {
      setIsLoading(false);
    }
  };

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
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col">
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
        <div className="flex-1">
          <button className="text-2xl mb-4" onClick={() => setLocation("/track-swap-history")}>←</button>
          
          {actionType === 'send_track' ? (
            <>
              <Heading level={3} serif={false} className="mb-4 font-bold text-center">Send a Track</Heading>
              <p className="text-center text-gray-300 mb-8">
                Choose a track to send to your match
              </p>

              <div className="mb-8">
                <TrackSelector
                  selectedTrack={selectedTrack}
                  onTrackSelect={setSelectedTrack}
                  username={userDetails.profile}
                  label="Choose a Track to Send"
                />
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-900/50 rounded-lg">
                  <p className="text-red-400 text-center">{error}</p>
                </div>
              )}

              <div className="mt-auto pt-6">
                <ButtonWrapper
                  variant={!selectedTrack || isLoading ? "disabled" : "primary"}
                  width="full"
                  onClick={() => handleTrackSelect(selectedTrack as Song)}
                >
                  Send Track
                </ButtonWrapper>
              </div>
            </>
          ) : (
            <>
              <Heading level={3} serif={false} className="mb-4 font-bold text-center">Rate Track</Heading>
              <p className="text-center text-gray-300 mb-8">
                Rate the track you received from your match
              </p>

              <div className="space-y-4">
                {error && (
                  <div className="p-4 bg-red-900/50 rounded-lg">
                    <p className="text-red-400 text-center">{error}</p>
                  </div>
                )}

                <div className="flex justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleReaction(rating)}
                      disabled={isLoading}
                      className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50"
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <BottomToolbar />
      </div>
    </div>
  );
} 