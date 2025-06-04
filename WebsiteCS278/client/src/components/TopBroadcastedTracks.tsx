import { useState, useEffect } from "react";
import { Heading } from "@/components/Heading";
import TopTrackPost from "@/components/TopTrackPost";
import { ButtonWrapper } from "@/components/ButtonWrapper";
import { useAuth } from "@/AuthContext";
import { FeedPost } from "@/components/FeedPost";
import { API_CONFIG } from "@/config";

interface TopBroadcastedTrack {
  broadcastid: number;
  trackid: number;
  track: string;
  artist: string;
  lastfmtrackurl: string;
  likes: number;
  isLiked: boolean;
}

type TopBroadcastedTracksProps = {
  username: string;
  limit?: number;
};

export default function TopBroadcastedTracks({ username, limit = 10 }: TopBroadcastedTracksProps) {
  const [tracks, setTracks] = useState<TopBroadcastedTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const { userDetails } = useAuth();
  const [userProfile, setUserProfile] = useState<{
    pfpsm?: string;
    pfpmed?: string;
    pfplg?: string;
    pfpxl?: string;
  } | null>(null);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (username === userDetails?.profile) {
        setUserProfile(userDetails);
        return;
      }

      try {
        const response = await fetch(
          `${API_CONFIG.baseUrl}/api/user/profile?user=${encodeURIComponent(username)}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }

        const data = await response.json();
        if (data.userProfile && data.userProfile.length > 0) {
          setUserProfile(data.userProfile[0]);
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      }
    };

    fetchUserProfile();
  }, [username, userDetails]);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        setLoading(true);
        const url = new URL(`${API_CONFIG.baseUrl}/api/user/top-broadcasted-tracks`);
        url.searchParams.append('user', username);
        url.searchParams.append('limit', limit.toString());
        if (userDetails?.profile) {
          url.searchParams.append('current_user', userDetails.profile);
        }
        const response = await fetch(url.toString());
        if (!response.ok) {
          throw new Error('Failed to fetch top broadcasted tracks');
        }
        const data = await response.json();
        setTracks(data.topTracks);
        setError(null);
      } catch (err) {
        console.error('Error fetching top broadcasted tracks:', err);
        setError('Failed to load tracks');
      } finally {
        setLoading(false);
      }
    };

    fetchTracks();
  }, [username, limit, lastRefresh, userDetails]);

  // Listen for broadcast events
  useEffect(() => {
    const handleBroadcastDelete = (event: CustomEvent) => {
      const broadcastId = event.detail.broadcastId;
      // Remove the deleted broadcast immediately
      setTracks(prevTracks => prevTracks.filter(track => track.broadcastid !== broadcastId));
      // Then refresh to ensure consistency
      setLastRefresh(Date.now());
    };

    const handleBroadcastLiked = (event: CustomEvent) => {
      const broadcastId = event.detail.broadcastId;
      setTracks(prevTracks => {
        const updatedTracks = prevTracks.map(track => 
          track.broadcastid === broadcastId
            ? { ...track, likes: track.likes + 1, isLiked: true }
            : track
        );
        // Sort tracks by likes in descending order
        return [...updatedTracks].sort((a, b) => b.likes - a.likes);
      });
    };

    const handleBroadcastUnliked = (event: CustomEvent) => {
      const broadcastId = event.detail.broadcastId;
      setTracks(prevTracks => {
        const updatedTracks = prevTracks.map(track => 
          track.broadcastid === broadcastId
            ? { ...track, likes: track.likes - 1, isLiked: false }
            : track
        );
        // Sort tracks by likes in descending order
        return [...updatedTracks].sort((a, b) => b.likes - a.likes);
      });
    };

    window.addEventListener('broadcastDeleted', handleBroadcastDelete as EventListener);
    window.addEventListener('broadcastLiked', handleBroadcastLiked as EventListener);
    window.addEventListener('broadcastUnliked', handleBroadcastUnliked as EventListener);

    return () => {
      window.removeEventListener('broadcastDeleted', handleBroadcastDelete as EventListener);
      window.removeEventListener('broadcastLiked', handleBroadcastLiked as EventListener);
      window.removeEventListener('broadcastUnliked', handleBroadcastUnliked as EventListener);
    };
  }, []);

  const handleDelete = async (broadcastId: number) => {
    try {
      console.log('Deleting broadcast:', broadcastId);
      
      // First send the delete request
      const deleteResponse = await fetch(
        `${API_CONFIG.baseUrl}/api/delete-broadcast?id=${broadcastId}`,
        { method: 'POST' }
      );
      
      if (!deleteResponse.ok) {
        throw new Error('Failed to delete broadcast');
      }

      console.log('Delete request successful');
      
      // Update local state for immediate feedback
      setTracks(prevTracks => prevTracks.filter(track => track.broadcastid !== broadcastId));
      
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('broadcastDeleted', {
        detail: { broadcastId }
      }));
      
      // Trigger a refresh after a short delay
      setTimeout(() => {
        setLastRefresh(Date.now());
      }, 500);
    } catch (err) {
      console.error('Error during delete operation:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete broadcast');
    }
  };

  if (loading && tracks.length === 0) {
    return (
      <section className="mt-8">
        <h2 className="text-center text-xl font-semibold text-white mb-2">Top Broadcasted Tracks</h2>
        <p className="text-center text-gray-400 text-sm mb-6">Loading...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mt-8">
        <h2 className="text-center text-xl font-semibold text-white mb-2">Top Broadcasted Tracks</h2>
        <p className="text-center text-gray-400 text-sm mb-6">Failed to load tracks</p>
      </section>
    );
  }

  if (!tracks.length) {
    return (
      <section className="mt-8">
        <h2 className="text-center text-xl font-semibold text-white mb-2">Top Broadcasted Tracks</h2>
        <p className="text-center text-gray-400 text-sm mb-6">No broadcasted tracks yet</p>
      </section>
    );
  }

  return (
    <section className="mt-8">
        <h2 className="text-center text-xl font-semibold text-white mb-2">Top Broadcasted Tracks</h2>
      <p className="text-center text-gray-400 text-sm mb-6">
        Tracks broadcasted that were most liked by other broadcastrs
      </p>
      
      <div className="space-y-4">
        {tracks.map((track) => (
          <FeedPost
            key={track.broadcastid}
            id={track.broadcastid}
            user={{
              id: 0,
              username,
              swag: 0,
              profileImage: (username === "System" || username === "@System")
                ? "https://i.ibb.co/Q7fkzTqg/bc-logo.png"
                : userProfile?.pfpmed || userProfile?.pfpsm || userProfile?.pfplg || userProfile?.pfpxl || "https://via.placeholder.com/100"
            }}
            timeAgo=""
            content=""
            type="track"
            track={{
              id: track.trackid,
              name: track.track,
              artist: track.artist,
              playCount: 0
            }}
            likes={track.likes}
            isLiked={track.isLiked}
            onDelete={() => handleDelete(track.broadcastid)}
          />
        ))}
      </div>

      <div className="mt-4 mb-8">
        <ButtonWrapper
          width="full"
          variant="secondary"
          onClick={() => {/* TODO: Implement view all */}}
        >
          Explore All
        </ButtonWrapper>
      </div>
    </section>
  );
} 