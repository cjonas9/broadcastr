import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/AuthContext";
import { ButtonWrapper } from "@/components/ButtonWrapper";

const VITE_API_URL = "https://broadcastr.onrender.com";

interface User {
  username: string;
  profileImage: string;
  swag: number;
}

export default function FollowersPage() {
  const [, params] = useRoute<{ username: string }>("/followers/:username");
  const [, setLocation] = useLocation();
  const { userDetails } = useAuth();
  const [followers, setFollowers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFollowers = async () => {
      if (!params?.username) return;

      try {
        setLoading(true);
        const res = await fetch(
          `${VITE_API_URL}/api/user/followers?user=${encodeURIComponent(params.username)}`
        );

        if (!res.ok) {
          throw new Error("Failed to fetch followers");
        }

        const data = await res.json();
        
        // Fetch full profile for each follower
        const followerProfiles = await Promise.all(
          data.followers.map(async (follower: { follower: string }) => {
            const profileRes = await fetch(
              `${VITE_API_URL}/api/user/profile?user=${encodeURIComponent(follower.follower)}`
            );
            
            if (!profileRes.ok) return null;
            
            const profileData = await profileRes.json();
            const profile = profileData.userProfile[0];
            
            return {
              username: profile.profile,
              profileImage: profile.pfpmed || profile.pfpsm || profile.pfpxl || "",
              swag: profile.swag
            };
          })
        );

        // Filter out any failed profile fetches
        setFollowers(followerProfiles.filter((profile): profile is User => profile !== null));
        setError(null);
      } catch (err) {
        console.error("Error fetching followers:", err);
        setError("Failed to load followers");
      } finally {
        setLoading(false);
      }
    };

    fetchFollowers();
  }, [params?.username]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <p className="text-lg mb-4">Loading followers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <p className="text-lg mb-4">{error}</p>
        <button
          className="text-purple-400 hover:text-purple-300"
          onClick={() => setLocation(`/profile/${params?.username}`)}
        >
          ← Back to Profile
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <div className="max-w-2xl mx-auto">
        <div className="p-4">
          <button
            onClick={() => setLocation(`/profile/${params?.username}`)}
            className="flex items-center text-purple-400 hover:text-purple-300 mb-6"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Profile
          </button>

          <h1 className="text-2xl font-bold mb-6">{params?.username}'s Followers</h1>

          {followers.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No followers yet</p>
          ) : (
            <div className="space-y-4">
              {followers.map((user) => (
                <div
                  key={user.username}
                  className="flex items-center justify-between bg-gray-800 p-4 rounded-lg"
                >
                  <div 
                    className="flex items-center space-x-4 cursor-pointer"
                    onClick={() => setLocation(`/profile/${user.username}`)}
                  >
                    <img
                      src={user.profileImage || "https://via.placeholder.com/40"}
                      alt={`${user.username}'s profile`}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-medium">{user.username}</h3>
                      <p className="text-sm text-gray-400">{user.swag} Swag</p>
                    </div>
                  </div>
                  
                  {userDetails && userDetails.profile !== user.username && (
                    <ButtonWrapper
                      width="hug"
                      variant="primary"
                      onClick={() => setLocation(`/profile/${user.username}`)}
                    >
                      View Profile
                    </ButtonWrapper>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 