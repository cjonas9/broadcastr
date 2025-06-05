import { useState, useEffect } from "react";
import { Heart, ExternalLink } from "lucide-react";
import { useAuth } from "@/AuthContext";
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

export default function TopBroadcastedTracks({ username, limit = 3 }: TopBroadcastedTracksProps) {
  const [tracks, setTracks] = useState<TopBroadcastedTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const { userDetails } = useAuth();

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
      setTracks(prevTracks => prevTracks.filter(track => track.broadcastid !== broadcastId));
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
      const deleteResponse = await fetch(
        `${API_CONFIG.baseUrl}/api/delete-broadcast?id=${broadcastId}`,
        { method: 'POST' }
      );
      
      if (!deleteResponse.ok) {
        throw new Error('Failed to delete broadcast');
      }
      
      setTracks(prevTracks => prevTracks.filter(track => track.broadcastid !== broadcastId));
      
      window.dispatchEvent(new CustomEvent('broadcastDeleted', {
        detail: { broadcastId }
      }));
      
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
      <section className="mt-8 mb-8">
        <h2 className="text-center text-xl font-semibold text-white mb-2">Top Broadcasted Tracks</h2>
        <p className="text-center text-gray-400 text-sm mb-6">Failed to load tracks</p>
      </section>
    );
  }

  if (!tracks.length) {
    return (
      <section className="mt-8 mb-4">
        <h2 className="text-center text-xl font-semibold text-white mb-2">Top Broadcasted Tracks</h2>
        <p className="text-center text-gray-400 text-sm mb-6">No broadcasted tracks yet</p>
      </section>
    );
  }

  return (
    <section className="mt-8 mb-8">
      <h2 className="text-center text-xl font-semibold text-white mb-2">Top Broadcasted Tracks</h2>
      <p className="text-center text-gray-400 text-sm mb-6">
        Most liked broadcasts
      </p>
      
      <div className="space-y-2">
        {tracks.map((track) => (
          <div
            key={track.broadcastid}
            className="bg-gray-800 rounded-lg p-3 flex items-center justify-between group hover:bg-gray-700 transition-colors"
          >
            <div className="min-w-0 flex-1">
              <div className="text-white font-medium truncate">{track.track}</div>
              <div className="text-gray-400 text-sm truncate">{track.artist}</div>
            </div>
            
            <div className="flex items-center gap-3 ml-4">
              <div className="flex items-center gap-1">
                <Heart
                  size={16}
                  className={track.isLiked ? "fill-purple-500 text-purple-500" : "text-gray-400"}
                />
                <span className="text-sm text-gray-400">{track.likes}</span>
              </div>
              
              {track.lastfmtrackurl && (
                <a
                  href={track.lastfmtrackurl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <ExternalLink size={16} />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
} 