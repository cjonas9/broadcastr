// src/pages/TopArtists.tsx

import { useLocation } from "wouter";
import { ChevronRightIcon } from "lucide-react";
import { useEffect, useState } from "react";

const VITE_API_URL="https://broadcastr.onrender.com"

type Artist = {
  id: number;
  name: string;
  scrobbles: number;
  imageUrl: string;
};

export default function TopArtists() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading]   = useState(true);
  const [, navigate] = useLocation();

  useEffect(() => {
    async function load() {
		// NOTE: THIS PART CAN FETCH WITH SESSION DATA INSTEAD
      try {
        const res = await fetch(
          VITE_API_URL + `/api/user/top-artists?user=cjonas41&period=overall&limit=10`
        );
        const { topArtists } = await res.json();
        setArtists(topArtists);
      } catch (err) {
        console.error("Failed to load top artists:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <p className="text-center text-gray-400">Loading top artists…</p>;
  }

  return (
    <section className="mb-10">
      <h2 className="text-center text-xl font-semibold text-white mb-2">
        Top Artists
      </h2>
      <p className="text-center text-gray-400 text-sm mb-6">
        Your most-played artists—the soundtrack to your life.
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
