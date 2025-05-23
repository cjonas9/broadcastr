// The page for a specific artist's top listens leaderboard
import { useRoute, useLocation } from "wouter";
import { ArrowLeft, ChevronRightIcon } from "lucide-react";
import { useEffect, useState } from "react";

const BACKEND_API_URL="https://broadcastr.onrender.com"

// API call to fetch artist by ID
export async function getArtistById(id: number) {
  try {
	//console.log("yea")
    const res = await fetch(BACKEND_API_URL + `/api/artist/by-id?id=${id}`);
	//console.log("hi")
    if (!res.ok) return null;
	console.log("hello")
    const data = await res.json();
	console.log("Fetched artist data:", data);
    return data.artist;
  } catch (err) {
    console.error("Failed to fetch artist:", err);
    return null;
  }
}

interface Listener {
  username: string;
  playcount: number;
  profileImage?: string;
}

export default function ArtistDetail() {
  const [, params] = useRoute<{ id: string }>("/artist/:id");
  const [, setLocation] = useLocation();
  const artistId = params?.id ? parseInt(params.id) : null;

  const [artist, setArtist] = useState<{ id: number; name: string } | null>(null);
  const [topListeners, setTopListeners] = useState<Listener[]>([]);
  const [userScrobbles, setUserScrobbles] = useState(0);
  const [loading, setLoading] = useState(true);

  const currentUser = {
    username: "cjonas41",
    swag: 69000,
  };

  useEffect(() => {
    if (!artistId) return;

    let isActive = true;
    async function fetchArtist() {
      const result = await getArtistById(artistId);
      if (isActive) {
        setArtist(result);
      }
    }

    fetchArtist();
    return () => {
      isActive = false;
    };
  }, [artistId]);

  useEffect(() => {
    if (!artist) return;
    let isActive = true;

    async function fetchData() {
      setLoading(true);
      try {
        const tlRes = await fetch(
        	BACKEND_API_URL + `/api/artist/top-listeners?artist=${encodeURIComponent(
            artist.name
          )}&period=overall&limit=50`
        );
        const { topListeners: fetchedTL } = await tlRes.json();

        const pRes = await fetch(
			BACKEND_API_URL + `/api/artist/listens?user=${encodeURIComponent(
            currentUser.username.replace(/^@/, "")
          )}&artist=${encodeURIComponent(artist.name)}&period=overall`
        );
        const { plays } = await pRes.json();

        if (!isActive) return;
        setTopListeners(fetchedTL);
        setUserScrobbles(plays);
      } catch (e) {
        console.error(e);
      } finally {
        if (isActive) setLoading(false);
      }
    }

    fetchData();
    return () => {
      isActive = false;
    };
  }, [artist, currentUser.username]);

  if (!artist) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <p className="text-xl">Loading artist…</p>
        <div
          className="mt-4 flex items-center text-purple-400 hover:text-purple-300 cursor-pointer"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </div>
      </div>
    );
  }

  const percentile = Math.floor(Math.random() * 20) + 80;

  let listenersToShow: Array<Listener & { id: number }> = [];
  if (!loading) {
    const sorted = [...topListeners].sort((a, b) => b.playcount - a.playcount);
    const idx = sorted.findIndex((l) => l.username === currentUser.username);

    if (idx >= 0 && idx < 5) {
      listenersToShow = sorted.slice(0, 5).map((l, i) => ({ ...l, id: i + 1 }));
    } else {
      const top5 = sorted.slice(0, 5).map((l, i) => ({ ...l, id: i + 1 }));
      const you = idx >= 0
        ? { ...sorted[idx], id: idx + 1 }
        : { username: currentUser.username, playcount: userScrobbles, id: -1 };
      listenersToShow = [...top5, { username: "...", playcount: 0, id: -2 }, you];
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-3xl mx-auto">
        <div
          className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-6 cursor-pointer"
          onClick={() => setLocation("/profile")}
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Profile
        </div>

        <h1 className="text-2xl font-bold text-center mb-2">
          Top Listens Leaderboard
        </h1>
        <h2 className="text-xl text-center mb-8 text-purple-400">
          {artist.name}
        </h2>

        <div className="grid grid-cols-2 gap-6 mb-12">
          <div className="bg-gray-800 rounded-xl p-6 flex flex-col items-center">
            <p className="text-gray-400 mb-2">Your number of scrobbles</p>
            <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              {loading ? "…" : userScrobbles.toLocaleString()}
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 flex flex-col items-center">
            <p className="text-gray-400 mb-2">Percentile</p>
            <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              {percentile}%
            </p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-lg font-medium">Top Listeners for Stanford</h3>
          </div>

          {loading ? (
            <div className="p-6 text-center">Loading listeners…</div>
          ) : (
            listenersToShow.map((listener, index) => {
              if (listener.username === "...") {
                return (
                  <div key="ellipsis" className="flex items-center justify-center p-4">
                    <div className="text-white text-4xl font-bold">...</div>
                  </div>
                );
              }

              const isYou = listener.username === currentUser.username;
              return (
                <div
                  key={listener.id}
                  className={`flex items-center p-4 ${
                    index < listenersToShow.length - 1
                      ? "border-b border-gray-700"
                      : ""
                  } ${isYou ? "bg-sky-700/50" : ""}`}
                >
                  <div className="flex items-center w-8">
                    <span className="font-bold text-white">{index + 1}</span>
                  </div>
                  <div className="flex-1 flex items-center">
                    {listener.profileImage && (
                      <img
                        src={listener.profileImage}
                        alt={listener.username}
                        className="h-10 w-10 rounded-full mr-3 object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <div className="text-white font-medium">
                        {listener.username}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {listener.playcount.toLocaleString()} scrobbles
                      </div>
                    </div>
                    <button
                      className="text-gray-400 hover:text-white"
                      onClick={() => setLocation(`/profile/${listener.username}`)}
                      aria-label={`View ${listener.username} profile`}
                    >
                      <ChevronRightIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
