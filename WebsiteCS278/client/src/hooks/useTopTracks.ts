import { useState, useEffect } from 'react';
import { Song } from '@/components/SongCard';
import { API_CONFIG } from '@/config';

interface TopTrack {
  id: number;
  track: string;
  artist: string;
  playcount: number;
  lastfmtrackurl: string;
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
          `${API_CONFIG.baseUrl}/api/user/top-tracks?user=${encodeURIComponent(username)}&period=${period}&limit=${limit}`
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
          url: track.lastfmtrackurl,
          track_url: track.lastfmtrackurl
        }));

        setTracks(transformedTracks);
        setError(null);
      } catch (err) {
        console.error('Error fetching tracks:', err);
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