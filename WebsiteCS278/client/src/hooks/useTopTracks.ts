import { useState, useEffect } from 'react';
import { Song } from '@/components/SongCard';

interface TopTrack {
  id: number;
  track: string;
  artist: string;
  playcount: number;
}

export function useTopTracks(username: string, period: string = '7day', limit: number = 100) {
  const [tracks, setTracks] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:8000/api/user/top-tracks?user=${username}&period=${period}&limit=${limit}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch tracks');
        }

        const data = await response.json();
        // Transform the API response to match the Song type
        const transformedTracks: Song[] = data.topTracks.map((track: TopTrack) => ({
          id: track.id,
          name: track.track,
          artist: track.artist,
          playCount: track.playcount,
        }));

        setTracks(transformedTracks);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchTracks();
    }
  }, [username, period, limit]);

  return { tracks, loading, error };
} 