import { ArrowLeft, Play, Search } from "lucide-react";
import { useLocation } from "wouter";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select";
import { Button } from "../components/ui/button";
import { musicData } from "../data/musicData";
import { useState, useEffect } from "react";
import MatchProfileCard from "@/components/MatchProfileCard";
import SongCard, { Song } from "../components/SongCard";
import React from "react";
import { useSwap, MatchUser } from "../context/SwapContext";
import { BottomToolbar } from "@/components/BottomToolbar";
import { ButtonWrapper } from "@/components/ButtonWrapper";
import TrackSelector from "@/components/TrackSelector";
import { useAuth } from "@/AuthContext";
import { Heading } from "@/components/Heading";
import { API_CONFIG } from "@/config";

// Storage keys for persisting match data
const MATCHED_USER_KEY = 'track_swap_matched_user';
const SONG_SWAP_ID_KEY = 'track_swap_id';

export default function TrackSwap() {
  const [, setLocation] = useLocation();
  const { userDetails } = useAuth();
  const [localSelectedTrack, setLocalSelectedTrack] = useState<Song | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matchedUser, setMatchedUser] = useState<MatchUser | null>(null);
  const [songSwapId, setSongSwapId] = useState<number | null>(null);
  const { setSwapTrack, setMatchUser } = useSwap();

  // Initialize state from localStorage on mount
  useEffect(() => {
    const storedMatch = localStorage.getItem(MATCHED_USER_KEY);
    const storedSwapId = localStorage.getItem(SONG_SWAP_ID_KEY);
    
    if (storedMatch) {
      setMatchedUser(JSON.parse(storedMatch));
      setMatchUser(JSON.parse(storedMatch));
    }
    if (storedSwapId) {
      setSongSwapId(parseInt(storedSwapId));
    }
  }, [setMatchUser]);

  // Fetch matched user when component mounts
  useEffect(() => {
    const fetchMatchedUser = async () => {
      if (!userDetails) return;

      // Check if we should fetch a new match
      const shouldFetchNewMatch = localStorage.getItem('should_fetch_new_match') === 'true';

      // If we have a stored match and we shouldn't fetch a new one, verify it's still valid
      if (matchedUser && songSwapId && !shouldFetchNewMatch) {
        try {
          const response = await fetch(
            `${API_CONFIG.baseUrl}/api/get-song-swaps?user=${encodeURIComponent(userDetails.profile)}&songswapid=${songSwapId}`
          );
          if (response.ok) {
            const data = await response.json();
            if (data.songSwaps && data.songSwaps.length > 0) {
              // Match is still valid, no need to do anything
              return;
            }
          }
          // If we get here, the stored match is invalid, clear it
          clearLocalStorage();
        } catch (err) {
          console.error('Error verifying stored match:', err);
          clearLocalStorage();
        }
      }

      // Only fetch a new match if we should
      if (shouldFetchNewMatch) {
        try {
          setIsLoading(true);
          setError(null);

          // Call new matchmaking endpoint
          const response = await fetch(
            `${API_CONFIG.baseUrl}/api/find-song-swap-match?user=${encodeURIComponent(userDetails.profile)}`
          );
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error || 'Failed to find a match');
          }

          // Fetch the user's profile using their Last.fm profile name
          const userResponse = await fetch(
            `${API_CONFIG.baseUrl}/api/user/profile?user=${encodeURIComponent(data.matched_user_profile)}`
          );
          const userData = await userResponse.json();
          if (!userResponse.ok) {
            throw new Error('Failed to fetch matched user details');
          }
          if (!userData.userProfile || userData.userProfile.length === 0) {
            throw new Error('No user profile data found');
          }
          const matchedUserData = userData.userProfile[0];
          const newMatchedUser = {
            username: matchedUserData.profile,
            profileImage: matchedUserData.pfpsm || matchedUserData.pfpmed || matchedUserData.pfplg || matchedUserData.pfpxl || '',
            swag: matchedUserData.swag || 0
          };
          setMatchedUser(newMatchedUser);
          setMatchUser(newMatchedUser);
          localStorage.setItem(MATCHED_USER_KEY, JSON.stringify(newMatchedUser));
          // Clear the flag after fetching
          localStorage.removeItem('should_fetch_new_match');
        } catch (err) {
          console.error('Error in fetchMatchedUser:', err);
          setError(err instanceof Error ? err.message : 'Failed to find a match');
          clearLocalStorage();
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchMatchedUser();
  }, [userDetails, setMatchUser, matchedUser, songSwapId]);

  const handleInitiateSwap = async () => {
    if (!localSelectedTrack || !userDetails || !matchedUser) return;
    try {
      setIsLoading(true);
      setError(null);
      // 1. Create the swap
      const createSwapResponse = await fetch(
        `${API_CONFIG.baseUrl}/api/create-song-swap?user=${encodeURIComponent(userDetails.profile)}&matched_user=${encodeURIComponent(matchedUser.username)}`,
        { method: 'POST' }
      );
      const createSwapData = await createSwapResponse.json();
      if (!createSwapResponse.ok) {
        throw new Error(createSwapData.error || 'Failed to create song swap');
      }
      setSongSwapId(createSwapData.song_swap_id);
      localStorage.setItem(SONG_SWAP_ID_KEY, createSwapData.song_swap_id.toString());
      // 2. Add the track to the new swap
      const addTrackResponse = await fetch(
        `${API_CONFIG.baseUrl}/api/add-song-swap-track?user=${encodeURIComponent(userDetails.profile)}&songswapid=${createSwapData.song_swap_id}&trackid=${localSelectedTrack.id}`,
        { method: 'POST' }
      );
      if (!addTrackResponse.ok) {
        const data = await addTrackResponse.json();
        throw new Error(data.error || 'Failed to add track to song swap');
      }
      setSwapTrack(localSelectedTrack);
      setLocation("/track-swap-confirmation");
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate song swap');
    } finally {
      setIsLoading(false);
    }
  };

  // Add function to clear localStorage
  const clearLocalStorage = () => {
    localStorage.removeItem(MATCHED_USER_KEY);
    localStorage.removeItem(SONG_SWAP_ID_KEY);
    localStorage.removeItem('should_fetch_new_match');
    setMatchedUser(null);
    setSongSwapId(null);
  };

  // Add a function to handle cancellation
  const handleCancel = () => {
    clearLocalStorage();
    setLocation("/track-swap-entry");
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

  // Show loading state while fetching match
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <Heading level={3} serif={false} className="mb-4">Finding your match...</Heading>
        </div>
      </div>
    );
  }

  // Show error state if match fetch failed
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <Heading level={3} serif={false} className="mb-4 font-semibold text-red-400">Error</Heading>
          <p className="text-gray-400 mb-4">{error}</p>
          <ButtonWrapper
            width="hug"
            onClick={handleCancel}
          >  
            Try Again
          </ButtonWrapper>
        </div>
      </div>
    );
  }

  // Show message if no match found
  if (!matchedUser) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <Heading level={3} serif={false} className="mb-4 font-semibold">No matches found</Heading>
          <p className="text-gray-400 mb-4">Try again later when more users are active</p>
          <ButtonWrapper
            width="hug"
            onClick={handleCancel}
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
          <button className="text-2xl mb-4" onClick={handleCancel}>←</button>
          {/* Header */}
          <Heading level={2} serif={true} className="mb-4">Track Swap Battle</Heading>
          <p className="text-gray-400 mb-8">
            Swap a song with your matched partner to expand your music taste! The challenge is you can only select tracks from your recent top listens. Their rating of your track will determine how many swag points you get!
          </p>

          {/* Match of the day */}
          <div className="mb-8">
            <h2 className="text-md text-gray-400 mb-2">Your Match</h2>
            <MatchProfileCard
              username={matchedUser.username}
              profileImage={matchedUser.profileImage}
              swag={matchedUser.swag}
              onClick={() => setLocation(`/profile/${matchedUser.username.replace(/^@/, "")}`)}
            />
          </div>

          <div className="mb-8">
            <TrackSelector
              selectedTrack={localSelectedTrack}
              onTrackSelect={setLocalSelectedTrack}
              username={userDetails.profile}
              label="Choose a Track to Swap!"
            />
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-900/50 rounded-lg">
              <p className="text-red-400 text-center">{error}</p>
            </div>
          )}
        </div>
        <div className="mt-auto pt-6 pb-16">
          <ButtonWrapper
            variant={!localSelectedTrack || isLoading ? "disabled" : "primary"}
            width="full"
            onClick={handleInitiateSwap}
          >
            Send Swap
          </ButtonWrapper>
        </div>

        <BottomToolbar />
      </div>
    </div>
  );
}
