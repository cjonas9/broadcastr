import { musicData } from "@/data/musicData";
import { useLocation } from "wouter";

// Define types for future API integration
type Artist = {
  id: number;
  name: string;
  scrobbles: number;
  imageUrl: string;
};

type Props = {
  artists?: Artist[];
};

export default function ExplorationZones({ artists }: Props) {
  const [, setLocation] = useLocation();

  const zones = [
    { name: "Beach Zone", color: "from-[#F8E9CB] to-[#FFB740]", textColor: "text-gray-800" },
    { name: "Sunlight Zone", color: "from-[#FFB740] to-[#9370DB]", textColor: "text-gray-800" },
    { name: "Twilight Zone", color: "from-[#9370DB] to-[#1E3A8A]", textColor: "text-white" },
    { name: "Midnight Zone", color: "from-[#1E3A8A] to-[#0F172A]", textColor: "text-white" },
    { name: "Abyss", color: "bg-[#0F172A]", textColor: "text-white" },
  ];

  function getZoneForScrobbles(scrobbles: number) {
    if (scrobbles <= 200) return "Beach Zone";
    if (scrobbles <= 400) return "Sunlight Zone";
    if (scrobbles <= 600) return "Twilight Zone";
    if (scrobbles <= 900) return "Midnight Zone";
    return "Abyss";
  }

  // Use passed-in artists if provided, otherwise default to main user
  const topArtists = artists ?? musicData.topArtists;

  const groupedByZone: Record<string, Artist[]> = {
    "Beach Zone": [],
    "Sunlight Zone": [],
    "Twilight Zone": [],
    "Midnight Zone": [],
    "Abyss": []
  };

  topArtists.forEach(artist => {
    const zone = getZoneForScrobbles(artist.scrobbles);
    groupedByZone[zone].push(artist);
  });


  return (
    <section className="mb-12">
      <h2 className="text-center text-xl font-semibold text-white mb-2">Top Exploration Zones</h2>
      <p className="text-center text-gray-400 text-sm mb-6">
        Showcasing the five artists you've explored most deeply—highlighting your journey beyond the hits into their full discographies. Tap to view leaderboard.
      </p>

      <div className="relative overflow-hidden rounded-xl" style={{ height: "600px" }}>
        {zones.map((zone, index) => (
          <div
            key={zone.name}
            className={`absolute left-0 right-0 h-1/5 flex items-center justify-center bg-gradient-to-b ${zone.color} ${zone.textColor}`}
            style={{ top: `${index * 20}%` }}
          >
            <span className="font-semibold text-lg">{zone.name}</span>

            {(groupedByZone[zone.name] || []).map((artist, artistIndex) => {
              const positions = [
                { right: '15%', top: '50%' },
                { left: '15%', top: '50%' },
                { right: '30%', top: '50%' },
                { left: '30%', top: '50%' }
              ];

              const positionStyle = positions[artistIndex % positions.length];
              const size = zone.name === "Abyss" ? "h-16 w-16" : "h-14 w-14";
              const animation = zone.name === "Abyss" ? "animate-pulse" : "";

              return (
                <div
                  key={artist.id}
                  className="absolute cursor-pointer"
                  style={{
                    ...positionStyle,
                    transform: 'translate(0, -50%)'
                  }}
                  onClick={() => setLocation(`/exploration/${artist.id}`)}
                >
                  <img
                    src={artist.imageUrl}
                    alt={artist.name}
                    className={`${size} rounded-full border-2 border-white shadow-lg ${animation}`}
                    title={artist.name}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
