// src/pages/TopArtists.tsx

import { useLocation } from "wouter";
import { ChevronRightIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/AuthContext";
import { ButtonWrapper } from "./ButtonWrapper";
import { Heading } from "@/components/Heading";
import { API_CONFIG } from "@/config";

type Artist = {
  id: number;
  name: string;
  scrobbles: number;
  imageUrl: string;
};

type TopArtistsProps = {
	username: string;
  };

export default function TopArtists({ username }: TopArtistsProps) {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, navigate] = useLocation();
  const { userDetails } = useAuth();

  const isOwnProfile = userDetails?.profile === username;

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_CONFIG.baseUrl}/api/user/top-artists?user=${encodeURIComponent(username)}&period=overall&limit=10`
        );
        if (!response.ok) throw new Error('Failed to fetch top artists');
        const { topArtists } = await response.json();
        setArtists(topArtists);
      } catch (err) {
        console.error("Failed to load top artists:", err);
        setError(err instanceof Error ? err.message : 'Failed to load top artists');
      } finally {
        setLoading(false);
      }
    };

    if (!username) return;
    fetchArtists();
  }, [username]);

  if (loading) {
    return <p className="text-center text-gray-400">Loading top artists…</p>;
  }

  if (error) {
    return <p className="text-center text-gray-400">Failed to load top artists</p>;
  }

  if (!artists.length) {
    return <p className="text-center text-gray-400">No top artists found</p>;
  }

  return (
    <section className="mb-10">
      <h2 className="text-center text-xl font-semibold text-white mb-2">
        Top Artists
      </h2>
      <p className="text-center text-gray-400 text-sm mb-6">
        {isOwnProfile 
          ? "Your most-played artists."
          : `${username}'s most-played artists.`}
      </p>

      <div className="bg-gray-800 rounded-xl overflow-hidden">
        {artists.map((artist, index) => (
          <div
            key={artist.id}
            className={`flex items-center p-4 ${
              index < artists.length - 1 ? "border-b border-gray-700" : ""
            }`}
          >
            <div className="flex items-center w-8">
              <span className="font-bold text-white">{index + 1}</span>
            </div>
            <div className="flex-1 flex items-center">
              {artist.imageUrl && (
                <img
                  src={artist.imageUrl}
                  alt={artist.name}
                  className="h-10 w-10 rounded-full mr-3 object-cover"
                />
              )}
              <div className="flex-1">
                <div className="text-white font-medium">{artist.name}</div>
                <div className="text-gray-400 text-sm">
                  {artist.scrobbles.toLocaleString()} scrobbles
                </div>
              </div>
              <button
                className="text-gray-400 hover:text-white"
                onClick={() => navigate(`/artist/${artist.id}`)}
                aria-label={`View ${artist.name} details`}
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
