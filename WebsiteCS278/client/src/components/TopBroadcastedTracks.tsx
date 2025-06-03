import { useState, useEffect } from "react";
import { Heading } from "@/components/Heading";
import TopTrackPost from "@/components/TopTrackPost";
import { ButtonWrapper } from "@/components/ButtonWrapper";
import { useAuth } from "@/AuthContext";
import { FeedPost } from "@/components/FeedPost";

const VITE_API_URL = "https://broadcastr.onrender.com";

interface TopBroadcastedTrack {
  broadcastid: number;
  trackid: number;
  track: string;
  artist: string;
  lastfmtrackurl: string;
  likes: number;
}

interface TopBroadcastedTracksProps {
  username: string;
  limit?: number;
}

export default function TopBroadcastedTracks({ username, limit = 10 }: TopBroadcastedTracksProps) {
  const [tracks, setTracks] = useState<TopBroadcastedTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const { userDetails } = useAuth();

  const fetchTracks = async () => {
    try {
      setLoading(true);
      console.log('Fetching tracks for user:', username);
      const response = await fetch(
        `${VITE_API_URL}/api/user/top-broadcasted-tracks?user=${encodeURIComponent(username)}&limit=${limit}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch top broadcasted tracks');
      }

      const data = await response.json();
      console.log('Received tracks:', data.topTracks);
      setTracks(data.topTracks);
      setError(null);
    } catch (err) {
      console.error('Error fetching top broadcasted tracks:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (username) {
      console.log('Username or lastRefresh changed, fetching tracks for:', username);
      fetchTracks();
    }
  }, [username, limit, lastRefresh]);

  // Poll for updates every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(Date.now());
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Listen for broadcast events
  useEffect(() => {
    const handleBroadcastDelete = () => {
      // Remove the deleted broadcast immediately
      setTracks(prevTracks => prevTracks.filter(track => track.broadcastid !== event.detail.broadcastId));
      // Then refresh to ensure consistency
      setLastRefresh(Date.now());
    };

    const handleBroadcastLiked = (event: CustomEvent) => {
      const broadcastId = event.detail.broadcastId;
      setTracks(prevTracks => {
        const updatedTracks = prevTracks.map(track => 
          track.broadcastid === broadcastId
            ? { ...track, likes: track.likes + 1 }
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
            ? { ...track, likes: track.likes - 1 }
            : track
        );
        // Sort tracks by likes in descending order
        return [...updatedTracks].sort((a, b) => b.likes - a.likes);
      });
    };

    window.addEventListener('broadcastDeleted', handleBroadcastDelete);
    window.addEventListener('broadcastLiked', handleBroadcastLiked as EventListener);
    window.addEventListener('broadcastUnliked', handleBroadcastUnliked as EventListener);

    return () => {
      window.removeEventListener('broadcastDeleted', handleBroadcastDelete);
      window.removeEventListener('broadcastLiked', handleBroadcastLiked as EventListener);
      window.removeEventListener('broadcastUnliked', handleBroadcastUnliked as EventListener);
    };
  }, []);

  const handleDelete = async (broadcastId: number) => {
    try {
      console.log('Deleting broadcast:', broadcastId);
      
      // First send the delete request
      const deleteResponse = await fetch(
        `${VITE_API_URL}/api/delete-broadcast?id=${broadcastId}`,
        { method: 'POST' }
      );
      
      if (!deleteResponse.ok) {
        throw new Error('Failed to delete broadcast');
      }

      console.log('Delete request successful');
      
      // Update local state for immediate feedback
      setTracks(prevTracks => prevTracks.filter(track => track.broadcastid !== broadcastId));
      
      // Dispatch event to notify other components
      window.dispatchEvent(new Event('broadcastDeleted'));
      
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
        <h2 className="text-2xl font-bold text-white">Top Broadcasted Tracks</h2>
        <p className="text-sm text-gray-400 mb-4">Loading...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mt-8">
        <h2 className="text-2xl font-bold text-white">Top Broadcasted Tracks</h2>
        <p className="text-sm text-gray-400 mb-4">Failed to load tracks</p>
      </section>
    );
  }

  if (!tracks.length) {
    return (
      <section className="mt-8">
        <h2 className="text-2xl font-bold text-white">Top Broadcasted Tracks</h2>
        <p className="text-sm text-gray-400 mb-4">No broadcasted tracks yet</p>
      </section>
    );
  }

  return (
    <section className="mt-8">
      <h2 className="text-2xl font-bold text-white">Top Broadcasted Tracks</h2>
      <p className="text-sm text-gray-400 mb-4">
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
              profileImage: userDetails?.pfpmed || userDetails?.pfpsm || userDetails?.pfpxl || "https://via.placeholder.com/100"
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
            onDelete={() => handleDelete(track.broadcastid)}
          />
        ))}
      </div>

      <div className="mt-4">
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