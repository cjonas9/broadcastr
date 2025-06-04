import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/AuthContext';
import { ButtonWrapper } from '@/components/ButtonWrapper';
import { BottomToolbar } from '@/components/BottomToolbar';
import { Heading } from '@/components/Heading';
import MatchProfileCard from '@/components/MatchProfileCard';
import SongCard, { Song } from '@/components/SongCard';
import { TrackSwap } from '@/components/TrackSwapCard';
import TrackSelector from '@/components/TrackSelector';
import { API_CONFIG } from "@/config";
import SwapPendingView from '../components/SwapPendingView';
import SwapActionRequiredView from '../components/SwapActionRequiredView';
import SwapCompletedView from '../components/SwapCompletedView';

interface Track {
  id: number;
  name: string;
  artist: string;
  playCount: number;
}

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
  const [selectedTrack, setSelectedTrack] = useState<Song | null>(null);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  const fetchSwapDetails = async () => {
    if (!userDetails) return;
    try {
      setIsLoading(true);
      setError(null);
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

  useEffect(() => {
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
      setIsSubmittingRating(true);
      const response = await fetch(
        `${API_CONFIG.baseUrl}/api/add-song-swap-reaction?user=${encodeURIComponent(userDetails.profile)}&songswapid=${swap.id}&reaction=${rating}`,
        { method: 'POST' }
      );
      if (!response.ok) throw new Error('Failed to rate track');
      // Refetch swap details instead of reloading
      await fetchSwapDetails();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rate track');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const getActionMessage = () => {
    if (!swap || !userDetails) return '';
    const isInitiator = swap.initiated_user === userDetails.profile;
    
    if (isInitiator) {
      if (!swap.initiated_track_id) return 'Select a track to send to your match';
      if (!swap.matched_track_id) return 'Waiting for your match to send a track';
      if (!swap.initiated_reaction) return 'Rate the track your match sent you';
      if (!swap.matched_reaction) return 'Waiting for your match to rate your track';
    } else {
      if (!swap.initiated_track_id) return 'Waiting for your match to send a track';
      if (!swap.matched_track_id) return 'Select a track to send to your match';
      if (!swap.matched_reaction) return 'Rate the track your match sent you';
      if (!swap.initiated_reaction) return 'Waiting for your match to rate your track';
    }
    return '';
  };

  const handleSendTrack = async () => {
    if (!userDetails || !selectedTrack || !swap) return;

    try {
      const response = await fetch(
        `${API_CONFIG.baseUrl}/api/add-song-swap-track?user=${encodeURIComponent(userDetails.profile)}&songswapid=${swap.id}&trackid=${selectedTrack.id}`,
        { method: 'POST' }
      );

      if (!response.ok) throw new Error('Failed to send track');
      
      // Refresh the swap details
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send track');
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

  // Safeguard: If the initiator's track is missing, show a fallback error message
  if (!swap.initiated_track_id) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <Heading level={3} serif={false} className="mb-4 font-semibold text-red-400">Swap Data Error</Heading>
          <p className="text-gray-400 mb-4">This swap is missing a sent track from the initiator. Please contact support or delete this swap.</p>
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
  const actionMessage = getActionMessage();

  if (status === 'pending') {
    const sentTrack = isInitiator
      ? (swap.initiated_track_id ? {
          id: swap.initiated_track_id,
          name: swap.initiated_track_name || '',
          artist: swap.initiated_artist_name || '',
          playCount: 0
        } : undefined)
      : (swap.matched_track_id ? {
          id: swap.matched_track_id,
          name: swap.matched_track_name || '',
          artist: swap.matched_artist_name || '',
          playCount: 0
        } : undefined);
    if (!sentTrack) {
      return (
        <div className="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center">
          <div className="text-center">
            <Heading level={3} serif={false} className="mb-4 font-semibold text-red-400">Swap Data Error</Heading>
            <p className="text-gray-400 mb-4">This swap is missing a sent track. Please contact support or delete this swap.</p>
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
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col">
        <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
          <button className="text-2xl mb-2 text-left" onClick={() => setLocation("/track-swap-history")}>←</button>
          <SwapPendingView  
            otherUser={otherUser}
            otherUserProfile={otherUserProfile}
            sentTrack={sentTrack}
            onProfileClick={() => setLocation(`/profile/${otherUser.replace(/^@/, "")}`)}
            isInitiator={isInitiator}
          />
          <BottomToolbar />
        </div>
      </div>
    );
  }

  if (status === 'action_required') {
    // Determine substate for receiver: 'rate' or 'select'
    const isReceiver = swap.matched_user === userDetails.profile;
    let ratingStage: 'rate' | 'select' = 'rate';
    if (isReceiver) {
      if (swap.matched_track_id) {
        // Already sent track, so should be rating
        ratingStage = !swap.matched_reaction ? 'rate' : 'select';
      } else if (!swap.matched_track_id && swap.initiated_track_id) {
        // Need to select a track
        ratingStage = 'select';
      }
    }
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col">
        <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
          <button className="text-2xl mb-2 text-left" onClick={() => setLocation("/track-swap-history")}>←</button>
          <SwapActionRequiredView
            isReceiver={isReceiver}
            otherUser={otherUser}
            otherUserProfile={otherUserProfile}
            receivedTrack={
              isReceiver
                ? (swap.initiated_track_id ? {
                    id: swap.initiated_track_id,
                    name: swap.initiated_track_name || '',
                    artist: swap.initiated_artist_name || '',
                    playCount: 0
                  } : undefined)
                : (swap.matched_track_id ? {
                    id: swap.matched_track_id,
                    name: swap.matched_track_name || '',
                    artist: swap.matched_artist_name || '',
                    playCount: 0
                  } : undefined)
            }
            selectedTrack={selectedTrack}
            onProfileClick={() => setLocation(`/profile/${otherUser.replace(/^@/, "")}`)}
            onRateTrack={handleRateTrack}
            onTrackSelect={setSelectedTrack}
            onSendTrack={handleSendTrack}
            ratingStage={ratingStage}
            ratingValue={undefined}
            isSending={isSubmittingRating}
            userDetails={userDetails}
          />
          <BottomToolbar />
        </div>
      </div>
    );
  }

  if (status === 'completed' && swap.initiated_track_id && swap.matched_track_id) {
    // Calculate swag points (example logic, adjust as needed)
    const isInitiator = swap.initiated_user === userDetails.profile;
    const sentSwag = isInitiator ? (swap.initiated_reaction || 0) : (swap.matched_reaction || 0);
    const receivedSwag = isInitiator ? (swap.matched_reaction || 0) : (swap.initiated_reaction || 0);
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col">
        <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
          <button className="text-2xl mb-2 text-left" onClick={() => setLocation("/track-swap-history")}>←</button>
          <SwapCompletedView
            otherUser={otherUser}
            otherUserProfile={otherUserProfile}
            sentTrack={isInitiator ? {
              id: swap.initiated_track_id,
              name: swap.initiated_track_name || '',
              artist: swap.initiated_artist_name || '',
              playCount: 0
            } : {
              id: swap.matched_track_id,
              name: swap.matched_track_name || '',
              artist: swap.matched_artist_name || '',
              playCount: 0
            }}
            receivedTrack={isInitiator ? {
              id: swap.matched_track_id,
              name: swap.matched_track_name || '',
              artist: swap.matched_artist_name || '',
              playCount: 0
            } : {
              id: swap.initiated_track_id,
              name: swap.initiated_track_name || '',
              artist: swap.initiated_artist_name || '',
              playCount: 0
            }}
            sentSwag={sentSwag}
            receivedSwag={receivedSwag}
            onProfileClick={() => setLocation(`/profile/${otherUser.replace(/^@/, "")}`)}
          />
          <BottomToolbar />
        </div>
      </div>
    );
  }

  // Remove all code after this point, as it is now unreachable.
} 