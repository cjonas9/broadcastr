import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/AuthContext';
import { ButtonWrapper } from '@/components/ButtonWrapper';
import { BottomToolbar } from '@/components/BottomToolbar';
import { Heading } from '@/components/Heading';
import { TrackSwapCard, TrackSwap } from '@/components/TrackSwapCard';
import { API_CONFIG } from "@/config";

interface UserProfile {
  username: string;
  profileImage: string;
  swag: number;
}

export default function TrackSwapHistory() {
  const [, setLocation] = useLocation();
  const { userDetails } = useAuth();
  const [swaps, setSwaps] = useState<TrackSwap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});

  const fetchUserProfile = async (username: string) => {
    try {
      const response = await fetch(
        `${API_CONFIG.baseUrl}/api/user/profile?user=${encodeURIComponent(username)}`
      );
      if (!response.ok) throw new Error('Failed to fetch user profile');
      const data = await response.json();
      return data.userProfile[0];
    } catch (err) {
      console.error('Error fetching user profile:', err);
      return null;
    }
  };

  const fetchTrackSwaps = async () => {
    if (!userDetails) return;

    try {
      setIsLoading(true);
      setError(null);

      const apiUrl = `${API_CONFIG.baseUrl}/api/get-song-swaps?user=${encodeURIComponent(userDetails.profile)}`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        const text = await response.text();
        console.error('Error response:', text);
        throw new Error(`Failed to fetch track swaps: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setSwaps(data.songSwaps);

      // Fetch profiles for all unique users in the swaps
      const uniqueUsers = new Set<string>();
      data.songSwaps.forEach((swap: TrackSwap) => {
        uniqueUsers.add(swap.initiated_user);
        uniqueUsers.add(swap.matched_user);
      });

      const profilePromises = Array.from(uniqueUsers).map(username => fetchUserProfile(username));
      const profiles = await Promise.all(profilePromises);
      
      const profileMap: Record<string, UserProfile> = {};
      profiles.forEach((profile, index) => {
        if (profile) {
          profileMap[Array.from(uniqueUsers)[index]] = {
            username: profile.profile,
            profileImage: profile.pfpmed || profile.pfpsm || '',
            swag: profile.swag
          };
        }
      });
      
      setUserProfiles(profileMap);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch track swaps');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrackSwaps();
  }, [userDetails]);

  const handleRateTrack = async (swapId: number, rating: number) => {
    if (!userDetails) return;

    try {
      const response = await fetch(
        `${API_CONFIG.baseUrl}/api/add-song-swap-reaction?user=${encodeURIComponent(userDetails.profile)}&songswapid=${swapId}&reaction=${rating}`,
        { method: 'POST' }
      );

      if (!response.ok) throw new Error('Failed to rate track');
      
      // Refresh the swaps list
      await fetchTrackSwaps();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rate track');
    }
  };

  const handleSendTrack = (swap: TrackSwap) => {
    // Store the swap ID and navigate to track selection
    localStorage.setItem('pending_swap_id', swap.id.toString());
    setLocation('/track-swap-action');
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <Heading level={3} serif={false} className="mb-4">Loading track swaps...</Heading>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <Heading level={3} serif={false} className="mb-4 font-semibold text-red-400">Error</Heading>
          <p className="text-gray-400 mb-4">{error}</p>
          <ButtonWrapper
            width="hug"
            onClick={() => window.location.reload()}
          >
            Try Again
          </ButtonWrapper>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col">
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
        <div className="flex-1">
          <button className="text-2xl mb-4" onClick={() => setLocation("/track-swap-entry")}>←</button>
          <Heading level={3} serif={false} className="mb-4 font-bold text-center">Track Swap History</Heading>

          {swaps.length === 0 ? (
            <div className="text-center text-gray-400 mt-8">
              <p>No track swaps yet</p>
              <ButtonWrapper
                width="hug"
                onClick={() => setLocation("/track-swap-entry")}
                className="mt-4"
              >
                Start Your First Swap
              </ButtonWrapper>
            </div>
          ) : (
            <div className="space-y-6">
              {swaps.map((swap) => (
                <TrackSwapCard
                  key={swap.id}
                  swap={swap}
                  currentUser={userDetails.profile}
                  userProfiles={userProfiles}
                  onRateTrack={handleRateTrack}
                  onSendTrack={handleSendTrack}
                />
              ))}
            </div>
          )}
        </div>

        <BottomToolbar />
      </div>
    </div>
  );
} 