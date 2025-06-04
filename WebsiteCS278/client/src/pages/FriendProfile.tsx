// Placeholder page for a user's profile page that is not yet a friend
import { useRoute, useLocation } from "wouter";
import { musicData } from "@/data/musicData";
import ProfileHeader from "@/components/ProfileHeader";
import TopArtists from "@/components/TopArtists";
import ExplorationZones from "@/components/ExplorationZones"; // optional
import DropDownMenu from "@/components/DropDownMenu";
import TopTrackPost from "@/components/TopTrackPost";
import { useState, useEffect } from "react";
import { BottomToolbar } from "@/components/BottomToolbar";
import { ButtonWrapper } from "@/components/ButtonWrapper";
import { useAuth } from "@/AuthContext";
import { useFollow } from "@/hooks/useFollow";
import TopBroadcastedTracks from "@/components/TopBroadcastedTracks";
import { API_CONFIG } from "@/config";

const VITE_API_URL = "https://broadcastr.onrender.com";
const isDevelopment = process.env.NODE_ENV === 'development';

interface UserProfile {
  id: number;
  profile: string;
  firstname: string;
  lastname: string;
  email: string;
  profileurl: string;
  bootstrapped: number;
  admin: number;
  lastlogin: string;
  pfpsm: string;
  pfpmed: string;
  pfplg: string;
  pfpxl: string;
  swag: number;
}

// Development fallback profile
const dummyProfile: UserProfile = {
  id: 999,
  profile: "dummyuser",
  firstname: "Dummy",
  lastname: "User",
  email: "dummy@example.com",
  profileurl: "",
  bootstrapped: 0,
  admin: 0,
  lastlogin: new Date().toISOString(),
  pfpsm: "https://via.placeholder.com/40",
  pfpmed: "https://via.placeholder.com/100",
  pfplg: "https://via.placeholder.com/200",
  pfpxl: "https://via.placeholder.com/400",
  swag: 100
};

export default function FriendProfile() {
  const [, params] = useRoute<{ username: string }>("/profile/:username");
  const [, setLocation] = useLocation();
  const { userDetails } = useAuth();
  const [friendProfile, setFriendProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const username = params?.username || "";
  const { isFollowing, followUser, unfollowUser, loading: followLoading } = useFollow(username);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!username) return;

	  if (username === userDetails?.profile) {
		setLocation("/profile");
		return;
	  }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${API_CONFIG.baseUrl}/api/user/profile?user=${encodeURIComponent(username)}`
        );
        
        if (!response.ok) {
          console.error('API Error:', {
            status: response.status,
            statusText: response.statusText
          });
          
          // In development, use dummy profile instead of showing error
          if (isDevelopment) {
            console.log('Using dummy profile for development');
            setFriendProfile({
              ...dummyProfile,
              profile: username
            });
            return;
          }
          
          throw new Error(`Failed to fetch profile: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Profile data:', data); // Debug log
        
        if (data.userProfile && data.userProfile.length > 0) {
          setFriendProfile(data.userProfile[0]);
        } else {
          // In development, use dummy profile for non-existent users
          if (isDevelopment) {
            console.log('Using dummy profile for non-existent user');
            setFriendProfile({
              ...dummyProfile,
              profile: username
            });
          } else {
            setError('User not found');
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        // In development, use dummy profile on error
        if (isDevelopment) {
          console.log('Using dummy profile after error');
          setFriendProfile({
            ...dummyProfile,
            profile: username
          });
        } else {
          setError(error instanceof Error ? error.message : 'Failed to load profile');
        }
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchProfile();
    }
  }, [username]);

  const handleFollowClick = async () => {
    try {
      if (isFollowing) {
        await unfollowUser();
      } else {
        await followUser();
      }
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error updating follow status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <p>Loading...</p>
      </div>
    );
  }

  if (error || !friendProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <p className="text-lg mb-4">{error || 'User not found'}</p>
        <div
          className="text-purple-400 hover:text-purple-300 cursor-pointer"
          onClick={() => setLocation("/friends")}
        >
          Back to Friends
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen">
      <BottomToolbar />
      <div className="max-w-md mx-auto p-6">
          <button 
            className="text-2xl mb-4 text-white"
            onClick={() => window.history.back()}
          >
            ←
          </button>

        <ProfileHeader
          username={"@" + friendProfile.profile}
          profileImage={
            friendProfile.pfpmed ||
            friendProfile.pfpsm ||
            friendProfile.pfpxl ||
            "https://via.placeholder.com/100"
          }
          swag={friendProfile.swag}
          showActions={true}
          refreshKey={refreshKey}
        />
    
        <div className="flex justify-center gap-4 mb-16">
          {userDetails && userDetails.profile !== friendProfile.profile && (
            <ButtonWrapper
              width="hug"
              corner="rounded-lg"
              variant={isFollowing ? "secondary" : "primary"}
              onClick={handleFollowClick}
              className={isFollowing ? "!hover:bg-red-600" : ""}
              disabled={followLoading}
            >
              {followLoading ? "Loading..." : isFollowing ? "Unfollow" : "Follow"}
            </ButtonWrapper>
          )}
          <ButtonWrapper variant="secondary" corner="rounded-lg" onClick={() => setLocation(`/dm/${friendProfile.profile}`)}>
              Message
          </ButtonWrapper>
        </div>

        <main className="max-w-md mx-auto pb-24">
          {friendProfile && <TopBroadcastedTracks username={friendProfile.profile} />}
          {friendProfile && <TopArtists username={friendProfile.profile} />}
        </main>
      </div>
    </div>
  );
}
