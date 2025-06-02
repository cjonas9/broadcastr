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

// Use environment variable for API URL with development fallback
// const API_URL = import.meta.env.DEV 
//   ? 'http://localhost:8000'  // Use localhost in development
//   : 'https://broadcastr.onrender.com';  // Use production in production
const API_URL = 'http://localhost:8000';

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

  // Fetch matched user when component mounts
  useEffect(() => {
    const fetchMatchedUser = async () => {
      if (!userDetails) return;

      //Check if we already have a match stored
      const storedMatch = localStorage.getItem(MATCHED_USER_KEY);
      const storedSwapId = localStorage.getItem(SONG_SWAP_ID_KEY);

      if (storedMatch && storedSwapId) {
        try {
          // Verify the stored match is still valid
          const response = await fetch(
            `${API_URL}/api/get-song-swaps?user=${encodeURIComponent(userDetails.profile)}&songswapid=${storedSwapId}`
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data.songSwaps && data.songSwaps.length > 0) {
              // Match is still valid, use stored data
              const parsedMatch = JSON.parse(storedMatch);
              setMatchedUser(parsedMatch);
              setMatchUser(parsedMatch);
              setSongSwapId(parseInt(storedSwapId));
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

      try {
        setIsLoading(true);
        setError(null);

        console.log('Fetching match for user:', userDetails.profile);

        // Call initiate-song-swap endpoint to get a match
        const response = await fetch(
          `${API_URL}/api/initiate-song-swap?user=${encodeURIComponent(userDetails.profile)}`,
          { method: 'POST' }
        );

        console.log('Initiate swap response status:', response.status);
        const data = await response.json();
        console.log('Initiate swap response data:', data);

        if (!response.ok) {
          throw new Error(data.error || 'Failed to find a match');
        }

        // Store the song swap ID
        setSongSwapId(data.song_swap_id);
        localStorage.setItem(SONG_SWAP_ID_KEY, data.song_swap_id.toString());

        // Fetch the user's profile using their Last.fm profile name
        console.log('Fetching details for Last.fm profile:', data.matched_user_profile);
        const userResponse = await fetch(
          `${API_URL}/api/user/profile?user=${encodeURIComponent(data.matched_user_profile)}`
        );

        console.log('User profile response status:', userResponse.status);
        const userData = await userResponse.json();
        console.log('User profile response data:', userData);

        if (!userResponse.ok) {
          throw new Error('Failed to fetch matched user details');
        }

        if (!userData.userProfile || userData.userProfile.length === 0) {
          throw new Error('No user profile data found');
        }

        const matchedUserData = userData.userProfile[0];
        console.log('Matched user data:', matchedUserData);

        // Set the matched user with proper profile image
        const newMatchedUser = {
          username: matchedUserData.profile,
          profileImage: matchedUserData.pfpsm || matchedUserData.pfpmed || matchedUserData.pfplg || matchedUserData.pfpxl || '',
          swag: matchedUserData.swag || 0
        };
        console.log('Setting matched user:', newMatchedUser);
        setMatchedUser(newMatchedUser);
        setMatchUser(newMatchedUser);
        
        // Store the match in localStorage
        localStorage.setItem(MATCHED_USER_KEY, JSON.stringify(newMatchedUser));

      } catch (err) {
        console.error('Error in fetchMatchedUser:', err);
        setError(err instanceof Error ? err.message : 'Failed to find a match');
        // Only clear localStorage if we failed to get a new match
        clearLocalStorage();
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatchedUser();
  }, [userDetails, setMatchUser]);

  const handleInitiateSwap = async () => {
    if (!localSelectedTrack || !userDetails || !matchedUser || !songSwapId) return;

    try {
      setIsLoading(true);
      setError(null);

      // Add the track to the existing song swap
      const response = await fetch(
        `${API_URL}/api/add-song-swap-track?user=${encodeURIComponent(userDetails.profile)}&songswapid=${songSwapId}&trackid=${localSelectedTrack.id}`,
        { method: 'POST' }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add track to song swap');
      }

      // Set the selected track in the global context and navigate to confirmation
      setSwapTrack(localSelectedTrack);
      setLocation("/track-swap-confirmation");

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add track to song swap');
    } finally {
      setIsLoading(false);
    }
  };

  // Add a function to handle cancellation
  const handleCancel = () => {
    // Clear the stored match data
    localStorage.removeItem(MATCHED_USER_KEY);
    localStorage.removeItem(SONG_SWAP_ID_KEY);
    setMatchedUser(null);
    setSongSwapId(null);
    setLocation("/track-swap-entry");
  };

  // Add function to clear localStorage
  const clearLocalStorage = () => {
    localStorage.removeItem(MATCHED_USER_KEY);
    localStorage.removeItem(SONG_SWAP_ID_KEY);
    setMatchedUser(null);
    setSongSwapId(null);
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
          <Heading level={3} serif={false} className="mb-4 font-bold text-center">Track Swap Battle</Heading>
          <p className="text-center text-gray-300 mb-8">
            Swap a song with your matched partner to expand your music taste! If your match saves your song, you earn +5 swag
          </p>

          {/* Match of the day */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-center mb-2">Your Match of the day</h2>
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
