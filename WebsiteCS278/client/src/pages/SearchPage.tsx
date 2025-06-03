import { useState } from "react";
import { useLocation } from "wouter";
import { Search } from "lucide-react";
import { useAuth } from "@/AuthContext";
import { ButtonWrapper } from "@/components/ButtonWrapper";
import { BottomToolbar } from "@/components/BottomToolbar";
import { API_CONFIG } from "@/config";

interface User {
  username: string;
  profileImage: string;
  swag: number;
}

export default function SearchPage() {
  const [, setLocation] = useLocation();
  const { userDetails } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setError(null);

      // Try to fetch the exact user profile
      const response = await fetch(
        `${API_CONFIG.baseUrl}/api/user/profile?user=${encodeURIComponent(searchQuery.trim())}`
      );

      if (!response.ok) {
        if (response.status === 400) {
          setUsers([]);
          setError("User not found");
        } else {
          throw new Error("Failed to search user");
        }
        return;
      }

      const data = await response.json();
      if (data.userProfile && data.userProfile.length > 0) {
        const profile = data.userProfile[0];
        setUsers([{
          username: profile.profile,
          profileImage: profile.pfpmed || profile.pfpsm || profile.pfpxl || "",
          swag: profile.swag
        }]);
        setError(null);
      } else {
        setUsers([]);
        setError("User not found");
      }
    } catch (err) {
      console.error("Error searching user:", err);
      setError("Failed to search user");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const navigateToProfile = (username: string) => {
    setLocation(`/profile/${username}`);
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white pb-20">
      <BottomToolbar />
      
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Find Users</h1>

        <div className="flex gap-2 mb-8">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Enter exact username..."
            className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-purple-500"
          />
          <ButtonWrapper
            width="hug"
            variant="primary"
            onClick={handleSearch}
            disabled={loading || !searchQuery.trim()}
          >
            <Search className="h-5 w-5" />
          </ButtonWrapper>
        </div>

        {error && (
          <p className="text-red-400 text-center mb-4">{error}</p>
        )}

        {loading ? (
          <p className="text-center text-gray-400">Searching...</p>
        ) : users.length > 0 ? (
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.username}
                onClick={() => navigateToProfile(user.username)}
                className="flex items-center justify-between bg-gray-800 p-4 rounded-lg cursor-pointer transition-colors hover:bg-gray-700 group"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={user.profileImage || "https://via.placeholder.com/40"}
                    alt={`${user.username}'s profile`}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-medium group-hover:text-purple-400 transition-colors">{user.username}</h3>
                    <p className="text-sm text-gray-400">{user.swag} Swag</p>
                  </div>
                </div>
                
                {userDetails && userDetails.profile !== user.username && (
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateToProfile(user.username);
                    }}
                  >
                    <ButtonWrapper
                      width="hug"
                      variant="primary"
                    >
                      View Profile
                    </ButtonWrapper>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : searchQuery ? (
          <div className="text-center text-gray-400">
            <p className="mb-2">No user found with that exact username</p>
            <p className="text-sm">Try entering the complete username</p>
          </div>
        ) : (
          <div className="text-center text-gray-400">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Enter a username to find their profile</p>
            <p className="text-sm mt-2">Note: Username must be exact</p>
          </div>
        )}
      </div>
    </div>
  );
} 