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
  const { userDetails } = useAuth();

  const fetchTracks = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${VITE_API_URL}/api/user/top-broadcasted-tracks?user=${encodeURIComponent(username)}&limit=${limit}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch top broadcasted tracks');
      }

      const data = await response.json();
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
      fetchTracks();
    }
  }, [username, limit]);

  const handleDelete = async (broadcastId: number) => {
    // First update local state for immediate feedback
    setTracks(prevTracks => prevTracks.filter(track => track.broadcastid !== broadcastId));
    
    // Then refetch the data to ensure we're in sync with the server
    await fetchTracks();
  };

  if (loading) {
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
              profileImage: "https://via.placeholder.com/100"
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