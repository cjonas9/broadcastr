import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/AuthContext';
import { ButtonWrapper } from '@/components/ButtonWrapper';
import { BottomToolbar } from '@/components/BottomToolbar';
import { Heading } from '@/components/Heading';
import MatchProfileCard from '@/components/MatchProfileCard';
import SongCard from '@/components/SongCard';
import { TrackSwap } from '@/components/TrackSwapCard';
import { API_CONFIG } from "@/config";

interface UserProfile {
  username: string;
  profileImage: string;
  swag: number;
}

export default function TrackSwapDetail() {
  const [, setLocation] = useLocation();
  const { userDetails } = useAuth();
  const [swap, setSwap] = useState<TrackSwap | null>(null);
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSwapDetails = async () => {
      if (!userDetails) return;

      try {
        setIsLoading(true);
        setError(null);

        // Get swap ID from URL
        const swapId = new URLSearchParams(window.location.search).get('id');
        if (!swapId) throw new Error('No swap ID provided');

        const response = await fetch(
          `${API_CONFIG.baseUrl}/api/get-song-swaps?user=${encodeURIComponent(userDetails.profile)}&songswapid=${swapId}`
        );

        if (!response.ok) throw new Error('Failed to fetch swap details');
        
        const data = await response.json();
        if (!data.songSwaps || data.songSwaps.length === 0) {
          throw new Error('Swap not found');
        }

        setSwap(data.songSwaps[0]);

        // Fetch profiles for both users
        const profiles = await Promise.all([
          fetchUserProfile(data.songSwaps[0].initiated_user),
          fetchUserProfile(data.songSwaps[0].matched_user)
        ]);

        const profileMap: Record<string, UserProfile> = {};
        profiles.forEach((profile, index) => {
          if (profile) {
            const username = index === 0 ? data.songSwaps[0].initiated_user : data.songSwaps[0].matched_user;
            profileMap[username] = {
              username: profile.profile,
              profileImage: profile.pfpmed || profile.pfpsm || '',
              swag: profile.swag
            };
          }
        });

        setUserProfiles(profileMap);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch swap details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSwapDetails();
  }, [userDetails]);

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

  const getSwapStatus = () => {
    if (!swap || !userDetails) return 'loading';
    const isInitiator = swap.initiated_user === userDetails.profile;
    
    if (isInitiator) {
      if (!swap.initiated_track_id) return 'pending';
      if (!swap.matched_track_id) return 'pending';
      if (!swap.initiated_reaction) return 'action_required';
      if (!swap.matched_reaction) return 'pending';
    } else {
      if (!swap.initiated_track_id) return 'pending';
      if (!swap.matched_track_id) return 'action_required';
      if (!swap.matched_reaction) return 'action_required';
      if (!swap.initiated_reaction) return 'pending';
    }
    return 'completed';
  };

  const handleRateTrack = async (rating: number) => {
    if (!userDetails || !swap) return;

    try {
      const response = await fetch(
        `${API_CONFIG.baseUrl}/api/add-song-swap-reaction?user=${encodeURIComponent(userDetails.profile)}&songswapid=${swap.id}&reaction=${rating}`,
        { method: 'POST' }
      );

      if (!response.ok) throw new Error('Failed to rate track');
      
      // Refresh the swap details
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rate track');
    }
  };

  const handleSendTrack = () => {
    if (!swap) return;
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
          <Heading level={3} serif={false} className="mb-4">Loading swap details...</Heading>
        </div>
      </div>
    );
  }

  if (error || !swap) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <Heading level={3} serif={false} className="mb-4 font-semibold text-red-400">Error</Heading>
          <p className="text-gray-400 mb-4">{error || 'Swap not found'}</p>
          <ButtonWrapper
            width="hug"
            onClick={() => setLocation('/track-swap-history')}
          >
            Back to History
          </ButtonWrapper>
        </div>
      </div>
    );
  }

  const status = getSwapStatus();
  const isInitiator = swap.initiated_user === userDetails.profile;
  const otherUser = isInitiator ? swap.matched_user : swap.initiated_user;
  const otherUserProfile = userProfiles[otherUser];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col">
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
        <div className="flex-1">
          <button className="text-2xl mb-4" onClick={() => setLocation("/track-swap-history")}>←</button>
          <Heading level={3} serif={false} className="mb-4 font-bold text-center">Track Swap Details</Heading>

          {/* Status Badge */}
          <div className="flex justify-center mb-6">
            <span className={`px-3 py-1 rounded-full text-sm ${
              status === 'completed' ? 'bg-green-900/50 text-green-400' :
              status === 'action_required' ? 'bg-blue-900/50 text-blue-400' :
              'bg-yellow-900/50 text-yellow-400'
            }`}>
              {status === 'action_required' ? 'Action Required' :
               status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>

          {/* Matched User */}
          <div className="mb-8">
            <h3 className="text-sm text-gray-400 mb-2 text-center">Matched with:</h3>
            <MatchProfileCard
              username={otherUser}
              profileImage={otherUserProfile?.profileImage || ''}
              swag={otherUserProfile?.swag || 0}
              onClick={() => setLocation(`/profile/${otherUser.replace(/^@/, "")}`)}
            />
          </div>

          {/* Swap Details */}
          <div className="space-y-6">
            {/* Initiated Track */}
            {swap.initiated_track_id && (
              <div>
                <h3 className="text-sm text-gray-400 mb-2">
                  {isInitiator ? 'You sent:' : 'Received from match:'}
                </h3>
                <SongCard
                  song={{
                    id: swap.initiated_track_id,
                    name: swap.initiated_track_name || '',
                    artist: swap.initiated_artist_name || '',
                    playCount: 0
                  }}
                  className='bg-gray-700'
                  showPlayButton={true}
                />
                {swap.initiated_reaction && (
                  <div className="mt-2 text-sm text-gray-400">
                    Rating: {swap.initiated_reaction}/5
                  </div>
                )}
              </div>
            )}

            {/* Matched Track */}
            {swap.matched_track_id && (
              <div>
                <h3 className="text-sm text-gray-400 mb-2">
                  {isInitiator ? 'Received from match:' : 'You sent:'}
                </h3>
                <SongCard
                  song={{
                    id: swap.matched_track_id,
                    name: swap.matched_track_name || '',
                    artist: swap.matched_artist_name || '',
                    playCount: 0
                  }}
                  className='bg-gray-700'
                  showPlayButton={true}
                />
                {swap.matched_reaction && (
                  <div className="mt-2 text-sm text-gray-400">
                    Rating: {swap.matched_reaction}/5
                  </div>
                )}
              </div>
            )}

            {/* Status-specific content */}
            {status === 'completed' && (
              <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Swap Results</h3>
                <div className="space-y-2">
                  <p className="text-gray-300">
                    Your track received: {swap.initiated_reaction}/5
                  </p>
                  <p className="text-gray-300">
                    Their track received: {swap.matched_reaction}/5
                  </p>
                  {swap.initiated_reaction >= 4 && (
                    <p className="text-green-400 font-semibold">
                      You earned +5 swag points!
                    </p>
                  )}
                </div>
              </div>
            )}

            {status === 'pending' && swap && (
              <div className="mt-6 p-4 bg-yellow-900/50 text-yellow-400 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Waiting for Response</h3>
                <p className="text-gray-00">
                  {isInitiator 
                    ? (!swap.matched_track_id 
                        ? "Waiting for your match to send their track."
                        : swap.matched_reaction === null 
                          ? "Waiting for your match to rate your track."
                          : "Waiting for your match to complete their part of the swap.")
                    : (!swap.initiated_track_id 
                        ? "Waiting for your match to send their track."
                        : swap.initiated_reaction === null 
                          ? "Waiting for your match to rate your track."
                          : "Waiting for your match to complete their part of the swap.")}
                </p>
              </div>
            )}

            {status === 'action_required' && (
              <div className="mt-6">
                {!swap.matched_track_id && !isInitiator && (
                  <ButtonWrapper
                    width="full"
                    onClick={handleSendTrack}
                  >
                    Send a Track
                  </ButtonWrapper>
                )}
                {((swap.matched_track_id && !isInitiator && !swap.matched_reaction) ||
                  (swap.initiated_track_id && isInitiator && !swap.initiated_reaction)) && (
                  <div className="space-y-4">
                    <p className="text-center text-gray-300">Rate this track:</p>
                    <div className="flex justify-center space-x-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => handleRateTrack(rating)}
                          className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
                        >
                          {rating}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <BottomToolbar />
      </div>
    </div>
  );
} 