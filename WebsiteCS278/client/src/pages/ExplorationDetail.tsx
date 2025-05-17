import { useRoute, useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { musicData } from "@/data/musicData";
import { getArtistById } from "./ArtistDetail";


// Helper function to get the zone name based on artist position
function getArtistZone(artistId: number): string {
  const topArtists = musicData.topArtists;
  
  if (artistId === topArtists[0].id) return "Abyss";
  if (artistId === topArtists[1].id || artistId === topArtists[2].id) return "Midnight Zone";
  if (artistId === topArtists[3].id) return "Twilight Zone";
  if (artistId === topArtists[4].id) return "Sunlight Zone";
  return "Beach Zone";
}

// Color mapping for zones
const zoneColors: Record<string, { 
  gradient: string, 
  textColor: string, 
  bgColor: string
}> = {
  "Beach Zone": { 
    gradient: "from-[#F8E9CB] to-[#FFB740]", 
    textColor: "text-gray-800",
    bgColor: "bg-[#FFB740]"
  },
  "Sunlight Zone": { 
    gradient: "from-[#FFB740] to-[#9370DB]", 
    textColor: "text-gray-800",
    bgColor: "bg-[#CBB3FF]"
  },
  "Twilight Zone": { 
    gradient: "from-[#9370DB] to-[#1E3A8A]", 
    textColor: "text-white",
    bgColor: "bg-[#6457A6]"
  },
  "Midnight Zone": { 
    gradient: "from-[#1E3A8A] to-[#0F172A]", 
    textColor: "text-white",
    bgColor: "bg-[#1E3A8A]"
  },
  "Abyss": { 
    gradient: "bg-[#0F172A]", 
    textColor: "text-white",
    bgColor: "bg-[#0F172A]"
  },
};

// User type
type ZoneUser = {
  id: number;
  username: string;
  profileImage: string;
};

// Hardcoded users for zones with type safety
const zoneUsers: Record<string, ZoneUser[]> = {
  "Beach Zone": [
    { id: 101, username: "@beachlover", profileImage: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OHx8cGVvcGxlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=100&h=100" },
    { id: 102, username: "@sunsurfer", profileImage: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8cGVvcGxlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=100&h=100" },
    { id: 103, username: "@wavechaser", profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTB8fHBlb3BsZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=100&h=100" },
  ],
  "Sunlight Zone": [
    { id: 201, username: "@sunseeker", profileImage: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fHBlb3BsZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=100&h=100" },
    { id: 202, username: "@lightfollower", profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MjB8fHBlb3BsZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=100&h=100" },
    { id: 203, username: "@dayracer", profileImage: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MjV8fHBlb3BsZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=100&h=100" },
  ],
  "Twilight Zone": [
    { id: 301, username: "@duskchaser", profileImage: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MzB8fHBlb3BsZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=100&h=100" },
    { id: 302, username: "@twilighter", profileImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MzV8fHBlb3BsZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=100&h=100" },
    { id: 303, username: "@fadinglight", profileImage: "https://images.unsplash.com/photo-1488161628813-04466f872be2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NDB8fHBlb3BsZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=100&h=100" },
  ],
  "Midnight Zone": [
    { id: 401, username: "@nighthunter", profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NDV8fHBlb3BsZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=100&h=100" },
    { id: 402, username: "@deepdiver", profileImage: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NTB8fHBlb3BsZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=100&h=100" },
    { id: 403, username: "@darkseeker", profileImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NTV8fHBlb3BsZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=100&h=100" },
  ],
  "Abyss": [
    { id: 501, username: "@depthmaster", profileImage: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NjB8fHBlb3BsZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=100&h=100" },
    { id: 502, username: "@abysswanderer", profileImage: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NjV8fHBlb3BsZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=100&h=100" },
    { id: 503, username: "@trencher", profileImage: "https://images.unsplash.com/photo-1560787313-5dff3307e257?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NzB8fHBlb3BsZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=100&h=100" },
    { id: 504, username: "@deepfan", profileImage: "https://images.unsplash.com/photo-1496360166961-10a51d5f367a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NzV8fHBlb3BsZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=100&h=100" },
    { id: 505, username: "@bottomfeeder", profileImage: "https://images.unsplash.com/photo-1530268729831-4b0b9e170218?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8ODB8fHBlb3BsZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=100&h=100" },
  ]
};

export default function ExplorationDetail() {
  // Get the artist ID from the route
  const [, params] = useRoute<{ id: string }>("/exploration/:id");
  const [, setLocation] = useLocation();
  const artistId = params?.id ? parseInt(params.id) : null;
  
  // Find the artist in our data
  const artist = artistId ? getArtistById(artistId) : null;

  
  if (!artist) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <p className="text-xl">Artist not found</p>
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

  const artistZone = getArtistZone(artist.id);
  const zoneColor = zoneColors[artistZone];
  
  // Get users for the current zone and abyss zone
  const currentZoneUsers = zoneUsers[artistZone];
  
  // Only show 3 users from the current zone and/or Abyss
  const usersToDisplay = artistZone === "Abyss" 
    ? zoneUsers["Abyss"].slice(0, 3)
    : [...currentZoneUsers.slice(0, 3), ...zoneUsers["Abyss"].slice(0, 3)];
  
  // Calculate rankings between 70-90%
  const explorationRanking = Math.floor(Math.random() * 20) + 70;
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-3xl mx-auto">
        <div 
          className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-6 cursor-pointer"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Home
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-2">Exploration Leaderboard</h1>
        <h2 className="text-xl text-center mb-8 text-purple-400">{artist.name}</h2>
        
        <div className="grid grid-cols-2 gap-6 mb-12">
          <div className="bg-gray-800 rounded-xl p-6 flex flex-col items-center">
            <p className="text-gray-400 mb-2">Your Current Zone</p>
            <p className={`text-3xl font-bold ${zoneColor.textColor} px-4 py-2 rounded-lg ${zoneColor.bgColor}`}>
              {artistZone}
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6 flex flex-col items-center">
            <p className="text-gray-400 mb-2">Exploration Ranking</p>
            <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              {explorationRanking}%
            </p>
          </div>
        </div>
        
        <h3 className="text-xl font-semibold mb-6 text-center">Other Explorers</h3>
        
        <div className="relative overflow-hidden rounded-xl mb-8" style={{ height: "400px" }}>
          {/* Create zones visualization with only Abyss and current zone populated */}
          {Object.entries(zoneColors).map(([zoneName, { gradient, textColor }], index) => {
            // Only show users in current zone and abyss
            const isActiveZone = zoneName === artistZone || zoneName === "Abyss";
            
            return (
              <div 
                key={zoneName}
                className={`absolute left-0 right-0 h-1/5 flex items-center justify-center bg-gradient-to-b ${gradient} ${textColor}`}
                style={{ top: `${index * 20}%` }}
              >
                <span className="font-semibold text-lg">{zoneName}</span>
                
                {isActiveZone && usersToDisplay
                  .filter(user => 
                    (zoneName === artistZone && usersToDisplay.indexOf(user) < 3) || 
                    (zoneName === "Abyss" && (artistZone === "Abyss" || usersToDisplay.indexOf(user) >= 3))
                  )
                  .map((user, userIndex) => {
                    // Position users along the sides of the zone
                    // This ensures they don't overlap with zone titles
                    
                    // Position all profiles horizontally on the same line, to the sides of zone name
                    // This ensures they're centered vertically and don't get cut off
                    let positions;
                    
                    if (zoneName === "Abyss") {
                      // Position all 3 users in the Abyss zone horizontally
                      // Moving the right-side profiles further to the right
                      positions = [
                        { left: '15%', top: '50%' },
                        { right: '10%', top: '50%' },  // Further right
                        { right: '30%', top: '50%' },  // Further right
                      ];
                    } else {
                      // For other zones - similar horizontal layout
                      positions = [
                        { left: '15%', top: '50%' },
                        { right: '10%', top: '50%' },  // Further right
                        { right: '30%', top: '50%' },  // Further right
                      ];
                    }
                    
                    // Get position based on user index
                    const positionStyle = positions[userIndex % positions.length];
                    
                    // Animation for abyss users
                    const animation = zoneName === "Abyss" ? "animate-pulse" : "";
                    
                    return (
                      <div 
                        key={user.id}
                        className={`absolute ${animation}`}
                        style={positionStyle}
                      >
                        <img 
                          src={user.profileImage}
                          alt={user.username}
                          className="h-10 w-10 rounded-full border-2 border-white shadow-lg"
                          title={user.username}
                        />
                        <div className="text-xs text-center mt-1 font-medium text-white bg-black bg-opacity-70 px-2 py-0.5 rounded-md">
                          {user.username}
                        </div>
                      </div>
                    );
                  })
                }
              </div>
            );
          })}
        </div>
        
        <div className="bg-gray-800 rounded-xl p-6">
          <p className="text-center text-gray-400">
            You've delved deep into {artist.name}'s discography, reaching the {artistZone}.
            {artistZone === "Abyss" 
              ? " You're among the most dedicated fans who have explored their entire catalog!"
              : " Keep listening to discover more of their music and reach the Abyss!"}
          </p>
        </div>
      </div>
    </div>
  );
}